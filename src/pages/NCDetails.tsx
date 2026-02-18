import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { InspectionSeverityBadge } from "@/components/InspectionSeverityBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building2, 
  QrCode, 
  User, 
  Calendar, 
  FileText, 
  Camera,
  Wrench,
  AlertTriangle,
  ExternalLink,
  Image as ImageIcon
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";

export default function NCDetails() {
  const { ncId } = useParams();
  const navigate = useNavigate();
  const { ncs } = useInspection();

  const nc = ncs.find((n) => n.id === ncId);

  if (!nc) {
    return <div className="p-8 text-center text-muted-foreground">NC not found</div>;
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const workOrderStatusColors: Record<string, string> = {
    pending: "bg-warning/20 text-warning border-warning/30",
    assigned: "bg-primary/20 text-primary border-primary/30",
    "in-progress": "bg-blue-500/20 text-blue-500 border-blue-500/30",
    completed: "bg-success/20 text-success border-success/30",
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title={`NC: ${nc.id}`} />

      <main className="container px-4 py-6 space-y-6">
        {/* NC Summary Card */}
        <Card className="border-warning/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span className="font-bold text-lg">{nc.id}</span>
                </div>
                <Badge variant={nc.status === "open" ? "destructive" : "secondary"}>
                  {nc.status.toUpperCase()}
                </Badge>
              </div>
              <InspectionSeverityBadge severity={nc.severity} />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>Created: {formatDate(nc.createdDate)} by {nc.createdBy}</p>
              {nc.closedDate && <p>Closed: {formatDate(nc.closedDate)}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Customer & Site Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Customer & Site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Customer</p>
              <p className="font-medium">{nc.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Site</p>
              <p className="font-medium">{nc.siteName}</p>
              <p className="text-muted-foreground">{nc.siteAddress}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => openGoogleMaps(nc.siteGpsLat, nc.siteGpsLng)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              View Site on Map
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Device Section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Device Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Device Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {nc.deviceImageUrl ? (
                <img
                  src={"https://aivio.c-metric.net/"+nc.deviceImageUrl}
                  alt={nc.deviceName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Device Name</p>
                <p className="font-medium">{nc.deviceName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Device ID</p>
                <p className="font-medium font-mono">{nc.deviceId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium">{nc.deviceType}</p>
              </div>
              <div>
                <p className="text-muted-foreground">System Type</p>
                <p className="font-medium">{nc.deviceSystemType}</p>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
              <QrCode className="w-12 h-12 text-primary" />
              <div>
                <p className="text-sm font-medium">QR Code</p>
                <p className="text-xs font-mono text-muted-foreground">{nc.deviceId}</p>
              </div>
            </div>

            {/* Device Location (Critical) */}
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Device Location</span>
              </div>
              <p className="text-sm">{nc.deviceLocationDescription}</p>
              {nc.deviceGpsLat && nc.deviceGpsLng && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => openGoogleMaps(nc.deviceGpsLat!, nc.deviceGpsLng!)}
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  GPS: {nc.deviceGpsLat.toFixed(4)}, {nc.deviceGpsLng.toFixed(4)}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Non-Conformance Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Non-Conformance Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Failed Checklist Items</p>
              <div className="flex flex-wrap gap-2">
                {nc.failedChecklistItems.map((item, index) => (
                  <Badge key={index} variant="outline" className="border-destructive/50 text-destructive">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Technician Remarks</p>
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                {nc.technicianRemarks}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Evidence */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Photo Evidence ({nc.photoEvidence.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {nc.photoEvidence.map((photo, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg bg-muted flex items-center justify-center border"
                >
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{photo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work Order (Read-only) */}
        {nc.workOrderId && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Work Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">Work Order ID</p>
                  <p className="font-medium font-mono">{nc.workOrderId}</p>
                </div>
                <Badge className={workOrderStatusColors[nc.workOrderStatus || "pending"]}>
                  {nc.workOrderStatus?.toUpperCase()}
                </Badge>
              </div>
              {nc.workOrderAssignedTo && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Assigned to: {nc.workOrderAssignedTo}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Inspection Reference */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Inspection Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">Inspection Job ID</p>
            <p className="font-medium font-mono">{nc.inspectionJobId}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
