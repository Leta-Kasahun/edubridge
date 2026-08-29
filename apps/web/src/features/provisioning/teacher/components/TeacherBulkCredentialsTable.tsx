import { Download, Copy, Check } from "lucide-react";
import { CredentialExportRow } from "@/shared/utils";

export interface TeacherBulkCredentialsTableProps {
  readonly credentialRows: readonly CredentialExportRow[];
  readonly copiedField: string | null;
  readonly onCopy: (text: string, fieldKey: string) => void;
  readonly onDownload: () => void;
}

export function TeacherBulkCredentialsTable({
  credentialRows,
  copiedField,
  onCopy,
  onDownload,
}: TeacherBulkCredentialsTableProps) {
  if (credentialRows.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-4 rounded-xl border border-border bg-background/50 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-foreground">
            Generated Credentials ({credentialRows.length})
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            Download or copy login credentials for teachers.
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer w-full sm:w-auto"
        >
          <Download size={14} />
          <span>Download CSV / Excel</span>
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs text-left min-w-[340px]">
          <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground sticky top-0">
            <tr>
              <th className="p-2 sm:p-2.5">Full Name</th>
              <th className="p-2 sm:p-2.5">Username</th>
              <th className="p-2 sm:p-2.5">Password</th>
              <th className="p-2 sm:p-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {credentialRows.map((item, idx) => {
              const fieldKey = `row-${idx}`;
              const isCopied = copiedField === fieldKey;

              return (
                <tr key={item.username + idx} className="hover:bg-muted/20">
                  <td className="p-2 sm:p-2.5 font-medium truncate max-w-[120px] sm:max-w-none">{item.fullName}</td>
                  <td className="p-2 sm:p-2.5 font-mono text-muted-foreground">{item.username}</td>
                  <td className="p-2 sm:p-2.5 font-mono font-semibold">{item.password}</td>
                  <td className="p-2 sm:p-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onCopy(`${item.username} / ${item.password}`, fieldKey)}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-border hover:bg-background cursor-pointer"
                      aria-label={`Copy credentials for ${item.fullName}`}
                    >
                      {isCopied ? (
                        <>
                          <Check size={12} className="text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
