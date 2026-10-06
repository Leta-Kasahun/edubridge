"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Layers } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { AssessmentItem } from "../../types/assessment.types";
import { AssessmentStatusBadge } from "../AssessmentStatusBadge";
import { ASSESSMENT_TYPE_LABELS } from "@/shared/constants/assessment.constants";

interface AssessmentDetailHeaderProps {
  readonly assessment: AssessmentItem;
  readonly questionCount: number;
  readonly totalPoints: number;
  readonly onOpenSelector: () => void;
  readonly onOpenAuthor: () => void;
  readonly hasBankAvailable: boolean;
}

export function AssessmentDetailHeader({
  assessment,
  questionCount,
  totalPoints,
  onOpenSelector,
  onOpenAuthor,
  hasBankAvailable,
}: AssessmentDetailHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <Link
          href={ROUTES.ASSESSMENTS.BASE}
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded-lg transition-colors shrink-0"
          title="Back to Assessments"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </Link>

        <span className="text-border text-xs font-light select-none">|</span>

        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
            {assessment.title}
          </h1>

          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
              {questionCount} {questionCount === 1 ? "Question" : "Questions"}
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border whitespace-nowrap">
              {totalPoints} Pts
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border whitespace-nowrap">
              {ASSESSMENT_TYPE_LABELS[assessment.type] || assessment.type}
            </span>
            <AssessmentStatusBadge status={assessment.status} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenSelector}
          className="inline-flex items-center justify-center gap-1.5 h-8 sm:h-8.5 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
          title="Add from Question Bank"
        >
          <Layers size={13} className="text-primary" />
          <span>Add from Bank</span>
        </button>

        {hasBankAvailable && (
          <button
            type="button"
            onClick={onOpenAuthor}
            className="inline-flex items-center justify-center gap-1 h-8 sm:h-8.5 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
            title="Add Question"
          >
            <Plus size={14} />
            <span>Question</span>
          </button>
        )}
      </div>
    </div>
  );
}
