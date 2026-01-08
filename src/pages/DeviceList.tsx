import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DeviceCard } from "@/components/DeviceCard";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, CheckCircle2 } from "lucide-react";
import { getJobById, getDevicesByJobId } from "@/data/mockData";

export default function DeviceList() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const job = getJobById(jobId || "");
  const devices = getDevicesByJobId(jobId || "");

  const completed = devices.filter((d) => d.status !== "pending").length;
  const failed = devices.filter((d) => d.status === "failed").length;

  if (!job) return <div className="p-8 text-center text-muted-foreground">Job not found</div>;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBack title={job.siteName} />
      <main className="container px-4 py-6 space-y-6">
        <Card>
          <CardContent className="p-4">
            <ProgressIndicator completed={completed} total={devices.length} failed={failed} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} jobId={jobId || ""} />
          ))}
        </div>

        {completed === devices.length && (
          <Button className="w-full h-14" onClick={() => navigate(`/job/${jobId}/summary`)}>
            <CheckCircle2 className="w-5 h-5 mr-2" /> View Summary & Complete
          </Button>
        )}
      </main>

      <div className="fixed bottom-6 right-6">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg animate-pulse-glow">
          <QrCode className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
