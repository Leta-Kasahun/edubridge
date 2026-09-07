"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import { QuestionListItem } from "../../../types/question-bank.types";
import { ROUTES } from "@/constants/routes";

interface PracticeSummaryReportProps {
  readonly bankTitle: string;
  readonly gradeLevel?: number | null;
  readonly questions: readonly QuestionListItem[];
  readonly selectedAnswers: Record<string, string>;
  readonly flaggedQuestionIds: ReadonlySet<string>;
  readonly formattedTime: string;
  readonly onRetake: () => void;
  readonly onReviewIndex: (index: number) => void;
}

export function PracticeSummaryReport({
  bankTitle,
  gradeLevel,
  questions,
  selectedAnswers,
  flaggedQuestionIds,
  formattedTime,
  onRetake,
  onReviewIndex,
}: PracticeSummaryReportProps): React.JSX.Element {
  const [filterType, setFilterType] = useState<"ALL" | "INCORRECT" | "FLAGGED" | "CORRECT">("ALL");
  const [expandedExplanationIds, setExpandedExplanationIds] = useState<Record<string, boolean>>({});

  const totalQuestions = questions.length;

  const stats = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    for (const q of questions) {
      const selected = selectedAnswers[q.id];
      if (!selected) {
        unattempted++;
      } else {
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (correctOpt && (correctOpt.id === selected || correctOpt.text === selected)) {
          correct++;
        } else {
          incorrect++;
        }
      }
    }

    const accuracy = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    return { correct, incorrect, unattempted, accuracy };
  }, [questions, selectedAnswers, totalQuestions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const selected = selectedAnswers[q.id];
      const correctOpt = q.options?.find((o) => o.isCorrect);
      const isCorrect = Boolean(
        correctOpt && (correctOpt.id === selected || correctOpt.text === selected)
      );

      if (filterType === "INCORRECT") return selected && !isCorrect;
      if (filterType === "CORRECT") return isCorrect;
      if (filterType === "FLAGGED") return flaggedQuestionIds.has(q.id);
      return true;
    });
  }, [questions, selectedAnswers, filterType, flaggedQuestionIds]);

  const toggleExplanation = (id: string) => {
    setExpandedExplanationIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Award size={34} />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Practice Summary
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {bankTitle} {gradeLevel ? `· Grade ${gradeLevel}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Score
              </span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">
                {stats.correct} / {totalQuestions}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Accuracy
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {stats.accuracy}%
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Time Spent
              </span>
              <span className="text-lg font-bold text-foreground mt-0.5 block">
                {formattedTime}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-muted/50 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold block">
                Flagged
              </span>
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                {flaggedQuestionIds.size}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRetake}
              className="w-full sm:flex-1 h-10 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Retake Practice</span>
            </button>

            <Link
              href={ROUTES.QUESTION_BANK.BANKS}
              className="w-full sm:flex-1 h-10 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft size={14} />
              <span>Back to Question Banks</span>
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-bold text-foreground">
              Question Review ({filteredQuestions.length})
            </h2>

            <div className="flex items-center gap-1.5 bg-card p-1 rounded-xl border border-border text-xs">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "ALL"
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({totalQuestions})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("INCORRECT")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "INCORRECT"
                    ? "bg-destructive text-destructive-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Incorrect ({stats.incorrect})
              </button>
              {flaggedQuestionIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType("FLAGGED")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    filterType === "FLAGGED"
                      ? "bg-amber-500 text-white font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Flagged ({flaggedQuestionIds.size})
                </button>
              )}
              <button
                type="button"
                onClick={() => setFilterType("CORRECT")}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  filterType === "CORRECT"
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Correct ({stats.correct})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((question) => {
              const originalIndex = questions.findIndex((q) => q.id === question.id);
              const selectedKey = selectedAnswers[question.id];
              const correctOpt = question.options?.find((o) => o.isCorrect);
              const isCorrect = Boolean(
                correctOpt && (correctOpt.id === selectedKey || correctOpt.text === selectedKey)
              );
              const isFlagged = flaggedQuestionIds.has(question.id);
              const isExpOpen = Boolean(expandedExplanationIds[question.id]);

              return (
                <div
                  key={question.id}
                  className="bg-card rounded-2xl border border-border p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-foreground">
                        Q{originalIndex + 1}
                      </span>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 size={12} />
                          <span>Correct</span>
                        </span>
                      ) : selectedKey ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                          <XCircle size={12} />
                          <span>Incorrect</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
                          Unanswered
                        </span>
                      )}

                      {isFlagged && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Bookmark size={11} />
                          <span>Flagged</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onReviewIndex(originalIndex)}
                      className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Jump to Question
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-foreground break-words">
                    {question.prompt}
                  </p>

                  {question.options && question.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {question.options.map((opt, idx) => {
                        const optKey = opt.id || opt.text || String(idx);
                        const isUserSelected = selectedKey === optKey;

                        let style = "bg-muted/30 border-border text-muted-foreground";
                        if (opt.isCorrect) {
                          style = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold";
                        } else if (isUserSelected) {
                          style = "bg-destructive/10 border-destructive text-destructive font-semibold";
                        }

                        return (
                          <div
                            key={optKey}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${style}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[10px] font-bold opacity-75 shrink-0">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <span className="break-words">{opt.text}</span>
                            </div>
                            {opt.isCorrect && (
                              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                            {!opt.isCorrect && isUserSelected && (
                              <XCircle size={14} className="text-destructive shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {question.explanation && (
                    <div className="pt-2 border-t border-border">
                      <button
                        type="button"
                        onClick={() => toggleExplanation(question.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <span>Explanation</span>
                        <ChevronDown
                          size={12}
                          className={`transition-transform ${isExpOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpOpen && (
                        <p className="mt-1.5 p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed animate-in fade-in-0">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
