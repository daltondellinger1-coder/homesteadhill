import type { Unit } from "@/data/units";

export const MINIMUM_NIGHTS = 3;
export const WEEKLY_MIN_NIGHTS = 7;
export const MONTHLY_MIN_NIGHTS = 30;

/** Public explanation of the 7–29 night tier. */
export const PRORATED_WEEKLY_NOTICE =
  "Stays of 7–29 nights are charged the weekly rate prorated per night, including partial weeks.";

export type RateType = "monthly" | "weekly" | "nightly" | "minimum";

export interface Pricing {
  subtotal: number;
  total: number;
  rateType: RateType;
  perNight: number;
  minimumNights?: number;
}

/** Round once, at the end, to whole cents. */
const toCents = (amount: number) => Math.round(amount * 100) / 100;

/** Advertised weekly price — the same number a 7-night quote returns. */
export function getWeeklyPrice(unit: Unit): number {
  return unit.weeklyPrice ?? toCents((unit.monthlyPrice / 4) * 1.25);
}

export function formatUSD(amount: number, exact?: boolean): string {
  return exact
    ? amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString("en-US");
}

/**
 * Tiers: 30+ nights monthly, 7–29 weekly, 3–6 nightly, under 3 billed as the 3-night minimum.
 * Per-night rates are kept at full precision (weekly/7, monthly/30); only the final total is rounded to cents,
 * so 7 nights equals the weekly price and 30 nights equals the monthly price exactly.
 */
export function calculatePricing(unit: Unit, nights: number): Pricing {
  const monthly = unit.monthlyPrice;
  const weekly = getWeeklyPrice(unit);
  const nightly = unit.nightlyPrice ?? 95;

  if (nights >= MONTHLY_MIN_NIGHTS) {
    const daily = monthly / 30;
    const total = toCents(Math.floor(nights / 30) * monthly + (nights % 30) * daily);
    return { subtotal: total, total, rateType: "monthly", perNight: toCents(daily) };
  }
  if (nights >= WEEKLY_MIN_NIGHTS) {
    const daily = weekly / 7;
    const total = toCents(nights * daily);
    return { subtotal: total, total, rateType: "weekly", perNight: toCents(daily) };
  }
  if (nights >= MINIMUM_NIGHTS) {
    const total = toCents(nights * nightly);
    return { subtotal: total, total, rateType: "nightly", perNight: nightly };
  }
  const total = toCents(MINIMUM_NIGHTS * nightly);
  return { subtotal: total, total, rateType: "minimum", perNight: nightly, minimumNights: MINIMUM_NIGHTS };
}
