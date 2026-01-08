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
import { Switch } from "@/components/ui/switch";
import { Camera, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { mockChecklistItems, type ChecklistItem } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface InspectionChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceName: string;
  onComplete: (result: "pass" | "fail") => void;
}

interface ChecklistState {
  [key: string]: {
    value: boolean | number | string;
    result: "pass" | "fail" | null;
    photo?: string;
    notes?: string;
  };
}

export function InspectionChecklist({
  open,
  onOpenChange,
  deviceName,
  onComplete,
}: InspectionChecklistProps) {
  const { toast } = useToast();
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

  const hasFailures = Object.values(checklistState).some((item) => item.result === "fail");

  const getItemsWithFailures = () => {
    return mockChecklistItems.filter((item) => checklistState[item.id]?.result === "fail");
  };

  const canSubmit = () => {
    // Check all required items have results
    const allRequiredComplete = mockChecklistItems
      .filter((item) => item.required)
      .every((item) => checklistState[item.id]?.result !== null);

    // Check failed items have photos and notes
    const failedItems = getItemsWithFailures();
    const allFailedHaveEvidence = failedItems.every(
      (item) => failedItemPhotos[item.id] && failedItemNotes[item.id]?.trim()
    );

    return allRequiredComplete && (failedItems.length === 0 || allFailedHaveEvidence);
  };

  const handleToggleChange = (item: ChecklistItem, passed: boolean) => {
    setChecklistState((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        value: passed,
        result: passed ? "pass" : "fail",
      },
    }));
  };

  const handleNumericChange = (item: ChecklistItem, value: number) => {
    const inRange =
      value >= (item.minValue || 0) && value <= (item.maxValue || Infinity);
    setChecklistState((prev) => ({
      ...prev,
      [item.id]: {
        ...prev[item.id],
        value,
        result: inRange ? "pass" : "fail",
      },
    }));
  };

  const handlePhotoCapture = (itemId: string) => {
    // Simulate photo capture
    setFailedItemPhotos((prev) => ({ ...prev, [itemId]: true }));
    toast({
      title: "Photo captured",
      description: "Evidence photo has been attached.",
    });
  };

  const handleSubmit = () => {
    const overallResult = hasFailures ? "fail" : "pass";
    onComplete(overallResult);
    onOpenChange(false);
    
    toast({
      title: overallResult === "pass" ? "Inspection Passed" : "Inspection Failed",
      description: overallResult === "pass" 
        ? "All checks completed successfully." 
        : `${getItemsWithFailures().length} item(s) failed. NC will be created.`,
      variant: overallResult === "pass" ? "default" : "destructive",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Inspection Checklist</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{deviceName}</p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {mockChecklistItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-lg border transition-colors",
                checklistState[item.id]?.result === "pass" && "border-success/50 bg-success/5",
                checklistState[item.id]?.result === "fail" && "border-destructive/50 bg-destructive/5",
                checklistState[item.id]?.result === null && "border-border"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">
                      {item.name}
                      {item.required && <span className="text-destructive ml-0.5">*</span>}
                    </Label>
                    {item.critical && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-accent/20 text-accent font-medium">
                        Critical
                      </span>
                    )}
                  </div>

                  {/* Toggle Type */}
                  {item.type === "toggle" && (
                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        type="button"
                        variant={checklistState[item.id]?.result === "pass" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          checklistState[item.id]?.result === "pass" && "bg-success hover:bg-success/90"
                        )}
                        onClick={() => handleToggleChange(item, true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Pass
                      </Button>
                      <Button
                        type="button"
                        variant={checklistState[item.id]?.result === "fail" ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          checklistState[item.id]?.result === "fail" && "bg-destructive hover:bg-destructive/90"
                        )}
                        onClick={() => handleToggleChange(item, false)}
                      >
                        <XCircle className="w-4 h-4 mr-1.5" />
                        Fail
                      </Button>
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
                      />
                      <span className="text-sm text-muted-foreground">{item.unit}</span>
                      {checklistState[item.id]?.result && (
                        <span
                          className={cn(
                            "text-xs font-medium",
                            checklistState[item.id]?.result === "pass"
                              ? "text-success"
                              : "text-destructive"
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
              {checklistState[item.id]?.result === "fail" && (
                <div className="mt-4 pt-4 border-t border-destructive/20 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Evidence required for failed item</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant={failedItemPhotos[item.id] ? "default" : "outline"}
                      size="sm"
                      className={cn(failedItemPhotos[item.id] && "bg-success hover:bg-success/90")}
                      onClick={() => handlePhotoCapture(item.id)}
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
                    />
                    {!failedItemNotes[item.id]?.trim() && (
                      <span className="text-xs text-destructive">Description required</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className={cn(hasFailures && "bg-destructive hover:bg-destructive/90")}
          >
            {hasFailures ? "Submit with Failures" : "Submit Inspection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
