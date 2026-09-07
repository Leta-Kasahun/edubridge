"use client";

import { Calendar, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { QuestionListItem } from "../../types/question-bank.types";
import {
  QuestionTypeBadge,
  QuestionDifficultyBadge,
  QuestionStatusBadge,
} from "./QuestionBadges";
import { QuestionRowActions } from "./QuestionRowActions";

interface QuestionCardItemProps {
  readonly question: QuestionListItem;
  readonly qIndex: number;
  readonly isStudent?: boolean;
  readonly selectedOptKey?: string;
  readonly onOptionSelect?: (questionId: string, optKey: string) => void;
  readonly isExplanationOpen?: boolean;
  readonly onToggleExplanation?: (questionId: string) => void;
  readonly onPreview: (question: QuestionListItem) => void;
  readonly onEdit: (question: QuestionListItem) => void;
  readonly onPublish: (id: string) => void;
  readonly onArchive: (id: string) => void;
  readonly onActivate: (id: string) => void;
  readonly onDelete: (id: string, code: string) => void;
  readonly isBusy: boolean;
}

export function QuestionCardItem({
  question,
  qIndex,
  isStudent = false,
  selectedOptKey,
  onOptionSelect,
  isExplanationOpen = false,
  onToggleExplanation,
  onPreview,
  onEdit,
  onPublish,
  onArchive,
  onActivate,
  onDelete,
  isBusy,
}: QuestionCardItemProps) {
  const formattedDate = question.createdAt
    ? new Date(question.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-2xs hover:border-primary/40 transition-colors space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              #{qIndex + 1}
            </span>
            <QuestionTypeBadge type={question.type} />
            <QuestionDifficultyBadge difficulty={question.difficulty} />
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
              {question.defaultPoints} pt{question.defaultPoints === 1 ? "" : "s"}
            </span>
            {!isStudent && <QuestionStatusBadge status={question.status} />}
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </span>
          </div>

          <p className="text-xs sm:text-sm font-semibold text-foreground break-words line-clamp-3">
            {question.prompt}
          </p>
        </div>

        {!isStudent && (
          <QuestionRowActions
            question={question}
            onPreview={onPreview}
            onEdit={onEdit}
            onPublish={onPublish}
            onArchive={onArchive}
            onActivate={onActivate}
            onDelete={onDelete}
            isBusy={isBusy}
          />
        )}
      </div>

      {question.options && question.options.length > 0 && (
        <div className="pt-2.5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {question.options.map((opt, idx) => {
            const optKey = opt.id || opt.text || String(idx);
            const isSelected = selectedOptKey === optKey;

            let optionStyle =
              "bg-card border-border text-foreground hover:bg-muted/50 cursor-pointer";

            if (isStudent) {
              if (selectedOptKey) {
                if (isSelected) {
                  optionStyle = opt.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "bg-destructive/10 border-destructive text-destructive font-semibold";
                } else if (opt.isCorrect) {
                  optionStyle =
                    "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-medium";
                } else {
                  optionStyle =
                    "bg-card border-border text-muted-foreground opacity-50";
                }
              }
            } else {
              optionStyle = opt.isCorrect
                ? "bg-muted/70 border-foreground/20 text-foreground font-medium"
                : "bg-card border-border text-muted-foreground";
            }

            return (
              <button
                type="button"
                key={optKey}
                onClick={() =>
                  isStudent && onOptionSelect?.(question.id, optKey)
                }
                disabled={!isStudent || Boolean(selectedOptKey)}
                className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${optionStyle}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] font-semibold opacity-75 shrink-0">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="break-words">{opt.text}</span>
                </div>

                {isStudent && selectedOptKey && isSelected && (
                  <span className="shrink-0">
                    {opt.isCorrect ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    ) : (
                      <XCircle size={16} className="text-destructive" />
                    )}
                  </span>
                )}

                {isStudent && selectedOptKey && !isSelected && opt.isCorrect && (
                  <span className="shrink-0">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isStudent && (
        <div className="pt-2 border-t border-border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onToggleExplanation?.(question.id)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
            >
              <Lightbulb size={13} className="text-amber-500" />
              <span>
                {isExplanationOpen ? "Hide Explanation" : "View Explanation"}
              </span>
            </button>
            {selectedOptKey && (
              <span className="text-[11px] text-muted-foreground">Attempted</span>
            )}
          </div>

          {isExplanationOpen && (
            <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed animate-in fade-in-0 duration-200">
              <strong className="text-foreground block mb-0.5">
                Explanation:
              </strong>
              {question.explanation ||
                "No explanation provided for this question."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
