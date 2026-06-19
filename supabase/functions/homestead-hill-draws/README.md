# Homestead Hill draw dashboard function

Protected admin-only Edge Function for the Homestead Hill Draw/Funding Dashboard.

## Data flow

- Frontend route: `/admin/draws`
- Function: `homestead-hill-draws`
- Embedded fallback: `snapshot.json`, generated from Google Sheet `Homestead Hill Renovation Plans` → `All Unit Cost Tracker`
- Optional live source: set `HOMESTEAD_HILL_DRAWS_LIVE_JSON_URL` to a private/signed JSON endpoint generated from the Sheet.
- Optional auth for live source: set `HOMESTEAD_HILL_DRAWS_LIVE_JSON_TOKEN`.

The function requires a Supabase session token and checks `admin_allowlist` with the service-role key. Do not expose Google/Composio/QBO credentials in browser code.

## Expected JSON shape

- `summary`: totals for actual paid, draws received, owner cash, open committed, draw mismatch, cash needed
- `unitSummary[]`: per-unit budget/actual/draw/open/funding rows
- `draws[]`: draw ledger rows, including requested amount/holdback when derivable
- `ledger[]`: source line-item ledger rows
- `dataQuality[]`: warnings and source caveats
- `recommendedNextActions[]`: practical cleanup/actions
