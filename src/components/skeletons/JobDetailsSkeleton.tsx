import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function JobDetailsSkeleton() {
  return (
    <main className="container px-4 py-6 space-y-6">
      {/* Job Info Card Skeleton */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Info Grid */}
          <div className="grid gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-12 mb-1" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56 mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4 border-t border-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-1" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Map Skeleton */}
      <Skeleton className="h-48 rounded-lg" />

      {/* Action Buttons Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-14 rounded-lg" />
        <Skeleton className="h-14 rounded-lg" />
      </div>
    </main>
  );
}
