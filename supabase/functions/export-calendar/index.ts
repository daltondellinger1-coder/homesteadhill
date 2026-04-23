import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

// Host Hub (the guest-management app) is a separate Supabase project.
// We read its public tables via the anon key + RLS so we can include
// app-side bookings in the Airbnb-facing iCal feed. Values can be
// overridden via env vars; the anon key is already public in the
// send-booking-email function used by the booking form.
const HOST_HUB_URL =
  Deno.env.get('HOST_HUB_URL') || 'https://fiunauckxdnaqvlircob.supabase.co'
const HOST_HUB_ANON_KEY =
  Deno.env.get('HOST_HUB_ANON_KEY') ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpdW5hdWNreGRuYXF2bGlyY29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MjcwMjUsImV4cCI6MjA4NjAwMzAyNX0.Ro1WWf4RPIJJZkQw0HBhK8DaAWgApZJ35Ci4Izp1J6Q'

// Slugify an app unit name ("Unit 1") to the website's unit_id convention ("unit-1").
function slugifyUnitName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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

// Best-effort fetch of a table from the Host Hub Supabase project.
// Returns [] on any error — we never want to fail the iCal feed because
// the cross-project call had a hiccup.
async function hostHubSelect(path: string): Promise<any[]> {
  try {
    const res = await fetch(`${HOST_HUB_URL}/rest/v1/${path}`, {
      headers: {
        apikey: HOST_HUB_ANON_KEY,
        Authorization: `Bearer ${HOST_HUB_ANON_KEY}`,
        Accept: 'application/json',
      },
    })
    if (!res.ok) {
      console.error(`Host Hub select failed (${path}):`, res.status, await res.text())
      return []
    }
    return await res.json()
  } catch (err) {
    console.error(`Host Hub select threw (${path}):`, err)
    return []
  }
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

    // 3) Host Hub guests — any confirmed booking in the app (approved booking requests
    //    plus manually-added guests) needs to block Airbnb. We skip source='airbnb'
    //    so Airbnb's own blocks don't loop back to it via this feed.
    //    Unit matching: app's units.name ("Unit 1") is slugified to the website's
    //    unit_id convention ("unit-1").
    const guestsRows = await hostHubSelect(
      'guests?select=id,name,source,check_in,check_out,unit:unit_id(name)' +
        `&check_out=gte.${todayStr}`
    )

    for (const g of guestsRows) {
      if (!g?.unit?.name) continue
      if (slugifyUnitName(g.unit.name) !== unitId) continue
      if (g.source === 'airbnb') continue // prevent loopback
      const checkOut = g.check_out || '9999-12-31' // open-ended leases: block far out
      ranges.push({
        uid: `hh-guest-${g.id}@homestead-hill.com`,
        start: g.check_in,
        end: checkOut,
        summary: `Blocked - ${g.name || 'Guest'} (${g.source || 'direct'})`,
      })
    }

    // Note: we intentionally don't pull from Host Hub's `booking_requests` table
    // here. Approved requests already create a row in `guests` (which section 3
    // covers), and pending requests don't carry an assigned unit so there's
    // nothing specific to block until the admin approves them.

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
