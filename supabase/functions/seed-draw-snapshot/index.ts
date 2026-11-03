// One-time migration: copies the embedded draw snapshot into draw_snapshots.
// Idempotent: does nothing if any row already exists. Deleted after use.
import { createClient } from 'npm:@supabase/supabase-js@2'
import snapshot from './snapshot.json' with { type: 'json' }

Deno.serve(async () => {
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { count, error: countError } = await admin.from('draw_snapshots').select('id', { count: 'exact', head: true })
  if (countError) return new Response(JSON.stringify({ error: countError.message }), { status: 500 })
  if ((count ?? 0) > 0) return new Response(JSON.stringify({ inserted: false, count }))
  const s = snapshot as Record<string, unknown>
  const { error } = await admin.from('draw_snapshots').insert({
    data: s,
    source: String(s.source ?? 'embedded-sheet-snapshot'),
    refreshed_at: s.refreshedAt as string,
  })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ inserted: true }))
})
