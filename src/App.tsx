import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Units from "./pages/Units";
import UnitDetail from "./pages/UnitDetail";
import Amenities from "./pages/Amenities";
import Gallery from "./pages/Gallery";
import Location from "./pages/Location";

import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import RentalApplication from "./pages/RentalApplication";
import ExtendStay from "./pages/ExtendStay";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import BookRedirect from "./pages/BookRedirect";
const HomesteadHillDraws = lazy(() => import("./pages/HomesteadHillDraws"));
const ContractorOfficeLaundry = lazy(() => import("./pages/ContractorOfficeLaundry"));
const AdminAuthGate = lazy(() => import("@/components/AdminAuthGate").then((m) => ({ default: m.AdminAuthGate })));
const OpsFunnel = lazy(() => import("./pages/OpsFunnel"));
const Admin = lazy(() => import("./pages/Admin"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          <Route path="/book" element={<BookRedirect />} />
          <Route
            path="/admin"
            element={
              <Suspense fallback={null}>
              <AdminAuthGate>
                <Admin />
              </AdminAuthGate>
              </Suspense>
            }
          />
          <Route
            path="/admin/draws"
            element={
              <Suspense fallback={null}>
              <AdminAuthGate>
                <HomesteadHillDraws />
              </AdminAuthGate>
              </Suspense>
            }
          />
          <Route
            path="/ops/funnel"
            element={
              <Suspense fallback={null}>
              <AdminAuthGate>
                <OpsFunnel />
              </AdminAuthGate>
              </Suspense>
            }
          />
          <Route path="/rental-application" element={<RentalApplication />} />
          <Route path="/extend-stay" element={<ExtendStay />} />
          <Route path="/extend/:unitId" element={<ExtendStay />} />
          <Route path="/contractors/office-laundry" element={<Suspense fallback={null}><ContractorOfficeLaundry /></Suspense>} />
          <Route path="/contractor/office-laundry" element={<Navigate to="/contractors/office-laundry" replace />} />
          <Route path="/contractor/office-laundry-bid-a7k29" element={<Navigate to="/contractors/office-laundry" replace />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
