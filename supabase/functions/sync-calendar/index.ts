import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  unit_id: string
  start_date: string
  end_date: string
  summary: string | null
  source: string
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    
    // Validate authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const token = authHeader.replace('Bearer ', '')
    
    // Validate the token - accept service role key or anon key
    if (token !== supabaseServiceKey && token !== supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { unit_id, ical_url, action } = await req.json()

    if (action === 'add') {
      // Add or update iCal URL for a unit
      const { error: upsertError } = await supabase
        .from('unit_calendars')
        .upsert({
          unit_id,
          ical_url,
          updated_at: new Date().toISOString()
        }, { onConflict: 'unit_id' })

      if (upsertError) {
        throw new Error(`Failed to save calendar URL: ${upsertError.message}`)
      }

      // Immediately sync the calendar
      await syncUnitCalendar(supabase, unit_id, ical_url)

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
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

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
