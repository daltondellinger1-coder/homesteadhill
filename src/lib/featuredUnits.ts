import type { Unit } from "@/data/units";

export function getHomepageFeaturedUnits(units: Unit[]) {
  // Keep the existing three-slot selection; occupied units do not promote replacements.
  return units.filter(unit => unit.featured).slice(0, 3)
    .filter(unit => unit.id !== "unit-3" && unit.id !== "unit-13");
}