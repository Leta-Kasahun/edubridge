"use client";

import React from "react";
import { X, Bookmark, CheckCircle2 } from "lucide-react";
import { QuestionListItem } from "../../../types/question-bank.types";

interface PracticePaletteDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly questions: readonly QuestionListItem[];
  readonly currentIndex: number;
  readonly onSelectIndex: (index: number) => void;
  readonly selectedAnswers: Record<string, string>;
  readonly flaggedQuestionIds: ReadonlySet<string>;
  readonly onFinish: () => void;
}

export function PracticePaletteDrawer({
  isOpen,
  onClose,
  questions,
  currentIndex,
  onSelectIndex,
  selectedAnswers,
  flaggedQuestionIds,
  onFinish,
}: PracticePaletteDrawerProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0">
      <div className="w-full max-w-md bg-card rounded-3xl border border-border p-5 shadow-xl space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Question Navigator
            </h2>
            <p className="text-xs text-muted-foreground">
              {Object.keys(selectedAnswers).length} of {questions.length} answered
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-y border-border py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500/40" />
            <span>Flagged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-muted border border-border" />
            <span>Unanswered</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
          {questions.map((q, idx) => {
            const isAnswered = Boolean(selectedAnswers[q.id]);
            const isFlagged = flaggedQuestionIds.has(q.id);
            const isCurrent = idx === currentIndex;

            let btnStyle = "bg-muted text-muted-foreground border-border";
            if (isCurrent) {
              btnStyle = "bg-primary text-primary-foreground border-primary font-bold shadow-2xs";
            } else if (isFlagged) {
              btnStyle = "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 font-semibold";
            } else if (isAnswered) {
              btnStyle = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 font-semibold";
            }

            return (
              <button
                type="button"
                key={q.id}
                onClick={() => {
                  onSelectIndex(idx);
                  onClose();
                }}
                className={`h-9 rounded-xl text-xs font-mono border flex items-center justify-center gap-1 transition-all cursor-pointer ${btnStyle}`}
              >
                <span>{idx + 1}</span>
                {isFlagged && <Bookmark size={10} className="text-amber-500 fill-amber-500" />}
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onFinish();
            }}
            className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Finish Practice
          </button>
        </div>
      </div>
    </div>
  );
}
