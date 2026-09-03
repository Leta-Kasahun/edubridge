"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Layers,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { CurriculumImportCommitResult } from "../types/import.types";

export interface CurriculumImportResultCardProps {
  readonly result: CurriculumImportCommitResult;
  readonly onReset: () => void;
}

export function CurriculumImportResultCard({
  result,
  onReset,
}: CurriculumImportResultCardProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Curriculum Imported Successfully
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Processed {result.totalProcessedRows} row(s) and established the structure hierarchy.
        </p>
      </div>

      {/* Stats Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Subjects</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {result.createdSubjectsCount}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Units Created</p>
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {result.createdUnitsCount}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Topics Created</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {result.createdTopicsCount}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Objectives</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {result.createdObjectivesCount}
          </p>
        </div>
      </div>

      {result.skippedDuplicatesCount > 0 && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {result.skippedDuplicatesCount} duplicate objective(s) were automatically skipped.
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Import Another File
        </button>

        <Link
          href={ROUTES.CURRICULUM.STRUCTURE}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <Layers className="w-4 h-4" />
          View in Structure
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
