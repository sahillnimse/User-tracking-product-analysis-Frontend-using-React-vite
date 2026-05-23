// src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes }     from "react-router-dom";
import { Toaster as Sonner }                from "@/components/ui/sonner";
import { Toaster }                          from "@/components/ui/toaster";
import { TooltipProvider }                  from "@/components/ui/tooltip";

import DashboardLayout   from "@/components/dashboard/DashboardLayout";
import { ProtectedRoute } from "@/components/dashboard/ProtectedRoute";

// ── Main pages ────────────────────────────────────────────────────────────────
import Overview          from "./pages/dashboard/Overview";
import Events            from "./pages/dashboard/Events";
import Funnel            from "./pages/dashboard/Funnel";
import FeatureAdoption   from "./pages/dashboard/FeatureAdoption";
import Conversion        from "./pages/dashboard/Conversion";
import Segments          from "./pages/dashboard/Segments";
import Retention         from "./pages/dashboard/Retention";
import CsvAnalysis       from "./pages/dashboard/CsvAnalysis";
import ProductHealth     from "./pages/dashboard/ProductHealth";
import PageFlow          from "./pages/dashboard/PageFlow";
import PageAnalytics     from "./pages/dashboard/PageAnalytics";
import NotFound          from "./pages/NotFound";

// ── Detail pages ──────────────────────────────────────────────────────────────
import UserDetail        from "./pages/dashboard/detail/UserDetail";
import EventDetail       from "./pages/dashboard/detail/EventDetail";
import SegmentDetail     from "./pages/dashboard/detail/SegmentDetail";
import FeatureDetail     from "./pages/dashboard/detail/FeatureDetail";
import FunnelStepDetail  from "./pages/dashboard/detail/FunnelStepDetail";
import PageDetail        from "./pages/dashboard/detail/PageDetail";
import IssueDetail       from "./pages/dashboard/detail/IssueDetail";
import CohortDetail      from "./pages/dashboard/detail/CohortDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition:   true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/*
           * ProtectedRoute wraps the entire dashboard shell.
           * Only approved emails (defined in src/lib/auth.ts) can enter.
           * To disable auth during local dev, temporarily remove <ProtectedRoute>.
           */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* ── Main dashboard pages ── */}
            <Route path="/"               element={<Overview />} />
            <Route path="/events"         element={<Events />} />
            <Route path="/funnel"         element={<Funnel />} />
            <Route path="/features"       element={<FeatureAdoption />} />
            <Route path="/conversion"     element={<Conversion />} />
            <Route path="/segments"       element={<Segments />} />
            <Route path="/retention"      element={<Retention />} />
            <Route path="/csv"            element={<CsvAnalysis />} />
            <Route path="/health"         element={<ProductHealth />} />
            <Route path="/pageflow"       element={<PageFlow />} />
            <Route path="/pageanalytics"  element={<PageAnalytics />} />

            {/* ── Detail pages ── */}
            <Route path="/users/:userId"          element={<UserDetail />} />
            <Route path="/events/:eventName"       element={<EventDetail />} />
            <Route path="/segments/:segmentName"   element={<SegmentDetail />} />
            <Route path="/features/:featureName"   element={<FeatureDetail />} />
            <Route path="/funnel/:stepName"        element={<FunnelStepDetail />} />
            <Route path="/pageflow/:pageName"      element={<PageDetail />} />
            <Route path="/health/:issueTitle"      element={<IssueDetail />} />
            <Route path="/retention/:cohort"       element={<CohortDetail />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;