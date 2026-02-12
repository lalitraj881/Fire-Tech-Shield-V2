import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { InspectionProvider } from "@/context/InspectionContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ScanDevice from "./pages/ScanDevice";
import DeviceHub from "./pages/DeviceHub";
import RelocateDevice from "./pages/RelocateDevice";
import DeviceHistoryPage from "./pages/DeviceHistoryPage";
import SearchDevice from "./pages/SearchDevice";
import MyTasks from "./pages/MyTasks";
import SyncStatus from "./pages/SyncStatus";
import AssetCreation from "./pages/AssetCreation";
import JobDetails from "./pages/JobDetails";
import DeviceList from "./pages/DeviceList";
import JobSummary from "./pages/JobSummary";
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
              <Route path="/home" element={<Home />} />
              <Route path="/scan" element={<ScanDevice />} />
              <Route path="/install" element={<AssetCreation />} />
              <Route path="/device/:deviceId" element={<DeviceHub />} />
              <Route path="/device/:deviceId/relocate" element={<RelocateDevice />} />
              <Route path="/device/:deviceId/history" element={<DeviceHistoryPage />} />
              <Route path="/search" element={<SearchDevice />} />
              <Route path="/tasks" element={<MyTasks />} />
              <Route path="/sync" element={<SyncStatus />} />
              {/* Legacy job routes */}
              <Route path="/dashboard" element={<Navigate to="/home" replace />} />
              <Route path="/job/:jobId" element={<JobDetails />} />
              <Route path="/job/:jobId/devices" element={<DeviceList />} />
              <Route path="/job/:jobId/device/:deviceId" element={<DeviceHub />} />
              <Route path="/job/:jobId/summary" element={<JobSummary />} />
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
