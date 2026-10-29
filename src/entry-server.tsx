import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { units } from "./data/units";
export { getPropertyAccommodationSchema } from "./lib/accommodationSchema";

// Prerender metadata uses the same names as cards, details and booking selectors.
export const unitNames = Object.fromEntries(units.map(unit => [unit.id, unit.name]));

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
  );
}
