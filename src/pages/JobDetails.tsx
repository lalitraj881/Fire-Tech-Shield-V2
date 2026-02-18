import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PriorityBadge } from "@/components/PriorityBadge";
import { SiteMap } from "@/components/SiteMap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, Wrench, Navigation, Play, CheckCircle2 } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { JobDetailsSkeleton } from "@/components/skeletons/JobDetailsSkeleton";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { getJobById, getJobStats } = useInspection();

  const job = getJobById(jobId || "");
  const stats = getJobStats(jobId || "");

  const isJobDataIncomplete = job && job.estimatedDeviceCount === 0;
  
  if (!job || isJobDataIncomplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBack title="Loading..." />
        <JobDetailsSkeleton />
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr || dateStr === "" || dateStr === "Invalid Date") return "N/A";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isCompleted = job.status === "completed";

  return (
    <div className="min-h-screen bg-background">
      <Header showBack title={job.name} />
      <main className="container px-4 py-6 space-y-6">
        {/* Status Banner */}
        {isCompleted && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/30">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-success font-medium">Job Completed</span>
          </div>
        )}

        <Card>
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {job.type === "maintenance" ? "Maintenance Job" : "Repair Job"}
                </p>
                <h2 className="text-xl font-bold mt-1 break-words">{job.name}</h2>
              </div>
              <PriorityBadge priority={job.priority} />
            </div>

            {/* Info Grid */}
            <div className="grid gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{job.customerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Site</p>
                  <p className="font-medium">{job.siteId}</p>
                  <p className="text-sm text-muted-foreground">{job.siteAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Inspection</p>
                    <p className="font-medium">{formatDate(job.lastInspectionDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Due</p>
                    <p className="font-medium text-primary">{formatDate(job.nextDueDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{job.estimatedDeviceCount}</p>
                <p className="text-sm text-muted-foreground">Total Devices</p>
              </div>
              {stats.completed > 0 && (
                <>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success">{stats.passed}</p>
                    <p className="text-sm text-muted-foreground">Passed</p>
                  </div>
                  {stats.failed > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  )}
                </>
              )}
              {job.openNCCount > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">{job.openNCCount}</p>
                  <p className="text-sm text-muted-foreground">Open NCs</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Site Map */}
        <SiteMap siteName={job.siteName} />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            size="lg" 
            className="h-14"
            onClick={() => window.open(`https://maps.google.com/?q=${job.siteGpsLat},${job.siteGpsLng}`, '_blank')}
          >
            <Navigation className="w-5 h-5 mr-2" />
            Navigate to Site
          </Button>
          <Button
            size="lg"
            className="h-14"
            onClick={() => navigate(`/job/${job.id}/devices`)}
          >
            <Play className="w-5 h-5 mr-2" />
            {isCompleted ? "View Devices" : "Start Inspection"}
          </Button>
        </div>
      </main>
    </div>
  );
}
