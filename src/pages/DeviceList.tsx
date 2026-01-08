import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DeviceCard } from "@/components/DeviceCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
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
  
  const job = getJobById(jobId || "");
  const devices = getDevicesByJobId(jobId || "");
  const stats = getJobStats(jobId || "");

  const handleQRScan = () => {
    // Simulate QR scan - navigate to first pending device
    const pendingDevice = devices.find((d) => d.status === "pending");
    if (pendingDevice) {
      toast({
        title: "✅ Device Verified",
        description: `${pendingDevice.name} matched successfully`,
      });
      navigate(`/job/${jobId}/device/${pendingDevice.id}`);
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

        {/* Device List */}
        <div className="space-y-3">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} jobId={jobId || ""} />
          ))}
        </div>

        {/* Complete Button - shows when all devices done */}
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
    </div>
  );
}
