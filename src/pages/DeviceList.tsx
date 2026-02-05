import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DeviceCard } from "@/components/DeviceCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { LiveGPSMap } from "@/components/LiveGPSMap";
import { QRScanner } from "@/components/QRScanner";
import { SearchFilter, defaultFilters, FilterState } from "@/components/SearchFilter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, CheckCircle2 } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { useToast } from "@/hooks/use-toast";

export default function DeviceList() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getJobById, getDevicesByJobId, getJobStats } = useInspection();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    showCompleted: true, // Show all devices by default
  });
  
  const job = getJobById(jobId || "");
  const devices = getDevicesByJobId(jobId || "");
  const stats = getJobStats(jobId || "");

  // Apply filters to devices
  const filteredDevices = useMemo(() => {
    let result = devices;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((device) =>
        device.name.toLowerCase().includes(searchLower) ||
        device.serialNumber.toLowerCase().includes(searchLower) ||
        device.locationDescription.toLowerCase().includes(searchLower) ||
        device.type.toLowerCase().includes(searchLower) ||
        device.building.toLowerCase().includes(searchLower) ||
        device.zone.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((device) => device.status === filters.status);
    }

    // Show completed filter
    if (!filters.showCompleted) {
      result = result.filter((device) => device.status === "pending");
    }

    return result;
  }, [devices, filters]);
  
  const pendingDevice = devices.find((d) => d.status === "pending");

  const handleScanSuccess = (deviceId: string) => {
    setScannerOpen(false);
    toast({
      title: "✅ Device Verified",
      description: `${pendingDevice?.name} matched successfully`,
    });
    navigate(`/job/${jobId}/device/${deviceId}`);
  };

  const handleQRScan = () => {
    if (pendingDevice) {
      setScannerOpen(true);
    } else {
      toast({
        title: "All devices inspected",
        description: "No pending devices remaining",
      });
    }
  };

  if (!job) return <div className="p-8 text-center text-muted-foreground">Job not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBack title={job.siteName} />
      <main className="container px-4 py-6 space-y-6">
        {/* Progress Card */}
        <Card>
          <CardContent className="p-4">
            <ProgressIndicator 
              completed={stats.completed} 
              total={stats.total} 
              failed={stats.failed} 
            />
          </CardContent>
        </Card>

        {/* Live GPS Map */}
        <LiveGPSMap 
          siteName={job.siteName}
          siteGpsLat={job.siteGpsLat}
          siteGpsLng={job.siteGpsLng}
          devices={devices}
          currentDevice={pendingDevice}
        />

        {/* Search & Filter */}
        <SearchFilter
          value={filters}
          onChange={setFilters}
          mode="devices"
          placeholder="Search devices, serial, location..."
        />

        {/* Device List */}
        <div className="space-y-3">
          {filteredDevices.map((device) => (
            <DeviceCard key={device.id} device={device} jobId={jobId || ""} />
          ))}
          
          {filteredDevices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>{filters.search ? "No matching devices found" : "No devices"}</p>
            </div>
          )}
        </div>

        {/* Complete Button */}
        {stats.completed === stats.total && stats.total > 0 && (
          <Button
            className="w-full h-14 animate-fade-in"
            onClick={() => navigate(`/job/${jobId}/summary`)}
          >
            <CheckCircle2 className="w-5 h-5 mr-2" />
            View Summary & Complete Job
          </Button>
        )}
      </main>

      {/* Floating QR Scan Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg animate-pulse-glow"
          onClick={handleQRScan}
        >
          <QrCode className="w-6 h-6" />
        </Button>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        expectedDeviceId={pendingDevice?.id}
        deviceName={pendingDevice?.name}
      />
    </div>
  );
}
