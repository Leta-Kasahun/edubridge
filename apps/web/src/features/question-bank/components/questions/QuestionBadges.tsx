"use client";

import {
  QuestionType,
  DifficultyLevel,
  QuestionStatus,
} from "../../types/question-bank.types";

export function QuestionTypeBadge({ type }: { readonly type: QuestionType }) {
  const label = type.replace(/_/g, " ");
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
      {label}
    </span>
  );
}

export function QuestionDifficultyBadge({ difficulty }: { readonly difficulty: DifficultyLevel }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-foreground border border-border">
      {difficulty}
    </span>
  );
}

export function QuestionStatusBadge({ status }: { readonly status: QuestionStatus }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
      {status}
    </span>
  );
}
