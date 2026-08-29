import { AlertTriangle } from "lucide-react";
import { TeacherBulkRowError } from "../types/teacher-provisioning.types";

export interface TeacherBulkErrorsSectionProps {
  readonly failedRows?: readonly TeacherBulkRowError[];
}

export function TeacherBulkErrorsSection({
  failedRows,
}: TeacherBulkErrorsSectionProps) {
  if (!failedRows || failedRows.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-rose-600 dark:text-rose-400 tracking-wider">
        <AlertTriangle size={16} />
        <span>Rows with Errors ({failedRows.length})</span>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-2 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs">
        {failedRows.map((failed) => (
          <div key={failed.rowNumber} className="border-b border-rose-500/10 pb-2 last:border-b-0 last:pb-0">
            <div className="font-semibold text-rose-600 dark:text-rose-400">
              Row {failed.rowNumber}:
            </div>
            <ul className="list-disc list-inside text-muted-foreground mt-0.5 space-y-0.5">
              {failed.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
