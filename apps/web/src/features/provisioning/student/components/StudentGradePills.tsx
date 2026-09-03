"use client";

import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { AcademicStructureGrade } from "../types/student-provisioning.types";

export interface StudentGradePillsProps {
  readonly grades: readonly AcademicStructureGrade[];
  readonly selectedGradeId?: string;
  readonly onSelectGrade: (gradeId: string) => void;
  readonly onOpenAddGrade: () => void;
}

export function StudentGradePills({
  grades,
  selectedGradeId,
  onSelectGrade,
  onOpenAddGrade,
}: StudentGradePillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
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
            <span
              className={cn(
                "text-[11px] font-mono",
                isSelected
                  ? "text-primary-foreground/90 font-bold"
                  : "text-muted-foreground"
              )}
            >
              {grade.studentCount}
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onOpenAddGrade}
        className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-xs font-medium bg-card/60 border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer"
      >
        <Plus size={13} />
        <span>Grade</span>
      </button>
    </div>
  );
}
