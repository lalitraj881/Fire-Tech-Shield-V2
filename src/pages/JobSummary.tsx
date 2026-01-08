import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Home, Bell } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { useToast } from "@/hooks/use-toast";

export default function JobSummary() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getJobById, getJobStats, completeJob } = useInspection();
  
  const job = getJobById(jobId || "");
  const stats = getJobStats(jobId || "");

  const handleComplete = () => {
    completeJob(jobId || "");
    
    // Show NC notification if there are failures
    if (stats.failed > 0) {
      toast({
        title: "📋 NC Created",
        description: `${stats.failed} Non-Conformance report(s) generated`,
        duration: 3000,
      });
      
      setTimeout(() => {
        toast({
          title: "🔔 Notifications Sent",
          description: "Factory Maintenance, FTS, and Third Party notified",
          duration: 3000,
        });
      }, 1000);
    }
    
    toast({
      title: "✅ Job Completed!",
      description: `${stats.passed} passed, ${stats.failed} failed out of ${stats.total} devices`,
      duration: 3000,
    });
    
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  if (!job) {
    return <div className="p-8 text-center text-muted-foreground">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBack title="Job Summary" />
      <main className="container px-4 py-6 space-y-6">
        {/* Status Icon */}
        <div className="text-center py-6 animate-fade-in">
          <div
            className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
              stats.failed > 0 ? "bg-warning/20" : "bg-success/20"
            }`}
          >
            {stats.failed > 0 ? (
              <AlertTriangle className="w-10 h-10 text-warning" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-success" />
            )}
          </div>
          <h2 className="text-2xl font-bold mt-4">
            {stats.failed > 0 ? "Completed with Issues" : "All Checks Passed"}
          </h2>
          <p className="text-muted-foreground">{job.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="border-success/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-success" />
                <p className="text-3xl font-bold text-success">{stats.passed}</p>
              </div>
              <p className="text-sm text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
          <Card className="border-destructive/50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1">
                <XCircle className="w-5 h-5 text-destructive" />
                <p className="text-3xl font-bold text-destructive">{stats.failed}</p>
              </div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>

        {/* NC Warning */}
        {stats.failed > 0 && (
          <Card className="border-warning/50 bg-warning/5 animate-fade-in">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <p className="font-medium text-warning">
                  {stats.failed} Non-Conformance Report(s) will be created
                </p>
              </div>
              <div className="flex items-center gap-3 pl-8">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Notifications will be sent to: Factory Maintenance, FTS, Third Party
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button size="lg" className="w-full h-14" onClick={handleComplete}>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Complete Job
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate(`/job/${jobId}/devices`)}
          >
            Review Devices
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={() => navigate("/dashboard")}
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
