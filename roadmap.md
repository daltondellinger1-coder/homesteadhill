## Open tasks
- [ ] Publish homestead-hill.com — ON HOLD pending Dalton's review; current project also includes the preexisting unpublished Unit 7/Unit 9 changes, so publication ships those too
- [x] Weekly rate mismatch RESOLVED for units 1, 2, 3, 4, 7, 9 only (Dalton approved $585.20/wk = $83.60/night, exact cents); preview only, not published
- [ ] Weekly rate mismatch still open for Units 5, 6, 11, 13 (card monthly/3.75 vs form monthly/3.2) — awaiting Dalton's choice
- [ ] Add Unit 9 (7 real photos, config matched to Units 1–4), no publish until Dalton reviews diff
- [x] Add Unit 13 video + poster to /units/unit-13 — assets arrived and wired (MP4 on Lovable CDN, poster in public/media); section live in preview
- [x] Apply and verify a display-only brightness adjustment scoped to every Unit 9 photo surface; do not publish
- [x] Level all seven Unit 9 photos with per-image presentation-only rotation and verify every image surface; do not publish
- [x] Complete the unpublished Unit 7 five-photo gallery using the four supplied 405x720 displayed copies plus the original 2268x4032 bedroom photo; no calendar feed configured and do not publish without Dalton's approval.

## Rate & tier decisions — recorded 2026-10-06 (documentation only; no code, rate, crop, video, calendar or permission change)
- Dalton confirmed "Thirty's fine" after comparing 29- vs 30-night totals. Tier boundaries are therefore: monthly tier starts at 30 nights (NOT 28), weekly tier starts at 7 nights, minimum stay 3 nights. Implementation already matches and was left untouched (`src/lib/pricing.ts`: `nights >= 30`, `nights >= 7`, `MINIMUM_NIGHTS = 3`) — confirmed by read only.
- Approved, verified and accepted rates — Units 1, 2, 3, 4, 7, 9: monthly $1,650, nightly $95, weekly $585.20 ($83.60/night = 12% off nightly), displayed exact to the cent across cards, unit detail and the booking form.
- Publication remains ON HOLD. Nothing was published, deployed, posted, or re-permissioned in this pass.

## Publication gates as of 2026-10-06 (reused from existing inventory/calendar findings; not re-investigated)
Blocking:
- Dalton's review sign-off on the current preview (Unit 13 crop fix is confirmed satisfied at commit 07be6909d7c8aa8a08aa58d909359ac17d5f4dd6).
- Unit 7 and Unit 9 have no calendar feed configured, so their dates stay unavailable to visitors until real feeds are supplied — publishing ships those two listings without bookable dates.
Optional follow-ups (not blocking):
- Units 5, 6, 11, 13 weekly rate mismatch (card monthly/3.75 vs form monthly/3.2) still awaits Dalton's choice.
- Booking emails come from the currently deployed email code and print the weekly total as "$585.2" rather than "$585.20" until that email code is updated and redeployed.
- Unit 13 video playback could not be verified in the test browser (common H.264 decode unavailable there); duration and framing were confirmed from the file itself, so one live check on a phone is still worthwhile.
- Nine units (1, 2, 3, 4, 5, 6, 11, 13, 14) have feeds configured and sync every six hours; no action needed there.
