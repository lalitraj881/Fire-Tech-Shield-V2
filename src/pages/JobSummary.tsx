import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Home, 
  Bell, 
  FileText,
  Download,
  Mail,
  Loader2
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { useToast } from "@/hooks/use-toast";

export default function JobSummary() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getJobById, getJobStats, getDevicesByJobId, completeJob, technician } = useInspection();
  
  const job = getJobById(jobId || "");
  const stats = getJobStats(jobId || "");
  const devices = getDevicesByJobId(jobId || "");
  
  const [signature, setSignature] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passedDevices = devices.filter(d => d.status === "completed");
  const failedDevices = devices.filter(d => d.status === "failed");

  const handleComplete = async () => {
    if (!signature) {
      toast({
        title: "Signature Required",
        description: "Please sign to confirm the inspection",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 1500));

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
      title: "📄 Report Generated",
      description: "PDF report and certificate created successfully",
      duration: 3000,
    });
    
    toast({
      title: "✅ Job Completed!",
      description: `${stats.passed} passed, ${stats.failed} failed out of ${stats.total} devices`,
      duration: 3000,
    });
    
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  const handleDownloadReport = () => {
    toast({
      title: "📥 Downloading...",
      description: "Inspection report is being prepared",
    });
  };

  const handleSendReport = () => {
    toast({
      title: "📧 Report Sent",
      description: `Report sent to ${job?.customerName}`,
    });
  };

  if (!job) {
    return <div className="p-8 text-center text-muted-foreground">Job not found</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
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

        {/* Device Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {passedDevices.length > 0 && (
              <div className="p-2 bg-success/10 rounded-lg border border-success/20">
                <div className="flex items-center gap-2 text-success text-sm font-medium mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Passed ({passedDevices.length})
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {passedDevices.slice(0, 5).map(d => (
                    <p key={d.id}>{d.name} - {d.locationDescription}</p>
                  ))}
                  {passedDevices.length > 5 && (
                    <p className="text-success">+{passedDevices.length - 5} more</p>
                  )}
                </div>
              </div>
            )}
            
            {failedDevices.length > 0 && (
              <div className="p-2 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive text-sm font-medium mb-1">
                  <XCircle className="w-4 h-4" />
                  Failed ({failedDevices.length})
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {failedDevices.map(d => (
                    <p key={d.id}>{d.name} - {d.locationDescription}</p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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

        {/* Remarks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Additional Remarks</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any additional notes or observations..."
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Signature */}
        <SignatureCanvas 
          onSignatureChange={setSignature}
          label={`Signed by: ${technician.name}`}
        />

        {/* Report Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Inspection Report
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownloadReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleSendReport}
              >
                <Mail className="w-4 h-4 mr-2" />
                Send to Customer
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Report includes QR code for verification
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            size="lg" 
            className="w-full h-14" 
            onClick={handleComplete}
            disabled={isSubmitting || !signature}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Complete Job & Generate Report
              </>
            )}
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
