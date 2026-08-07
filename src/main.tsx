import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Lovable serves index.html for every SPA route in production. Its static HTML can
// therefore describe a different route than the browser URL; mounting fresh avoids
// React hydrating that mismatched document.
createRoot(root).render(app);
