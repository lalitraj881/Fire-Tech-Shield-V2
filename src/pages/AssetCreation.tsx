import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Camera, 
  MapPin, 
  CheckCircle2,
  Loader2,
  Save,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInspection } from "@/context/InspectionContext";
import { cn } from "@/lib/utils";

const zones = ["Zone A", "Zone B", "Zone C", "Zone D"];
const floors = ["Ground Floor", "Floor 1", "Floor 2", "Floor 3", "Basement"];
const rooms = ["Production Hall", "Server Room", "Cafeteria", "Loading Dock", "Office", "Warehouse", "Assembly Line", "Entrance"];

export default function AssetCreation() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { devices, technician } = useInspection();

  const device = devices.find((d) => d.id === deviceId);

  const [photo, setPhoto] = useState(false);
  const [zone, setZone] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLng, setGpsLng] = useState<number | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(true);

  // Auto-capture GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLat(pos.coords.latitude);
          setGpsLng(pos.coords.longitude);
          setGpsLoading(false);
        },
        () => {
          setGpsLoading(false);
          // Simulate GPS for demo
          setGpsLat(42.3314 + Math.random() * 0.01);
          setGpsLng(-83.0458 + Math.random() * 0.01);
        }
      );
    } else {
      setGpsLoading(false);
      setGpsLat(42.3314);
      setGpsLng(-83.0458);
    }
  }, []);

  // Auto-open camera simulation
  useEffect(() => {
    if (cameraOpen) {
      const timer = setTimeout(() => setCameraOpen(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cameraOpen]);

  const handleCapture = () => {
    setPhoto(true);
    toast({ title: "📸 Photo captured" });
  };

  const isValid = photo && zone && floor && room;

  const handleSave = async () => {
    if (!isValid) return;
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast({
      title: "✅ Device Installed",
      description: `${device?.name || "Device"} installed at ${zone}, ${floor}, ${room}`,
    });
    setIsSaving(false);
    navigate("/home");
  };

  if (!device) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Device not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="Install Device" />
      <main className="container px-4 py-6 space-y-5">
        {/* Device Info Summary */}
        <Card className="border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{device.name}</p>
              <p className="text-sm text-muted-foreground">{device.type} · {device.serialNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 1 — Photo Capture */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Step 1 — Capture Photo</p>
            {!photo ? (
              <button
                onClick={handleCapture}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-3 active:scale-[0.98] transition-transform"
              >
                <Camera className="w-12 h-12 text-primary" />
                <p className="font-medium text-primary">Tap to Capture Photo</p>
                <p className="text-xs text-muted-foreground">Camera opens automatically</p>
              </button>
            ) : (
              <div className="w-full aspect-video rounded-xl bg-muted flex items-center justify-center relative">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-2" />
                  <p className="text-success font-medium">Photo Captured</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute bottom-3 right-3"
                  onClick={() => setPhoto(false)}
                >
                  Retake
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2 — Location Selection */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Step 2 — Select Location</p>
            <div className="space-y-3">
              <Select value={zone} onValueChange={setZone}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>{z}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={floor} onValueChange={setFloor}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Floor" />
                </SelectTrigger>
                <SelectContent>
                  {floors.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={room} onValueChange={setRoom}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select Room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Step 3 — GPS Auto */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">Step 3 — GPS Location</p>
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className={cn("w-5 h-5", gpsLoading ? "text-muted-foreground" : "text-success")} />
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
              {gpsLat && !gpsLoading && <CheckCircle2 className="w-5 h-5 text-success" />}
            </div>
          </CardContent>
        </Card>

        {/* Auto-filled info */}
        <Card className="border-muted">
          <CardContent className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Auto-captured</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Technician</div>
              <div className="font-medium">{technician.name}</div>
              <div className="text-muted-foreground">Timestamp</div>
              <div className="font-medium">{new Date().toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Save */}
        <Button
          size="lg"
          className="w-full h-14"
          onClick={handleSave}
          disabled={!isValid || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save Installation
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
