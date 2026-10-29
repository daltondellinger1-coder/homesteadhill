import { test } from "node:test";
import { deepStrictEqual } from "node:assert/strict";
import { units } from "../data/units";
import { getHomepageFeaturedUnits } from "./featuredUnits";

test("occupied Units 3 and 13 are removed without replacing them with Unit 14", () => {
  deepStrictEqual(getHomepageFeaturedUnits(units).map(unit => unit.id), ["unit-11"]);
});