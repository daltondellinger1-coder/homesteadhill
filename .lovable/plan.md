# Unit 11 weekly price — inspection findings (no changes made)

Public page: https://homestead-hill.com/units/unit-11

## Current source data (src/data/units.ts)
- monthlyPrice: 1750
- No weeklyPrice, no nightlyPrice (defaults to $95), no exactPricing

## What visitors see vs. what they're quoted (src/lib/pricing.ts)
| Where | Formula | Result |
|---|---|---|
| Card + detail page (`getWeeklyPrice`, used by UnitCard.tsx / UnitDetail.tsx) | `Math.round(1750 / 3.75)` | **$467/week** |
| Booking form 7-night quote (`calculatePricing`, legacy path) | `(1750 / 4) × 1.25 / 7` per night × 7, `Math.round` | 546.875 → **$547** (shown $78/night) |
| Monthly (30+ nights) | 1750 per 30 nights | **$1,750** |

- The displayed $467 uses a 3.75-weeks-per-month conversion (no 25% premium) — mismatched with the quote.
- The quote applies Dalton's "25% above monthly equivalent" with 4 weeks/month, then rounds to nearest dollar: $547, not $546. $546 would require floor rounding or an explicit weekly price.
- Unit 13 (same $1,750) already displays $547 via a special case; Unit 11 does not.

## Suggested fix if approved (preview only)
Set `weeklyPrice: 546` on Unit 11 so card, detail page, and 7-night quote all show $546 (10 nights ≈ $780, 29 ≈ $2,262; monthly unchanged).
