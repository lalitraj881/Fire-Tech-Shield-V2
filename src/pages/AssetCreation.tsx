import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  QrCode, 
  Printer, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Factory,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInspection } from "@/context/InspectionContext";
import { cn } from "@/lib/utils";

interface AssetFormData {
  name: string;
  type: string;
  systemType: string;
  manufacturer: string;
  serialNumber: string;
  locationDescription: string;
  gpsLat: number | null;
  gpsLng: number | null;
  installationDate: string;
  purchaseDate: string;
  manufacturingDate: string;
  warrantyEndDate: string;
  photo: boolean;
}

const deviceTypes = [
  "ABC Dry Chemical",
  "CO2",
  "Water Mist",
  "Foam",
  "Clean Agent",
  "Wet Chemical",
];

const systemTypes = [
  "Fire Suppression",
  "Fire Detection",
  "Emergency Lighting",
  "Sprinkler System",
  "Fire Alarm",
];

export default function AssetCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCustomerId, selectedSiteId, sites } = useInspection();
  
  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  const [formData, setFormData] = useState<AssetFormData>({
    name: "",
    type: "",
    systemType: "",
    manufacturer: "",
    serialNumber: "",
    locationDescription: "",
    gpsLat: null,
    gpsLng: null,
    installationDate: new Date().toISOString().split("T")[0],
    purchaseDate: "",
    manufacturingDate: "",
    warrantyEndDate: "",
    photo: false,
  });

  const [generatedId, setGeneratedId] = useState<string>("");
  const [gpsLoading, setGpsLoading] = useState(true);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate device ID
  useEffect(() => {
    const prefix = formData.type ? formData.type.substring(0, 2).toUpperCase() : "XX";
    const timestamp = Date.now().toString().slice(-6);
    setGeneratedId(`FTS-${prefix}-${timestamp}`);
  }, [formData.type]);

  // Auto-capture GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            gpsLat: position.coords.latitude,
            gpsLng: position.coords.longitude,
          }));
          setGpsLoading(false);
        },
        (error) => {
          console.error("GPS error:", error);
          setGpsLoading(false);
          toast({
            title: "GPS not available",
            description: "Please enter location manually",
            variant: "destructive",
          });
        }
      );
    } else {
      setGpsLoading(false);
    }
  }, [toast]);

  // Prevent accidental page refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formData.name || formData.type) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData]);

  const handlePhotoCapture = () => {
    setFormData((prev) => ({ ...prev, photo: true }));
    toast({
      title: "Photo captured",
      description: "Device photo has been attached.",
    });
  };

  const handleGenerateQR = () => {
    if (!formData.name || !formData.type) {
      toast({
        title: "Missing information",
        description: "Please fill in device name and type first.",
        variant: "destructive",
      });
      return;
    }
    setQrGenerated(true);
    toast({
      title: "QR Code Generated",
      description: `QR code for ${generatedId} is ready.`,
    });
  };

  const handlePrintQR = () => {
    toast({
      title: "Print QR Code",
      description: "Opening print dialog for QR label...",
    });
    // In production, this would trigger actual printing
    window.print();
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.type !== "" &&
      formData.systemType !== "" &&
      formData.locationDescription.trim() !== "" &&
      formData.manufacturer.trim() !== "" &&
      formData.installationDate !== "" &&
      formData.photo
    );
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields and capture a photo.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast({
      title: "Asset Created Successfully",
      description: `Device ${generatedId} has been registered.`,
    });

    setIsSaving(false);
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="Register New Asset" />
      
      <main className="container px-4 py-6 space-y-6">
        {/* Site Context */}
        {selectedSite && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Factory className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{selectedSite.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSite.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-Generated Device ID */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Device ID (Auto-generated)</p>
                <p className="text-xl font-mono font-bold text-primary">{generatedId}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 text-success" />
            </div>
          </CardContent>
        </Card>

        {/* Device Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Device Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Fire Extinguisher A1"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Device Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>System Type *</Label>
                <Select
                  value={formData.systemType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, systemType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select system" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer *</Label>
              <Input
                id="manufacturer"
                placeholder="e.g., Kidde, Amerex"
                value={formData.manufacturer}
                onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial">Serial Number</Label>
              <Input
                id="serial"
                placeholder="Manufacturer serial number"
                value={formData.serialNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Physical Location *</Label>
              <Textarea
                id="location"
                placeholder="e.g., Building A - Floor 2 - Near Exit Door"
                value={formData.locationDescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, locationDescription: e.target.value }))}
                rows={2}
              />
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
                  ) : formData.gpsLat && formData.gpsLng ? (
                    `${formData.gpsLat.toFixed(6)}, ${formData.gpsLng.toFixed(6)}`
                  ) : (
                    "GPS not available"
                  )}
                </span>
              </div>
              {formData.gpsLat && <CheckCircle2 className="w-4 h-4 text-success" />}
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Installation Date *</Label>
                <Input
                  type="date"
                  value={formData.installationDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, installationDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, purchaseDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Manufacturing Date</Label>
                <Input
                  type="date"
                  value={formData.manufacturingDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, manufacturingDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Warranty End Date</Label>
                <Input
                  type="date"
                  value={formData.warrantyEndDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, warrantyEndDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo & QR */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Photo & QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Photo Capture */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
              <div className="flex items-center gap-3">
                <Camera className={cn("w-8 h-8", formData.photo ? "text-success" : "text-muted-foreground")} />
                <div>
                  <p className="font-medium">Device Photo *</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.photo ? "Photo captured" : "Required"}
                  </p>
                </div>
              </div>
              <Button
                variant={formData.photo ? "outline" : "default"}
                size="sm"
                onClick={handlePhotoCapture}
              >
                {formData.photo ? "Retake" : "Capture"}
              </Button>
            </div>

            {/* QR Code Generation */}
            <div className="p-4 rounded-lg border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <QrCode className={cn("w-8 h-8", qrGenerated ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className="font-medium">QR Code</p>
                    <p className="text-sm text-muted-foreground">
                      {qrGenerated ? "Ready to print" : "Generate after filling details"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={handleGenerateQR} disabled={qrGenerated}>
                  Generate
                </Button>
              </div>

              {qrGenerated && (
                <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center p-2">
                    <QrCode className="w-full h-full text-black" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-sm">{generatedId}</p>
                    <Button size="sm" onClick={handlePrintQR}>
                      <Printer className="w-4 h-4 mr-2" />
                      Print QR Label
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Warning */}
        {!isFormValid() && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-warning/10 border border-warning/30">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-warning">Complete all required fields</p>
              <ul className="text-muted-foreground mt-1 list-disc list-inside">
                {!formData.name && <li>Device Name</li>}
                {!formData.type && <li>Device Type</li>}
                {!formData.systemType && <li>System Type</li>}
                {!formData.manufacturer && <li>Manufacturer</li>}
                {!formData.locationDescription && <li>Physical Location</li>}
                {!formData.photo && <li>Device Photo</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          size="lg"
          className="w-full h-14"
          onClick={handleSave}
          disabled={!isFormValid() || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Register Asset
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
