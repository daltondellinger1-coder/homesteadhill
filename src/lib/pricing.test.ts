import { describe, expect, it } from "vitest";
import { units } from "@/data/units";
import { calculatePricing, getWeeklyPrice } from "@/lib/pricing";
import { CLEANING_FEE } from "@/lib/fees";

const unit = (id: string) => units.find((u) => u.id === id)!;
const cents = (n: number) => Math.round(n * 100) / 100;

describe("prorated weekly pricing", () => {
  it("Unit 3 and 4: Nov 10–Dec 4 (24 nights) = $1782.86 rent, $1882.86 with cleaning", () => {
    for (const id of ["unit-3", "unit-4"]) {
      const p = calculatePricing(unit(id), 24);
      expect(p.rateType).toBe("weekly");
      expect(p.total).toBe(1782.86);
      expect(cents(p.total + CLEANING_FEE)).toBe(1882.86);
    }
  });

  it("all 11 units prorate weekly/7 for 7–29 nights; 6 nightly, 30 monthly", () => {
    expect(units).toHaveLength(11);
    for (const u of units) {
      const w = getWeeklyPrice(u);
      for (const n of [7, 8, 14, 24, 29]) {
        const p = calculatePricing(u, n);
        expect(p.rateType).toBe("weekly");
        expect(p.total).toBe(cents((w / 7) * n));
      }
      expect(calculatePricing(u, 7).total).toBe(w);
      expect(calculatePricing(u, 6)).toMatchObject({ rateType: "nightly", total: cents(6 * u.nightlyPrice!) });
      expect(calculatePricing(u, 30)).toMatchObject({ rateType: "monthly", total: u.monthlyPrice });
    }
  });

  it("cleaning fee is $100 and not included in rent", () => {
    expect(CLEANING_FEE).toBe(100);
    expect(calculatePricing(unit("unit-3"), 24).subtotal).toBe(1782.86);
  });
});
