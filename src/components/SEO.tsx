import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: "website" | "article" | "product";
  image?: string;
  noindex?: boolean;
}

const BASE_URL = "https://homestead-hill.com";
const DEFAULT_TITLE = "Homestead Hill | Furnished Apartments & Cottages in Vincennes, IN";
const DEFAULT_DESCRIPTION = "Book direct and save! Fully furnished apartments and cottages in Vincennes, Indiana. Perfect for traveling nurses, contractors, and business travelers. Self check-in, free parking, fast Wi-Fi.";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonical,
  type = "website",
  image = DEFAULT_IMAGE,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
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
    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    // Open Graph
    setMeta("og:type", type, true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:image", image, true);
    setMeta("og:url", canonical || window.location.href, true);
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
    canonicalLink.href = canonical || `${BASE_URL}${window.location.pathname}`;

  }, [title, description, canonical, type, image, noindex]);

  return null;
}

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: "Homestead Hill | Furnished Apartments & Cottages in Vincennes, IN",
    description: "Book direct and save! Fully furnished apartments and cottages in Vincennes, Indiana. Perfect for traveling nurses, contractors, and business travelers. Self check-in, free parking, fast Wi-Fi.",
  },
  units: {
    title: "Browse All Units | Homestead Hill Furnished Rentals",
    description: "View all available furnished apartments and cottages in Vincennes, IN. 1-2 bedroom options with full kitchens, Wi-Fi, and free parking. Monthly rates from $1,450.",
  },
  amenities: {
    title: "Amenities | Homestead Hill Furnished Apartments",
    description: "Every Homestead Hill unit includes full kitchen, fast Wi-Fi, smart TV, A/C & heat, free parking, and smart lock self check-in. See all amenities.",
  },
  gallery: {
    title: "Photo Gallery | Homestead Hill Vincennes Rentals",
    description: "Browse photos of our fully furnished apartments and cottages in Vincennes, Indiana. See kitchens, bedrooms, living areas, and more.",
  },
  location: {
    title: "Location | Homestead Hill - Vincennes, Indiana",
    description: "Homestead Hill is conveniently located in Vincennes, Indiana. Near Good Samaritan Hospital, Vincennes University, and local restaurants.",
  },
  faq: {
    title: "FAQ | Homestead Hill Furnished Rentals",
    description: "Frequently asked questions about staying at Homestead Hill. Check-in times, parking, long-term stays, cleaning, and booking direct.",
  },
  contact: {
    title: "Book Your Stay | Homestead Hill Direct Booking",
    description: "Book directly with Homestead Hill and save on platform fees. Request a reservation for furnished apartments and cottages in Vincennes, IN.",
  },
};

// Generate unit-specific SEO
export function getUnitSEO(unit: { name: string; type: string; bedrooms: number; description: string }) {
  return {
    title: `${unit.name} - ${unit.bedrooms} Bed ${unit.type === 'cottage' ? 'Cottage' : 'Apartment'} | Homestead Hill`,
    description: `${unit.description} Book direct for the best rates on this furnished ${unit.type} in Vincennes, IN.`,
  };
}
