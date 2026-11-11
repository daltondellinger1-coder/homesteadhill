import { units, type Unit } from "@/data/units";

export interface Vacancy {
  unitId: string;
  /** ISO calendar date, Y-M-D. */
  availableFrom: string;
  label: string;
  note?: string;
  hasDetailPage?: boolean;
}

export function findCatalogUnit(unitId: string): Unit | undefined {
  return units.find((unit) => unit.id === unitId);
}

export function getUnitNumber(unitId: string): string {
  const match = unitId.match(/(\d+)/);
  return match ? `Unit ${match[1]}` : "Unit";
}

/** Parse the ISO parts locally so dates never shift a day (timezone-safe). */
export function formatAvailableFrom(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function vacancyHref(vacancy: Vacancy): string {
  const inCatalog = Boolean(findCatalogUnit(vacancy.unitId));
  if (inCatalog && vacancy.hasDetailPage !== false) {
    return `/units/${vacancy.unitId}`;
  }
  return `/contact?unit=${vacancy.unitId}`;
}

export function vacancyCta(vacancy: Vacancy): string {
  const inCatalog = Boolean(findCatalogUnit(vacancy.unitId));
  return inCatalog && vacancy.hasDetailPage !== false ? "View unit" : "Book / Contact";
}
