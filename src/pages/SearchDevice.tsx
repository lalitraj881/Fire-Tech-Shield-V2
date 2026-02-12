import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, QrCode, MapPin } from "lucide-react";
import { useInspection } from "@/context/InspectionContext";

export default function SearchDevice() {
  const navigate = useNavigate();
  const { devices } = useInspection();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return devices.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.serialNumber.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.locationDescription.toLowerCase().includes(q) ||
        d.building.toLowerCase().includes(q)
    );
  }, [devices, query]);

  return (
    <div className="min-h-screen bg-background pb-8">
      <Header showBack title="Search Device" />
      <main className="container px-4 py-6 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, serial, location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-14 text-base"
            autoFocus
          />
        </div>

        {/* Results */}
        {query.trim() && (
          <p className="text-sm text-muted-foreground">
            {results.length} device{results.length !== 1 ? "s" : ""} found
          </p>
        )}

        <div className="space-y-3">
          {results.map((device) => (
            <Card
              key={device.id}
              className="cursor-pointer hover:border-primary/30 transition-colors active:scale-[0.98]"
              onClick={() => navigate(`/device/${device.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{device.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <QrCode className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-mono">{device.serialNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{device.locationDescription}</span>
                    </div>
                  </div>
                  <StatusBadge status={device.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {!query.trim() && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Type to search devices</p>
            <p className="text-xs mt-1">Search by name, serial number, or location</p>
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p>No devices found for "{query}"</p>
          </div>
        )}
      </main>
    </div>
  );
}
