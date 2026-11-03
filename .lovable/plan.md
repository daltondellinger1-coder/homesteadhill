# Security plan: remove private business data from the public site

## Answers

**1. Where private data lives (all bundled into the public JS today, because App.tsx imports every page eagerly)**

| File | Route | What it holds |
|---|---|---|
| `src/data/homesteadHillDrawSnapshot.ts` | used by /admin/draws | ~80 KB: total/unit budgets, actuals, draws, owner cash, open commitments, contractor notes (e.g. Tim Kirk labor email), Google Sheet ID + URL |
| `src/pages/HomesteadHillDraws.tsx` | /admin/draws | ~21 KB UI, plus hardcoded public Google Sheet CSV URL (sheet is readable by anyone with the link) |
| `src/pages/ContractorOfficeLaundry.tsx` | /contractors/office-laundry (public, no gate) | ~19 KB contractor bid scope, owner-supplied material links |
| `src/pages/Admin.tsx`, `src/components/RentalApplicationsAdmin.tsx` | /admin | ~13 KB+ admin UI code (data fetched from backend, not hardcoded) |
| `src/pages/OpsFunnel.tsx` | /ops/funnel | ~17 KB ops UI code (data via admin-only functions) |
| `supabase/functions/homestead-hill-draws/snapshot.json` | backend only | ~80 KB draw snapshot (not in browser bundle; function checks sign-in) |
| `supabase/functions/homestead-hill-pl/snapshot.json` | backend only | ~222 KB P&L snapshot (not in browser bundle) |

**2. Authentication:** Yes. Sign-in is the `AdminAuthGate` shown on /admin, /admin/draws, /ops/funnel (email+password and email link). Admins are identified by the `admin_allowlist` table via the `is_admin()` check (no `user_roles` table). **Admin users set up: none** — the allowlist has 0 rows and there are 0 sign-in accounts.

**3. Tables (all have RLS on):** admin_allowlist, analytics_events, booking_requests_ops, calendar_events, rental_applications, unit_calendars.

## Plan

1. **New private tables** (RLS on, admin-only read/write via `is_admin()`, no anonymous access): `draw_snapshots` (one row per snapshot, full JSON kept so nothing is lost) and `contractor_scopes` (contractor page content as JSON). Copy the current embedded snapshot and contractor content into them exactly — migrate, not delete.
2. **Load after sign-in only:** /admin/draws reads from `draw_snapshots` once the admin gate passes; remove the embedded fallback import and the hardcoded Google Sheet CSV fetch. Contractor page moves behind the admin gate and reads from `contractor_scopes`.
3. **Code-split:** switch Admin, HomesteadHillDraws, OpsFunnel, ContractorOfficeLaundry, RentalApplicationsAdmin and AdminAuthGate to lazy-loaded chunks; public pages keep normal imports, so their look and content stay exactly the same.
4. **Remove source files** `src/data/homesteadHillDrawSnapshot.ts` (after migration is verified) so it can't be bundled again.
5. **Verify:** build, then search the built public bundle and prerendered HTML for "Derek Wolfe", "Draw #", "ownerCash", "totalBudget", the Sheet ID — must be absent from main chunks. Compare public page HTML before/after for byte-identical output. Check signed-out access to new tables returns nothing.

## Risks to flag

- **No admin can sign in today** (0 accounts, empty allowlist). Once data is locked down, nobody can view it until Dalton's account is created and allowlisted. I won't create accounts; you'd sign up yourself, then I add your user to the allowlist.
- **Already exposed:** everything shipped in past deployments is in public caches/archives. Treat budgets and notes as leaked; publishing removes them going forward only.
- **The Google Sheet is publicly readable** by link (the page fetches it unauthenticated). Change its sharing to private in Google Sheets — this is outside the code.
- **Contractor page:** contractors currently open it without signing in. Gating it breaks their link. Alternative: keep the scope public but strip owner-only details. Please confirm which.
- **Sitemap/SEO:** if /contractors/office-laundry is listed or prerendered, it'll be removed from those.
- Backend functions `homestead-hill-draws`/`-pl` keep their snapshot files server-side; they already require sign-in, I'll confirm they also require admin.
