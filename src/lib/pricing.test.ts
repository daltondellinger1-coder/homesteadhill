/// <reference types="node" />
import { test } from "node:test";
import { strictEqual } from "node:assert/strict";
import { units } from "../data/units";
import { calculatePricing, getWeeklyPrice } from "./pricing";
import { CLEANING_FEE } from "./fees";

const unit = (id: string) => units.find((u) => u.id === id)!;
const cents = (n: number) => Math.round(n * 100) / 100;

test("Units 3 and 4: 24 nights = $1782.86 rent, $1882.86 with one $100 cleaning fee", () => {
  for (const id of ["unit-3", "unit-4"]) {
    const p = calculatePricing(unit(id), 24);
    strictEqual(p.rateType, "weekly");
    strictEqual(p.total, 1782.86);
    strictEqual(cents(p.total + CLEANING_FEE), 1882.86);
  }
});

test("all 11 units prorate weekly/7 for 7-29 nights; 6 stays nightly, 30 monthly", () => {
  strictEqual(units.length, 11);
  for (const u of units) {
    const w = getWeeklyPrice(u);
    for (const n of [7, 8, 14, 24, 29]) {
      const p = calculatePricing(u, n);
      strictEqual(p.rateType, "weekly");
      strictEqual(p.total, cents((w / 7) * n));
    }
    strictEqual(calculatePricing(u, 7).total, w);
    strictEqual(calculatePricing(u, 6).rateType, "nightly");
    strictEqual(calculatePricing(u, 6).total, cents(6 * u.nightlyPrice!));
    strictEqual(calculatePricing(u, 30).rateType, "monthly");
    strictEqual(calculatePricing(u, 30).total, u.monthlyPrice);
  }
});
