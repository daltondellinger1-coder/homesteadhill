import { units } from "@/data/units";
import type { Unit } from "@/data/units";
import { getWeeklyPrice } from "@/lib/pricing";

export const PETS_ALLOWED = false;

export const PROPERTY_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "2818 Washington Ave",
  addressLocality: "Vincennes",
  addressRegion: "IN",
  postalCode: "47591",
  addressCountry: "US",
};

export function getUnitOffers(unit: Pick<Unit, "id" | "name" | "monthlyPrice" | "weeklyPrice" | "nightlyPrice">) {
  const url = `https://homestead-hill.com/units/${unit.id}`;
  return [
    { label: "Night", duration: "P1D", price: unit.nightlyPrice ?? 95 },
    { label: "Week", duration: "P7D", price: getWeeklyPrice(unit as Unit) },
    { label: "Month", duration: "P1M", price: unit.monthlyPrice },
  ].map(({ label, duration, price }) => ({
    "@type": "Offer",
    name: `${unit.name} — per ${label.toLowerCase()}`,
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
    numberOfRooms: units.length,
    petsAllowed: PETS_ALLOWED,
    address: PROPERTY_ADDRESS,
    containsPlace: units.map(unit => ({
      "@type": "Accommodation",
      "@id": `https://homestead-hill.com/units/${unit.id}#accommodation`,
      name: unit.name,
      petsAllowed: PETS_ALLOWED,
      url: `https://homestead-hill.com/units/${unit.id}`,
      numberOfBedrooms: unit.bedrooms,
      numberOfBathroomsTotal: unit.baths,
      offers: getUnitOffers(unit),
    })),
  };
}