import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { DeviceStatus } from "@/data/mockData";

interface StatusBadgeProps {
  status: DeviceStatus;
  className?: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-success/20 text-success border-success/30",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
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
      <span>{config.label}</span>
    </span>
  );
}
