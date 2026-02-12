import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  CheckCircle2
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { type InspectionSeverity } from "@/data/mockData";

export default function DeviceHub() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { devices, updateDeviceStatus, getNcsByDeviceId, jobs } = useInspection();
  
  const device = devices.find((d) => d.id === deviceId);
  const ncs = getNcsByDeviceId(deviceId || "");
  const deviceJob = jobs.find((j) => j.id === device?.jobId);

  const [showChecklist, setShowChecklist] = useState(false);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [missingNote, setMissingNote] = useState("");
  const [missingPhoto, setMissingPhoto] = useState(false);

  if (!device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Device not found</p>
      </div>
    );
  }

  const handleInspectionComplete = (result: "pass" | "fail", severity: InspectionSeverity) => {
    const newStatus = result === "pass" ? "completed" : "failed";
    updateDeviceStatus(device.id, newStatus);
    toast({
      title: result === "pass" ? "✅ Inspection Passed" : "⚠️ Issues Found",
      description: result === "pass" ? "Device passed all checks" : "NC created automatically",
    });
  };

  const handleMarkMissing = () => {
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
        {/* Device Photo & Status */}
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
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
            </div>

            {/* Device Info */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{device.name}</h2>
                  <p className="text-sm text-muted-foreground">{device.type}</p>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <QrCode className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm">{device.serialNumber}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{device.building} - {device.zone}</p>
                  <p className="text-xs text-muted-foreground">{device.locationDescription}</p>
                </div>
              </div>

              {device.gpsLat && device.gpsLng && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>GPS: {device.gpsLat.toFixed(6)}, {device.gpsLng.toFixed(6)}</span>
                </div>
              )}
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
      {deviceJob && (
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
    </div>
  );
}
