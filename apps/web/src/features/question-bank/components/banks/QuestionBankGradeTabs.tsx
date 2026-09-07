"use client";

import { cn } from "@/lib/utils";

export interface QuestionGradeTabItem {
  readonly id: string;
  readonly level: number;
  readonly count?: number;
}

export interface QuestionBankGradeTabsProps {
  readonly grades: readonly QuestionGradeTabItem[];
  readonly selectedGradeId: string;
  readonly onSelectGrade: (gradeId: string) => void;
  readonly totalCount?: number;
}

export function QuestionBankGradeTabs({
  grades,
  selectedGradeId,
  onSelectGrade,
  totalCount,
}: QuestionBankGradeTabsProps) {
  const isAllSelected = selectedGradeId === "ALL" || !selectedGradeId;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
      <button
        type="button"
        onClick={() => onSelectGrade("ALL")}
        className={cn(
          "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 sm:px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs",
          isAllSelected
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border text-foreground hover:bg-muted/80"
        )}
      >
        <span>All</span>
        {totalCount !== undefined && (
          <span
            className={cn(
              "text-[11px] font-mono",
              isAllSelected
                ? "text-primary-foreground/90 font-bold"
                : "text-muted-foreground"
            )}
          >
            {totalCount}
          </span>
        )}
      </button>

      {grades.map((grade) => {
        const isSelected = selectedGradeId === grade.id;

        return (
          <button
            key={grade.id}
            type="button"
            onClick={() => onSelectGrade(grade.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 sm:px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted/80"
            )}
          >
            <span>Grade {grade.level}</span>
            {grade.count !== undefined && (
              <span
                className={cn(
                  "text-[11px] font-mono",
                  isSelected
                    ? "text-primary-foreground/90 font-bold"
                    : "text-muted-foreground"
                )}
              >
                {grade.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
