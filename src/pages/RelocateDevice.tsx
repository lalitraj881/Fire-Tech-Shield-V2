import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  CheckCircle2, 
  Loader2, 
  Move, 
  Navigation 
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function RelocateDevice() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { devices } = useInspection();

  const device = devices.find((d) => d.id === deviceId);

  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [room, setRoom] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Auto-capture GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLat(position.coords.latitude);
          setGpsLng(position.coords.longitude);
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
          // Fallback coords for demo
          setGpsLat(42.3320);
          setGpsLng(-83.0465);
        }
      );
    } else {
      setGpsLoading(false);
    }
  }, []);

  if (!device) {
    return <div className="p-8 text-center text-muted-foreground">Device not found</div>;
  }

  const handleConfirm = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setIsSaving(false);

    toast({
      title: "📍 Location Updated",
      description: `${device.name} moved successfully. History logged.`,
    });
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="Relocate Device" />
      <main className="container px-4 py-6 space-y-6">
        {/* Current Location */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Current Location</p>
            <p className="font-medium">{device.building} - {device.zone}</p>
            <p className="text-sm text-muted-foreground">{device.locationDescription}</p>
          </CardContent>
        </Card>

        {/* New GPS */}
        <Card className="border-primary/30">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" />
              <p className="font-semibold">New Location</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={cn("w-4 h-4", gpsLoading ? "text-muted-foreground" : "text-success")} />
                <span className="text-sm">
                  {gpsLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Acquiring GPS...
                    </span>
                  ) : gpsLat && gpsLng ? (
                    `${gpsLat.toFixed(6)}, ${gpsLng.toFixed(6)}`
                  ) : (
                    "GPS not available"
                  )}
                </span>
              </div>
              {gpsLat && <CheckCircle2 className="w-4 h-4 text-success" />}
            </div>

            <div className="space-y-2">
              <Label>Room / Area (Optional)</Label>
              <Input
                placeholder="e.g., Building B - Floor 3"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Confirm */}
        <Button
          size="lg"
          className="w-full h-14"
          onClick={handleConfirm}
          disabled={gpsLoading || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Move className="w-5 h-5 mr-2" />
              Confirm Relocation
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
