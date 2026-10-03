"use client";

import React, { useState, useMemo } from "react";
import { X, Bookmark, CheckCircle2, HelpCircle } from "lucide-react";
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
  const [filterTab, setFilterTab] = useState<"ALL" | "ANSWERED" | "UNANSWERED" | "FLAGGED">("ALL");

  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = questions.length;
  const unansweredCount = Math.max(0, totalCount - answeredCount);
  const flaggedCount = flaggedQuestionIds.size;

  const filteredList = useMemo(() => {
    return questions.map((q, idx) => {
      const isAnswered = Boolean(selectedAnswers[q.id]);
      const isFlagged = flaggedQuestionIds.has(q.id);
      return { q, idx, isAnswered, isFlagged };
    }).filter((item) => {
      if (filterTab === "ANSWERED") return item.isAnswered;
      if (filterTab === "UNANSWERED") return !item.isAnswered;
      if (filterTab === "FLAGGED") return item.isFlagged;
      return true;
    });
  }, [questions, selectedAnswers, flaggedQuestionIds, filterTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-card rounded-3xl border border-border p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Question Navigator
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {answeredCount} of {totalCount} answered ({Math.round((answeredCount / (totalCount || 1)) * 100)}%)
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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 text-xs">
          <button
            type="button"
            onClick={() => setFilterTab("ALL")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === "ALL"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("ANSWERED")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === "ANSWERED"
                ? "bg-emerald-600 text-white font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Answered ({answeredCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab("UNANSWERED")}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
              filterTab === "UNANSWERED"
                ? "bg-muted text-foreground font-bold border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Unanswered ({unansweredCount})
          </button>
          {flaggedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilterTab("FLAGGED")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterTab === "FLAGGED"
                  ? "bg-amber-500 text-white font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Flagged ({flaggedCount})
            </button>
          )}
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-1 min-h-[140px] max-h-64">
          {filteredList.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No questions found under this filter.
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {filteredList.map(({ q, idx, isAnswered, isFlagged }) => {
                const isCurrent = idx === currentIndex;

                let btnStyle = "bg-muted text-muted-foreground border-border hover:bg-muted/80";
                if (isCurrent) {
                  btnStyle = "bg-primary text-primary-foreground border-primary font-bold shadow-xs";
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
                    className={`h-10 rounded-xl text-xs font-mono border flex items-center justify-center gap-1 transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && <Bookmark size={10} className="text-amber-500 fill-amber-500" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Flagged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span>Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" />
            <span>Unanswered</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-9 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
          >
            Continue Practice
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onFinish();
            }}
            className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Finish Practice
          </button>
        </div>
      </div>
    </div>
  );
}
