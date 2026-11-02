import { useEffect } from "react";
import { getUnitOffers, PROPERTY_ADDRESS, PETS_ALLOWED, LODGING_ID } from "@/lib/accommodationSchema";
import { pageMeta, getCanonicalUrl, getUnitDisplayName, getUnitMetaTitle, getUnitMetaDescription } from "@/lib/siteMeta";
import type { Unit } from "@/data/units";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: "website" | "article" | "product";
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const BASE_URL = "https://homestead-hill.com";
const DEFAULT_TITLE = "Homestead Hill | Furnished Rentals in Vincennes, IN";
const DEFAULT_DESCRIPTION = "Furnished apartments and cottages in Vincennes, IN for traveling nurses, contractors, and business travelers. Self check-in, free parking, fast Wi-Fi.";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = "website",
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}: SEOProps) {
  useEffect(() => {
    const resolvedCanonical = canonical || getCanonicalUrl(window.location.pathname);

    // Update document title
    document.title = title;

    // Helper to update or create meta tags
    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Primary meta tags
    setMeta("description", description);
    setMeta("robots", noindex ? "noindex" : "index, follow");

    // Open Graph
    setMeta("og:type", type, true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:image", image, true);
    setMeta("og:url", resolvedCanonical, true);
    setMeta("og:site_name", "Homestead Hill", true);

    // Twitter
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", title, true);
    setMeta("twitter:description", description, true);
    setMeta("twitter:image", image, true);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.rel = "canonical";
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = resolvedCanonical;

    // Page-specific JSON-LD
    const SCRIPT_ID = "page-jsonld";
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) existing.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(SCRIPT_ID)?.remove();
    };
  }, [title, description, canonical, type, image, noindex, jsonLd]);

  return null;
}

// Page-specific SEO configurations (shared with build-time prerender)
export const pageSEO = {
  home: pageMeta["/"],
  units: pageMeta["/units"],
  amenities: pageMeta["/amenities"],
  gallery: pageMeta["/gallery"],
  location: pageMeta["/location"],
  faq: pageMeta["/faq"],
  contact: pageMeta["/contact"],
  rentalApplication: pageMeta["/rental-application"],
  privacy: pageMeta["/privacy-policy"],
  terms: pageMeta["/terms-of-service"],
};

// Generate unit-specific SEO (title, description, canonical, JSON-LD)
export function getUnitSEO(unit: Unit, image?: string) {
  const title = getUnitMetaTitle(unit);
  const description = getUnitMetaDescription(unit);
  const canonical = `${BASE_URL}/units/${unit.id}`;
  const absoluteImage = image
    ? image.startsWith("http")
      ? image
      : `${BASE_URL}${image}`
    : DEFAULT_IMAGE;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": unit.type === "cottage" ? "House" : "Apartment",
    "@id": `${canonical}#accommodation`,
    name: getUnitDisplayName(unit),
    petsAllowed: PETS_ALLOWED,
    description: unit.description,
    url: canonical,
    image: absoluteImage,
    numberOfBedrooms: unit.bedrooms,
    numberOfBathroomsTotal: unit.baths,
    occupancy: { "@type": "QuantitativeValue", value: unit.sleeps, unitText: "guests" },
    amenityFeature: unit.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    address: PROPERTY_ADDRESS,
    offers: getUnitOffers(unit),
    containedInPlace: { "@id": LODGING_ID },
  };

  return { title, description, canonical, image: absoluteImage, jsonLd };
}
