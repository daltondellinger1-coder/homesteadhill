import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
export { getPropertyAccommodationSchema } from "./lib/accommodationSchema";
// Prerender titles, descriptions, canonicals and the sitemap come from the same data as the app.
export { getIndexableRoutes, getCanonicalUrl, buildSitemapXml } from "./lib/siteMeta";

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
