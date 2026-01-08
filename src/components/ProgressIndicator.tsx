import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
  completed: number;
  total: number;
  failed?: number;
  className?: string;
}

export function ProgressIndicator({
  completed,
  total,
  failed = 0,
  className,
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const passed = completed - failed;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          <span className="text-foreground font-medium">{completed}</span> of{" "}
          <span className="text-foreground font-medium">{total}</span> devices
        </span>
        <span className="font-semibold text-primary">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      {completed > 0 && (
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-muted-foreground">
              <span className="text-success font-medium">{passed}</span> Passed
            </span>
          </div>
          {failed > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">
                <span className="text-destructive font-medium">{failed}</span> Failed
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
