"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Layers,
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
    <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xs text-center max-w-xl mx-auto space-y-5">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
        <CheckCircle2 size={24} />
      </div>

      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-foreground">
          Import Successful
        </h2>
        <p className="text-xs text-muted-foreground">
          Processed {result.totalProcessedRows} row(s) into curriculum structure.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-[11px] text-muted-foreground font-medium">Subjects</p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {result.createdSubjectsCount}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-[11px] text-muted-foreground font-medium">Units</p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {result.createdUnitsCount}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-[11px] text-muted-foreground font-medium">Topics</p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {result.createdTopicsCount}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-[11px] text-muted-foreground font-medium">Objectives</p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {result.createdObjectivesCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          <span>Import Another File</span>
        </button>

        <Link
          href={ROUTES.CURRICULUM.STRUCTURE}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-2xs transition-colors"
        >
          <Layers size={13} />
          <span>View Structure</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
