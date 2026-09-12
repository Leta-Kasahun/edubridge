"use client";

import { Flag, Check, Hash } from "lucide-react";
import { StudentQuestionView } from "../../types/assessment.types";
import { QuestionDifficultyBadge } from "@/features/question-bank/components/questions/QuestionBadges";
import { buildOptionLabel } from "@/shared/utils/question.util";

interface StudentAssessmentQuestionCardProps {
  readonly question: StudentQuestionView;
  readonly questionIndex: number;
  readonly totalQuestions: number;
  readonly currentAnswer: unknown;
  readonly isFlagged: boolean;
  readonly onAnswerChange: (answer: unknown) => void;
  readonly onToggleFlag: () => void;
}

export function StudentAssessmentQuestionCard({
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  isFlagged,
  onAnswerChange,
  onToggleFlag,
}: StudentAssessmentQuestionCardProps) {

  const renderQuestionInput = () => {
    switch (question.type) {
      case "MCQ": {
        const selectedKey = typeof currentAnswer === "string" ? currentAnswer : "";
        return (
          <div className="space-y-2.5 pt-2">
            {question.options.map((opt, idx) => {
              const letter = buildOptionLabel(idx);
              const isSelected = selectedKey === opt.optionKey;

              return (
                <button
                  key={opt.id || opt.optionKey}
                  type="button"
                  onClick={() => onAnswerChange(opt.optionKey)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground font-semibold shadow-xs ring-1 ring-primary/30"
                      : "bg-card border-border text-foreground hover:bg-muted/40 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm leading-relaxed">{opt.optionText}</span>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        );
      }

      case "TRUE_FALSE": {
        const selectedValue =
          currentAnswer === true || currentAnswer === "true"
            ? "true"
            : currentAnswer === false || currentAnswer === "false"
            ? "false"
            : "";

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => onAnswerChange(true)}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                selectedValue === "true"
                  ? "bg-emerald-500/10 border-emerald-500 text-foreground font-bold shadow-xs ring-1 ring-emerald-500/30"
                  : "bg-card border-border text-foreground hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                    selectedValue === "true"
                      ? "bg-emerald-600 text-white"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  T
                </span>
                <span className="text-sm font-semibold">True</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedValue === "true"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-border"
                }`}
              >
                {selectedValue === "true" && <Check size={12} strokeWidth={3} />}
              </div>
            </button>

            <button
              type="button"
              onClick={() => onAnswerChange(false)}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                selectedValue === "false"
                  ? "bg-rose-500/10 border-rose-500 text-foreground font-bold shadow-xs ring-1 ring-rose-500/30"
                  : "bg-card border-border text-foreground hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 ${
                    selectedValue === "false"
                      ? "bg-rose-600 text-white"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  F
                </span>
                <span className="text-sm font-semibold">False</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedValue === "false"
                    ? "border-rose-600 bg-rose-600 text-white"
                    : "border-border"
                }`}
              >
                {selectedValue === "false" && <Check size={12} strokeWidth={3} />}
              </div>
            </button>
          </div>
        );
      }

      case "NUMERIC": {
        const numValue =
          currentAnswer !== null && currentAnswer !== undefined ? String(currentAnswer) : "";

        return (
          <div className="pt-2 max-w-sm">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
              <Hash size={14} /> Enter numeric value
            </label>
            <input
              type="number"
              step="any"
              value={numValue}
              onChange={(e) => onAnswerChange(e.target.value === "" ? null : Number(e.target.value))}
              placeholder="e.g. 42 or 3.14"
              className="w-full px-4 py-3 text-sm rounded-xl border border-border bg-card text-foreground font-mono focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
        );
      }

      case "LONG_ANSWER": {
        const textValue = typeof currentAnswer === "string" ? currentAnswer : "";
        return (
          <div className="pt-2 space-y-1.5">
            <label className="block text-xs font-semibold text-muted-foreground">
              Write your comprehensive answer:
            </label>
            <textarea
              rows={6}
              value={textValue}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your explanation or response here..."
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-border bg-card text-foreground leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex justify-end text-[11px] text-muted-foreground font-mono">
              {textValue.length} characters
            </div>
          </div>
        );
      }

      case "SHORT_ANSWER":
      default: {
        const textValue = typeof currentAnswer === "string" ? currentAnswer : "";
        return (
          <div className="pt-2 max-w-lg">
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Enter your answer:
            </label>
            <input
              type="text"
              value={textValue}
              onChange={(e) => onAnswerChange(e.target.value)}
              placeholder="Type your response..."
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
        );
      }
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs p-5 sm:p-7 space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <QuestionDifficultyBadge difficulty={question.difficulty} />
          <span className="text-xs font-semibold text-muted-foreground">
            {question.points} {question.points === 1 ? "point" : "points"}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleFlag}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isFlagged
              ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 shadow-2xs"
              : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Flag size={14} className={isFlagged ? "fill-amber-500 text-amber-500" : ""} />
          <span>{isFlagged ? "Flagged for Review" : "Flag Question"}</span>
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
          {question.questionText}
        </h2>
      </div>

      <div>{renderQuestionInput()}</div>
    </div>
  );
}
