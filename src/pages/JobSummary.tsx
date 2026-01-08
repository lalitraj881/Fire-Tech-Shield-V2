import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Home } from "lucide-react";
import { getJobById, getDevicesByJobId } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function JobSummary() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const job = getJobById(jobId || "");
  const devices = getDevicesByJobId(jobId || "");

  const total = devices.length;
  const passed = devices.filter((d) => d.status === "completed").length;
  const failed = devices.filter((d) => d.status === "failed").length;

  const handleComplete = () => {
    toast({ title: "Job Completed!", description: `${failed > 0 ? `${failed} NC(s) have been created and notifications sent.` : "All devices passed inspection."}` });
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  if (!job) return <div className="p-8 text-center text-muted-foreground">Job not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header showBack title="Job Summary" />
      <main className="container px-4 py-6 space-y-6">
        <div className="text-center py-6">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${failed > 0 ? "bg-warning/20" : "bg-success/20"}`}>
            {failed > 0 ? <AlertTriangle className="w-10 h-10 text-warning" /> : <CheckCircle2 className="w-10 h-10 text-success" />}
          </div>
          <h2 className="text-2xl font-bold mt-4">{failed > 0 ? "Completed with Issues" : "All Checks Passed"}</h2>
          <p className="text-muted-foreground">{job.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{total}</p><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
          <Card className="border-success/50"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-success">{passed}</p><p className="text-sm text-muted-foreground">Passed</p></CardContent></Card>
          <Card className="border-destructive/50"><CardContent className="p-4 text-center"><p className="text-3xl font-bold text-destructive">{failed}</p><p className="text-sm text-muted-foreground">Failed</p></CardContent></Card>
        </div>

        {failed > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-warning" /><p className="font-medium text-warning">{failed} NC(s) will be created</p></div>
              <p className="text-sm text-muted-foreground mt-2">Notifications will be sent to: Factory Maintenance, FTS, Third Party</p>
            </CardContent>
          </Card>
        )}

        <Button size="lg" className="w-full h-14" onClick={handleComplete}><CheckCircle2 className="w-5 h-5 mr-2" /> Complete Job</Button>
        <Button variant="outline" size="lg" className="w-full" onClick={() => navigate("/dashboard")}><Home className="w-5 h-5 mr-2" /> Back to Dashboard</Button>
      </main>
    </div>
  );
}
