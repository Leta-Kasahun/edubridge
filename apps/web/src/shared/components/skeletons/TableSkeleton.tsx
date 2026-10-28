import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  readonly rows?: number;
  readonly columns?: number;
  readonly hasToolbar?: boolean;
  readonly hasPagination?: boolean;
}

const COLUMN_WIDTHS = [
  "w-1/4",
  "w-1/3",
  "w-1/5",
  "w-1/6",
  "w-1/4",
  "w-1/5",
];

export function TableSkeleton({
  rows = 5,
  columns = 5,
  hasToolbar = true,
  hasPagination = true,
}: TableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      {hasToolbar && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-1">
          <Skeleton className="h-9 w-full sm:w-72 rounded-none" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-none" />
            <Skeleton className="h-9 w-24 rounded-none" />
          </div>
        </div>
      )}

      <div className="rounded-none border border-border bg-card overflow-hidden shadow-xs">
        {/* Table Header */}
        <div className="flex items-center gap-4 px-4 py-3 bg-muted/30 border-b border-border">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-4 ${COLUMN_WIDTHS[colIndex % COLUMN_WIDTHS.length]} rounded-none opacity-80`}
            />
          ))}
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-border/60">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/10 transition-colors"
            >
              {Array.from({ length: columns }).map((_, colIndex) => {
                const isFirstCol = colIndex === 0;
                const isLastCol = colIndex === columns - 1;

                return (
                  <div
                    key={colIndex}
                    className={`flex items-center gap-2 ${
                      COLUMN_WIDTHS[colIndex % COLUMN_WIDTHS.length]
                    }`}
                  >
                    {isFirstCol && (
                      <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                    )}
                    <Skeleton
                      className={`h-4 ${
                        isLastCol
                          ? "w-16"
                          : isFirstCol
                          ? "w-3/4"
                          : "w-full"
                      } rounded-none opacity-60`}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        {hasPagination && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
            <Skeleton className="h-3 w-32 rounded-none opacity-60" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-8 w-8 rounded-none" />
              <Skeleton className="h-8 w-8 rounded-none" />
              <Skeleton className="h-8 w-8 rounded-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
