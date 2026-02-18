import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Scan, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  X,
  Download,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import jsQR from "jsqr";
import axios from "axios";

// Define API Response Type
interface APIDeviceData {
  name: string;
  serial_number: string;
  device_type: string;
  system_type: string;
  location: string | null; // This determines if it's mapped or not
  model?: string;
  manufacturer?: string;
  purchase_date?: string;
  installation_date?: string;
  warranty_end_date?: string;
  expiry_date?: string;
  status: string;
  device_image?: string;
  // ... other fields
}

interface APIResponse {
  message: APIDeviceData;
}

export default function ScanDevice() {
  const navigate = useNavigate();
  // We might use context to check if device exists locally, but sticking to API for the 3 cases as requested.
  const { devices } = useInspection(); 

  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"mapped" | "unmapped" | "not-found" | "error" | null>(null);
  const [apiData, setApiData] = useState<APIDeviceData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef<boolean>(true);

  // Start Camera
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      setScanning(true);
      setResult(null);
      setApiData(null);
      setErrorMessage("");
      scanningRef.current = true;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Required for Safari/iOS
        videoRef.current.setAttribute("playsinline", "true"); 
        
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          requestAnimationFrame(scanQRCode);
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      setScanning(false);
      setResult("error");
      setErrorMessage("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    scanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanQRCode = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleScanSuccess(code.data);
          return; // Stop loop
        }
      }
    }
    
    if (scanningRef.current) {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleScanSuccess = async (qrData: string) => {
    // 1. Stop scanning
    scanningRef.current = false;
    setScanning(false);
    setLoading(true);

    try {
      // 2. Extract Device ID
      let deviceId = qrData;
      
      // Try to parse URL param if it's a URL
      try {
        const url = new URL(qrData);
        const idParam = url.searchParams.get("fire_system_register");
        if (idParam) {
          deviceId = idParam;
        }
      } catch (e) {
        // Not a URL, use raw data
      }

      console.log("Scanned ID:", deviceId);

      // 3. Call API
      // Uses the proxy configured in vite.config.ts to avoid Mixed Content (HTTPS -> HTTP)
      // "/custom-api" -> "http://202.131.111.246:8000"
      const apiUrl = `/custom-api/api/method/fts_qr.api.qr_redirect?fire_system_register=${encodeURIComponent(deviceId)}`;
      
      console.log("Fetching:", apiUrl);
      const response = await axios.get<APIResponse>(apiUrl);
      const data = response.data.message;
      
      console.log("API Data:", data);

      if (!data) {
        throw new Error("No data returned");
      }

      setApiData(data);

      // 4. Determine Case
      // CASE A: Mapped (Has Location)
      if (data.location && data.location.trim() !== "") {
        setResult("mapped");
        // Auto-redirect after delay
        setTimeout(() => {
          // If the device exists in our local context, we prefer to go to that context-aware page
          // But for now, we'll route to generic device page
          navigate(`/device/${encodeURIComponent(data.name)}`, { state: { apiData: data } });
        }, 1500);
      } 
      // CASE B: Unmapped (Location missing)
      else {
        setResult("unmapped");
      }

    } catch (error) {
        console.error("API Error Details:", error);
        if (axios.isAxiosError(error) && error.response) {
            console.error("Response data:", error.response.data);
            setErrorMessage(`Server Error: ${error.response.status}`);
        } else if (axios.isAxiosError(error) && error.request) {
            console.error("No response received:", error.request);
            setErrorMessage("Network Error: No response from server. Check connection.");
        } else {
             setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
        }
        
        // CASE C: Not Found (or Error)
        setResult("not-found");
    } finally {
        setLoading(false);
    }
  };

  const handleReset = () => {
    stopCamera();
    startCamera();
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="relative w-full h-screen">
        {/* Camera Feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Viewfinder Overlay */}
        <div className="absolute inset-0 bg-black/50 overflow-hidden">
          {/* Transparent Cutout */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-transparent border-2 border-primary/70 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
             {/* Corners */}
             <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
             <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
             <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
             <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
             
             {/* Scanning Line */}
             {scanning && (
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scan-y" />
             )}
          </div>
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <h1 className="text-white font-semibold text-lg flex items-center gap-2">
            <Scan className="w-5 h-5 text-primary" />
            Scan Device QR
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Status / Result Display */}
        <div className="absolute inset-x-0 bottom-0 p-6 z-20 bg-gradient-to-t from-black via-black/90 to-transparent pt-20">
            
            {/* 1. Loading State */}
            {loading && (
                <Card className="bg-black/80 border-primary/30 backdrop-blur">
                    <CardContent className="p-6 text-center space-y-3">
                        <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
                        <p className="text-white font-medium text-lg">Verifying Device...</p>
                        <p className="text-white/60 text-sm">Checking system records</p>
                    </CardContent>
                </Card>
            )}

            {/* 2. Scanning State (Instruction) */}
            {scanning && !loading && (
                <div className="text-center space-y-2 mb-8">
                    <p className="text-white font-medium">Align QR code within the frame</p>
                    <p className="text-white/50 text-sm">Searching for valid FTS device...</p>
                </div>
            )}

            {/* 3. CASE A: Mapped (Success) */}
            {result === "mapped" && apiData && (
                <Card className="bg-black/80 border-success/50 backdrop-blur animate-in slide-in-from-bottom duration-300">
                    <CardContent className="p-6 text-center space-y-3">
                        <CheckCircle2 className="w-12 h-12 mx-auto text-success" />
                        <h2 className="text-success font-bold text-xl">Device Found!</h2>
                        
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-white font-semibold text-lg">{apiData.name}</p>
                            <p className="text-white/60 text-xs font-mono mt-1">{apiData.serial_number}</p>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-white/70 text-sm">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Redirecting to details...
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 4. CASE B: Unmapped (Install Needed) */}
            {result === "unmapped" && apiData && (
                <Card className="bg-black/80 border-warning/50 backdrop-blur animate-in slide-in-from-bottom duration-300">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 mx-auto text-warning" />
                        <h2 className="text-warning font-bold text-xl">Device Not Installed</h2>
                        
                        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-white font-semibold">{apiData.name}</p>
                            <p className="text-white/60 text-sm mt-1">
                                Device found but has no location assigned.
                            </p>
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                                onClick={handleReset}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-warning hover:bg-warning/90 text-warning-foreground"
                                onClick={() => navigate(`/install/${encodeURIComponent(apiData.name)}`, { state: { apiData } })}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Install Now
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 5. CASE C: Not Found (Error) */}
            {result === "not-found" && (
                <Card className="bg-black/80 border-destructive/50 backdrop-blur animate-in slide-in-from-bottom duration-300">
                    <CardContent className="p-6 text-center space-y-4">
                        <XCircle className="w-12 h-12 mx-auto text-destructive" />
                        <h2 className="text-destructive font-bold text-xl">QR Not Registered</h2>
                        
                        <p className="text-white/80">
                            {errorMessage || "This QR code is not valid or not found in the system."}
                        </p>
                        
                        <div className="flex gap-3 pt-2">
                             <Button
                                variant="outline"
                                className="flex-1 border-white/20 text-white hover:bg-white/10"
                                onClick={() => navigate(-1)}
                            >
                                <X className="w-4 h-4 mr-2" />
                                Close
                            </Button>
                            <Button
                                className="flex-1 bg-white hover:bg-white/90 text-black"
                                onClick={handleReset}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Scan Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
             
             {result === "error" && (
                <Card className="bg-black/80 border-destructive/50 backdrop-blur animate-in slide-in-from-bottom duration-300">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
                        <h2 className="text-destructive font-bold text-xl">System Error</h2>
                         <p className="text-white/80">
                            {errorMessage}
                        </p>
                         <Button
                            className="w-full bg-white hover:bg-white/90 text-black mt-2"
                            onClick={handleReset}
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
             )}

        </div>
      </div>
    </div>
  );
}

