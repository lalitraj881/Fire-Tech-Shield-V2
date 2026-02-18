import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2,
  Building2,
  MapPin,
  Calendar,
  Smartphone,
  AlertTriangle
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { getDashboardData, type DashboardData } from "@/services/dashboardService";
import { MyTasksSkeleton } from "@/components/skeletons/MyTasksSkeleton";

export default function MyTasks() {
  const { 
    jobs, 
    technician,
    assignedCustomers,
    selectedCustomerId,
    selectedSiteId,
    assignedSites
  } = useInspection();
  const [tab, setTab] = useState("pending");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
   console.log(dashboardData);

  // Get selected customer and site details
  const selectedCustomer = assignedCustomers.find((c) => c.name === selectedCustomerId);
  const selectedSite = assignedSites[selectedCustomerId]?.find((s) => s.name === selectedSiteId);

  // Fetch dashboard data when site changes
  useEffect(() => {
    const fetchDashboard = async () => {
      if (selectedSiteId && selectedSite) {
        const siteCode = selectedSite.site_code || selectedSiteId;
        const data = await getDashboardData(siteCode);
        setDashboardData(data);
      } else {
        setDashboardData(null);
      }
    };
    
    fetchDashboard();
  }, [selectedSiteId, selectedSite]);

  // Filter jobs that are not completed (active jobs)
  const pending = jobs.filter((j) => j.status === "not-started");
  const inProgress = jobs.filter((j) => j.status === "in-progress");
  const completed = jobs.filter((j) => j.status === "completed");

  // Dashboard stats
  const totalDevices = dashboardData?.total_devices ?? 0;
  const openNCCount = dashboardData?.open_nc ?? 0;
  const nextDueDate = dashboardData?.next_due_date;
  const lastInspectionDate = dashboardData?.last_inspection_date;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show skeleton while jobs haven't loaded yet
  if (jobs.length === 0 && selectedSiteId) {
    return (
      <div className="min-h-screen bg-background pb-8">
        <Header showBack title="My Tasks" />
        <MyTasksSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="My Tasks" />
      <main className="container px-4 py-6 space-y-6">
        {/* Welcome & Context Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <h2 className="text-xl font-bold text-foreground">{technician?.name}</h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 border border-success/30">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-medium text-success">Online</span>
              </div>
            </div>

            {/* Customer & Site Info */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <Building2 className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium truncate">
                    {selectedCustomer?.name || "All Customers"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Site</p>
                  <p className="text-sm font-medium truncate">
                    {dashboardData?.site_name || selectedSite?.site_code || selectedSite?.name || "All Sites"}
                  </p>
                </div>
              </div>
            </div>

            {/* Site Address */}
            {selectedSite && (
              <div className="mt-3 p-2 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedSite.address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Last Inspection */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Last Inspection</span>
              </div>
              <p className="text-lg font-bold">
                {lastInspectionDate ? formatDate(lastInspectionDate) : "N/A"}
              </p>
            </CardContent>
          </Card>

          {/* Next Due */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Next Due</span>
              </div>
              <p className="text-lg font-bold text-primary">
                {nextDueDate ? formatDate(nextDueDate) : "N/A"}
              </p>
            </CardContent>
          </Card>

          {/* Total Devices */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Smartphone className="w-4 h-4" />
                <span className="text-xs">Total Devices</span>
              </div>
              <p className="text-lg font-bold">{totalDevices}</p>
            </CardContent>
          </Card>

          {/* Open NCs */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-warning mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">Open NCs</span>
              </div>
              <p className="text-lg font-bold text-warning">
                {openNCCount}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Job Status Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Job Status</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid grid-cols-3 gap-2">
              {/* Pending */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 border border-border">
                <Clock className="w-5 h-5 text-muted-foreground mb-1" />
                <span className="text-2xl font-bold">{pending.length}</span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>

              {/* In Progress */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
                <PlayCircle className="w-5 h-5 text-primary mb-1" />
                <span className="text-2xl font-bold text-primary">{inProgress.length}</span>
                <span className="text-xs text-primary">In Progress</span>
              </div>

              {/* Completed */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-success/10 border border-success/30">
                <CheckCircle2 className="w-5 h-5 text-success mb-1" />
                <span className="text-2xl font-bold text-success">{completed.length}</span>
                <span className="text-xs text-success">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
