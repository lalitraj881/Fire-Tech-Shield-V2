import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/PriorityBadge";
import { MapPin, Calendar, Wrench, AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Job } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
      onClick={() => navigate(`/job/${job.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{job.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{job.customerName}</p>
            </div>
            <PriorityBadge priority={job.priority} />
          </div>

          {/* Site Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{job.siteName}</span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Last Inspection</p>
                <p className="text-foreground">{formatDate(job.lastInspectionDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Next Due</p>
                <p className="text-primary font-medium">{formatDate(job.nextDueDate)}</p>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{job.estimatedDeviceCount} devices</span>
              </div>
              {job.openNCCount > 0 && (
                <div className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{job.openNCCount} open NC</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to map - for now just navigate to job
                navigate(`/job/${job.id}`);
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* NC Reference for Repair Jobs */}
          {job.type === "repair" && job.ncReference && (
            <div className="flex items-center gap-2 px-2 py-1.5 bg-accent/10 rounded-md text-sm">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span className="text-accent font-medium">Ref: {job.ncReference}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
