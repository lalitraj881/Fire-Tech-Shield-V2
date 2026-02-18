import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin, ChevronRight, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Device } from "@/types";
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
        <div className="flex items-start gap-3">
          {/* Device Image or Status Indicator */}
          <div className="relative shrink-0">
            {device.imageUrl ? (
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted">
                <img 
                  src={"https://aivio.c-metric.net" + device.imageUrl} 
                  alt={device.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            {/* Status dot overlay */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                device.status === "pending" && "bg-muted-foreground",
                device.status === "completed" && "bg-success",
                device.status === "failed" && "bg-destructive"
              )}
            />
          </div>

          {/* Device Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-medium text-foreground line-clamp-2 leading-tight">{device.name}</h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-1.5">
              <span className="px-1.5 py-0.5 rounded bg-secondary whitespace-nowrap">{device.type}</span>
              <span className="font-mono text-[10px]">#{device.serialNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate text-xs sm:text-sm">
                {device.locationDescription}
              </span>
            </div>
          </div>

          {/* Status & Arrow */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={device.status} />
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
