"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Layers,
  FileText,
  ListOrdered,
} from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  CurriculumImportPreview,
  ValidatedCurriculumImportRow,
} from "../types/import.types";

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Upload different file
          </button>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Validation & Preview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Version: <span className="font-semibold text-slate-700 dark:text-slate-300">{preview.versionName}</span> ({preview.versionCode})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            Cancel
          </button>
          <SubmitButton
            isLoading={isCommitting}
            disabled={!preview.canCommit || preview.invalidRowsCount > 0}
            onClick={onCommit}
          >
            {`Import ${preview.validRowsCount} Valid Item${preview.validRowsCount === 1 ? "" : "s"}`}
          </SubmitButton>
        </div>
      </div>

      {commitError && (
        <ErrorAlert message={commitError} />
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <FileText className="w-4 h-4 text-blue-500" />
            Total Rows
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {preview.totalRows}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10 p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Valid Rows
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {preview.validRowsCount}
          </div>
        </div>

        <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/30 dark:bg-red-950/10 p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium">
            <AlertCircle className="w-4 h-4" />
            Invalid Rows
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-red-700 dark:text-red-300">
            {preview.invalidRowsCount}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <Layers className="w-4 h-4 text-purple-500" />
            Structure Count
          </div>
          <div className="mt-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
            {preview.uniqueUnitsCount} Units • {preview.uniqueTopicsCount} Topics
          </div>
        </div>
      </div>

      {/* Validation Issue Alerts */}
      {preview.issues.length > 0 && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Issues Found ({preview.issues.length})
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            {preview.issues.slice(0, 10).map((issue, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className={`inline-block px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-bold shrink-0 ${
                  issue.severity === "ERROR"
                    ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                    : "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300"
                }`}>
                  Row {issue.rowNumber}
                </span>
                <span>{issue.message}</span>
              </div>
            ))}
            {preview.issues.length > 10 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                ...and {preview.issues.length - 10} more issue(s)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Rows Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "ALL"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All Rows ({preview.totalRows})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VALID")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "VALID"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Valid ({preview.validRowsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INVALID")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "INVALID"
                ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Invalid ({preview.invalidRowsCount})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 sm:px-4">#</th>
                <th className="py-3 px-3 sm:px-4">Grade</th>
                <th className="py-3 px-3 sm:px-4">Subject</th>
                <th className="py-3 px-3 sm:px-4">Unit</th>
                <th className="py-3 px-3 sm:px-4">Topic</th>
                <th className="py-3 px-3 sm:px-4">Learning Objective</th>
                <th className="py-3 px-3 sm:px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRows.map((row) => (
                <tr
                  key={row.rowNumber}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                    !row.isValid ? "bg-red-50/20 dark:bg-red-950/10" : ""
                  }`}
                >
                  <td className="py-3 px-3 sm:px-4 font-mono text-slate-400">
                    {row.rowNumber}
                  </td>
                  <td className="py-3 px-3 sm:px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {row.gradeLevel ? `Grade ${row.gradeLevel}` : "—"}
                  </td>
                  <td className="py-3 px-3 sm:px-4 font-medium text-slate-900 dark:text-white">
                    {row.subjectName || "—"}
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {row.unitTitle || "—"}
                    </div>
                    {row.unitCode && (
                      <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {row.unitCode}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {row.topicTitle || "—"}
                    </div>
                    {row.topicCode && (
                      <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-mono bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {row.topicCode}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 sm:px-4">
                    <div className="text-slate-700 dark:text-slate-300 line-clamp-2">
                      {row.objectiveStatement || "—"}
                    </div>
                    {row.objectiveCode && (
                      <span className="inline-block px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {row.objectiveCode}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                    {row.isValid ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-3 h-3" />
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
