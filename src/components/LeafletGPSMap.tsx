import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { 
  Navigation, 
  Locate, 
  Target,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Device } from "@/types";

// Fix for default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface LeafletGPSMapProps {
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

export function LeafletGPSMap({
  siteName,
  siteGpsLat,
  siteGpsLng,
  devices,
  currentDevice,
  compact = false,
  onStartNavigation,
}: LeafletGPSMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [techPosition, setTechPosition] = useState<TechnicianPosition | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [siteGpsLat, siteGpsLng],
      zoom: compact ? 17 : 18,
      zoomControl: !compact,
      attributionControl: !compact,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [siteGpsLat, siteGpsLng, compact]);

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

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Get nearest pending device
  const getNearestPendingDevice = (): Device | undefined => {
    const pendingDevices = devices.filter((d) => d.status === "pending" && d.gpsLat && d.gpsLng);
    if (!techPosition || pendingDevices.length === 0) return pendingDevices[0];

    return pendingDevices.reduce((nearest, device) => {
      const distToDevice = calculateDistance(
        techPosition.lat, techPosition.lng,
        device.gpsLat || 0, device.gpsLng || 0
      );
      const distToNearest = calculateDistance(
        techPosition.lat, techPosition.lng,
        nearest.gpsLat || 0, nearest.gpsLng || 0
      );
      return distToDevice < distToNearest ? device : nearest;
    });
  };

  const nearestDevice = currentDevice || getNearestPendingDevice();

  // Create custom icon
  const createCustomIcon = (color: string, number?: number) => {
    const svg = `
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" fill="${color}"/>
        ${number ? `<text x="16" y="20" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${number}</text>` : ''}
      </svg>
    `;
    return L.divIcon({
      html: svg,
      className: 'custom-marker',
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42]
    });
  };

  const technicianIcon = L.divIcon({
    html: `
      <div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
        </svg>
      </div>
    `,
    className: 'technician-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#22c55e";
      case "failed": return "#ef4444";
      case "pending": return "#f59e0b";
      default: return "#94a3b8";
    }
  };

  // Update markers and route
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add device markers
    devices.forEach((device, index) => {
      // Check for valid coordinates (skip if null/undefined or both are 0)
      if (device.gpsLat == null || device.gpsLng == null || 
          (device.gpsLat === 0 && device.gpsLng === 0)) {
        return;
      }

      const marker = L.marker([device.gpsLat, device.gpsLng], {
        icon: createCustomIcon(getStatusColor(device.status), index + 1)
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-size: 14px;">
          <p style="font-weight: 600; margin-bottom: 4px;">${device.name}</p>
          <p style="font-size: 12px; color: #666;">${device.type}</p>
          ${techPosition ? `<p style="font-size: 12px; color: #3b82f6; font-weight: 500; margin-top: 4px;">
            ${Math.round(calculateDistance(techPosition.lat, techPosition.lng, device.gpsLat, device.gpsLng))}m away
          </p>` : ''}
        </div>
      `);

      markersRef.current.push(marker);
    });

    // Add technician marker
    if (techPosition) {
      const techMarker = L.marker([techPosition.lat, techPosition.lng], {
        icon: technicianIcon
      }).addTo(map);

      techMarker.bindPopup(`
        <div style="font-size: 14px;">
          <p style="font-weight: 600;">Your Location</p>
          <p style="font-size: 12px; color: #666;">Accuracy: ±${Math.round(techPosition.accuracy)}m</p>
        </div>
      `);

      markersRef.current.push(techMarker);
    }

    // Center on nearest device
    if (nearestDevice?.gpsLat && nearestDevice?.gpsLng) {
      map.setView([nearestDevice.gpsLat, nearestDevice.gpsLng], map.getZoom());
    }
  }, [devices, techPosition, nearestDevice]);

  const openNavigation = (device: Device) => {
    if (device.gpsLat && device.gpsLng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${device.gpsLat},${device.gpsLng}`,
        "_blank"
      );
    }
    onStartNavigation?.(device);
  };

  if (compact) {
    return (
      <div className="relative w-full h-40 rounded-lg border border-border overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />
        
        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-background/90 px-2 py-1 rounded text-xs z-[1000]">
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
        <div className="absolute top-2 right-2 bg-background/80 px-2 py-0.5 rounded text-xs text-muted-foreground z-[1000]">
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
        <div className="relative w-full aspect-video rounded-lg border border-border overflow-hidden z-[0]">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Legend */}
          <div className="absolute bottom-2 right-2 flex items-center gap-3 bg-background/90 px-2 py-1 rounded text-xs z-[1000]">
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
                "text-xs px-2 py-0.5 rounded text-white",
                nearestDevice.status === "completed" && "bg-success",
                nearestDevice.status === "failed" && "bg-destructive",
                nearestDevice.status === "pending" && "bg-warning"
              )}>
                {nearestDevice.status.toUpperCase()}
              </span>
            </div>

            <div>
              <p className="font-medium truncate">{nearestDevice.name}</p>
              <p className="text-sm text-muted-foreground">
                {/* {nearestDevice.building} → {nearestDevice.zone} */}
                {nearestDevice.locationDescription} → {nearestDevice.locationDescription}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {nearestDevice.locationDescription}
              </p>
              {techPosition && nearestDevice.gpsLat && nearestDevice.gpsLng && (
                <p className="text-sm text-primary font-medium mt-2">
                  Distance: {Math.round(calculateDistance(
                    techPosition.lat, techPosition.lng,
                    nearestDevice.gpsLat, nearestDevice.gpsLng
                  ))}m away
                </p>
              )}
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
