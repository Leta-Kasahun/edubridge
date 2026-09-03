"use client";

import { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Layers,
  FileText,
} from "lucide-react";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { CurriculumImportPreview } from "../types/import.types";

export interface CurriculumImportPreviewTableProps {
  readonly preview: CurriculumImportPreview;
  readonly isCommitting: boolean;
  readonly onCommit: () => Promise<void>;
  readonly onBack: () => void;
  readonly commitError: string | null;
}

type TabType = "ALL" | "VALID" | "INVALID";

export function CurriculumImportPreviewTable({
  preview,
  isCommitting,
  onCommit,
  onBack,
  commitError,
}: CurriculumImportPreviewTableProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ALL");

  const filteredRows = preview.rows.filter((row) => {
    if (activeTab === "VALID") return row.isValid;
    if (activeTab === "INVALID") return !row.isValid;
    return true;
  });

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
            Validation & Preview
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            Version: <span className="font-semibold text-foreground">{preview.versionName}</span> ({preview.versionCode})
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 sm:flex-none h-9 px-4 text-xs font-semibold rounded-xl border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            Cancel
          </button>
          <SubmitButton
            size="sm"
            isLoading={isCommitting}
            disabled={!preview.canCommit || preview.invalidRowsCount > 0}
            onClick={onCommit}
            className="flex-1 sm:flex-none shrink-0"
          >
            {`Import ${preview.validRowsCount} Item${preview.validRowsCount === 1 ? "" : "s"}`}
          </SubmitButton>
        </div>
      </div>

      {commitError && (
        <ErrorAlert message={commitError} />
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
            <FileText size={14} className="text-primary" />
            <span>Total Rows</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-foreground">
            {preview.totalRows}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>Valid</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {preview.validRowsCount}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
            <AlertCircle size={14} className="text-destructive" />
            <span>Invalid</span>
          </div>
          <div className="mt-1.5 text-xl font-bold text-destructive">
            {preview.invalidRowsCount}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
            <Layers size={14} className="text-primary" />
            <span>Structure</span>
          </div>
          <div className="mt-1.5 text-xs font-semibold text-foreground truncate">
            {preview.uniqueUnitsCount} Units • {preview.uniqueTopicsCount} Topics
          </div>
        </div>
      </div>

      {preview.issues.length > 0 && (
        <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-foreground font-bold text-xs">
            <AlertTriangle size={14} className="text-amber-500" />
            <span>Issues Found ({preview.issues.length})</span>
          </div>
          <div className="max-h-36 overflow-y-auto space-y-1 text-xs text-muted-foreground">
            {preview.issues.slice(0, 10).map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold shrink-0 ${
                  issue.severity === "ERROR"
                    ? "bg-destructive/10 text-destructive border border-destructive/20"
                    : "bg-muted text-foreground border border-border"
                }`}>
                  Row {issue.rowNumber}
                </span>
                <span>{issue.message}</span>
              </div>
            ))}
            {preview.issues.length > 10 && (
              <p className="text-[11px] text-muted-foreground italic pt-1">
                ...and {preview.issues.length - 10} more issue(s)
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border shadow-2xs overflow-hidden">
        <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/30 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === "ALL"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({preview.totalRows})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VALID")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === "VALID"
                ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Valid ({preview.validRowsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INVALID")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
              activeTab === "INVALID"
                ? "bg-card text-destructive shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Invalid ({preview.invalidRowsCount})
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[640px] text-left text-xs border-collapse">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Grade</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Learning Objective</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className={`hover:bg-muted/30 transition-colors ${
                    !row.isValid ? "bg-destructive/5" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-muted-foreground">
                    {row.rowNumber}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                    {row.gradeLevel ? `Grade ${row.gradeLevel}` : "—"}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-foreground">
                    {row.subjectName || "—"}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-foreground">
                      {row.unitTitle || "—"}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-foreground">
                      {row.topicTitle || "—"}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="text-muted-foreground line-clamp-2">
                      {row.objectiveStatement || "—"}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {row.isValid ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-muted text-foreground border border-border">
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                        Invalid
                      </span>
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
