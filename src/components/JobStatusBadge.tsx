import { cn } from "@/lib/utils";
import { Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import type { JobStatus } from "@/data/mockData";

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const statusConfig = {
  'not-started': {
    label: "Not Started",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
  'in-progress': {
    label: "In Progress",
    icon: PlayCircle,
    className: "bg-primary/20 text-primary border-primary/30",
  },
  'completed': {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-success/20 text-success border-success/30",
  },
};

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
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
