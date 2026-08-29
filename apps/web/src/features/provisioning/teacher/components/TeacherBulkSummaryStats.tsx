export interface TeacherBulkSummaryStatsProps {
  readonly total: number;
  readonly success: number;
  readonly failed: number;
}

export function TeacherBulkSummaryStats({
  total,
  success,
  failed,
}: TeacherBulkSummaryStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-background/50 border border-border text-center">
      <div className="p-1">
        <div className="text-[10px] sm:text-xs font-semibold uppercase text-muted-foreground">Total</div>
        <div className="text-base sm:text-lg font-bold text-foreground">{total}</div>
      </div>
      <div className="p-1">
        <div className="text-[10px] sm:text-xs font-semibold uppercase text-foreground">Success</div>
        <div className="text-base sm:text-lg font-bold text-foreground">{success}</div>
      </div>
      <div className="p-1">
        <div className="text-[10px] sm:text-xs font-semibold uppercase text-rose-600 dark:text-rose-400">Failed</div>
        <div className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400">{failed}</div>
      </div>
    </div>
  );
}
