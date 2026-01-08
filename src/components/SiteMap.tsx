import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, Layers } from "lucide-react";

interface SiteMapProps {
  siteName: string;
  currentZone?: string;
  compact?: boolean;
}

export function SiteMap({ siteName, currentZone, compact = false }: SiteMapProps) {
  // Mock floor plan data
  const zones = [
    { id: "A", name: "Zone A - Main Entrance", x: 15, y: 20, active: currentZone === "Zone A" },
    { id: "B", name: "Zone B - Server Room", x: 65, y: 25, active: currentZone === "Zone B" },
    { id: "C", name: "Zone C - Warehouse", x: 40, y: 60, active: currentZone === "Zone C" },
    { id: "D", name: "Zone D - Office Block", x: 75, y: 70, active: currentZone === "Zone D" },
  ];

  if (compact) {
    return (
      <div className="relative w-full h-32 bg-muted/30 rounded-lg border border-border overflow-hidden">
        {/* Mini floor plan */}
        <div className="absolute inset-2">
          {/* Building outline */}
          <div className="absolute inset-0 border-2 border-dashed border-muted-foreground/30 rounded" />
          
          {/* Zone markers */}
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`absolute w-3 h-3 rounded-full transition-all ${
                zone.active 
                  ? "bg-primary animate-pulse shadow-lg shadow-primary/50" 
                  : "bg-muted-foreground/40"
              }`}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            />
          ))}
          
          {/* Current location indicator */}
          {currentZone && (
            <div className="absolute bottom-1 left-1 flex items-center gap-1 text-xs text-primary">
              <MapPin className="w-3 h-3" />
              <span>{currentZone}</span>
            </div>
          )}
        </div>
        
        {/* Site name overlay */}
        <div className="absolute top-1 right-1 bg-background/80 px-2 py-0.5 rounded text-xs text-muted-foreground">
          {siteName}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Site Layout - {siteName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-muted/20 rounded-lg border border-border overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary) / 0.3) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary) / 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>

          {/* Building sections */}
          <div className="absolute top-[10%] left-[5%] w-[35%] h-[35%] border-2 border-primary/40 rounded bg-primary/5">
            <span className="absolute top-1 left-2 text-xs text-muted-foreground">Main Building</span>
          </div>
          
          <div className="absolute top-[10%] right-[5%] w-[25%] h-[30%] border-2 border-accent/40 rounded bg-accent/5">
            <span className="absolute top-1 left-2 text-xs text-muted-foreground">Server Room</span>
          </div>
          
          <div className="absolute bottom-[10%] left-[10%] w-[50%] h-[35%] border-2 border-muted-foreground/40 rounded bg-muted/10">
            <span className="absolute top-1 left-2 text-xs text-muted-foreground">Warehouse</span>
          </div>
          
          <div className="absolute bottom-[15%] right-[5%] w-[30%] h-[40%] border-2 border-success/40 rounded bg-success/5">
            <span className="absolute top-1 left-2 text-xs text-muted-foreground">Office Block</span>
          </div>

          {/* Zone markers with labels */}
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="absolute flex flex-col items-center"
              style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                zone.active 
                  ? "bg-primary text-primary-foreground animate-pulse shadow-lg shadow-primary/50" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {zone.id}
              </div>
              {zone.active && (
                <MapPin className="w-4 h-4 text-primary mt-1 animate-bounce" />
              )}
            </div>
          ))}

          {/* Legend */}
          <div className="absolute bottom-2 right-2 flex items-center gap-3 bg-background/90 px-2 py-1 rounded text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-muted-foreground" />
              <span>Floor 1</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
