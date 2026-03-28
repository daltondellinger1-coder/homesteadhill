import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const RequestSchema = z.object({
  action: z.enum(['add', 'sync', 'sync-all']),
  unit_id: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  ical_url: z.string().url().optional()
}).refine(
  (data) => {
    // unit_id is required for 'add' and 'sync' actions
    if (data.action === 'add' || data.action === 'sync') {
      return !!data.unit_id
    }
    return true
  },
  { message: 'unit_id is required for add and sync actions' }
).refine(
  (data) => {
    // ical_url is required for 'add' action
    if (data.action === 'add') {
      return !!data.ical_url
    }
    return true
  },
  { message: 'ical_url is required for add action' }
)

// Allowed iCal URL hosts for SSRF protection
const ALLOWED_ICAL_HOSTS = [
  'airbnb.com',
  'calendar.google.com',
  'vrbo.com',
  'booking.com',
  'icalendar.net',
  'outlook.live.com',
  'outlook.office365.com'
]

interface CalendarEvent {
  unit_id: string
  start_date: string
  end_date: string
  summary: string | null
  source: string
}

// Validate iCal URL against allowed hosts (SSRF protection)
function validateIcalUrl(icalUrl: string): { valid: boolean; error?: string } {
  try {
    const url = new URL(icalUrl)
    
    // Only allow HTTPS
    if (url.protocol !== 'https:') {
      return { valid: false, error: 'iCal URL must use HTTPS' }
    }
    
    // Check against allowed hosts
    const isAllowed = ALLOWED_ICAL_HOSTS.some(host => 
      url.hostname === host || url.hostname.endsWith('.' + host)
    )
    
    if (!isAllowed) {
      return { valid: false, error: 'iCal URL must be from a trusted provider (Airbnb, Google Calendar, VRBO, Booking.com)' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

// Parse iCal format to extract events
function parseIcal(icalData: string): { start: Date; end: Date; summary: string }[] {
  const events: { start: Date; end: Date; summary: string }[] = []
  const lines = icalData.split(/\r?\n/)
  
  let inEvent = false
  let currentEvent: { start?: Date; end?: Date; summary?: string } = {}
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
    } else if (line === 'END:VEVENT') {
      if (currentEvent.start && currentEvent.end) {
        events.push({
          start: currentEvent.start,
          end: currentEvent.end,
          summary: currentEvent.summary || 'Blocked'
        })
      }
      inEvent = false
    } else if (inEvent) {
      if (line.startsWith('DTSTART')) {
        const dateStr = line.split(':')[1]
        currentEvent.start = parseIcalDate(dateStr)
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1]
        currentEvent.end = parseIcalDate(dateStr)
      } else if (line.startsWith('SUMMARY')) {
        currentEvent.summary = line.split(':').slice(1).join(':')
      }
    }
  }
  
  return events
}

function parseIcalDate(dateStr: string): Date {
  // Handle both DATE and DATE-TIME formats
  // DATE: 20240115
  // DATE-TIME: 20240115T120000Z
  const clean = dateStr.replace(/[^0-9T]/g, '')
  
  if (clean.length === 8) {
    // Just date: YYYYMMDD
    const year = parseInt(clean.slice(0, 4))
    const month = parseInt(clean.slice(4, 6)) - 1
    const day = parseInt(clean.slice(6, 8))
    return new Date(year, month, day)
  } else {
    // Date-time: YYYYMMDDTHHMMSS
    const year = parseInt(clean.slice(0, 4))
    const month = parseInt(clean.slice(4, 6)) - 1
    const day = parseInt(clean.slice(6, 8))
    const hour = parseInt(clean.slice(9, 11)) || 0
    const minute = parseInt(clean.slice(11, 13)) || 0
    return new Date(Date.UTC(year, month, day, hour, minute))
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Validate authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Accept service role key for admin operations
    const isServiceRole = token === supabaseServiceKey
    
    // For cron jobs: also accept the anon key passed via apikey header or authorization
    const apikeyHeader = req.headers.get('apikey') || ''
    const isAnonViaApikey = apikeyHeader !== '' && token === apikeyHeader
    const isAnonDirect = token !== supabaseServiceKey && token.length > 20 // JWT token from cron
    
    if (!isServiceRole && !isAnonViaApikey && !isAnonDirect) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Parse and validate input
    let rawBody: unknown
    try {
      rawBody = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const parseResult = RequestSchema.safeParse(rawBody)
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: parseResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { action, unit_id, ical_url } = parseResult.data
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === 'add') {
      // Only service role can add calendars
      if (!isServiceRole) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized - admin access required for this action' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      // Validate iCal URL against allowed hosts (SSRF protection)
      const urlValidation = validateIcalUrl(ical_url!)
      if (!urlValidation.valid) {
        return new Response(
          JSON.stringify({ error: urlValidation.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Add or update iCal URL for a unit
      const { error: upsertError } = await supabase
        .from('unit_calendars')
        .upsert({
          unit_id: unit_id!,
          ical_url: ical_url!,
          updated_at: new Date().toISOString()
        }, { onConflict: 'unit_id' })

      if (upsertError) {
        throw new Error(`Failed to save calendar URL: ${upsertError.message}`)
      }

      // Immediately sync the calendar
      await syncUnitCalendar(supabase, unit_id!, ical_url!)

      return new Response(
        JSON.stringify({ success: true, message: 'Calendar URL saved and synced' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'sync' || action === 'sync-all') {
      // Sync specific unit or all units
      const { data: calendars, error: fetchError } = await supabase
        .from('unit_calendars')
        .select('*')
        .then(res => {
          if (unit_id && action === 'sync') {
            return { ...res, data: res.data?.filter(c => c.unit_id === unit_id) }
          }
          return res
        })

      if (fetchError) {
        throw new Error(`Failed to fetch calendars: ${fetchError.message}`)
      }

      const results = []
      for (const calendar of calendars || []) {
        try {
          await syncUnitCalendar(supabase, calendar.unit_id, calendar.ical_url)
          results.push({ unit_id: calendar.unit_id, success: true })
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          results.push({ unit_id: calendar.unit_id, success: false, error: errorMessage })
        }
      }

      return new Response(
        JSON.stringify({ success: true, synced: results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// deno-lint-ignore no-explicit-any
async function syncUnitCalendar(supabase: any, unitId: string, icalUrl: string) {
  console.log(`Syncing calendar for unit ${unitId}`)
  
  // Fetch iCal data
  const response = await fetch(icalUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal: ${response.status}`)
  }
  
  const icalData = await response.text()
  const events = parseIcal(icalData)
  
  console.log(`Found ${events.length} events for unit ${unitId}`)
  
  // Delete existing events for this unit
  const { error: deleteError } = await supabase
    .from('calendar_events')
    .delete()
    .eq('unit_id', unitId)
  
  if (deleteError) {
    console.error('Delete error:', deleteError)
  }
  
  // Insert new events (only future events)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const futureEvents: CalendarEvent[] = events
    .filter(e => e.end >= today)
    .map(e => ({
      unit_id: unitId,
      start_date: e.start.toISOString().split('T')[0],
      end_date: e.end.toISOString().split('T')[0],
      summary: e.summary,
      source: 'airbnb'
    }))
  
  if (futureEvents.length > 0) {
    const { error: insertError } = await supabase
      .from('calendar_events')
      .insert(futureEvents)
    
    if (insertError) {
      throw new Error(`Failed to insert events: ${insertError.message}`)
    }
  }
  
  // Update last synced timestamp
  await supabase
    .from('unit_calendars')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('unit_id', unitId)
  
  console.log(`Synced ${futureEvents.length} future events for unit ${unitId}`)
}
