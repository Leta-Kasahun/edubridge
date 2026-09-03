"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, RotateCcw, BookMarked } from "lucide-react";
import { ContentImportCommitResult } from "../../types/import.types";
import { ROUTES } from "@/constants/routes";

export interface ContentImportResultCardProps {
  readonly result: ContentImportCommitResult;
  readonly onReset: () => void;
}

export function ContentImportResultCard({
  result,
  onReset,
}: ContentImportResultCardProps) {
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
          Processed {result.totalProcessed} row(s) into learning content.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-[11px] text-muted-foreground font-medium">Processed</p>
          <p className="text-lg font-bold text-foreground mt-0.5">
            {result.totalProcessed}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Created</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {result.createdCount}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-muted/40 border border-border">
          <p className="text-[11px] text-muted-foreground font-medium">Skipped</p>
          <p className="text-lg font-bold text-muted-foreground mt-0.5">
            {result.skippedCount}
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
          href={ROUTES.LEARNING_CONTENT.MATERIALS}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-2xs transition-colors"
        >
          <BookMarked size={13} />
          <span>View Materials</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
