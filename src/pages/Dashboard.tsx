import { useState } from "react";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { NCDetailModal } from "@/components/NCDetailModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, AlertTriangle, FileWarning, ChevronRight } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { mockNCs, type NC } from "@/data/mockData";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("maintenance");
  const [selectedNC, setSelectedNC] = useState<NC | null>(null);
  const { jobs } = useInspection();
  
  const maintenanceJobs = jobs.filter((j) => j.type === "maintenance");
  const repairJobs = jobs.filter((j) => j.type === "repair");
  const openNCs = mockNCs.filter((nc) => nc.status === "open");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6">
        {/* Open NCs Section */}
        {openNCs.length > 0 && (
          <Card className="mb-6 border-warning/30 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-warning" />
                Open Non-Conformances
                <Badge variant="outline" className="ml-auto border-warning text-warning">
                  {openNCs.length} Open
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {openNCs.map((nc) => (
                  <div
                    key={nc.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-border hover:border-warning/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedNC(nc)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                      <div>
                        <p className="font-mono text-sm font-semibold">{nc.id.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {nc.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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

      {/* NC Detail Modal */}
      <NCDetailModal
        nc={selectedNC}
        open={!!selectedNC}
        onClose={() => setSelectedNC(null)}
      />
    </div>
  );
}
