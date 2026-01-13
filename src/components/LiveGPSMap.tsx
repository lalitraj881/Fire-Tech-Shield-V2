import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Navigation, 
  Locate, 
  Building2, 
  Target,
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device } from "@/data/mockData";

interface LiveGPSMapProps {
  siteName: string;
  siteGpsLat: number;
  siteGpsLng: number;
  devices: Device[];
  currentDevice?: Device;
  compact?: boolean;
  onStartNavigation?: (device: Device) => void;
}

interface TechnicianPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export function LiveGPSMap({
  siteName,
  siteGpsLat,
  siteGpsLng,
  devices,
  currentDevice,
  compact = false,
  onStartNavigation,
}: LiveGPSMapProps) {
  const [techPosition, setTechPosition] = useState<TechnicianPosition | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Get live GPS position
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("GPS not supported");
      setGpsLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setTechPosition({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setGpsLoading(false);
        setGpsError(null);
      },
      (error) => {
        setGpsError("Unable to get location");
        setGpsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Calculate nearest pending device
  const getNearestPendingDevice = (): Device | undefined => {
    const pendingDevices = devices.filter((d) => d.status === "pending" && d.gpsLat && d.gpsLng);
    if (!techPosition || pendingDevices.length === 0) return pendingDevices[0];

    return pendingDevices.reduce((nearest, device) => {
      const distToDevice = Math.sqrt(
        Math.pow((device.gpsLat || 0) - techPosition.lat, 2) +
        Math.pow((device.gpsLng || 0) - techPosition.lng, 2)
      );
      const distToNearest = Math.sqrt(
        Math.pow((nearest.gpsLat || 0) - techPosition.lat, 2) +
        Math.pow((nearest.gpsLng || 0) - techPosition.lng, 2)
      );
      return distToDevice < distToNearest ? device : nearest;
    });
  };

  const nearestDevice = currentDevice || getNearestPendingDevice();

  // Calculate position percentage for map display
  const getPositionStyle = (lat: number, lng: number) => {
    // Normalize positions relative to site center
    const offsetLat = ((lat - siteGpsLat) * 10000) + 50;
    const offsetLng = ((lng - siteGpsLng) * 10000) + 50;
    return {
      top: `${Math.max(10, Math.min(90, 50 - offsetLat * 5))}%`,
      left: `${Math.max(10, Math.min(90, 50 + offsetLng * 5))}%`,
    };
  };

  const openNavigation = (device: Device) => {
    if (device.gpsLat && device.gpsLng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${device.gpsLat},${device.gpsLng}`,
        "_blank"
      );
    }
    onStartNavigation?.(device);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-success";
      case "failed": return "bg-destructive";
      case "pending": return "bg-warning";
      default: return "bg-muted-foreground";
    }
  };

  if (compact) {
    return (
      <div className="relative w-full h-40 bg-muted/30 rounded-lg border border-border overflow-hidden">
        {/* Map Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />
        </div>

        {/* Device Markers */}
        {devices.map((device) => {
          if (!device.gpsLat || !device.gpsLng) return null;
          const style = getPositionStyle(device.gpsLat, device.gpsLng);
          const isNearest = device.id === nearestDevice?.id;

          return (
            <div
              key={device.id}
              className={cn(
                "absolute w-3 h-3 rounded-full transition-all transform -translate-x-1/2 -translate-y-1/2",
                getStatusColor(device.status),
                isNearest && "w-4 h-4 ring-2 ring-primary ring-offset-1 animate-pulse"
              )}
              style={style}
            />
          );
        })}

        {/* Technician Position */}
        {techPosition && (
          <div
            className="absolute w-5 h-5 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-lg z-10"
            style={getPositionStyle(techPosition.lat, techPosition.lng)}
          >
            <Navigation className="w-3 h-3 text-primary-foreground" />
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-background/90 px-2 py-1 rounded text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>You</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span>Pending</span>
          </div>
        </div>

        {/* Site Name */}
        <div className="absolute top-2 right-2 bg-background/80 px-2 py-0.5 rounded text-xs text-muted-foreground">
          {siteName}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-primary" />
            Live Navigation
          </div>
          {gpsLoading ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Acquiring GPS...
            </span>
          ) : techPosition ? (
            <span className="flex items-center gap-1 text-xs text-success">
              <Locate className="w-3 h-3" />
              GPS Active
            </span>
          ) : (
            <span className="text-xs text-destructive">{gpsError}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Area */}
        <div className="relative w-full aspect-video bg-muted/20 rounded-lg border border-border overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
                `,
                backgroundSize: "20px 20px",
              }}
            />
          </div>

          {/* Site Building Outline */}
          <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/30 rounded">
            <span className="absolute -top-3 left-2 bg-background px-1 text-xs text-muted-foreground">
              {siteName}
            </span>
          </div>

          {/* Device Markers */}
          {devices.map((device, index) => {
            if (!device.gpsLat || !device.gpsLng) return null;
            const style = getPositionStyle(device.gpsLat, device.gpsLng);
            const isNearest = device.id === nearestDevice?.id;

            return (
              <div
                key={device.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={style}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    getStatusColor(device.status),
                    device.status === "completed" && "text-success-foreground",
                    device.status === "failed" && "text-destructive-foreground",
                    device.status === "pending" && "text-warning-foreground",
                    isNearest && "ring-2 ring-primary ring-offset-2 animate-pulse scale-110"
                  )}
                >
                  {index + 1}
                </div>
                {isNearest && (
                  <Target className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-4 text-primary animate-bounce" />
                )}
              </div>
            );
          })}

          {/* Technician Position */}
          {techPosition && (
            <div
              className="absolute w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 z-10"
              style={getPositionStyle(techPosition.lat, techPosition.lng)}
            >
              <div className="w-full h-full bg-primary rounded-full flex items-center justify-center shadow-lg">
                <Navigation className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-2 right-2 flex items-center gap-3 bg-background/90 px-2 py-1 rounded text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Done</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span>Failed</span>
            </div>
          </div>
        </div>

        {/* Nearest Device Info */}
        {nearestDevice && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Next Asset</span>
              </div>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded",
                getStatusColor(nearestDevice.status),
                nearestDevice.status === "pending" && "text-warning-foreground"
              )}>
                {nearestDevice.status.toUpperCase()}
              </span>
            </div>

            <div>
              <p className="font-medium">{nearestDevice.name}</p>
              <p className="text-sm text-muted-foreground">
                {nearestDevice.building} → {nearestDevice.zone}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {nearestDevice.locationDescription}
              </p>
            </div>

            <Button
              className="w-full"
              size="sm"
              onClick={() => openNavigation(nearestDevice)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Start Navigation
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </div>
        )}

        {/* Inspection Sequence */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Inspection Sequence</p>
          <div className="flex flex-wrap gap-2">
            {devices.map((device, index) => (
              <div
                key={device.id}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2",
                  device.status === "completed" && "bg-success/20 border-success text-success",
                  device.status === "failed" && "bg-destructive/20 border-destructive text-destructive",
                  device.status === "pending" && device.id === nearestDevice?.id && "bg-primary/20 border-primary text-primary",
                  device.status === "pending" && device.id !== nearestDevice?.id && "bg-muted border-muted-foreground/30 text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
