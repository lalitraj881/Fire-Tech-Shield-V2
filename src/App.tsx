import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { InspectionProvider } from "@/context/InspectionContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import JobDetails from "./pages/JobDetails";
import DeviceList from "./pages/DeviceList";
import DeviceDetails from "./pages/DeviceDetails";
import JobSummary from "./pages/JobSummary";
import AssetCreation from "./pages/AssetCreation";
import NCDetails from "./pages/NCDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <InspectionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/job/:jobId" element={<JobDetails />} />
              <Route path="/job/:jobId/devices" element={<DeviceList />} />
              <Route path="/job/:jobId/device/:deviceId" element={<DeviceDetails />} />
              <Route path="/job/:jobId/summary" element={<JobSummary />} />
              <Route path="/asset/new" element={<AssetCreation />} />
              <Route path="/nc/:ncId" element={<NCDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </InspectionProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
