import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { JobCard } from "@/components/JobCard";
import { SearchFilter, defaultFilters, FilterState } from "@/components/SearchFilter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Wrench, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  PlayCircle, 
  CheckCircle2,
  Smartphone
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const { 
    jobs, 
    customers, 
    sites, 
    selectedCustomerId, 
    selectedSiteId,
    getJobsByCustomerAndSite,
    technician
  } = useInspection();

  // Get filtered jobs based on selection
  const baseJobs = useMemo(() => {
    return getJobsByCustomerAndSite(
      selectedCustomerId || undefined, 
      selectedSiteId || undefined
    );
  }, [selectedCustomerId, selectedSiteId, getJobsByCustomerAndSite]);

  // Apply search and filters
  const filteredJobs = useMemo(() => {
    let result = baseJobs;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((job) =>
        job.name.toLowerCase().includes(searchLower) ||
        job.siteName.toLowerCase().includes(searchLower) ||
        job.customerName.toLowerCase().includes(searchLower) ||
        job.ncReference?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      result = result.filter((job) => job.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== "all") {
      result = result.filter((job) => job.priority === filters.priority);
    }

    // Type filter
    if (filters.type !== "all") {
      result = result.filter((job) => job.type === filters.type);
    }

    // Show completed filter
    if (!filters.showCompleted) {
      result = result.filter((job) => job.status !== "completed");
    }

    return result;
  }, [baseJobs, filters]);

  // Categorize jobs by status
  const pendingJobs = filteredJobs.filter((j) => j.status === "not-started");
  const inProgressJobs = filteredJobs.filter((j) => j.status === "in-progress");
  const maintenanceJobs = filteredJobs.filter((j) => j.type === "maintenance" && j.status !== "completed");
  const repairJobs = filteredJobs.filter((j) => j.type === "repair" && j.status !== "completed");

  // Get selected customer and site details
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  // Calculate total devices at selected site
  const totalDevices = selectedSite?.totalDevices || 
    sites.filter((s) => !selectedCustomerId || s.customerId === selectedCustomerId)
      .reduce((acc, s) => acc + s.totalDevices, 0);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Find next due job for display
  const nextDueJob = baseJobs
    .filter((j) => j.status !== "completed")
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];

  // Last inspection from any job
  const lastInspection = baseJobs
    .sort((a, b) => new Date(b.lastInspectionDate).getTime() - new Date(a.lastInspectionDate).getTime())[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container px-4 py-6 space-y-6">
        {/* Welcome & Context Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <h2 className="text-xl font-bold text-foreground">{technician.name}</h2>
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
                    {selectedSite?.name || "All Sites"}
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
                {lastInspection ? formatDate(lastInspection.lastInspectionDate) : "N/A"}
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
                {nextDueJob ? formatDate(nextDueJob.nextDueDate) : "N/A"}
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
          <Card className={cn(
            repairJobs.length > 0 && "border-warning/50"
          )}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-warning mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs">Open NCs</span>
              </div>
              <p className="text-lg font-bold text-warning">
                {baseJobs.reduce((acc, j) => acc + j.openNCCount, 0)}
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
                <span className="text-2xl font-bold">{baseJobs.filter(j => j.status === "not-started").length}</span>
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>

              {/* In Progress */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
                <PlayCircle className="w-5 h-5 text-primary mb-1" />
                <span className="text-2xl font-bold text-primary">{baseJobs.filter(j => j.status === "in-progress").length}</span>
                <span className="text-xs text-primary">In Progress</span>
              </div>

              {/* Completed Today - placeholder */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-success/10 border border-success/30">
                <CheckCircle2 className="w-5 h-5 text-success mb-1" />
                <span className="text-2xl font-bold text-success">
                  {baseJobs.filter((j) => j.status === "completed").length}
                </span>
                <span className="text-xs text-success">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search & Filter */}
        <SearchFilter
          value={filters}
          onChange={setFilters}
          mode="jobs"
          placeholder="Search jobs, sites, customers..."
        />

        {/* Jobs Tabs */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Today's Jobs</h3>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="all" className="gap-1.5 text-xs">
                All
                <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px]">
                  {filteredJobs.filter((j) => j.status !== "completed").length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-1.5 text-xs">
                <Wrench className="w-3.5 h-3.5" />
                Maint
                <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px]">
                  {maintenanceJobs.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="repair" className="gap-1.5 text-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                Repair
                <span className="px-1.5 py-0.5 rounded-full bg-accent/20 text-accent text-[10px]">
                  {repairJobs.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 animate-fade-in">
              {/* In Progress Jobs First */}
              {inProgressJobs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    In Progress
                  </h4>
                  {inProgressJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}

              {/* Pending Jobs */}
              {pendingJobs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending
                  </h4>
                  {pendingJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}

              {filteredJobs.filter((j) => j.status !== "completed").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>{filters.search ? "No matching jobs found" : "All jobs completed!"}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4 animate-fade-in">
              {maintenanceJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {maintenanceJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No maintenance jobs</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="repair" className="space-y-4 animate-fade-in">
              {repairJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {repairJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No repair jobs</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
