"use client";

import { useState, useMemo, useCallback } from "react";
import { X, Download, Check, Copy, CheckCircle2, AlertTriangle, Users, ArrowRight } from "lucide-react";
import { downloadCredentialsCsv, CredentialExportRow } from "@/shared/utils";
import { SubmitButton } from "@/shared/components/SubmitButton";
import {
  StudentBulkProvisionResult,
  StudentProvisionResult,
} from "../types/student-provisioning.types";

export interface StudentProvisioningResultModalProps {
  readonly result: StudentBulkProvisionResult | StudentProvisionResult | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function StudentProvisioningResultModal({
  result,
  isOpen,
  onClose,
}: StudentProvisioningResultModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const isBulk = Boolean(result && "totalRows" in result);
  const bulkResult = isBulk ? (result as StudentBulkProvisionResult) : null;
  const singleResult = !isBulk ? (result as StudentProvisionResult) : null;

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const successfulStudents: readonly StudentProvisionResult[] = useMemo(() => {
    if (bulkResult) return bulkResult.successfulStudents;
    if (singleResult) return [singleResult];
    return [];
  }, [bulkResult, singleResult]);

  const credentialRows: readonly CredentialExportRow[] = useMemo(() => {
    return successfulStudents.map((item) => {
      const fullName = [
        item.student.firstName,
        item.student.middleName,
        item.student.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        fullName,
        username: item.credentials.username,
        password: item.credentials.tempPassword,
      };
    });
  }, [successfulStudents]);

  const handleDownloadCsv = useCallback(() => {
    if (credentialRows.length === 0) return;
    downloadCredentialsCsv(credentialRows, "student_credentials.csv");
  }, [credentialRows]);

  if (!isOpen || !result) return null;

  const failedRows = bulkResult?.failedRows || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              {isBulk ? <Users size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isBulk ? "Bulk Student Onboarding Complete" : "Student Provisioned Successfully"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBulk
                  ? `${bulkResult?.successCount} of ${bulkResult?.totalRows} students onboarded`
                  : "First-login credentials generated"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {isBulk && bulkResult && (
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-border bg-background/50 text-center">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Total
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5 block">
                  {bulkResult.totalRows}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Succeeded
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {bulkResult.successCount}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-center">
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                  Failed
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5 block">
                  {bulkResult.failureCount}
                </span>
              </div>
            </div>
          )}

          {credentialRows.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-background/50 border border-border">
              <div className="text-xs text-muted-foreground">
                Export credentials spreadsheet with <span className="font-semibold text-foreground">Full Name</span>, <span className="font-semibold text-foreground">Username</span>, and <span className="font-semibold text-foreground">Password</span>.
              </div>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs shrink-0"
              >
                <Download size={13} />
                <span>Download CSV</span>
              </button>
            </div>
          )}

          {successfulStudents.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Generated Credentials ({successfulStudents.length})
              </span>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs border-collapse min-w-[450px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <th className="px-4 py-2.5">Student</th>
                      <th className="px-4 py-2.5">Username</th>
                      <th className="px-4 py-2.5">Temporary Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {successfulStudents.map((item) => {
                      const fullName = [
                        item.student.firstName,
                        item.student.middleName,
                        item.student.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <tr key={item.student.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5 font-medium text-foreground">
                            {fullName}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-foreground">
                                {item.credentials.username}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    item.credentials.username,
                                    `u-${item.student.id}`
                                  )
                                }
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                aria-label="Copy username"
                              >
                                {copiedKey === `u-${item.student.id}` ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-foreground">
                                {item.credentials.tempPassword}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    item.credentials.tempPassword,
                                    `p-${item.student.id}`
                                  )
                                }
                                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                                aria-label="Copy password"
                              >
                                {copiedKey === `p-${item.student.id}` ? (
                                  <Check size={12} className="text-emerald-500" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {failedRows.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Failed Rows ({failedRows.length})
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-rose-500/5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      <th className="px-3 py-2 w-16">Row #</th>
                      <th className="px-3 py-2">Error Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {failedRows.map((err) => (
                      <tr key={err.rowNumber} className="hover:bg-rose-500/5">
                        <td className="px-3 py-2 font-mono text-muted-foreground">
                          {err.rowNumber}
                        </td>
                        <td className="px-3 py-2 text-rose-600 dark:text-rose-400 font-medium">
                          {err.errors.join(", ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-border bg-muted/20">
          <SubmitButton
            type="button"
            onClick={onClose}
            icon={<ArrowRight size={14} />}
            iconPosition="right"
            className="w-auto h-9 px-4 text-xs font-semibold"
          >
            Done
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}
