"use client";

import { ReactNode } from "react";
import {
  Folder,
  FolderOpen,
  ChevronDown,
  Clock,
  HelpCircle,
  Users,
} from "lucide-react";
import { AssessmentItem } from "../types/assessment.types";
import { AssessmentStatusBadge } from "./AssessmentStatusBadge";
import { ASSESSMENT_TYPE_LABELS } from "@/shared/constants/assessment.constants";

export interface AssessmentSubjectGroup {
  readonly id: string;
  readonly name: string;
  readonly code?: string;
  readonly assessments: readonly AssessmentItem[];
}

interface AssessmentSubjectAccordionProps {
  readonly group: AssessmentSubjectGroup;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly renderActions: (assessment: AssessmentItem) => ReactNode;
}

export function AssessmentSubjectAccordion({
  group,
  isOpen,
  onToggle,
  renderActions,
}: AssessmentSubjectAccordionProps) {
  const totalQuestions = group.assessments.reduce(
    (acc, a) => acc + (a._count?.questions || a.questions?.length || 0),
    0
  );

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden transition-all shadow-xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-muted/40 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-amber-500 shrink-0">
            {isOpen ? <FolderOpen size={20} /> : <Folder size={20} />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-foreground truncate">
                {group.name}
              </span>
              {group.code && (
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                  {group.code}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {group.assessments.length} {group.assessments.length === 1 ? "assessment" : "assessments"} · {totalQuestions} questions total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
            {group.assessments.length}
          </span>
          <ChevronDown
            size={18}
            className={`text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border bg-muted/10 p-3 sm:p-4 space-y-3">
          {group.assessments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No assessments found under this subject.
            </p>
          ) : (
            group.assessments.map((assessment) => {
              const qCount = assessment._count?.questions || assessment.questions?.length || 0;
              const assignCount = assessment._count?.assignments || assessment.assignments?.length || 0;
              const typeLabel = ASSESSMENT_TYPE_LABELS[assessment.type] || assessment.type;

              return (
                <div
                  key={assessment.id}
                  className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {assessment.title}
                      </span>
                      <AssessmentStatusBadge status={assessment.status} />
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {typeLabel}
                      </span>
                    </div>

                    {assessment.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {assessment.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="inline-flex items-center gap-1">
                        <HelpCircle size={14} className="text-primary/70" />
                        {qCount} {qCount === 1 ? "Question" : "Questions"}
                      </span>
                      {assessment.timeLimitMinutes && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={14} className="text-amber-500/70" />
                          {assessment.timeLimitMinutes} mins
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Users size={14} className="text-emerald-500/70" />
                        {assignCount} {assignCount === 1 ? "Section" : "Sections"} Assigned
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    {renderActions(assessment)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
