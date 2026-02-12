import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Scan, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  X 
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";

export default function ScanDevice() {
  const navigate = useNavigate();
  const { devices } = useInspection();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<"success" | "not-found" | null>(null);
  const [scannedDevice, setScannedDevice] = useState<typeof devices[0] | null>(null);

  useEffect(() => {
    // Simulate scanning - in production this would use camera API
    const timer = setTimeout(() => {
      setScanning(false);
      // 70% chance of finding existing device for demo
      const findExisting = Math.random() > 0.3;
      if (findExisting && devices.length > 0) {
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        setScannedDevice(randomDevice);
        setResult("success");
      } else {
        setResult("not-found");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [devices]);

  const handleRetry = () => {
    setScanning(true);
    setResult(null);
    setScannedDevice(null);
    
    setTimeout(() => {
      setScanning(false);
      const findExisting = Math.random() > 0.3;
      if (findExisting && devices.length > 0) {
        const randomDevice = devices[Math.floor(Math.random() * devices.length)];
        setScannedDevice(randomDevice);
        setResult("success");
      } else {
        setResult("not-found");
      }
    }, 2500);
  };

  // Auto-navigate on success
  useEffect(() => {
    if (result === "success" && scannedDevice) {
      const timer = setTimeout(() => {
        navigate(`/device/${scannedDevice.id}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [result, scannedDevice, navigate]);

  return (
    <div className="min-h-screen bg-black">
      {/* Full-screen scanner view */}
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
            {/* Corner accents */}
            <div className="absolute -top-0.5 -left-0.5 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <div className="absolute -top-0.5 -right-0.5 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
            <div className="absolute -bottom-0.5 -left-0.5 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
            <div className="absolute -bottom-0.5 -right-0.5 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-2xl" />

            {/* Scanning line animation */}
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

          {result === "success" && scannedDevice && (
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

          {result === "not-found" && (
            <Card className="bg-black/80 border-warning/30 backdrop-blur animate-fade-in">
              <CardContent className="p-6 text-center space-y-4">
                <XCircle className="w-12 h-12 mx-auto text-warning" />
                <p className="text-warning font-bold text-xl">Device Not Found</p>
                <p className="text-white/70 text-sm">This QR code is not registered in the system</p>
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                    onClick={handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button
                    className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => navigate("/install")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Install New
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
