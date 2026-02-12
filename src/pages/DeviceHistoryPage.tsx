import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InspectionSeverityBadge } from "@/components/InspectionSeverityBadge";
import { 
  Calendar, 
  User, 
  MapPin, 
  Camera, 
  Wrench, 
  Move, 
  Plus,
  AlertTriangle 
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { getDeviceHistory } from "@/data/mockData";

export default function DeviceHistoryPage() {
  const { deviceId } = useParams();
  const { devices, getNcsByDeviceId } = useInspection();

  const device = devices.find((d) => d.id === deviceId);
  const history = getDeviceHistory(deviceId || "");
  const ncs = getNcsByDeviceId(deviceId || "");

  if (!device) {
    return <div className="p-8 text-center text-muted-foreground">Device not found</div>;
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Build a combined timeline
  const timeline = [
    // Installation event
    {
      id: "install",
      type: "installation" as const,
      date: device.installationDate,
      title: "Device Installed",
      description: `${device.type} installed at ${device.building} - ${device.zone}`,
      icon: Plus,
      color: "text-success",
    },
    // Inspection history
    ...history.map((h) => ({
      id: h.id,
      type: "inspection" as const,
      date: h.date,
      title: `Inspection - ${h.result === "pass" ? "Passed" : "Failed"}`,
      description: h.notes || `Inspected by ${h.technician}`,
      technician: h.technician,
      severity: h.severity,
      icon: Wrench,
      color: h.result === "pass" ? "text-success" : "text-destructive",
    })),
    // NCs
    ...ncs.map((nc) => ({
      id: nc.id,
      type: "nc" as const,
      date: nc.createdDate,
      title: `NC Created - ${nc.severity}`,
      description: nc.description,
      technician: nc.createdBy,
      icon: AlertTriangle,
      color: nc.severity === "critical" ? "text-destructive" : "text-warning",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="Device History" />
      <main className="container px-4 py-6 space-y-6">
        {/* Device Header */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-bold text-lg">{device.name}</h2>
            <p className="text-sm text-muted-foreground">{device.serialNumber} • {device.type}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              {device.locationDescription}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Audit Trail ({timeline.length} events)</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-0">
              {timeline.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="flex gap-4">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${event.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border my-1" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="pb-6 flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm">{event.title}</p>
                        {"severity" in event && event.severity && (
                          <InspectionSeverityBadge severity={event.severity} />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date)}
                        </span>
                        {"technician" in event && event.technician && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {event.technician}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {timeline.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No history available</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
