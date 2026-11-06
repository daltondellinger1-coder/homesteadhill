# sync-vacancies-from-ical

Moves open homepage vacancies **later** when Airbnb-synced `calendar_events` show the unit is still booked. Never moves dates earlier (marketing lag), never creates rows, never writes guest names or calendar URLs.

## Run on demand
`POST <backend>/functions/v1/sync-vacancies-from-ical`
Headers (one of): `X-Ingest-Key: <VACANCIES_INGEST_KEY>` or `Authorization: Bearer <service role or anon key>`.
Dry run: `?dry_run=1` or body `{"dry_run": true}`.

Schedule: cron `15 */6 * * *` (15 min after `sync-airbnb-calendars`).

## Unit 7 — missing iCal
Unit 7 has no `unit_calendars` row, so it is reported as `skipped_missing_ical`. Dalton: in Airbnb host calendar → Availability → Connect calendars → Export calendar → Copy link, then add it via the existing `sync-calendar` function (`action: "add"`) or the admin page. Do not invent URLs.

## RentRedi
Not wired. Lease-based dates (Unit 11 long-term, Unit 15) stay as seeded until RentRedi API access/login is provided.
