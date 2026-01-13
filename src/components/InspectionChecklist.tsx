import { useState } from "react";
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
import { Camera, AlertTriangle, CheckCircle2, XCircle, AlertCircle, Info, MapPin } from "lucide-react";
import { mockChecklistItems, type ChecklistItem, type InspectionSeverity, type Device } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useInspection } from "@/context/InspectionContext";

interface InspectionChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
  jobId: string;
  onComplete: (result: "pass" | "fail", severity: InspectionSeverity) => void;
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
  const { createNC, getJobById, technician } = useInspection();
  const job = getJobById(jobId);

  const [checklistState, setChecklistState] = useState<ChecklistState>(() => {
    const initial: ChecklistState = {};
    mockChecklistItems.forEach((item) => {
      initial[item.id] = {
        value: item.type === "toggle" ? true : item.type === "numeric" ? 0 : "",
        result: null,
      };
    });
    return initial;
  });

  const [failedItemNotes, setFailedItemNotes] = useState<{ [key: string]: string }>({});
  const [failedItemPhotos, setFailedItemPhotos] = useState<{ [key: string]: boolean }>({});
  const [deviceLocation, setDeviceLocation] = useState(device.locationDescription);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const getFailedItems = () => {
    return mockChecklistItems.filter((item) => {
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
    const allRequiredComplete = mockChecklistItems
      .filter((item) => item.required)
      .every((item) => checklistState[item.id]?.result !== null);

    // Check failed items have photos and notes
    const failedItems = getFailedItems();
    const allFailedHaveEvidence = failedItems.every(
      (item) => failedItemPhotos[item.id] && failedItemNotes[item.id]?.trim()
    );

    // Device location must be confirmed
    const hasLocation = deviceLocation.trim().length > 0;

    return allRequiredComplete && (failedItems.length === 0 || allFailedHaveEvidence) && hasLocation;
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

  const handlePhotoCapture = (itemId: string) => {
    if (isReadOnly) return;
    setFailedItemPhotos((prev) => ({ ...prev, [itemId]: true }));
    toast({
      title: "Photo captured",
      description: "Evidence photo has been attached.",
    });
  };

  const handleSubmit = () => {
    const overallSeverity = getOverallSeverity();
    const overallResult = overallSeverity === "pass" ? "pass" : "fail";

    // Create NC if there are failures
    if (hasFailures && job) {
      const failedItems = getFailedItems();
      createNC({
        deviceId: device.id,
        deviceName: device.name,
        deviceType: device.type,
        deviceSystemType: device.systemType,
        deviceImageUrl: device.imageUrl,
        deviceLocationDescription: deviceLocation,
        deviceGpsLat: device.gpsLat,
        deviceGpsLng: device.gpsLng,
        jobId: job.id,
        customerId: job.customerId,
        customerName: job.customerName,
        siteId: job.siteId,
        siteName: job.siteName,
        siteAddress: job.siteAddress,
        siteGpsLat: job.siteGpsLat,
        siteGpsLng: job.siteGpsLng,
        severity: overallSeverity,
        description: failedItems.map((i) => i.name).join(", "),
        failedChecklistItems: failedItems.map((i) => i.name),
        technicianRemarks: Object.values(failedItemNotes).join("; "),
        photoEvidence: Object.keys(failedItemPhotos).filter((k) => failedItemPhotos[k]).map((k) => `photo-${k}.jpg`),
        inspectionJobId: job.id,
      });
    }

    setIsReadOnly(true);
    onComplete(overallResult, overallSeverity);
    onOpenChange(false);

    toast({
      title: overallResult === "pass" ? "Inspection Passed" : "Inspection Completed with Issues",
      description:
        overallResult === "pass"
          ? "All checks completed successfully."
          : `${getFailedItems().length} item(s) have issues. NC created automatically.`,
      variant: overallResult === "pass" ? "default" : "destructive",
    });
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
          <p className="text-sm text-muted-foreground">{device.name}</p>
        </DialogHeader>

        {/* Device Location Confirmation */}
        <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Device Location (Mandatory)</span>
          </div>
          <Textarea
            placeholder="Confirm or update device location..."
            value={deviceLocation}
            onChange={(e) => setDeviceLocation(e.target.value)}
            className="text-sm"
            rows={2}
            disabled={isReadOnly}
          />
          <p className="text-xs text-muted-foreground">
            GPS: {device.gpsLat?.toFixed(4)}, {device.gpsLng?.toFixed(4)}
          </p>
        </div>

        <div className="space-y-4 py-4">
          {mockChecklistItems.map((item) => {
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

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant={failedItemPhotos[item.id] ? "default" : "outline"}
                        size="sm"
                        className={cn(failedItemPhotos[item.id] && "bg-success hover:bg-success/90")}
                        onClick={() => handlePhotoCapture(item.id)}
                        disabled={isReadOnly}
                      >
                        <Camera className="w-4 h-4 mr-1.5" />
                        {failedItemPhotos[item.id] ? "Photo Attached" : "Capture Photo"}
                      </Button>
                      {!failedItemPhotos[item.id] && (
                        <span className="text-xs text-destructive">Required</span>
                      )}
                    </div>

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
          })}
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
