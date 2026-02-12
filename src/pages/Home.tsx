import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { 
  QrCode, 
  Plus, 
  ClipboardList, 
  Search, 
  RefreshCw,
  MapPin,
  Building2,
  Wifi,
  WifiOff
} from "lucide-react";
import { useInspection } from "@/context/InspectionContext";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { technician, selectedSiteId, sites, getJobsByCustomerAndSite, selectedCustomerId } = useInspection();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount] = useState(0);

  const selectedSite = sites.find((s) => s.id === selectedSiteId);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Get pending task count
  const jobs = getJobsByCustomerAndSite(selectedCustomerId || undefined, selectedSiteId || undefined);
  const pendingTaskCount = jobs.filter((j) => j.status !== "completed").length;

  const actions = [
    {
      id: "scan",
      label: "Scan QR",
      description: "Scan device QR code",
      icon: QrCode,
      color: "bg-primary text-primary-foreground",
      onClick: () => navigate("/scan"),
    },
    {
      id: "install",
      label: "Install Device",
      description: "Register new device",
      icon: Plus,
      color: "bg-success text-success-foreground",
      onClick: () => navigate("/install"),
    },
    {
      id: "tasks",
      label: "My Tasks",
      description: `${pendingTaskCount} pending`,
      icon: ClipboardList,
      color: "bg-warning text-warning-foreground",
      badge: pendingTaskCount > 0 ? pendingTaskCount : undefined,
      onClick: () => navigate("/tasks"),
    },
    {
      id: "search",
      label: "Search Device",
      description: "Find by name or serial",
      icon: Search,
      color: "bg-accent text-accent-foreground",
      onClick: () => navigate("/search"),
    },
    {
      id: "sync",
      label: "Sync Status",
      description: pendingSyncCount > 0 ? `${pendingSyncCount} pending` : "All synced",
      icon: RefreshCw,
      color: "bg-secondary text-secondary-foreground",
      badge: pendingSyncCount > 0 ? pendingSyncCount : undefined,
      onClick: () => navigate("/sync"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 space-y-6">
        {/* Site Context Bar */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Site</p>
                  <p className="font-semibold">{selectedSite?.name || "All Sites"}</p>
                  {selectedSite && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {selectedSite.address}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border">
                {isOnline ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-medium text-success">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-warning" />
                    <span className="text-xs font-medium text-warning">Offline</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Welcome */}
        <div className="text-center py-2">
          <p className="text-muted-foreground text-sm">Welcome,</p>
          <h2 className="text-2xl font-bold">{technician.name}</h2>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            // Make Scan QR span full width
            const isFullWidth = action.id === "scan";
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${isFullWidth ? "col-span-2" : ""} relative group`}
              >
                <Card className="border-border hover:border-primary/50 transition-all duration-200 active:scale-[0.98]">
                  <CardContent className={`p-6 flex ${isFullWidth ? "flex-row items-center gap-5" : "flex-col items-center gap-3"} text-center`}>
                    <div className={`${action.color} ${isFullWidth ? "w-16 h-16" : "w-14 h-14"} rounded-2xl flex items-center justify-center relative`}>
                      <Icon className={`${isFullWidth ? "w-8 h-8" : "w-7 h-7"}`} />
                      {action.badge && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <div className={isFullWidth ? "text-left" : ""}>
                      <p className={`font-semibold ${isFullWidth ? "text-lg" : "text-sm"}`}>{action.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
