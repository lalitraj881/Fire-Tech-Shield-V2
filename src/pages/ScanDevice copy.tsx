import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Scan, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  X,
  Download
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";

export default function ScanDevice() {
  const navigate = useNavigate();
  const { devices } = useInspection();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<"mapped" | "unmapped" | "not-found" | null>(null);
  const [scannedDevice, setScannedDevice] = useState<typeof devices[0] | null>(null);

  const doScan = () => {
    setScanning(true);
    setResult(null);
    setScannedDevice(null);

    setTimeout(() => {
      setScanning(false);
      const rand = Math.random();

      if (rand < 0.5 && devices.length > 0) {
        // Case A — Device exists + already mapped (has location/GPS)
        const mapped = devices.filter((d) => d.gpsLat && d.building);
        if (mapped.length > 0) {
          const dev = mapped[Math.floor(Math.random() * mapped.length)];
          setScannedDevice(dev);
          setResult("mapped");
          return;
        }
      }

      if (rand < 0.8 && devices.length > 0) {
        // Case B — Device exists but NOT mapped to location
        const unmapped = devices.filter((d) => !d.installed);
        if (unmapped.length > 0) {
          const dev = unmapped[Math.floor(Math.random() * unmapped.length)];
          setScannedDevice(dev);
          setResult("unmapped");
          return;
        }
        // fallback: pick any device and treat as unmapped for demo
        const dev = devices[Math.floor(Math.random() * devices.length)];
        setScannedDevice(dev);
        setResult("unmapped");
        return;
      }

      // Case C — QR not found at all
      setResult("not-found");
    }, 2500);
  };

  useEffect(() => {
    doScan();
  }, []);

  // Auto-navigate on mapped device found
  useEffect(() => {
    if (result === "mapped" && scannedDevice) {
      const timer = setTimeout(() => {
        navigate(`/device/${scannedDevice.id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [result, scannedDevice, navigate]);

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full h-screen">
        {/* Camera viewfinder background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80" />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4">
          <h1 className="text-white font-semibold text-lg">Scan QR Code</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Scanning frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-64 h-64 border-2 border-primary rounded-2xl">
            <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
            <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
            <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl" />
            {scanning && (
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
            )}
          </div>
        </div>

        {/* Status display */}
        <div className="absolute inset-x-0 bottom-0 p-8">
          {scanning && (
            <Card className="bg-black/80 border-primary/30 backdrop-blur">
              <CardContent className="p-6 text-center space-y-3">
                <Scan className="w-10 h-10 mx-auto text-primary animate-pulse" />
                <p className="text-white font-medium text-lg">Scanning...</p>
                <p className="text-white/60 text-sm">Position device QR code within the frame</p>
              </CardContent>
            </Card>
          )}

          {/* Case A — Device exists + already mapped */}
          {result === "mapped" && scannedDevice && (
            <Card className="bg-black/80 border-success/30 backdrop-blur animate-fade-in">
              <CardContent className="p-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success" />
                <p className="text-success font-bold text-xl">Device Found!</p>
                <p className="text-white/80">{scannedDevice.name}</p>
                <p className="text-white/50 text-sm">{scannedDevice.serialNumber}</p>
                <p className="text-white/40 text-xs">Opening device details...</p>
              </CardContent>
            </Card>
          )}

          {/* Case B — Device exists but NOT mapped */}
          {result === "unmapped" && scannedDevice && (
            <Card className="bg-black/80 border-warning/30 backdrop-blur animate-fade-in">
              <CardContent className="p-6 text-center space-y-4">
                <AlertTriangle className="w-12 h-12 mx-auto text-warning" />
                <p className="text-warning font-bold text-xl">Device Not Installed</p>
                <p className="text-white/80">{scannedDevice.name}</p>
                <p className="text-white/60 text-sm">
                  Device found but not mapped to a location.
                </p>
                <p className="text-white/50 text-sm">Install now?</p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => navigate(`/install/${scannedDevice.id}`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Yes, Install
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Case C — QR not registered */}
          {result === "not-found" && (
            <Card className="bg-black/80 border-destructive/30 backdrop-blur animate-fade-in">
              <CardContent className="p-6 text-center space-y-4">
                <XCircle className="w-12 h-12 mx-auto text-destructive" />
                <p className="text-destructive font-bold text-xl">QR Not Registered</p>
                <p className="text-white/70 text-sm">
                  This QR code is not registered in the system.
                </p>
                <p className="text-white/50 text-sm">
                  Contact purchase / admin to register this device.
                </p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={doScan}
                  >
                    Scan Again
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={() => navigate(-1)}
                  >
                    Go Back
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
