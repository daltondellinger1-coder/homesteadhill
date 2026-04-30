## Extend Your Stay — QR-Based Request Flow

### How it works for the guest

1. Guest scans the QR code in their unit (e.g., sticker by the kitchen sink).
2. Lands on `/extend/<unit-id>` — page already knows which unit they're in.
3. Enters **email on booking + check-in date** to verify themselves.
4. Sees their current stay, picks a **new checkout date**.
5. The page checks the live calendar:
   - **Same unit available** → "Great, your unit is free for those nights" → submit request.
   - **Same unit booked, similar unit(s) free** → shows available alternatives (same bedroom count / type) → guest can either request to stay in their current unit (asking us to shuffle the incoming guest) **or** request a switch to one of the alternatives.
   - **Nothing available** → friendly message + still lets them submit a request so you know they wanted to stay longer.
6. Confirmation screen + email: "We got your request — we'll be in touch shortly."

No payment is taken on the website. You handle billing manually after approving.

### How it works for you

- New entries land in the Host Hub `booking_requests` table (same pattern as new bookings and rental applications already use), tagged as an extension request with all context in the notes.
- Email notification to `booking@homestead-hill.com` with: guest name, current unit, current checkout, requested new checkout, scenario (same unit / switch requested / shuffle requested / nothing available), and any alternatives the system found.
- Confirmation email to the guest.

### What gets built

**Frontend**
- New page `src/pages/ExtendStay.tsx` at route `/extend/:unitId`.
- Components for: verification form, date picker (reuses calendar/availability hook), scenario display (same-unit / alternatives / shuffle / unavailable), confirmation screen.
- Reuses existing `useAvailability` hook and unit data from `src/data/units.ts`.

**Backend (one new edge function)**
- `supabase/functions/submit-extension-request/index.ts`:
  - Verifies guest by querying Host Hub for an existing booking matching email + check-in date + unit.
  - Inserts a record into Host Hub `booking_requests` with `source: "extension"` and detailed notes (current booking, requested new checkout, scenario, alternatives offered, guest's choice).
  - Sends notification email to you via Resend.
  - Sends confirmation email to the guest via Resend.
- Registered in `supabase/config.toml` with `verify_jwt = false`.

**Verification approach**
- The function calls Host Hub's `booking_requests` (or its bookings table) filtered by email + unit + check-in date.
- If no match → returns a generic "we couldn't find a booking matching that info — please contact us" message (no info leak).
- If match → returns minimal booking details (current checkout) so the guest can pick new dates.

**Similar-unit logic**
- One-bedroom units (1, 2, 3, 4): siblings of each other.
- Two-bedroom units (5, 6): siblings of each other.
- Cottages (11, 13): siblings of each other.
- Availability for siblings checked against the public `calendar_events` table for the requested extension window.

**Printable QR codes (separate deliverable)**
- A Python script generates a single PDF with one page per unit.
- Each page: Homestead Hill logo, unit name, "Extend Your Stay" heading, short instruction line, and a large QR code linking to `https://homestead-hill.com/extend/<unit-id>`.
- Output saved to `/mnt/documents/homestead-hill-extension-qr-codes.pdf` and surfaced as a downloadable artifact.
- 8 pages total (one per unit: 1, 2, 3, 4, 5, 6, 11, 13).

### Technical details

```text
Routing
  /extend/:unitId  →  ExtendStay.tsx

ExtendStay flow
  Step 1: lookup form (email + check-in date)
       ↓ POST /functions/v1/submit-extension-request { action: "lookup", ... }
  Step 2: pick new checkout date (calendar with current bookings disabled)
  Step 3: scenario screen
       - same unit free  → confirm + submit
       - alt(s) free     → choose: stay (request shuffle) | switch to <unit>
       - nothing free    → submit "wishlist" request
       ↓ POST /functions/v1/submit-extension-request { action: "submit", ... }
  Step 4: confirmation

Edge function actions
  lookup  → verify guest, return current booking summary
  submit  → mirror to Host Hub + send 2 emails
```

- Input validation with Zod on both actions.
- CORS headers on all responses.
- No new tables in this project's database — the request lives in Host Hub, matching the existing pattern.

### Out of scope (intentionally)

- No payment / Stripe flow on the extension page (per your "request only" choice).
- No automatic shuffling of the incoming guest — that stays a manual decision in Host Hub.
- No guest-facing account or login.

### Deliverables

1. Working `/extend/:unitId` page on the website.
2. Deployed `submit-extension-request` edge function.
3. Email notifications wired up (to you + to guest).
4. Host Hub mirroring confirmed with a test request.
5. Printable PDF of all 8 unit QR codes ready to download.
