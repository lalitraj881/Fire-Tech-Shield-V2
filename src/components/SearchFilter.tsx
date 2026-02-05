import { useState } from "react";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type JobStatus, type Priority, type DeviceStatus } from "@/data/mockData";

export interface FilterState {
  search: string;
  status: JobStatus | DeviceStatus | "all";
  priority: Priority | "all";
  type: "maintenance" | "repair" | "all";
  showCompleted: boolean;
}

interface SearchFilterProps {
  value: FilterState;
  onChange: (filters: FilterState) => void;
  mode?: "jobs" | "devices";
  placeholder?: string;
}

export function SearchFilter({ 
  value, 
  onChange, 
  mode = "jobs",
  placeholder = "Search..." 
}: SearchFilterProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeFiltersCount = [
    value.status !== "all",
    value.priority !== "all",
    value.type !== "all",
    !value.showCompleted,
  ].filter(Boolean).length;

  const handleSearchChange = (search: string) => {
    onChange({ ...value, search });
  };

  const handleClearSearch = () => {
    onChange({ ...value, search: "" });
  };

  const handleResetFilters = () => {
    onChange({
      search: value.search,
      status: "all",
      priority: "all",
      type: "all",
      showCompleted: true,
    });
  };

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={value.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {value.search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="relative shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto max-h-[80vh]">
            <SheetHeader className="pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle>Filters</SheetTitle>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                    Reset All
                  </Button>
                )}
              </div>
            </SheetHeader>

            <div className="space-y-6 pb-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={value.status}
                  onValueChange={(status) => onChange({ ...value, status: status as FilterState["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {mode === "jobs" ? (
                      <>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter (Jobs only) */}
              {mode === "jobs" && (
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={value.priority}
                    onValueChange={(priority) => onChange({ ...value, priority: priority as FilterState["priority"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Type Filter (Jobs only) */}
              {mode === "jobs" && (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={value.type}
                    onValueChange={(type) => onChange({ ...value, type: type as FilterState["type"] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Show Completed */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showCompleted"
                  checked={value.showCompleted}
                  onCheckedChange={(checked) => onChange({ ...value, showCompleted: !!checked })}
                />
                <Label htmlFor="showCompleted" className="text-sm font-normal cursor-pointer">
                  Show completed {mode}
                </Label>
              </div>
            </div>

            <Button className="w-full" onClick={() => setSheetOpen(false)}>
              Apply Filters
            </Button>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Tags */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.status !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Status: {value.status}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onChange({ ...value, status: "all" })} 
              />
            </Badge>
          )}
          {value.priority !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Priority: {value.priority}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onChange({ ...value, priority: "all" })} 
              />
            </Badge>
          )}
          {value.type !== "all" && (
            <Badge variant="secondary" className="gap-1">
              Type: {value.type}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onChange({ ...value, type: "all" })} 
              />
            </Badge>
          )}
          {!value.showCompleted && (
            <Badge variant="secondary" className="gap-1">
              Hiding completed
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onChange({ ...value, showCompleted: true })} 
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export const defaultFilters: FilterState = {
  search: "",
  status: "all",
  priority: "all",
  type: "all",
  showCompleted: false,
};
