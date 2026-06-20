import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import snapshot from './snapshot.json' with { type: 'json' }

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': status === 200 ? 'private, max-age=300' : 'no-store',
    },
  })
}

async function assertAdmin(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return { ok: false as const, status: 500, error: 'Supabase environment is not configured' }
  }

  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false as const, status: 401, error: 'Missing authorization header' }
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: userData, error: userError } = await userClient.auth.getUser()
  const user = userData?.user
  if (userError || !user) {
    return { ok: false as const, status: 401, error: 'Invalid or expired session' }
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey)
  const { data: allowlist, error: allowlistError } = await adminClient
    .from('admin_allowlist')
    .select('user_id')
    .eq('user_id', user.id)
    .limit(1)

  if (allowlistError) {
    console.error('Admin allowlist check failed:', allowlistError)
    return { ok: false as const, status: 500, error: 'Admin allowlist check failed' }
  }

  if (!allowlist?.length) {
    return { ok: false as const, status: 403, error: 'Not authorized for Homestead Hill draws' }
  }

  return { ok: true as const, user }
}

function isValidDrawDashboardShape(data: Record<string, unknown>) {
  const summary = data.summary as Record<string, unknown> | undefined
  return Boolean(
    summary &&
      Array.isArray(data.unitSummary) &&
      Array.isArray(data.draws) &&
      typeof summary.ledgerActualCostToDate === 'number' &&
      typeof summary.ledgerDrawsReceived === 'number',
  )
}

async function getLiveSnapshotIfConfigured() {
  const liveUrl = Deno.env.get('HOMESTEAD_HILL_DRAWS_LIVE_JSON_URL')
  const liveToken = Deno.env.get('HOMESTEAD_HILL_DRAWS_LIVE_JSON_TOKEN')

  if (!liveUrl) return null

  const response = await fetch(liveUrl, {
    headers: liveToken ? { Authorization: `Bearer ${liveToken}` } : undefined,
  })

  if (!response.ok) {
    throw new Error(`Live Homestead Hill draw JSON fetch failed: ${response.status}`)
  }

  const liveData = await response.json()
  if (!isValidDrawDashboardShape(liveData)) {
    throw new Error('Live Homestead Hill draw JSON response has invalid dashboard shape')
  }

  return {
    ...liveData,
    source: 'live-json-url',
    refreshedAt: new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  const admin = await assertAdmin(req)
  if (!admin.ok) return jsonResponse({ error: admin.error }, admin.status)

  try {
    const liveData = await getLiveSnapshotIfConfigured()
    if (liveData) return jsonResponse(liveData)
  } catch (error) {
    console.error('Falling back to embedded Homestead Hill draw snapshot:', error)
  }

  return jsonResponse({
    ...(snapshot as Record<string, unknown>),
    source: 'embedded-snapshot',
    refreshedAt: new Date().toISOString(),
  })
})
