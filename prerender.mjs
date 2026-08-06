import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const { render } = await import(join(dist, "server", "entry-server.js"));
const baseUrl = "https://homestead-hill.com";

const pages = [
  ["/", "Homestead Hill | Furnished Apartments & Cottages in Vincennes, IN", "Book direct and save! Fully furnished apartments and cottages in Vincennes, Indiana. Perfect for traveling nurses, contractors, and business travelers. Self check-in, free parking, fast Wi-Fi."],
  ["/units", "Browse All Units | Homestead Hill Furnished Rentals", "View all available furnished apartments and cottages in Vincennes, IN. 1-2 bedroom options with full kitchens, Wi-Fi, and free parking. Monthly rates from $1,450."],
  ["/units/unit-1", "Unit 1 — 1 Bed Furnished Apartment, Vincennes IN", "Cozy 1-bedroom with dedicated workspace, full kitchen, Wi-Fi, TV, A/C and heat, smart-lock entry, and free parking. Sleeps 2. Book direct from $1,600/month."],
  ["/units/unit-2", "Unit 2 — 1 Bed Furnished Apartment, Vincennes IN", "Comfortable 1-bedroom with full kitchen, Wi-Fi, TV, smart-lock self check-in, and free parking. Sleeps 2. Book direct from $1,600/month."],
  ["/units/unit-3", "Unit 3 — 1 Bed Furnished Apartment, Vincennes IN", "Highly rated 1-bedroom with queen bed, stylish living area, full kitchen, Wi-Fi, and free parking. Sleeps 2. Book direct from $1,600/month."],
  ["/units/unit-4", "Unit 4 — 1 Bed Furnished Apartment, Vincennes IN", "Queen bed, smart-lock entry, fast Wi-Fi, kitchen with stove and microwave, and dedicated workspace. Sleeps 2. Book direct from $1,600/month."],
  ["/units/unit-5", "Unit 5 — 2 Bed Furnished Apartment, Vincennes IN", "Spacious 2-bedroom for professionals with a large living area, full kitchen, private entrance, and long-term stays welcome. Sleeps 4. Book direct from $1,800/month."],
  ["/units/unit-6", "Unit 6 — 2 Bed Furnished Apartment, Vincennes IN", "Bright 2-bedroom with a large living area, full kitchen, modern bath, free parking, and exterior security cameras. Sleeps 4. Book direct from $1,800/month."],
  ["/units/unit-11", "Unit 11 Cottage — 1 Bed Furnished Rental, Vincennes IN", "Standalone cottage with dedicated workspace, compact kitchen, modern bath, and a private feel. Sleeps 2. Book direct from $1,700/month."],
  ["/units/unit-13", "Unit 13 Cottage — 1 Bed Furnished Rental, Vincennes IN", "Standalone cottage with a comfortable bedroom, stylish living area, kitchenette, modern bath, Wi-Fi, and free parking. Sleeps 2. Book direct from $1,700/month."],
  ["/units/unit-14", "Unit 14 Premium Cottage — Furnished Rental, Vincennes IN", "Premium standalone cottage with private entry, full kitchen, in-unit laundry, workspace, Wi-Fi, and smart-lock self check-in. Sleeps 2. Book direct from $1,850/month."],
  ["/amenities", "Amenities | Homestead Hill Furnished Apartments", "Every Homestead Hill unit includes full kitchen, fast Wi-Fi, smart TV, A/C and heat, free parking, and smart-lock self check-in. See all amenities."],
  ["/gallery", "Photo Gallery | Homestead Hill Vincennes Rentals", "Browse photos of our fully furnished apartments and cottages in Vincennes, Indiana. See kitchens, bedrooms, living areas, and more."],
  ["/location", "Location | Homestead Hill - Vincennes, Indiana", "Homestead Hill is conveniently located in Vincennes, Indiana near Good Samaritan Hospital, Vincennes University, and local restaurants."],
  ["/faq", "FAQ | Homestead Hill Furnished Rentals", "Frequently asked questions about staying at Homestead Hill: check-in, parking, long-term stays, cleaning, and booking direct."],
  ["/contact", "Book Your Stay | Homestead Hill Direct Booking", "Book directly with Homestead Hill and save on platform fees. Request a reservation for furnished apartments and cottages in Vincennes, IN."],
  ["/privacy-policy", "Privacy Policy | Homestead Hill", "Read Homestead Hill's privacy policy."],
  ["/terms-of-service", "Terms of Service | Homestead Hill", "Read Homestead Hill's terms of service."],
];

const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function pageHtml(template, route, title, description) {
  const canonical = `${baseUrl}${route === "/" ? "/" : route}`;
  const withMeta = template
    .replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="title"\s+content=")[^"]*("\s*\/?>)/i, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/i, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/i, `$1${canonical}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/i, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/i, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+name="twitter:url"\s+content=")[^"]*("\s*\/?>)/i, `$1${canonical}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/?>)/i, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/?>)/i, `$1${escapeHtml(description)}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/i, `$1${canonical}$2`);
  return withMeta.replace('<div id="root"></div>', `<div id="root">${render(route)}</div>`);
}

const template = await readFile(join(dist, "index.html"), "utf8");
for (const [route, title, description] of pages) {
  const output = route === "/" ? join(dist, "index.html") : join(dist, `${route.slice(1)}.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, pageHtml(template, route, title, description));
}
console.log(`Pre-rendered ${pages.length} sitemap routes to static HTML.`);
