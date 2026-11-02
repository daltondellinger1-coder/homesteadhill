import { units } from "@/data/units";
import type { Unit } from "@/data/units";
import { getWeeklyPrice } from "@/lib/pricing";
import { BASE_URL, TOTAL_UNITS, getUnitDisplayName, getUnitKind } from "@/lib/siteMeta";

export const PETS_ALLOWED = false;
export const LODGING_ID = `${BASE_URL}/#lodging`;

export const PROPERTY_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "2818 Washington Ave",
  addressLocality: "Vincennes",
  addressRegion: "IN",
  postalCode: "47591",
  addressCountry: "US",
};

export const OPENING_HOURS = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "09:00",
    closes: "17:00",
  },
];

export function getUnitOffers(unit: Unit) {
  const url = `${BASE_URL}/units/${unit.id}`;
  const name = getUnitDisplayName(unit);
  return [
    { label: "Night", duration: "P1D", price: unit.nightlyPrice ?? 95 },
    { label: "Week", duration: "P7D", price: getWeeklyPrice(unit) },
    { label: "Month", duration: "P1M", price: unit.monthlyPrice },
  ].map(({ label, duration, price }) => ({
    "@type": "Offer",
    name: `${name} — per ${label.toLowerCase()}`,
    url,
    price,
    priceCurrency: "USD",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price,
      priceCurrency: "USD",
      unitText: label,
      referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitText: label },
      billingDuration: duration,
    },
  }));
}

export function getPropertyAccommodationSchema() {
  return {
    "@id": LODGING_ID,
    address: PROPERTY_ADDRESS,
    numberOfRooms: TOTAL_UNITS,
    petsAllowed: PETS_ALLOWED,
    openingHoursSpecification: OPENING_HOURS,
    containsPlace: units.map(unit => ({
      "@type": "Accommodation",
      "@id": `${BASE_URL}/units/${unit.id}#unit`,
      name: getUnitDisplayName(unit),
      url: `${BASE_URL}/units/${unit.id}`,
      accommodationCategory: getUnitKind(unit),
      numberOfBedrooms: unit.bedrooms,
      occupancy: { "@type": "QuantitativeValue", maxValue: unit.sleeps },
      petsAllowed: PETS_ALLOWED,
      offers: getUnitOffers(unit),
    })),
  };
}
