import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { InspectionChecklist } from "@/components/InspectionChecklist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Wrench, 
  Move, 
  AlertOctagon, 
  History, 
  QrCode, 
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Shield,
  Clock,
  Building2
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { type InspectionSeverity } from "@/data/mockData";
import { QRScanner } from "@/components/QRScanner";
import { Device } from "@/types";

export default function DeviceHub() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  // Call useInspection only once
  const { getDeviceById, updateDeviceStatus, getNcsByDeviceId, jobs, submitInspectionResults } = useInspection();
  
  // Try to get device from Context OR Navigation State (passed from Scan)
  let device: Device | undefined = getDeviceById(deviceId || "");
  
  // If not in context, check if we got data from the API scan
  if (!device && location.state?.apiData) {
    const apiData = location.state.apiData;
    // Map API data to Device interface temporarily for display
    device = {
      id: apiData.name, // The API returns 'name' as the ID
      name: apiData.item_code || apiData.name, // Use item_code as name if available
      serialNumber: apiData.serial_no || "N/A",
      type: apiData.device_type || "Unknown",
      systemType: apiData.system_type || "Unknown",
      manufacturer: apiData.brand || "Unknown",
      locationDescription: apiData.location || "",
      building:  "", // Not in API data shown so far
      zone: "",
      jobId: "external-scan", // Placeholder
      status: "pending", 
      isVerified: true, // We just scanned it
      installationDate: apiData.installation_date,
      purchaseDate: apiData.purchase_date,
      expiryDate: apiData.expiry_date,
      warrantyEnd: apiData.warranty_expiry_date,
      imageUrl: apiData.image,
      gpsLat: 0,
      gpsLng: 0,
      manufacturingDate: "",
      warrantyStart: ""
    };
  }

  const ncs = getNcsByDeviceId(deviceId || "");
  const deviceJob = jobs.find((j) => j.id === device?.jobId);
  console.log('device', device);
  console.log('ncs', ncs);
  console.log('deviceJob', deviceJob);

  const [showChecklist, setShowChecklist] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [missingNote, setMissingNote] = useState("");
  const [missingPhoto, setMissingPhoto] = useState(false);

  if (!device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Device not found in local database.</p>
        <Button variant="outline" onClick={() => navigate("/scan")}>
          Scan Another
        </Button>
      </div>
    );
  }

  const formatDate = (d: string | undefined) => {
    if (!d || d === "") return "N/A";
    
    const date = new Date(d);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const validateDeviceQR = (scannedId: string): boolean => {
    if (!device) return false;
    const cleanId = scannedId.trim();
    
    const isMatch = 
      device.id === cleanId || 
      device.id === scannedId ||
      device.name === cleanId ||
      device.name === scannedId ||
      device.serialNumber === cleanId ||
      device.serialNumber === scannedId;
    
    return isMatch;
  };

  const handleQRScanSuccess = (scannedDeviceId: string) => {
    toast({
      title: "✅ Device Verified",
      description: "Device verification successful",
    });
    setShowQRScanner(false);
  };

  const handleInspectionComplete = async (
    result: "pass" | "fail",
    severity: InspectionSeverity,
    checklistResults?: any[]
  ) => {
    if (!device) return;
    try {
      // Submit inspection results to API if available
      if (submitInspectionResults && deviceJob && checklistResults) {
        await submitInspectionResults({
          jobId: deviceJob.id,
          deviceId: device.id,
          results: checklistResults,
          overallResult: result
        });
      }
      
      // Update device status
      const newStatus = result === "pass" ? "completed" : "failed";
      updateDeviceStatus(device.id, newStatus);
      
      toast({
        title: result === "pass" ? "✅ Inspection Passed" : "⚠️ Issues Found",
        description: result === "pass" 
          ? "Device passed all checks" 
          : "NC created automatically",
      });
    } catch (error) {
      console.error("Failed to submit inspection:", error);
      toast({
        title: "❌ Submission Failed",
        description: "Failed to submit inspection results. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkMissing = () => {
    if (!device) return;
    updateDeviceStatus(device.id, "failed");
    setShowMissingDialog(false);
    toast({
      title: "🚨 Device Marked Missing",
      description: `${device.name} has been flagged. Alert sent.`,
    });
    navigate(-1);
  };

  const actions = [
    {
      id: "maintenance",
      label: "Maintenance",
      description: "Run inspection checklist",
      icon: Wrench,
      color: "bg-primary",
      textColor: "text-primary-foreground",
      onClick: () => setShowChecklist(true),
    },
    {
      id: "move",
      label: "Move Device",
      description: "Update location",
      icon: Move,
      color: "bg-warning",
      textColor: "text-warning-foreground",
      onClick: () => navigate(`/device/${deviceId}/relocate`),
    },
    {
      id: "missing",
      label: "Mark Missing",
      description: "Report issue",
      icon: AlertOctagon,
      color: "bg-destructive",
      textColor: "text-destructive-foreground",
      onClick: () => setShowMissingDialog(true),
    },
    {
      id: "history",
      label: "View History",
      description: "Audit trail",
      icon: History,
      color: "bg-secondary",
      textColor: "text-secondary-foreground",
      onClick: () => navigate(`/device/${deviceId}/history`),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title={device.name} />
      <main className="container px-4 py-6 space-y-6">
        {/* Device Image & QR Code Card */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Device Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                {device.imageUrl ? (
                  <img
                    src={"https://aivio.c-metric.net" + device.imageUrl}
                    alt={device.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={device.status} />
                </div>
              </div>

              {/* QR Code */}
              <div className="aspect-square rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center p-4">
                {device.isVerified ? (
                  <>
                    <CheckCircle2 className="w-16 h-16 text-success mb-2" />
                    <p className="text-xs text-success text-center font-semibold">
                      Device Verified
                    </p>
                    <p className="text-xs text-muted-foreground text-center font-mono mt-1">
                      {device.serialNumber}
                    </p>
                  </>
                ) : (
                  <>
                    <QrCode className="w-16 h-16 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground text-center font-mono">
                      {device.serialNumber}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={() => setShowQRScanner(true)}
                    >
                      Scan to Verify
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

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
                <p className="font-medium font-mono">{device.serialNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{device.type || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">System Type</p>
                <p className="font-medium">{device.systemType || "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Manufacturer</p>
                <p className="font-medium">{device.manufacturer || "N/A"}</p>
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
                <p className="font-medium">{device.building || device.locationDescription || "N/A"}</p>
                <p className="text-muted-foreground">{device.zone || device.locationDescription || "N/A"}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">{device.locationDescription || "N/A"}</p>
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
                <p className="text-muted-foreground">Installed Date</p>
                <p className="font-medium">{formatDate(device.installationDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{formatDate(device.purchaseDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expiry Date</p>
                <p className="font-medium">{formatDate(device.expiryDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Warranty End</p>
                <p className="font-medium">{formatDate(device.warrantyEnd)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Open NCs Warning */}
        {ncs.filter((nc) => nc.status === "open").length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-warning shrink-0" />
              <div>
                <p className="font-medium text-warning">{ncs.filter((nc) => nc.status === "open").length} Open NC(s)</p>
                <p className="text-xs text-muted-foreground">Issues pending resolution</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - Big, touchable */}
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="active:scale-[0.97] transition-transform"
              >
                <Card className="h-full border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-5 flex flex-col items-center gap-3 text-center">
                    <div className={`${action.color} ${action.textColor} w-14 h-14 rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </main>

      {/* Maintenance Checklist */}
      {deviceJob && device && (
        <InspectionChecklist
          open={showChecklist}
          onOpenChange={setShowChecklist}
          device={device}
          jobId={deviceJob.id}
          onComplete={handleInspectionComplete}
        />
      )}

      {/* Mark Missing Dialog */}
      <Dialog open={showMissingDialog} onOpenChange={setShowMissingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-destructive" />
              Mark Device as Missing / Damaged
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Describe the issue (optional)..."
              value={missingNote}
              onChange={(e) => setMissingNote(e.target.value)}
              rows={3}
            />
            <Button
              variant={missingPhoto ? "default" : "outline"}
              className={missingPhoto ? "bg-success hover:bg-success/90" : ""}
              onClick={() => {
                setMissingPhoto(true);
                toast({ title: "Photo captured" });
              }}
            >
              <Camera className="w-4 h-4 mr-2" />
              {missingPhoto ? "Photo Attached ✓" : "Add Photo (Optional)"}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMissingDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleMarkMissing}>
              Confirm Missing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Scanner Modal */}
      {device && (
      <QRScanner
        open={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={handleQRScanSuccess}
        onValidate={validateDeviceQR}
        expectedDeviceId={device.id}
        deviceName={device.name}
      />
      )}
    </div>
  );
}
