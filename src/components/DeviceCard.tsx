import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Device } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface DeviceCardProps {
  device: Device;
  jobId: string;
  className?: string;
}

export function DeviceCard({ device, jobId, className }: DeviceCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:border-primary/50",
        device.status === "completed" && "opacity-75",
        className
      )}
      onClick={() => navigate(`/job/${jobId}/device/${device.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div
            className={cn(
              "w-2 h-12 rounded-full shrink-0",
              device.status === "pending" && "bg-muted-foreground",
              device.status === "completed" && "bg-success",
              device.status === "failed" && "bg-destructive"
            )}
          />

          {/* Device Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground truncate">{device.name}</h4>
              <span className="text-xs text-muted-foreground">#{device.serialNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {device.building} → {device.zone}
              </span>
            </div>
          </div>

          {/* Status & Arrow */}
          <div className="flex items-center gap-3">
            <StatusBadge status={device.status} />
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
