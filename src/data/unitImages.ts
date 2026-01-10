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

// Unit 4 Images
import unit4LivingRoom from "@/assets/units/unit-4/living-room.jpg";
import unit4Kitchen from "@/assets/units/unit-4/kitchen.jpg";
import unit4Kitchen2 from "@/assets/units/unit-4/kitchen-2.jpg";
import unit4Dining from "@/assets/units/unit-4/dining.jpg";
import unit4Entry from "@/assets/units/unit-4/entry.jpg";
import unit4Bedroom1 from "@/assets/units/unit-4/bedroom-1.jpg";
import unit4Bedroom2 from "@/assets/units/unit-4/bedroom-2.jpg";
import unit4Bathroom from "@/assets/units/unit-4/bathroom.jpg";

// Unit 5 Images
import unit5LivingRoom from "@/assets/units/unit-5/living-room.jpg";
import unit5KitchenLiving from "@/assets/units/unit-5/kitchen-living.jpg";
import unit5Kitchen from "@/assets/units/unit-5/kitchen.jpg";
import unit5Bedroom1 from "@/assets/units/unit-5/bedroom-1.jpg";
import unit5Bedroom2 from "@/assets/units/unit-5/bedroom-2.jpg";
import unit5Bathroom from "@/assets/units/unit-5/bathroom.jpg";

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
  "unit-4": {
    primary: unit4LivingRoom,
    gallery: [
      { src: unit4LivingRoom, alt: "Unit 4 - Cozy living room with comfortable seating", category: "Living" },
      { src: unit4Kitchen, alt: "Unit 4 - Full kitchen with modern appliances", category: "Kitchen" },
      { src: unit4Kitchen2, alt: "Unit 4 - Kitchen with stove and counter space", category: "Kitchen" },
      { src: unit4Dining, alt: "Unit 4 - Dining area with table", category: "Dining" },
      { src: unit4Entry, alt: "Unit 4 - Entry with smart lock", category: "Living" },
      { src: unit4Bedroom1, alt: "Unit 4 - Queen bedroom with natural light", category: "Bedroom" },
      { src: unit4Bedroom2, alt: "Unit 4 - Comfortable bedroom with storage", category: "Bedroom" },
      { src: unit4Bathroom, alt: "Unit 4 - Modern bathroom with vanity", category: "Bath" },
    ],
  },
  "unit-5": {
    primary: unit5LivingRoom,
    gallery: [
      { src: unit5LivingRoom, alt: "Unit 5 - Cozy living room with sectional sofa and TV", category: "Living" },
      { src: unit5KitchenLiving, alt: "Unit 5 - Open kitchen and living area", category: "Kitchen" },
      { src: unit5Kitchen, alt: "Unit 5 - Full kitchen with marble countertops and stainless appliances", category: "Kitchen" },
      { src: unit5Bedroom1, alt: "Unit 5 - Queen bedroom with TV and natural light", category: "Bedroom" },
      { src: unit5Bedroom2, alt: "Unit 5 - Spacious bedroom with ceiling fan", category: "Bedroom" },
      { src: unit5Bathroom, alt: "Unit 5 - Modern bathroom with shower", category: "Bath" },
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
