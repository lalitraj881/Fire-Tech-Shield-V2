import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { InspectionSeverityBadge } from "@/components/InspectionSeverityBadge";
import { InspectionChecklist } from "@/components/InspectionChecklist";
import { QRScanner } from "@/components/QRScanner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  Play, 
  CheckCircle2, 
  QrCode, 
  Wrench, 
  AlertTriangle,
  Building2,
  Factory,
  Shield,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { getDeviceHistory, type InspectionSeverity } from "@/data/mockData";

export default function DeviceDetails() {
  const { jobId, deviceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showChecklist, setShowChecklist] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [deviceVerified, setDeviceVerified] = useState(false);
  const { devices, updateDeviceStatus, getNcsByDeviceId, getJobById } = useInspection();
  
  const device = devices.find((d) => d.id === deviceId);
  const history = getDeviceHistory(deviceId || "");
  const ncs = getNcsByDeviceId(deviceId || "");
  const job = getJobById(jobId || "");

  if (!device) {
    return <div className="p-8 text-center text-muted-foreground">Device not found</div>;
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleInspectionComplete = (result: "pass" | "fail", severity: InspectionSeverity) => {
    const newStatus = result === "pass" ? "completed" : "failed";
    updateDeviceStatus(device.id, newStatus);
    
    setTimeout(() => {
      navigate(`/job/${jobId}/devices`);
    }, 1500);
  };

  const handleScanSuccess = (scannedDeviceId: string) => {
    setScannerOpen(false);
    if (scannedDeviceId === deviceId) {
      setDeviceVerified(true);
      toast({
        title: "✅ Device Verified",
        description: `${device.name} matched successfully. Ready for inspection.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "❌ Wrong Device",
        description: "Scanned QR does not match this device.",
      });
    }
  };

  const openNcs = ncs.filter((nc) => nc.status === "open");

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBack title={device.name} />
      <main className="container px-4 py-6 space-y-6">
        {/* Device Image Card */}
        <Card>
          <CardContent className="p-4">
            {/* Device Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {device.imageUrl ? (
                <img
                  src={device.imageUrl}
                  alt={device.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <StatusBadge status={device.status} />
              </div>
              {deviceVerified && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-success/90 text-success-foreground px-2 py-1 rounded-full text-xs font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </div>
              )}
            </div>

            {/* QR Code & Serial */}
            <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Serial Number</p>
                  <p className="font-mono font-medium">{device.serialNumber}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scan to Verify Button */}
        <Button
          variant={deviceVerified ? "outline" : "default"}
          size="lg"
          className="w-full h-14 gap-3"
          onClick={() => setScannerOpen(true)}
        >
          <QrCode className="w-5 h-5" />
          {deviceVerified ? "Device Verified ✓ - Scan Again" : "Scan QR to Verify Device"}
        </Button>

        {/* Device Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">Serial Number</p>
                <p className="font-medium font-mono">{device.serialNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{device.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">System Type</p>
                <p className="font-medium">{device.systemType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Manufacturer</p>
                <p className="font-medium">{device.manufacturer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{device.building}</p>
                <p className="text-muted-foreground">{device.zone}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">{device.locationDescription}</p>
            </div>
            {device.gpsLat && device.gpsLng && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>GPS: {device.gpsLat.toFixed(6)}, {device.gpsLng.toFixed(6)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Installed</p>
                <p className="font-medium">{formatDate(device.installationDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Manufactured</p>
                <p className="font-medium">{formatDate(device.manufacturingDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Warranty Start</p>
                <p className="font-medium">{formatDate(device.warrantyStart)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Warranty End</p>
                <p className="font-medium">{formatDate(device.warrantyEnd)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground">Expiry Date</p>
                <p className="font-medium text-warning">{formatDate(device.expiryDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Inspection History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm py-2">No previous inspections</p>
            ) : (
              history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDate(h.date)}</p>
                      <p className="text-sm text-muted-foreground">{h.technician}</p>
                      {h.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{h.notes}</p>
                      )}
                    </div>
                  </div>
                  <InspectionSeverityBadge severity={h.severity || (h.result === "pass" ? "pass" : "critical")} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Open NCs */}
        {openNcs.length > 0 && (
          <Card className="border-warning/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Open NCs ({openNcs.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {openNcs.map((nc) => (
                <div
                  key={nc.id}
                  className="p-3 rounded-lg bg-warning/10 border border-warning/20 cursor-pointer hover:bg-warning/20 transition-colors"
                  onClick={() => navigate(`/nc/${nc.id}`)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-warning">{nc.id}</p>
                    <InspectionSeverityBadge severity={nc.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground">{nc.description}</p>
                  {nc.workOrderId && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Wrench className="w-3 h-3" />
                      <span>WO: {nc.workOrderId} - {nc.workOrderStatus}</span>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Inspection Button */}
        <Button
          size="lg"
          className="w-full h-14"
          onClick={() => setShowChecklist(true)}
          disabled={device.status !== "pending"}
        >
          {device.status === "pending" ? (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start Device Inspection
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Inspection Completed
            </>
          )}
        </Button>
      </main>

      {/* QR Scanner Modal */}
      <QRScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        expectedDeviceId={device.id}
        deviceName={device.name}
      />

      {/* Inspection Checklist Modal */}
      <InspectionChecklist
        open={showChecklist}
        onOpenChange={setShowChecklist}
        device={device}
        jobId={jobId || ""}
        onComplete={handleInspectionComplete}
      />
    </div>
  );
}
