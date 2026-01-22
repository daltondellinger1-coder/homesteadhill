export interface Unit {
  id: string;
  name: string;
  type: 'apartment' | 'cottage';
  sleeps: number;
  bedrooms: number;
  beds: number;
  bedType: string;
  baths: number;
  description: string;
  amenities: string[];
  featured?: boolean;
  priceNote?: string;
  monthlyPrice: number;
}

export const units: Unit[] = [
  {
    id: "unit-1",
    name: "Unit 1",
    type: "apartment",
    sleeps: 2,
    bedrooms: 1,
    beds: 1,
    bedType: "Queen",
    baths: 1,
    description: "Cozy 1-bedroom with dedicated workspace, full kitchen (refrigerator, microwave, stove, Keurig), Wi-Fi, TV, A/C & heat, smart-lock entry, free parking.",
    amenities: ["Dedicated Workspace", "Full Kitchen", "Refrigerator", "Microwave", "Stove", "Keurig", "Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    monthlyPrice: 1500,
  },
  {
    id: "unit-2",
    name: "Unit 2",
    type: "apartment",
    sleeps: 2,
    bedrooms: 1,
    beds: 1,
    bedType: "Queen",
    baths: 1,
    description: "Comfortable 1-bedroom with full kitchen, Wi-Fi, TV, smart-lock self check-in, and free parking. Perfect for solo travelers or couples.",
    amenities: ["Full Kitchen", "Refrigerator", "Microwave", "Stove", "Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    monthlyPrice: 1500,
  },
  {
    id: "unit-3",
    name: "Unit 3",
    type: "apartment",
    sleeps: 2,
    bedrooms: 1,
    beds: 1,
    bedType: "Queen",
    baths: 1,
    description: "Highly rated 1-bedroom with queen bed, stylish living area, full kitchen, Wi-Fi, and free parking. Guest favorite!",
    amenities: ["Full Kitchen", "Stylish Living Area", "Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    featured: true,
    monthlyPrice: 1500,
  },
  {
    id: "unit-4",
    name: "Unit 4",
    type: "apartment",
    sleeps: 2,
    bedrooms: 1,
    beds: 1,
    bedType: "Queen",
    baths: 1,
    description: "Queen bed, smart-lock entry, fast Wi-Fi, kitchen with stove/oven & microwave, dedicated workspace. Ideal for business travelers.",
    amenities: ["Dedicated Workspace", "Full Kitchen", "Stove/Oven", "Microwave", "Fast Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    monthlyPrice: 1500,
  },
  {
    id: "unit-5",
    name: "Unit 5",
    type: "apartment",
    sleeps: 4,
    bedrooms: 2,
    beds: 2,
    bedType: "Queen + Full",
    baths: 1,
    description: "Spacious 2-bedroom for professionals; large living area, full kitchen (electric stove/oven, refrigerator, cooking basics), private entrance, long-term stays welcome.",
    amenities: ["2 Bedrooms", "Large Living Area", "Full Kitchen", "Electric Stove/Oven", "Refrigerator", "Private Entrance", "Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    monthlyPrice: 1700,
  },
  {
    id: "unit-6",
    name: "Unit 6",
    type: "apartment",
    sleeps: 4,
    bedrooms: 2,
    beds: 2,
    bedType: "Queen + Full",
    baths: 1,
    description: "Bright 2-bedroom with large living area, full kitchen, modern bath, free parking, and exterior security cameras for peace of mind.",
    amenities: ["2 Bedrooms", "Bright Living Area", "Full Kitchen", "Modern Bath", "Security Cameras", "Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    monthlyPrice: 1700,
  },
  {
    id: "unit-11",
    name: "Unit 11 - Cottage",
    type: "cottage",
    sleeps: 2,
    bedrooms: 1,
    beds: 1,
    bedType: "Queen",
    baths: 1,
    description: "Standalone cottage with dedicated workspace, compact kitchen, modern bath, and private feel. Perfect for those seeking extra privacy.",
    amenities: ["Standalone Cottage", "Dedicated Workspace", "Compact Kitchen", "Modern Bath", "Private Setting", "Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    featured: true,
    monthlyPrice: 1500,
  },
  {
    id: "unit-13",
    name: "Unit 13 - Premium Cottage",
    type: "cottage",
    sleeps: 2,
    bedrooms: 1,
    beds: 1,
    bedType: "King",
    baths: 1,
    description: "Premium cottage with king-size bed, stylish living area, kitchenette, modern bath. Our most luxurious standalone option.",
    amenities: ["Premium Cottage", "King Bed", "Stylish Living Area", "Kitchenette", "Modern Bath", "Wi-Fi", "TV", "A/C & Heat", "Smart Lock", "Free Parking"],
    featured: true,
    monthlyPrice: 1500,
  },
];

export const amenitiesData = [
  { icon: "UtensilsCrossed", label: "Full Kitchens", description: "Refrigerator, stove, microwave, Keurig, dishes" },
  { icon: "Laptop", label: "Dedicated Workspace", description: "Desk setup for productive work" },
  { icon: "Wifi", label: "Fast Wi-Fi", description: "High-speed internet throughout" },
  { icon: "Tv", label: "Smart TV", description: "Streaming-ready entertainment" },
  { icon: "Thermometer", label: "A/C & Heat", description: "Climate control year-round" },
  { icon: "Fan", label: "Ceiling Fans", description: "Additional comfort" },
  { icon: "Car", label: "Free Parking", description: "Convenient on-site parking" },
  { icon: "KeyRound", label: "Smart Lock", description: "Self check-in convenience" },
  { icon: "Shield", label: "Safety Features", description: "Smoke & CO alarms, fire extinguisher" },
  { icon: "Camera", label: "Security Cameras", description: "Exterior cameras for safety" },
  { icon: "Sparkles", label: "Cleaning Available", description: "Optional mid-stay cleaning" },
];

export const faqData = [
  {
    question: "What time is check-in and check-out?",
    answer: "Check-in is at 2:00 PM and check-out is at 11:00 AM. Self check-in is available 24/7 via smart lock—you'll receive your unique access code before arrival.",
  },
  {
    question: "Is parking available?",
    answer: "Yes! Free parking is included with every unit. Each unit has a designated parking spot right outside.",
  },
  {
    question: "Are there quiet hours?",
    answer: "Yes, quiet hours are from 10:00 PM to 8:00 AM out of respect for neighbors and fellow guests.",
  },
  {
    question: "Do you offer long-term stays?",
    answer: "Absolutely! We specialize in extended stays for traveling professionals. Contact us for discounted rates on 30+ day bookings.",
  },
  {
    question: "Is cleaning included?",
    answer: "All units are professionally cleaned before each stay. For longer stays, we offer optional mid-stay cleaning services.",
  },
  {
    question: "What safety features are in place?",
    answer: "Every unit has smoke and CO detectors, fire extinguishers, and first aid kits. Select units also have exterior security cameras.",
  },
  {
    question: "Is there laundry on-site?",
    answer: "Washer/dryer is not included in the units, but there's a convenient laundromat located just 5 minutes away.",
  },
  {
    question: "Can I book directly instead of through Airbnb?",
    answer: "Yes! Booking direct saves you money—no platform fees. Use our booking form or contact us directly for the best rates.",
  },
];

export const perfectForData = [
  { icon: "Stethoscope", label: "Traveling Nurses" },
  { icon: "HardHat", label: "Contractors" },
  { icon: "Briefcase", label: "Corporate Travelers" },
  { icon: "GraduationCap", label: "Visiting Professors" },
];
