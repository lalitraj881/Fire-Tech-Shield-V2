import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { InspectionSeverity } from "@/data/mockData";

interface InspectionSeverityBadgeProps {
  severity: InspectionSeverity;
  className?: string;
  showLabel?: boolean;
}

const severityConfig = {
  pass: {
    label: "Pass",
    icon: CheckCircle2,
    className: "bg-success/20 text-success border-success/30",
    dotClass: "bg-success",
  },
  minor: {
    label: "Minor Issue",
    icon: AlertCircle,
    className: "bg-semicritical/20 text-semicritical border-semicritical/30",
    dotClass: "bg-semicritical",
  },
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    className: "bg-critical/20 text-critical border-critical/30",
    dotClass: "bg-critical",
  },
  optional: {
    label: "Optional",
    icon: Info,
    className: "bg-warning/20 text-warning border-warning/30",
    dotClass: "bg-warning",
  },
};

export function InspectionSeverityBadge({ severity, className, showLabel = true }: InspectionSeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}

export function InspectionSeverityDot({ severity, className }: { severity: InspectionSeverity; className?: string }) {
  const config = severityConfig[severity];
  
  return (
    <span
      className={cn(
        "w-3 h-3 rounded-full",
        config.dotClass,
        className
      )}
    />
  );
}
