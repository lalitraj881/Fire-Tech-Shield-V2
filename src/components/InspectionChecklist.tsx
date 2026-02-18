import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera, AlertTriangle, CheckCircle2, XCircle, AlertCircle, Info, MapPin, Image as ImageIcon } from "lucide-react";
import { type ChecklistItem, type InspectionSeverity, type Device } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useInspection } from "@/context/InspectionContext";

interface InspectionChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
  jobId: string;
  onComplete: (result: "pass" | "fail", severity: InspectionSeverity, results?: any[]) => void;
}

interface ChecklistItemState {
  result: InspectionSeverity | null;
  value: boolean | number | string;
  photo?: string;
  notes?: string;
}

interface ChecklistState {
  [key: string]: ChecklistItemState;
}

const severityConfig = {
  pass: {
    label: "Pass",
    icon: CheckCircle2,
    color: "bg-success text-success-foreground",
    borderColor: "border-success/50",
    bgColor: "bg-success/10",
  },
  minor: {
    label: "Minor",
    icon: AlertCircle,
    color: "bg-warning text-warning-foreground",
    borderColor: "border-warning/50",
    bgColor: "bg-warning/10",
  },
  critical: {
    label: "Critical",
    icon: XCircle,
    color: "bg-destructive text-destructive-foreground",
    borderColor: "border-destructive/50",
    bgColor: "bg-destructive/10",
  },
  optional: {
    label: "Optional",
    icon: Info,
    color: "bg-normal text-normal-foreground",
    borderColor: "border-normal/50",
    bgColor: "bg-normal/10",
  },
};

