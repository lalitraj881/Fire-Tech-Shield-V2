import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import JobDetails from "./pages/JobDetails";
import DeviceList from "./pages/DeviceList";
import DeviceDetails from "./pages/DeviceDetails";
import JobSummary from "./pages/JobSummary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
