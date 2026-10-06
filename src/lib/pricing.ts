import type { Unit } from "@/data/units";

export const MINIMUM_NIGHTS = 3;

export type RateType = "monthly" | "weekly" | "nightly" | "minimum";

export interface Pricing {
  subtotal: number;
  total: number;
  rateType: RateType;
  perNight: number;
  minimumNights?: number;
}

/** Units with exactPricing keep cents; others keep the legacy whole-dollar rounding. */
export function getWeeklyPrice(unit: Unit): number {
  return unit.weeklyPrice ?? Math.round(unit.monthlyPrice / 3.75);
}

export function formatUSD(amount: number, exact?: boolean): string {
  return exact
    ? amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : amount.toLocaleString();
}

export function calculatePricing(unit: Unit, nights: number): Pricing {
  const monthlyPrice = unit.monthlyPrice;
  const nightlyRate = unit.nightlyPrice ?? 95;

  if (unit.exactPricing) {
    // Integer-cent math so totals are exact to the cent.
    const monthlyCents = Math.round(monthlyPrice * 100);
    const weeklyNightCents = Math.round(((unit.weeklyPrice ?? monthlyPrice / 3.75) * 100) / 7);
    const nightlyCents = Math.round(nightlyRate * 100);
    if (nights >= 30) {
      const dailyMonthlyCents = Math.round(monthlyCents / 30);
      const cents = Math.floor(nights / 30) * monthlyCents + (nights % 30) * dailyMonthlyCents;
      return { subtotal: cents / 100, total: cents / 100, rateType: "monthly", perNight: dailyMonthlyCents / 100 };
    }
    if (nights >= 7) {
      const cents = nights * weeklyNightCents;
      return { subtotal: cents / 100, total: cents / 100, rateType: "weekly", perNight: weeklyNightCents / 100 };
    }
    const billed = Math.max(nights, MINIMUM_NIGHTS);
    const cents = billed * nightlyCents;
    return nights >= MINIMUM_NIGHTS
      ? { subtotal: cents / 100, total: cents / 100, rateType: "nightly", perNight: nightlyRate }
      : { subtotal: cents / 100, total: cents / 100, rateType: "minimum", perNight: nightlyRate, minimumNights: MINIMUM_NIGHTS };
  }

  // Legacy logic (unchanged) for all other units.
  const dailyMonthlyRate = monthlyPrice / 30;
  const dailyWeeklyRate = (unit.weeklyPrice ?? (monthlyPrice / 4) * 1.25) / 7;
  if (nights >= 30) {
    const subtotal = Math.round(Math.floor(nights / 30) * monthlyPrice + (nights % 30) * dailyMonthlyRate);
    return { subtotal, total: subtotal, rateType: "monthly", perNight: Math.round(dailyMonthlyRate) };
  } else if (nights >= 7) {
    const subtotal = Math.round(nights * dailyWeeklyRate);
    return { subtotal, total: subtotal, rateType: "weekly", perNight: Math.round(dailyWeeklyRate) };
  } else if (nights >= MINIMUM_NIGHTS) {
    const subtotal = nights * nightlyRate;
    return { subtotal, total: subtotal, rateType: "nightly", perNight: nightlyRate };
  }
  const subtotal = MINIMUM_NIGHTS * nightlyRate;
  return { subtotal, total: subtotal, rateType: "minimum", perNight: nightlyRate, minimumNights: MINIMUM_NIGHTS };
}
