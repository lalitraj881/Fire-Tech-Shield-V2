import { useState } from "react";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, AlertTriangle } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("maintenance");
  const { jobs } = useInspection();
  
  const maintenanceJobs = jobs.filter((j) => j.type === "maintenance");
  const repairJobs = jobs.filter((j) => j.type === "repair");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Today's Jobs</h2>
          <p className="text-muted-foreground">Follow the priority order below</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 mb-6">
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="w-4 h-4" />
              Maintenance
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                {maintenanceJobs.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="repair" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Repairs
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                {repairJobs.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maintenance" className="space-y-4 animate-fade-in">
            {maintenanceJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </TabsContent>

          <TabsContent value="repair" className="space-y-4 animate-fade-in">
            {repairJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
