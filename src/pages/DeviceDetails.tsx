import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { InspectionChecklist } from "@/components/InspectionChecklist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Wrench, Shield, AlertTriangle, Play, CheckCircle2 } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { getDeviceHistory, getDeviceNCs } from "@/data/mockData";

export default function DeviceDetails() {
  const { jobId, deviceId } = useParams();
  const navigate = useNavigate();
  const [showChecklist, setShowChecklist] = useState(false);
  const { devices, updateDeviceStatus } = useInspection();
  
  const device = devices.find((d) => d.id === deviceId);
  const history = getDeviceHistory(deviceId || "");
  const ncs = getDeviceNCs(deviceId || "");

  if (!device) {
    return <div className="p-8 text-center text-muted-foreground">Device not found</div>;
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleInspectionComplete = (result: "pass" | "fail") => {
    const newStatus = result === "pass" ? "completed" : "failed";
    updateDeviceStatus(device.id, newStatus);
    
    // Navigate back after a delay
    setTimeout(() => {
      navigate(`/job/${jobId}/devices`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBack title={device.name} />
      <main className="container px-4 py-6 space-y-6">
        {/* Device Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Device Information</CardTitle>
              <StatusBadge status={device.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {device.building} → {device.zone}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Installed</p>
                <p className="font-medium">{formatDate(device.installationDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Warranty Ends</p>
                <p className="font-medium">{formatDate(device.warrantyEnd)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expires</p>
                <p className="font-medium text-warning">{formatDate(device.expiryDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inspection History</CardTitle>
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
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      h.result === "pass" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {h.result.toUpperCase()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Open NCs */}
        {ncs.filter((nc) => nc.status === "open").length > 0 && (
          <Card className="border-warning/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Open NCs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ncs
                .filter((nc) => nc.status === "open")
                .map((nc) => (
                  <div
                    key={nc.id}
                    className="p-3 rounded-lg bg-warning/10 border border-warning/20"
                  >
                    <p className="font-medium text-warning">{nc.id}</p>
                    <p className="text-sm text-muted-foreground">{nc.description}</p>
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

      {/* Inspection Checklist Modal */}
      <InspectionChecklist
        open={showChecklist}
        onOpenChange={setShowChecklist}
        deviceName={device.name}
        onComplete={handleInspectionComplete}
      />
    </div>
  );
}
