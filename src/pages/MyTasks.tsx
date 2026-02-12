import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2 
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";

export default function MyTasks() {
  const { getJobsByCustomerAndSite, selectedCustomerId, selectedSiteId } = useInspection();
  const [tab, setTab] = useState("pending");

  const jobs = getJobsByCustomerAndSite(
    selectedCustomerId || undefined,
    selectedSiteId || undefined
  );

  const pending = jobs.filter((j) => j.status === "not-started");
  const inProgress = jobs.filter((j) => j.status === "in-progress");
  const completed = jobs.filter((j) => j.status === "completed");

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="My Tasks" />
      <main className="container px-4 py-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
              <p className="text-2xl font-bold">{pending.length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30">
            <CardContent className="p-3 text-center">
              <PlayCircle className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold text-primary">{inProgress.length}</p>
              <p className="text-xs text-primary">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <CheckCircle2 className="w-5 h-5 mx-auto text-success mb-1" />
              <p className="text-2xl font-bold text-success">{completed.length}</p>
              <p className="text-xs text-success">Done</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending" className="text-xs">
              Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active ({inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="done" className="text-xs">
              Done ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3 mt-4">
            {pending.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {pending.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No pending tasks</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-3 mt-4">
            {inProgress.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {inProgress.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No active tasks</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="done" className="space-y-3 mt-4">
            {completed.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {completed.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No completed tasks</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
