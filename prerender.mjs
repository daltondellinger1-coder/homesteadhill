import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const { render, getIndexableRoutes, getCanonicalUrl, buildSitemapXml, getPropertyAccommodationSchema } = await import(join(dist, "server", "entry-server.js"));

// Routes, titles and descriptions are generated from shared site/unit data.
const pages = getIndexableRoutes().map(({ route, title, description }) => [route, title, description]);

const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function pageHtml(template, route, title, description) {
  const canonical = getCanonicalUrl(route);
  const withMeta = template
    .replace(/<title>[^<]*<\/title>/i, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name="title"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${escapeHtml(title)}${p2}`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${escapeHtml(description)}${p2}`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${canonical}${p2}`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${escapeHtml(title)}${p2}`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${escapeHtml(description)}${p2}`)
    .replace(/(<meta\s+name="twitter:url"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${canonical}${p2}`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${escapeHtml(title)}${p2}`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*("\s*\/?>)/i, (m, p1, p2) => `${p1}${escapeHtml(description)}${p2}`)
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, "")
    .replace("</head>", () => `    <link rel="canonical" href="${canonical}" />\n  </head>`);
  return withMeta.replace('<div id="root"></div>', () => `<div id="root">${render(route)}</div>`);
}

const template = (await readFile(join(dist, "index.html"), "utf8"))
  .replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (script, body) => {
    const schema = JSON.parse(body);
    if (schema["@type"] !== "LodgingBusiness") return script;
    return `<script type="application/ld+json">${JSON.stringify({ ...schema, ...getPropertyAccommodationSchema() }).replace(/</g, "\\u003c")}</script>`;
  });

// Remove stale flat .html artifacts so directory index outputs can take over
for (const [route] of pages) {
  if (route === "/") continue;
  try {
    await rm(join(dist, `${route.slice(1)}.html`));
  } catch {}
}

for (const [route, title, description] of pages) {
  const output = route === "/" ? join(dist, "index.html") : join(dist, route.slice(1), "index.html");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, pageHtml(template, route, title, description));
}
await writeFile(join(dist, "sitemap.xml"), buildSitemapXml());
console.log(`Pre-rendered ${pages.length} sitemap routes to static HTML.`);
