import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/PriorityBadge";
import { JobStatusBadge } from "@/components/JobStatusBadge";
import { 
  MapPin, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  ChevronRight,
  Building2,
  Navigation,
  Smartphone
} from "lucide-react";
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

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Would open maps navigation in real app
    window.open(`https://maps.google.com/?q=${job.siteGpsLat},${job.siteGpsLng}`, '_blank');
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
        job.status === "in-progress" && "border-primary/30 bg-primary/5",
        job.status === "completed" && "opacity-60",
        className
      )}
      onClick={() => navigate(`/job/${job.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <PriorityBadge priority={job.priority} />
                <JobStatusBadge status={job.status} />
              </div>
              <h3 className="font-semibold text-foreground truncate">{job.name}</h3>
            </div>
          </div>

          {/* Customer & Site Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium truncate">{job.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{job.siteName}</span>
            </div>
            <div className="text-xs text-muted-foreground pl-6 truncate">
              {job.siteAddress}
            </div>
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
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{job.estimatedDeviceCount} devices</span>
              </div>
              {job.openNCCount > 0 && (
                <div className="flex items-center gap-1.5 text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{job.openNCCount} NC</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-primary hover:bg-primary/10"
                onClick={handleNavigate}
              >
                <Navigation className="w-4 h-4" />
              </Button>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
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