export function InspectionChecklist({
  open,
  onOpenChange,
  device,
  jobId,
  onComplete,
}: InspectionChecklistProps) {
  const { toast } = useToast();
  const { getJobById, technician, checklists } = useInspection();
  const job = getJobById(jobId);

  // Get checklists for this specific device
  const currentChecklistItems = checklists[device.id] || [];

  const [checklistState, setChecklistState] = useState<ChecklistState>({});
  const [failedItemNotes, setFailedItemNotes] = useState<{ [key: string]: string }>({});
  const [failedItemPhotos, setFailedItemPhotos] = useState<{ [key: string]: boolean }>({});
  const [failedItemPhotoFiles, setFailedItemPhotoFiles] = useState<{ [key: string]: string }>({});
  const [deviceLocation, setDeviceLocation] = useState(device.locationDescription);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState<string | null>(null);

  // Initialize state when items or open changes
  useEffect(() => {
    if (open && currentChecklistItems.length > 0) {
       setChecklistState(prev => {
          // If already initialized for these items, don't overwrite
          if (Object.keys(prev).length > 0) return prev; 
          
          const initial: ChecklistState = {};
          currentChecklistItems.forEach((item) => {
            initial[item.id] = {
              value: item.type === "toggle" ? true : item.type === "numeric" ? 0 : "",
              result: null,
            };
          });
          return initial;
       });
    }
  }, [open, currentChecklistItems]);

  const getFailedItems = () => {
    return currentChecklistItems.filter((item) => {
      const state = checklistState[item.id];
      return state?.result && state.result !== "pass";
    });
  };

  const hasFailures = getFailedItems().length > 0;

  const getOverallSeverity = (): InspectionSeverity => {
    const states = Object.values(checklistState);
    if (states.some((s) => s.result === "critical")) return "critical";
    if (states.some((s) => s.result === "minor")) return "minor";
    if (states.some((s) => s.result === "optional")) return "optional";
    return "pass";
  };

  const canSubmit = () => {
    // Check all required items have results
    const allRequiredComplete = currentChecklistItems
      .filter((item) => item.required)
      .every((item) => checklistState[item.id]?.result !== null);

    // Check failed items have required evidence
    const failedItems = getFailedItems();
    const allFailedHaveEvidence = failedItems.every((item) => {
      const hasPhoto = !item.requiresPhoto || failedItemPhotos[item.id];
      const hasNotes = !item.requiresDescription || failedItemNotes[item.id]?.trim();
      return hasPhoto && hasNotes;
    });

    return allRequiredComplete && (failedItems.length === 0 || allFailedHaveEvidence);
  };

  const handleSeveritySelect = (item: ChecklistItem, severity: InspectionSeverity) => {
    if (isReadOnly) return;
    setChecklistState((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        result: severity,
      },
    }));
  };

  const handleNumericChange = (item: ChecklistItem, value: number) => {
    if (isReadOnly) return;
    const inRange = value >= (item.minValue || 0) && value <= (item.maxValue || Infinity);
    setChecklistState((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        value,
        result: inRange ? "pass" : "critical",
      },
    }));
  };

  const handlePhotoCapture = async (itemId: string) => {
    if (isReadOnly) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      
      setFailedItemPhotos((prev) => ({ ...prev, [itemId]: true }));
      setFailedItemPhotoFiles((prev) => ({ ...prev, [itemId]: photoData }));
      setShowPhotoOptions(null);
      
      toast({
        title: "Photo captured",
        description: "Camera photo has been attached.",
      });
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please try uploading from device.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoData = reader.result as string;
        setFailedItemPhotos((prev) => ({ ...prev, [itemId]: true }));
        setFailedItemPhotoFiles((prev) => ({ ...prev, [itemId]: photoData }));
        setShowPhotoOptions(null);
        
        toast({
          title: "Photo uploaded",
          description: "Evidence photo has been attached.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to convert data URL to Blob
  const dataURItoBlob = (dataURI: string) => {
    try {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    } catch (e) {
        console.error("Error converting data URI to blob", e);
        return null;
    }
  };

  const handleSubmit = async () => {
    const overallSeverity = getOverallSeverity();
    const overallResult = overallSeverity === "pass" ? "pass" : "fail";

    // Gather Results
    const results = currentChecklistItems.map((item) => {
        const state = checklistState[item.id];
        const photoData = failedItemPhotoFiles[item.id];
        const photoBlob = photoData ? dataURItoBlob(photoData) : null;
        
        return {
            itemId: item.id,
            question: item.name,
            value: state?.value,
            result: state?.result || "pass",
            notes: failedItemNotes[item.id],
            photoFile: photoBlob,
            minValue: item.minValue,
            maxValue: item.maxValue,
            requiresPhoto: item.requiresPhoto,
            requiresDescription: item.requiresDescription
        };
    });

    try {
      setIsReadOnly(true);
      // Pass the collected results to parent
      onComplete(overallResult, overallSeverity, results);
      onOpenChange(false);

      toast({
        title: overallResult === "pass" ? "Inspection Passed" : "Inspection Completed with Issues",
        description: "Submitting results...",
        variant: overallResult === "pass" ? "default" : "destructive",
      });
    } catch (e) {
      console.error("Submission prep failed", e);
      toast({
        title: "Error",
        description: "Could not prepare inspection results.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Inspection Checklist</span>
            {isReadOnly && (
              <span className="text-xs bg-muted px-2 py-1 rounded">Read Only</span>
            )}
          </DialogTitle>
          <p className="text-sm text-muted-foreground break-words">{device.name}</p>
        </DialogHeader>

        {/* Device Location Confirmation */}
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Device Location (Mandatory)</span>
          </div>
          <Textarea
            value={deviceLocation}
            className="text-sm bg-muted/50"
            rows={2}
            readOnly
          />

          <p className="text-xs text-muted-foreground">
            GPS: {device.gpsLat?.toFixed(4)}, {device.gpsLng?.toFixed(4)}
          </p>
        </div>

        <div className="space-y-4 py-4">
          {currentChecklistItems.length === 0 ? (
             <div className="text-center p-4 text-muted-foreground">No checklist items found for this device.</div>
          ) : (
             currentChecklistItems.map((item) => {
            const state = checklistState[item.id];
            const config = state?.result ? severityConfig[state.result] : null;

            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 rounded-lg border transition-colors",
                  config ? config.borderColor : "border-border",
                  config ? config.bgColor : ""
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Label className="font-medium">
                        {item.name}
                        {item.required && <span className="text-destructive ml-0.5">*</span>}
                      </Label>
                      {item.critical && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-medium">
                          Critical
                        </span>
                      )}
                    </div>

                    {/* Toggle Type - 4 State Buttons */}
                    {item.type === "toggle" && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {(Object.keys(severityConfig) as InspectionSeverity[]).map((severity) => {
                          const sConfig = severityConfig[severity];
                          const Icon = sConfig.icon;
                          const isSelected = state?.result === severity;

                          return (
                            <Button
                              key={severity}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "text-xs",
                                isSelected && sConfig.color
                              )}
                              onClick={() => handleSeveritySelect(item, severity)}
                              disabled={isReadOnly}
                            >
                              <Icon className="w-3 h-3 mr-1" />
                              {sConfig.label}
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    {/* Numeric Type */}
                    {item.type === "numeric" && (
                      <div className="flex items-center gap-3 mt-3">
                        <Input
                          type="number"
                          placeholder={`${item.minValue} - ${item.maxValue}`}
                          className="w-28"
                          onChange={(e) => handleNumericChange(item, Number(e.target.value))}
                          disabled={isReadOnly}
                        />
                        <span className="text-sm text-muted-foreground">{item.unit}</span>
                        {state?.result && (
                          <span
                            className={cn(
                              "text-xs font-medium",
                              state.result === "pass" ? "text-success" : "text-destructive"
                            )}
                          >
                            ({item.minValue}-{item.maxValue} {item.unit})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Text Type */}
                    {item.type === "text" && (
                      <Textarea
                        placeholder="Enter notes..."
                        className="mt-3"
                        rows={2}
                        disabled={isReadOnly}
                        onChange={(e) =>
                          setChecklistState((prev) => ({
                            ...prev,
                            [item.id]: { ...prev[item.id], value: e.target.value, result: "pass" },
                          }))
                        }
                      />
                    )}
                  </div>
                </div>

                {/* Fail Evidence Section */}
                {state?.result && state.result !== "pass" && (
                  <div className="mt-4 pt-4 border-t border-destructive/20 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Photo & remarks required</span>
                    </div>

                    {failedItemPhotos[item.id] ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-4 p-3 border rounded-lg bg-muted/30">
                          {failedItemPhotoFiles[item.id] && (
                            <div className="relative w-32 h-24 rounded-md overflow-hidden border border-border bg-background">
                              <img 
                                src={failedItemPhotoFiles[item.id]} 
                                alt="Evidence" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                          )}
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-success flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Photo Attached
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handlePhotoCapture(item.id)}
                              disabled={isReadOnly}
                            >
                              <Camera className="w-4 h-4 mr-1.5" />
                              Re-Capture
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePhotoCapture(item.id)}
                          disabled={isReadOnly}
                        >
                          <Camera className="w-4 h-4 mr-1.5" />
                          Capture Photo
                        </Button>
                        <span className="text-xs text-destructive">Required</span>
                      </div>
                    )}

                    <div>
                      <Textarea
                        placeholder="Describe the issue (required)..."
                        className={cn(
                          "border-destructive/30",
                          !failedItemNotes[item.id]?.trim() && "border-destructive"
                        )}
                        rows={2}
                        value={failedItemNotes[item.id] || ""}
                        onChange={(e) =>
                          setFailedItemNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        disabled={isReadOnly}
                      />
                      {!failedItemNotes[item.id]?.trim() && (
                        <span className="text-xs text-destructive">Description required</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }))
        }
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit() || isReadOnly}
            className={cn(
              hasFailures && getOverallSeverity() === "critical" && "bg-destructive hover:bg-destructive/90",
              hasFailures && getOverallSeverity() === "minor" && "bg-warning hover:bg-warning/90",
              hasFailures && getOverallSeverity() === "optional" && "bg-normal hover:bg-normal/90"
            )}
          >
            {hasFailures ? `Submit (${getOverallSeverity().toUpperCase()})` : "Submit Inspection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
