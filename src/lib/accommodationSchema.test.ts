/// <reference types="node" />
import { test } from "node:test";
import { strictEqual, deepStrictEqual } from "node:assert/strict";
import { getPropertyAccommodationSchema } from "./accommodationSchema";
import { CLEANING_FEE } from "./fees";

test("cleaning fee is $100 per stay", () => {
  strictEqual(CLEANING_FEE, 100);
});

test("owner's no-pets rule applies to the property and every unit", () => {
  const schema = getPropertyAccommodationSchema();
  strictEqual(schema.petsAllowed, false);
  schema.containsPlace.forEach(unit => strictEqual(unit.petsAllowed, false));
});

test("schema inventory contains exactly the 11 real units", () => {
  const schema = getPropertyAccommodationSchema();
  strictEqual(schema.numberOfRooms, 11);
  deepStrictEqual(schema.containsPlace.map(unit => unit.url.split("/").pop()),
    ["unit-1", "unit-2", "unit-3", "unit-4", "unit-5", "unit-6", "unit-7", "unit-9", "unit-11", "unit-13", "unit-14"]);
});

test("offers use approved nightly, weekly and monthly USD prices", () => {
  const expected = [[95,520,1650],[95,520,1650],[95,520,1650],[95,520,1650],
    [105,580,1850],[105,580,1850],[95,520,1650],[95,520,1650],
    [100,550,1750],[100,550,1750],[130,640,1850]];
  getPropertyAccommodationSchema().containsPlace.forEach((unit, index) => {
    deepStrictEqual(unit.offers.map(offer => offer.price), expected[index]);
    unit.offers.forEach(offer => strictEqual(offer.priceCurrency, "USD"));
  });
});