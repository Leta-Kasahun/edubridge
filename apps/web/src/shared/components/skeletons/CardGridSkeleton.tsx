import { Skeleton } from "@/components/ui/skeleton";

interface CardGridSkeletonProps {
  readonly count?: number;
  readonly columnsClassName?: string;
}

export function CardGridSkeleton({
  count = 6,
  columnsClassName = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: CardGridSkeletonProps) {
  return (
    <div className={`grid ${columnsClassName} gap-4`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-5 rounded-none border border-border bg-card shadow-xs space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4 rounded-none" />
              <Skeleton className="h-3.5 w-1/2 rounded-none opacity-70" />
            </div>
            <Skeleton className="h-8 w-8 rounded-none shrink-0" />
          </div>

          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3 w-full rounded-none opacity-50" />
            <Skeleton className="h-3 w-4/5 rounded-none opacity-50" />
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <Skeleton className="h-4 w-20 rounded-none opacity-60" />
            <Skeleton className="h-8 w-24 rounded-none" />
          </div>
        </div>
      ))}
    </div>
  );
}
