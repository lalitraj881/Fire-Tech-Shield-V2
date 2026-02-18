import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCardSkeleton } from "./JobCardSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="container px-4 py-6 space-y-6">
      {/* Welcome & Context Card Skeleton */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Status Summary Skeleton */}
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
                <Skeleton className="h-5 w-5 rounded-full mb-2" />
                <Skeleton className="h-8 w-8 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Jobs List Skeleton */}
      <div>
        <Skeleton className="h-6 w-32 mb-3" />
        <Skeleton className="h-10 w-full rounded-lg mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
