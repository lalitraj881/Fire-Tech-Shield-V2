import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Calendar, MapPin, Wrench, FileText } from "lucide-react";
import { NC, mockDevices, mockJobs } from "@/data/mockData";

interface NCDetailModalProps {
  nc: NC | null;
  open: boolean;
  onClose: () => void;
}

export function NCDetailModal({ nc, open, onClose }: NCDetailModalProps) {
  if (!nc) return null;

  const device = mockDevices.find((d) => d.id === nc.deviceId);
  const job = mockJobs.find((j) => j.id === nc.jobId);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Non-Conformance Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* NC ID & Status */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-mono font-bold text-foreground">{nc.id.toUpperCase()}</span>
            <Badge variant={nc.status === "open" ? "destructive" : "secondary"}>
              {nc.status === "open" ? "Open" : "Closed"}
            </Badge>
          </div>

          {/* Description */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Issue Description</p>
                  <p className="font-medium mt-1">{nc.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Device Info */}
          {device && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Affected Device</p>
                    <p className="font-medium mt-1">{device.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {device.serialNumber} • {device.type}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          {device && job && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium mt-1">{job.siteName}</p>
                    <p className="text-sm text-muted-foreground">
                      {device.building} → {device.zone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="space-y-2 flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="font-medium">{formatDate(nc.createdDate)}</p>
                  </div>
                  {nc.closedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Closed</p>
                      <p className="font-medium text-success">{formatDate(nc.closedDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repaired By */}
          {nc.repairedBy && (
            <div className="text-sm text-muted-foreground text-center">
              Repaired by: <span className="text-foreground font-medium">{nc.repairedBy}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
