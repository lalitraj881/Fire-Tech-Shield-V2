import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Wifi, 
  WifiOff, 
  Database,
  Loader2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SyncStatus() {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline] = useState(navigator.onLine);
  const [lastSync] = useState(new Date());

  // Demo sync items
  const [syncItems] = useState<Array<{ id: number; type: string; device: string; status: "synced" | "pending" }>>([
    { id: 1, type: "Inspection", device: "Fire Extinguisher A1", status: "synced" },
    { id: 2, type: "Installation", device: "Smoke Detector D3", status: "synced" },
    { id: 3, type: "Relocation", device: "Fire Alarm B2", status: "synced" },
  ]);

  const pendingCount = syncItems.filter((i) => i.status === "pending").length;

  const handleSync = async () => {
    if (!isOnline) {
      toast({
        title: "No Connection",
        description: "Sync will resume when you're back online",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsSyncing(false);

    toast({
      title: "✅ All Synced",
      description: "All data is up to date",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="Sync Status" />
      <main className="container px-4 py-6 space-y-6">
        {/* Connection Status */}
        <Card className={isOnline ? "border-success/30" : "border-warning/30"}>
          <CardContent className="p-6 flex items-center gap-4">
            {isOnline ? (
              <Wifi className="w-8 h-8 text-success" />
            ) : (
              <WifiOff className="w-8 h-8 text-warning" />
            )}
            <div>
              <p className="font-semibold text-lg">{isOnline ? "Connected" : "Offline"}</p>
              <p className="text-sm text-muted-foreground">
                {isOnline ? "Data syncing normally" : "Changes saved locally"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sync Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Last Sync</p>
              <p className="font-semibold text-sm mt-1">
                {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </CardContent>
          </Card>
          <Card className={pendingCount > 0 ? "border-warning/30" : ""}>
            <CardContent className="p-4 text-center">
              <Database className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className={`font-semibold text-sm mt-1 ${pendingCount > 0 ? "text-warning" : "text-success"}`}>
                {pendingCount > 0 ? `${pendingCount} items` : "All synced"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sync Button */}
        <Button
          size="lg"
          className="w-full h-14"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Sync Now
            </>
          )}
        </Button>

        {/* Recent Sync Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {syncItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{item.type}</p>
                  <p className="text-xs text-muted-foreground">{item.device}</p>
                </div>
                {item.status === "synced" ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-warning" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
