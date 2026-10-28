import { Skeleton } from "@/components/ui/skeleton";

interface PageHeaderSkeletonProps {
  readonly hasActions?: boolean;
}

export function PageHeaderSkeleton({ hasActions = true }: PageHeaderSkeletonProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 sm:w-64 rounded-none" />
        <Skeleton className="h-4 w-72 sm:w-96 rounded-none opacity-70" />
      </div>
      {hasActions && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Skeleton className="h-9 w-28 rounded-none" />
          <Skeleton className="h-9 w-32 rounded-none" />
        </div>
      )}
    </div>
  );
}
