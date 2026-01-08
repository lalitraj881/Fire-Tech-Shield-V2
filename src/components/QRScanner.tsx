import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Scan, CheckCircle2, XCircle } from "lucide-react";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (deviceId: string) => void;
  expectedDeviceId?: string;
  deviceName?: string;
}

export function QRScanner({ 
  open, 
  onClose, 
  onScanSuccess, 
  expectedDeviceId,
  deviceName 
}: QRScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (open) {
      setScanning(true);
      setResult(null);
      
      // Simulate scanning process
      const scanTimer = setTimeout(() => {
        setScanning(false);
        // 90% success rate for demo
        const success = Math.random() > 0.1;
        setResult(success ? "success" : "error");
        
        if (success && expectedDeviceId) {
          setTimeout(() => {
            onScanSuccess(expectedDeviceId);
          }, 1500);
        }
      }, 2000);

      return () => clearTimeout(scanTimer);
    }
  }, [open, expectedDeviceId, onScanSuccess]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-black border-none overflow-hidden">
        <div className="relative aspect-square w-full">
          {/* Camera viewfinder background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
          
          {/* Scanning frame */}
          <div className="absolute inset-8 border-2 border-primary rounded-lg">
            {/* Corner accents */}
            <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
            
            {/* Scanning line animation */}
            {scanning && (
              <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
            )}
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-8 grid grid-cols-3 grid-rows-3 opacity-20">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-primary/30" />
            ))}
          </div>

          {/* Status display */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-center">
            {scanning && (
              <div className="space-y-2">
                <Scan className="w-8 h-8 mx-auto text-primary animate-pulse" />
                <p className="text-white font-medium">Scanning QR Code...</p>
                <p className="text-white/60 text-sm">Position device QR within frame</p>
              </div>
            )}
            
            {result === "success" && (
              <div className="space-y-2 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success" />
                <p className="text-success font-bold text-lg">Device Verified!</p>
                <p className="text-white/80">{deviceName || "Device matched successfully"}</p>
              </div>
            )}
            
            {result === "error" && (
              <div className="space-y-3 animate-fade-in">
                <XCircle className="w-12 h-12 mx-auto text-destructive" />
                <p className="text-destructive font-bold text-lg">QR Mismatch</p>
                <p className="text-white/80 text-sm">This device doesn't match the expected QR code</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setScanning(true);
                    setResult(null);
                  }}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Top info bar */}
          <div className="absolute top-4 left-4 right-16">
            <p className="text-white/80 text-sm truncate">
              {deviceName ? `Looking for: ${deviceName}` : "Scan any device QR"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
