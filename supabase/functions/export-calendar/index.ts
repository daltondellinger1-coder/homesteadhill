import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

// Format a Date as YYYYMMDD for iCal DATE values
function formatIcalDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}

function formatIcalDateTime(d: Date): string {
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mi = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`
}

function escapeIcal(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

interface BlockedRange {
  uid: string
  start: string // YYYY-MM-DD
  end: string   // YYYY-MM-DD (exclusive, iCal style)
  summary: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)

    // Accept unit_id from either:
    //   1. Path segment ending in .ics  (e.g. /export-calendar/unit-11.ics)  ← Airbnb requires this
    //   2. Query param  (e.g. ?unit_id=unit-11)  ← legacy
    let unitId: string | null = null
    const pathParts = url.pathname.split('/').filter(Boolean)
    const lastSegment = pathParts[pathParts.length - 1] || ''
    if (lastSegment.endsWith('.ics')) {
      unitId = lastSegment.slice(0, -4)
    } else {
      unitId = url.searchParams.get('unit_id')
    }

    if (!unitId || !/^[a-zA-Z0-9_-]+$/.test(unitId) || unitId.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Invalid or missing unit_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const ranges: BlockedRange[] = []

    // 1) Existing calendar_events (already includes Airbnb-synced + any other sources)
    //    We exclude airbnb-sourced events to avoid echoing Airbnb's own blocks back to it.
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('id, unit_id, start_date, end_date, summary, source')
      .eq('unit_id', unitId)
      .gte('end_date', todayStr)

    if (eventsError) {
      console.error('Error fetching calendar_events:', eventsError)
    }

    for (const e of events || []) {
      if (e.source === 'airbnb') continue // don't echo back to Airbnb
      ranges.push({
        uid: `event-${e.id}@homestead-hill.com`,
        start: e.start_date,
        end: e.end_date,
        summary: e.summary || 'Blocked - Direct Booking',
      })
    }

    // 2) Rental applications (30+ night stays) — block requested dates regardless of status
    //    so Airbnb doesn't double-book during review.
    const { data: apps, error: appsError } = await supabase
      .from('rental_applications')
      .select('id, unit_id, check_in, check_out, status')
      .eq('unit_id', unitId)
      .gte('check_out', todayStr)
      .neq('status', 'rejected')

    if (appsError) {
      console.error('Error fetching rental_applications:', appsError)
    }

    for (const a of apps || []) {
      ranges.push({
        uid: `app-${a.id}@homestead-hill.com`,
        start: a.check_in,
        end: a.check_out,
        summary: `Blocked - Rental Application (${a.status})`,
      })
    }

    // Airbnb (and several other iCal importers) reject feeds with zero events
    // during the initial import. Add a far-future placeholder so the feed is
    // never empty — it blocks one harmless day in 2099.
    if (ranges.length === 0) {
      ranges.push({
        uid: `placeholder-${unitId}@homestead-hill.com`,
        start: '2099-01-01',
        end: '2099-01-02',
        summary: 'Homestead Hill placeholder (ignore)',
      })
    }

    // Build iCal feed
    const now = formatIcalDateTime(new Date())
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Homestead Hill//Direct Bookings//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Homestead Hill - ${unitId}`,
      'X-WR-TIMEZONE:America/Indiana/Indianapolis',
    ]

    for (const r of ranges) {
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${r.uid}`)
      lines.push(`DTSTAMP:${now}`)
      lines.push(`DTSTART;VALUE=DATE:${formatIcalDate(r.start)}`)
      lines.push(`DTEND;VALUE=DATE:${formatIcalDate(r.end)}`)
      lines.push(`SUMMARY:${escapeIcal(r.summary)}`)
      lines.push('TRANSP:OPAQUE')
      lines.push('STATUS:CONFIRMED')
      lines.push('END:VEVENT')
    }

    lines.push('END:VCALENDAR')

    // iCal requires CRLF line endings
    const icalBody = lines.join('\r\n') + '\r\n'

    return new Response(icalBody, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `inline; filename="${unitId}.ics"`,
        'Cache-Control': 'public, max-age=300', // 5 min cache
      },
    })
  } catch (error: unknown) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
