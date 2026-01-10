// Unit 1 Images
import unit1LivingRoom from "@/assets/units/unit-1/living-room.jpg";
import unit1Kitchen1 from "@/assets/units/unit-1/kitchen-1.jpg";
import unit1Kitchen2 from "@/assets/units/unit-1/kitchen-2.jpg";
import unit1Entry from "@/assets/units/unit-1/entry.jpg";
import unit1Dining from "@/assets/units/unit-1/dining.jpg";
import unit1Bedroom1 from "@/assets/units/unit-1/bedroom-1.jpg";
import unit1Bedroom2 from "@/assets/units/unit-1/bedroom-2.jpg";
import unit1Bathroom from "@/assets/units/unit-1/bathroom.jpg";

// Unit 2 Images
import unit2LivingRoom1 from "@/assets/units/unit-2/living-room-1.jpg";
import unit2LivingRoom2 from "@/assets/units/unit-2/living-room-2.jpg";
import unit2TvCorner from "@/assets/units/unit-2/tv-corner.jpg";
import unit2KitchenDining from "@/assets/units/unit-2/kitchen-dining.jpg";
import unit2Kitchen from "@/assets/units/unit-2/kitchen.jpg";
import unit2Bedroom1 from "@/assets/units/unit-2/bedroom-1.jpg";
import unit2Bedroom2 from "@/assets/units/unit-2/bedroom-2.jpg";
import unit2Bedroom3 from "@/assets/units/unit-2/bedroom-3.jpg";
import unit2Bathroom from "@/assets/units/unit-2/bathroom.jpg";

// Unit 3 Images
import unit3LivingRoom from "@/assets/units/unit-3/living-room.jpg";
import unit3Kitchen from "@/assets/units/unit-3/kitchen.jpg";
import unit3KitchenDining from "@/assets/units/unit-3/kitchen-dining.jpg";
import unit3Bedroom1 from "@/assets/units/unit-3/bedroom-1.jpg";
import unit3Bedroom2 from "@/assets/units/unit-3/bedroom-2.jpg";
import unit3Bathroom from "@/assets/units/unit-3/bathroom.jpg";
import unit3Shower from "@/assets/units/unit-3/shower.jpg";

export interface UnitImage {
  src: string;
  alt: string;
  category: "Living" | "Bedroom" | "Kitchen" | "Bath" | "Exterior" | "Dining";
}

export interface UnitImages {
  primary: string;
  gallery: UnitImage[];
}

// Images organized by unit
export const unitImages: Record<string, UnitImages> = {
  "unit-1": {
    primary: unit1LivingRoom,
    gallery: [
      { src: unit1LivingRoom, alt: "Unit 1 - Cozy living room with TV and comfortable seating", category: "Living" },
      { src: unit1Bedroom1, alt: "Unit 1 - Queen bedroom with natural light", category: "Bedroom" },
      { src: unit1Bedroom2, alt: "Unit 1 - Bedroom with mirror and storage", category: "Bedroom" },
      { src: unit1Kitchen1, alt: "Unit 1 - Full kitchen with stainless appliances", category: "Kitchen" },
      { src: unit1Kitchen2, alt: "Unit 1 - Kitchen with stove, microwave, and Keurig", category: "Kitchen" },
      { src: unit1Dining, alt: "Unit 1 - Dining area by the window", category: "Dining" },
      { src: unit1Entry, alt: "Unit 1 - Entry with smart lock", category: "Living" },
      { src: unit1Bathroom, alt: "Unit 1 - Modern bathroom with vanity", category: "Bath" },
    ],
  },
  "unit-2": {
    primary: unit2LivingRoom1,
    gallery: [
      { src: unit2LivingRoom1, alt: "Unit 2 - Open living area with TV and ceiling fan", category: "Living" },
      { src: unit2LivingRoom2, alt: "Unit 2 - Comfortable seating with industrial lamp", category: "Living" },
      { src: unit2TvCorner, alt: "Unit 2 - Entertainment corner with smart TV", category: "Living" },
      { src: unit2KitchenDining, alt: "Unit 2 - Kitchen and dining area with rustic table", category: "Kitchen" },
      { src: unit2Kitchen, alt: "Unit 2 - Full kitchen with granite countertops", category: "Kitchen" },
      { src: unit2Bedroom1, alt: "Unit 2 - Bedroom with queen bed and storage", category: "Bedroom" },
      { src: unit2Bedroom2, alt: "Unit 2 - Queen bedroom with decorative pillows", category: "Bedroom" },
      { src: unit2Bedroom3, alt: "Unit 2 - Cozy bedroom with natural light", category: "Bedroom" },
      { src: unit2Bathroom, alt: "Unit 2 - Bathroom with stocked towels", category: "Bath" },
    ],
  },
  "unit-3": {
    primary: unit3LivingRoom,
    gallery: [
      { src: unit3LivingRoom, alt: "Unit 3 - Stylish living room with sectional sofa and TV", category: "Living" },
      { src: unit3Kitchen, alt: "Unit 3 - Full kitchen with marble countertops and Keurig", category: "Kitchen" },
      { src: unit3KitchenDining, alt: "Unit 3 - Kitchen and dining area with rustic table", category: "Kitchen" },
      { src: unit3Bedroom1, alt: "Unit 3 - Bedroom with queen bed and storage", category: "Bedroom" },
      { src: unit3Bedroom2, alt: "Unit 3 - Cozy queen bedroom with decorative pillows", category: "Bedroom" },
      { src: unit3Bathroom, alt: "Unit 3 - Modern bathroom with vanity and towel storage", category: "Bath" },
      { src: unit3Shower, alt: "Unit 3 - Shower with stylish curtain", category: "Bath" },
    ],
  },
};

// Get all gallery images across all units
export const getAllGalleryImages = (): (UnitImage & { unitId: string })[] => {
  return Object.entries(unitImages).flatMap(([unitId, images]) =>
    images.gallery.map((img) => ({ ...img, unitId }))
  );
};

// Get primary image for a unit (returns placeholder if not available)
export const getUnitPrimaryImage = (unitId: string): string | null => {
  return unitImages[unitId]?.primary || null;
};

// Get gallery images for a unit
export const getUnitGalleryImages = (unitId: string): UnitImage[] => {
  return unitImages[unitId]?.gallery || [];
};
