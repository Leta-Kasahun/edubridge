import { AlertTriangle } from "lucide-react";
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

export function QuestionReportBadge({
  count,
  onClick,
}: {
  readonly count: number;
  readonly onClick?: () => void;
}) {
  if (count <= 0) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
      title={`${count} pending student issue${count === 1 ? "" : "s"}`}
    >
      <AlertTriangle size={11} className="shrink-0" />
      <span>{count} Issue{count === 1 ? "" : "s"}</span>
    </button>
  );
}
