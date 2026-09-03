"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { ContentImportPreview } from "../../types/import.types";
import { ContentTypeBadge } from "../content/ContentTypeBadge";
import { SubmitButton, ErrorAlert } from "@/shared/components";

export interface ContentImportPreviewTableProps {
  readonly previewData: ContentImportPreview;
  readonly isCommitting: boolean;
  readonly onCommit: () => Promise<void>;
  readonly onBack: () => void;
  readonly commitError: string | null;
}

type TabType = "ALL" | "VALID" | "INVALID";

export function ContentImportPreviewTable({
  previewData,
  isCommitting,
  onCommit,
  onBack,
  commitError,
}: ContentImportPreviewTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ALL");

  const rows = previewData.rows.filter((r) => {
    if (activeTab === "VALID") return r.isValid;
    if (activeTab === "INVALID") return !r.isValid;
    return true;
  });

  const canCommit = previewData.validRowsCount > 0;

  return (
    <div className="space-y-4 max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3.5 sm:p-5 rounded-2xl border border-border shadow-xs min-w-0">
        <div className="min-w-0 space-y-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Upload different file</span>
          </button>
          <h2 className="text-base font-bold text-foreground truncate">
            Validation &amp; Preview
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            Verify content records before committing to the curriculum.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={onBack}
            disabled={isCommitting}
            className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            Cancel
          </button>
          <SubmitButton
            size="sm"
            isLoading={isCommitting}
            disabled={!canCommit}
            onClick={onCommit}
            className="flex-1 sm:flex-none shrink-0"
          >
            {`Import ${previewData.validRowsCount} Material${previewData.validRowsCount === 1 ? "" : "s"}`}
          </SubmitButton>
        </div>
      </div>

      {commitError && <ErrorAlert message={commitError} />}

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
            <FileText size={14} className="text-primary" />
            <span>Total Rows</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-foreground">
            {previewData.totalRows}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Valid</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {previewData.validRowsCount}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
            <AlertCircle size={14} className="text-destructive" />
            <span>Invalid</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-destructive">
            {previewData.invalidRowsCount}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "ALL"
              ? "bg-primary text-primary-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          All Rows ({previewData.totalRows})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("VALID")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "VALID"
              ? "bg-emerald-600 text-white font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Valid ({previewData.validRowsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("INVALID")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            activeTab === "INVALID"
              ? "bg-destructive text-destructive-foreground font-semibold"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Invalid ({previewData.invalidRowsCount})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:hidden">
        {rows.map((row) => (
          <div
            key={row.rowNumber}
            className={`bg-card rounded-xl border p-4 shadow-2xs flex flex-col gap-2.5 ${
              row.isValid ? "border-border" : "border-destructive/40 bg-destructive/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                Row #{row.rowNumber}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  row.isValid
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-destructive/10 text-destructive border border-destructive/20"
                }`}
              >
                {row.isValid ? "Valid" : "Invalid"}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <ContentTypeBadge type={row.type} />
                <span className="font-mono text-xs font-bold text-primary">
                  {row.topicCode}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground truncate">
                {row.title}
              </h4>
            </div>

            {!row.isValid && row.errors.length > 0 && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
                {row.errors.map((err, i) => (
                  <p key={i}>&bull; {err}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3 px-4 w-14">#</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Topic Code</th>
                <th className="py-3 px-3">Objective Code</th>
                <th className="py-3 px-4">Validation Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className={
                    row.isValid
                      ? "hover:bg-muted/30 transition-colors"
                      : "bg-destructive/5 hover:bg-destructive/10 transition-colors"
                  }
                >
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {row.rowNumber}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {row.isValid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={13} />
                        <span>Valid</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                        <AlertCircle size={13} />
                        <span>Invalid</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground max-w-xs truncate">
                    {row.title}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <ContentTypeBadge type={row.type} />
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-primary whitespace-nowrap">
                    {row.topicCode}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-muted-foreground whitespace-nowrap">
                    {row.objectiveCode || "—"}
                  </td>
                  <td className="py-3.5 px-4 text-destructive">
                    {row.errors.length > 0 ? (
                      <div className="space-y-0.5">
                        {row.errors.map((e, i) => (
                          <p key={i}>&bull; {e}</p>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Ready</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
