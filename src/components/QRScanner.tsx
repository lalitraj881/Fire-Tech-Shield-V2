import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Scan, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import jsQR from "jsqr";
import { useToast } from "@/hooks/use-toast";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (deviceId: string, deviceData?: any) => void;
  expectedDeviceId?: string;
  deviceName?: string;
  // New prop for validation
  onValidate?: (deviceId: string) => boolean;
}

export function QRScanner({ 
  open, 
  onClose, 
  onScanSuccess, 
  expectedDeviceId,
  deviceName,
  onValidate
}: QRScannerProps) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fetchingData, setFetchingData] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(false);

  // Start camera when modal opens
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [open]);

  const startCamera = async () => {
    try {
      setScanning(true);
      setResult(null);
      setErrorMessage("");
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use rear camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          scanningRef.current = true;
          scanQRCode();
        };
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setScanning(false);
      setResult("error");
      setErrorMessage("Camera access denied. Please enable camera permissions.");
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const scanQRCode = () => {
    const scan = () => {
      if (!scanningRef.current || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleQRDetected(code.data);
          return; // Stop scanning after detection
        }
      }

      requestAnimationFrame(scan);
    };
    requestAnimationFrame(scan);
  };

  const handleQRDetected = async (qrData: string) => {
    if (scanningRef.current === false) return;
    scanningRef.current = false;
    setScanning(false);

    console.log('QR Code detected:', qrData);

    // Check if it's a URL
    const isUrl = qrData.startsWith('http://') || qrData.startsWith('https://');

    if (isUrl) {
      // 1. Try to get Device ID from URL params first (Fastest)
      let urlDeviceId: string | null = null;
      try {
        const urlObj = new URL(qrData);
        urlDeviceId = urlObj.searchParams.get("fire_system_register");
      } catch (e) {
        console.log("Could not parse URL params", e);
      }

      // Fetch data from URL
      setFetchingData(true);
      try {
        const response = await fetch(qrData);
        if (!response.ok) {
           // If fetch fails but we found ID in URL, use that
           if (urlDeviceId) {
             const decodedId = decodeURIComponent(urlDeviceId);
             
             // Validate if prop provided
             if (onValidate && !onValidate(decodedId)) {
               setFetchingData(false);
               setResult("error");
               setErrorMessage("Device not found in current job");
               return; 
             }

             console.log("Fetch failed, using URL param ID:", decodedId);
             setFetchingData(false);
             setResult("success");
             setTimeout(() => {
                onScanSuccess(decodedId, {});
             }, 1000);
             return;
           }
           throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        setFetchingData(false);
        
        // Extract device ID from data (handling nested message structure) or URL
        const rawId = data.message?.name || data.name || data.device_id || data.id || urlDeviceId || expectedDeviceId;
        const deviceId = rawId ? decodeURIComponent(rawId) : null;
        
        if (deviceId) {
            // Validate if prop provided
            if (onValidate && !onValidate(deviceId)) {
              setResult("error");
              setErrorMessage("Device not found in current job");
              return; 
            }

            setResult("success");
            setTimeout(() => {
              onScanSuccess(deviceId, data);
            }, 1000);
            
            if (!onValidate) {
                toast({
                  title: "Device Verified",
                  description: "Successfully identified device.",
                });
            }
        } else {
            throw new Error("No device ID found in response");
        }

      } catch (error) {
        console.error('Failed to fetch data from URL:', error);
        
        // If fetch failed completely but we have URL param, fallback to it
        if (urlDeviceId) {
             const decodedId = decodeURIComponent(urlDeviceId);
             
             // Validate if prop provided
             if (onValidate && !onValidate(decodedId)) {
               setFetchingData(false);
               setResult("error");
               setErrorMessage("Device not found in current job");
               return; 
             }

             console.log("Fetch error caught, fallback to URL param ID:", decodedId);
             setFetchingData(false);
             setResult("success");
             setTimeout(() => {
                onScanSuccess(decodedId, {});
             }, 1000);
             
             if (!onValidate) {
                 toast({
                  title: "Device ID Found",
                  description: "Identified device from QR link.",
                 });
             }
             return;
        }

        setFetchingData(false);
        setResult("error");
        setErrorMessage("Failed to verify device. Please try again.");
      }
    } else {
      // Treat as device ID directly
      const deviceId = qrData;
      
      // Validate if prop provided
      if (onValidate && !onValidate(deviceId)) {
          setResult("error");
          setErrorMessage("Device not found in current job");
          return;
      }
      
      // Check if it matches expected device (if provided and NO verification prop - backward compat)
      if (!onValidate && expectedDeviceId && deviceId !== expectedDeviceId) {
        setResult("error");
        setErrorMessage("QR code doesn't match expected device");
      } else {
        setResult("success");
        setTimeout(() => {
          onScanSuccess(deviceId);
        }, 1500);
      }
    }
  };

  const handleRetry = () => {
    setResult(null);
    setErrorMessage("");
    setFetchingData(false);
    // Restart camera and scanning
    startCamera();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 bg-black border-none overflow-hidden">
        <div className="relative aspect-square w-full bg-black">
          {/* Video element for camera feed */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover z-0"
            playsInline
            muted
            autoPlay
          />
          
          {/* Hidden canvas for QR detection */}
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Scanning frame */}
          <div className="absolute inset-8 border-2 border-primary rounded-lg pointer-events-none z-20">
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
          <div className="absolute inset-8 grid grid-cols-3 grid-rows-3 opacity-10 pointer-events-none z-10">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border border-primary/30" />
            ))}
          </div>

          {/* Status display */}
          <div className="absolute inset-x-0 bottom-0 p-6 text-center z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            {scanning && !fetchingData && (
              <div className="space-y-2">
                <Scan className="w-8 h-8 mx-auto text-primary animate-pulse" />
                <p className="text-white font-medium">Scanning QR Code...</p>
                <p className="text-white/60 text-sm">Position QR code within frame</p>
              </div>
            )}
            
            {fetchingData && (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                <p className="text-white font-medium">Fetching Device Data...</p>
                <p className="text-white/60 text-sm">Please wait</p>
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
                <p className="text-destructive font-bold text-lg">Scan Failed</p>
                <p className="text-white/80 text-sm">{errorMessage || "QR code could not be processed"}</p>
                <Button 
                  variant="outline" 
                  onClick={handleRetry}
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
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-40"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Top info bar - inside the scanning area */}
          {deviceName && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-black/70 rounded-full px-4 py-2 border border-primary/30">
              <p className="text-white text-sm font-medium whitespace-nowrap">
                Looking for: {deviceName}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
