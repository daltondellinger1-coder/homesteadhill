import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Units from "./pages/Units";
import UnitDetail from "./pages/UnitDetail";
import Amenities from "./pages/Amenities";
import Gallery from "./pages/Gallery";
import Location from "./pages/Location";

import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import { AdminAuthGate } from "@/components/AdminAuthGate";
import RentalApplication from "./pages/RentalApplication";
import ExtendStay from "./pages/ExtendStay";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/units" element={<Units />} />
          <Route path="/units/:id" element={<UnitDetail />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/location" element={<Location />} />
          
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin"
            element={
              <AdminAuthGate>
                <Admin />
              </AdminAuthGate>
            }
          />
          <Route path="/rental-application" element={<RentalApplication />} />
          <Route path="/extend/:unitId" element={<ExtendStay />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
