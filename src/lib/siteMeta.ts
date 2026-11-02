import { units } from "@/data/units";
import type { Unit } from "@/data/units";

export const BASE_URL = "https://homestead-hill.com";
/** Total units at the property (only some have public pages). */
export const TOTAL_UNITS = 15;
/** Date of the last significant content change to the listed pages. */
export const SITEMAP_LASTMOD = "2026-11-02";
export const SITE_SUFFIX = "Homestead Hill, Vincennes IN";

type UnitNameInput = Pick<Unit, "id" | "type" | "bedrooms" | "sleeps">;

export function getUnitNumber(unit: Pick<Unit, "id">) {
  return unit.id.replace(/^unit-/, "");
}

export function getUnitKind(unit: Pick<Unit, "type">) {
  return unit.type === "cottage" ? "Cottage" : "Apartment";
}

/** Single display-name pattern for H1s, cards and schema. */
export function getUnitDisplayName(unit: UnitNameInput) {
  return `Unit ${getUnitNumber(unit)} · ${unit.bedrooms}BR ${getUnitKind(unit)} · Sleeps ${unit.sleeps}`;
}

export function getUnitMetaTitle(unit: UnitNameInput) {
  return `${getUnitDisplayName(unit)} | ${SITE_SUFFIX}`;
}

export function getUnitMetaDescription(unit: UnitNameInput & Pick<Unit, "monthlyPrice" | "nightlyPrice">) {
  const kind = getUnitKind(unit).toLowerCase();
  return `Furnished ${unit.bedrooms}-bedroom ${kind}, sleeps ${unit.sleeps}. From $${unit.nightlyPrice ?? 95}/night or $${unit.monthlyPrice.toLocaleString("en-US")}/month. Book direct in Vincennes, IN.`;
}

export const pageMeta = {
  "/": {
    title: "Furnished Monthly Rentals in Vincennes, IN | Homestead Hill",
    description: `${TOTAL_UNITS} furnished apartments and cottages in Vincennes, IN for travel nurses, contractors and relocating professionals. Monthly rates, book direct, no platform fees.`,
  },
  "/units": {
    title: "Furnished Apartments & Cottages for Rent | Homestead Hill Vincennes",
    description: "Compare Homestead Hill's furnished 1- and 2-bedroom apartments and cottages in Vincennes, IN. Nightly, weekly and monthly rates. Book direct.",
  },
  "/amenities": {
    title: "Amenities | Homestead Hill Furnished Rentals, Vincennes IN",
    description: "Full kitchens, Wi-Fi, smart-lock self check-in, free parking and dedicated workspaces at Homestead Hill in Vincennes, IN.",
  },
  "/gallery": {
    title: "Photo Gallery | Homestead Hill Vincennes",
    description: "Photos of Homestead Hill's furnished apartments and cottages in Vincennes, Indiana.",
  },
  "/location": {
    title: "Location | Homestead Hill, 2818 Washington Ave, Vincennes IN",
    description: "Where Homestead Hill is in Vincennes, IN, and what's nearby. 2818 Washington Ave, Vincennes, IN 47591.",
  },
  "/faq": {
    title: "FAQ | Homestead Hill Furnished Rentals in Vincennes",
    description: "Answers on monthly rates, check-in, stays of 30+ days, pets and booking direct at Homestead Hill in Vincennes, IN.",
  },
  "/contact": {
    title: "Contact Homestead Hill | Vincennes, IN",
    description: "Contact Homestead Hill about a furnished stay in Vincennes, IN. Office hours 9 AM to 5 PM daily.",
  },
  "/rental-application": {
    title: "Rental Application | Homestead Hill",
    description: "Apply for a monthly furnished rental at Homestead Hill in Vincennes, IN.",
  },
  "/privacy-policy": {
    title: "Privacy Policy | Homestead Hill",
    description: "How Homestead Hill collects, uses and protects personal information for furnished rentals in Vincennes, IN.",
  },
  "/terms-of-service": {
    title: "Terms of Service | Homestead Hill",
    description: "Rental policies, guest responsibilities and booking terms for Homestead Hill furnished rentals in Vincennes, IN.",
  },
} as const;

export type MetaRoute = keyof typeof pageMeta;

/** Every indexable route with its own title/description, generated from unit data. */
export function getIndexableRoutes(list: Unit[] = units) {
  const unitRoutes = list.map(unit => ({
    route: `/units/${unit.id}`,
    title: getUnitMetaTitle(unit),
    description: getUnitMetaDescription(unit),
  }));
  const [home, unitsPage, ...rest] = Object.entries(pageMeta).map(([route, meta]) => ({ route, ...meta }));
  return [home, unitsPage, ...unitRoutes, ...rest];
}

export function getCanonicalUrl(route: string) {
  const path = route.split(/[?#]/)[0].replace(/\/+$/, "");
  return `${BASE_URL}${path || "/"}`;
}

export function buildSitemapXml(list: Unit[] = units) {
  const entries = getIndexableRoutes(list).map(({ route }) => {
    const priority = route === "/" ? "1.0" : route.startsWith("/units") ? "0.9" : "0.7";
    return `  <url>\n    <loc>${getCanonicalUrl(route)}</loc>\n    <lastmod>${SITEMAP_LASTMOD}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}
