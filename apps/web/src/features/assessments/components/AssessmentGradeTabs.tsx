"use client";

import { useMemo } from "react";
import { GradeItem } from "@/features/academic";
import { AssessmentItem } from "../types/assessment.types";

interface AssessmentGradeTabsProps {
  readonly grades: readonly GradeItem[];
  readonly selectedGradeId: string | null;
  readonly onSelectGrade: (gradeId: string | null) => void;
  readonly assessments: readonly AssessmentItem[];
}

export function AssessmentGradeTabs({
  grades,
  selectedGradeId,
  onSelectGrade,
  assessments,
}: AssessmentGradeTabsProps) {
  const countsByGrade = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const assessment of assessments) {
      for (const assignment of assessment.assignments || []) {
        const gradeId = assignment.section?.grade?.id;
        if (gradeId) {
          if (!map.has(gradeId)) {
            map.set(gradeId, new Set());
          }
          map.get(gradeId)!.add(assessment.id);
        }
      }
    }
    const countMap = new Map<string, number>();
    map.forEach((set, gradeId) => {
      countMap.set(gradeId, set.size);
    });
    return countMap;
  }, [assessments]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      <button
        type="button"
        onClick={() => onSelectGrade(null)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
          selectedGradeId === null
            ? "bg-primary text-primary-foreground border-primary shadow-xs"
            : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
        }`}
      >
        All Grades ({assessments.length})
      </button>

      {grades.map((grade) => {
        const isSelected = selectedGradeId === grade.id;
        const count = countsByGrade.get(grade.id) || 0;

        return (
          <button
            key={grade.id}
            type="button"
            onClick={() => onSelectGrade(grade.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
              isSelected
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
            }`}
          >
            Grade {grade.level} {count > 0 ? `(${count})` : ""}
          </button>
        );
      })}
    </div>
  );
}
