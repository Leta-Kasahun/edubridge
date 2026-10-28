import { Skeleton } from "@/components/ui/skeleton";

interface StatsRowSkeletonProps {
  readonly count?: number;
}

export function StatsRowSkeleton({ count = 4 }: StatsRowSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-5 rounded-none border border-border bg-card shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 rounded-none opacity-70" />
            <Skeleton className="h-8 w-8 rounded-none" />
          </div>
          <Skeleton className="h-8 w-20 rounded-none" />
          <Skeleton className="h-3 w-32 rounded-none opacity-50" />
        </div>
      ))}
    </div>
  );
}
