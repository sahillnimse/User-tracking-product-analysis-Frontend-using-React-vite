import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Events from "./pages/dashboard/Events";
import Funnel from "./pages/dashboard/Funnel";
import FeatureAdoption from "./pages/dashboard/FeatureAdoption";
import Conversion from "./pages/dashboard/Conversion";
import Segments from "./pages/dashboard/Segments";
import Retention from "./pages/dashboard/Retention";
import CsvAnalysis from "./pages/dashboard/CsvAnalysis";
import ProductHealth from "./pages/dashboard/ProductHealth";
import PageFlow from "./pages/dashboard/PageFlow";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
            <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/events" element={<Events />} />
            <Route path="/funnel" element={<Funnel />} />
            <Route path="/features" element={<FeatureAdoption />} />
            <Route path="/conversion" element={<Conversion />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/retention" element={<Retention />} />
            <Route path="/csv" element={<CsvAnalysis />} />
            <Route path="/health" element={<ProductHealth />} />
            <Route path="/pageflow" element={<PageFlow />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
