import { PageHeaderSkeleton } from "./PageHeaderSkeleton";
import { StatsRowSkeleton } from "./StatsRowSkeleton";
import { TableSkeleton } from "./TableSkeleton";
import { CardGridSkeleton } from "./CardGridSkeleton";

export type PageSkeletonVariant = "table" | "grid" | "dashboard";

interface PageSkeletonProps {
  readonly variant?: PageSkeletonVariant;
  readonly hasHeader?: boolean;
  readonly tableRows?: number;
  readonly gridCards?: number;
}

export function PageSkeleton({
  variant = "table",
  hasHeader = true,
  tableRows = 6,
  gridCards = 6,
}: PageSkeletonProps) {
  return (
    <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
      {hasHeader && <PageHeaderSkeleton />}

      {variant === "dashboard" && (
        <>
          <StatsRowSkeleton count={4} />
          <TableSkeleton rows={4} columns={4} hasToolbar={false} hasPagination={false} />
        </>
      )}

      {variant === "table" && (
        <TableSkeleton rows={tableRows} />
      )}

      {variant === "grid" && (
        <CardGridSkeleton count={gridCards} />
      )}
    </div>
  );
}
