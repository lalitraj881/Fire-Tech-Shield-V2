import { cn } from "@/lib/utils";
import type { Priority } from "@/data/mockData";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig = {
  critical: {
    label: "Critical",
    icon: "🔴",
    className: "bg-critical/20 text-critical border-critical/30",
  },
  semicritical: {
    label: "Semi-critical",
    icon: "🟠",
    className: "bg-semicritical/20 text-semicritical border-semicritical/30",
  },
  normal: {
    label: "Normal",
    icon: "🩷",
    className: "bg-normal/20 text-normal border-normal/30",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
