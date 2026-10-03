"use client";

import { useState } from "react";
import { Flag, Check, Hash, MessageSquarePlus, X, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { StudentQuestionView } from "../../types/assessment.types";
import { QuestionDifficultyBadge } from "@/features/question-bank/components/questions/QuestionBadges";
import { buildOptionLabel } from "@/shared/utils/question.util";
import { useSubmitQuestionFeedback } from "../../hooks/useAssessmentAttempt";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";

const FEEDBACK_CATEGORY_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "CLARIFICATION", label: "Need Help" },
  { value: "TYPO_REPORT", label: "Typo Error" },
  { value: "CONTENT_ISSUE", label: "Incorrect Answer" },
  { value: "GENERAL", label: "General" },
];

interface StudentAssessmentQuestionCardProps {
  readonly assessmentId?: string;
  readonly question: StudentQuestionView;
  readonly questionIndex: number;
  readonly totalQuestions: number;
  readonly currentAnswer: unknown;
  readonly isFlagged: boolean;
  readonly onAnswerChange: (answer: unknown) => void;
  readonly onToggleFlag: () => void;
}

export function StudentAssessmentQuestionCard({
  assessmentId,
  question,
  questionIndex,
  totalQuestions,
  currentAnswer,
  isFlagged,
  onAnswerChange,
  onToggleFlag,
}: StudentAssessmentQuestionCardProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<"CLARIFICATION" | "TYPO_REPORT" | "CONTENT_ISSUE" | "GENERAL">("CLARIFICATION");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const submitFeedbackMutation = useSubmitQuestionFeedback();

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentId || !feedbackText.trim()) return;

    try {
      await submitFeedbackMutation.mutateAsync({
        assessmentId,
        payload: {
          questionVersionId: question.questionVersionId,
          message: feedbackText.trim(),
          category: feedbackCategory,
        },
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setIsSubmitted(false);
        setFeedbackText("");
      }, 2000);
    } catch {
      // Error handled by mutation state
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case "MCQ": {
        const selectedKey = typeof currentAnswer === "string" ? currentAnswer : "";
        const rawOptions = (Array.isArray(question.options) && question.options.length > 0)
          ? question.options
          : (question.configuration && typeof question.configuration === "object" && Array.isArray((question.configuration as Record<string, unknown>).options))
          ? ((question.configuration as Record<string, unknown>).options as Array<{ id?: string; optionKey?: string; key?: string; optionText?: string; text?: string; label?: string }>)
          : [];

        if (rawOptions.length === 0) {
          return (
            <div className="p-4 rounded-xl border border-dashed border-border text-xs text-muted-foreground text-center">
              No options available for this multiple choice question.
            </div>
          );
        }

        return (
          <div className="space-y-2.5 pt-2">
            {rawOptions.map((rawOpt, idx) => {
              const optKey = rawOpt.optionKey || (rawOpt as { key?: string }).key || buildOptionLabel(idx);
              const optText = rawOpt.optionText || (rawOpt as { text?: string; label?: string }).text || (rawOpt as { label?: string }).label || "";
              const optId = rawOpt.id || optKey || String(idx);
              const letter = buildOptionLabel(idx);
              const isSelected = selectedKey === optKey;

              return (
                <button
                  key={optId}
                  type="button"
                  onClick={() => onAnswerChange(optKey)}
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
                    <span className="text-xs sm:text-sm leading-relaxed">{optText}</span>
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

        <div className="flex items-center gap-2">
          {assessmentId && (
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
            >
              <MessageSquarePlus size={14} />
              <span>Feedback</span>
            </button>
          )}

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
            <span>{isFlagged ? "Flagged" : "Flag"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm sm:text-base font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
          {question.questionText}
        </h2>
      </div>

      <div>{renderQuestionInput()}</div>

      {isFeedbackOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
          onClick={() => setIsFeedbackOpen(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <MessageSquarePlus size={18} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">Question Feedback</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={36} className="text-emerald-500 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-foreground">Feedback Sent</h4>
                <p className="text-xs text-muted-foreground">Your feedback was sent to your teacher.</p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                {submitFeedbackMutation.isError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>Failed to send feedback. Please try again.</span>
                  </div>
                )}

                <SelectDropdown
                  label="Category"
                  value={feedbackCategory}
                  onChange={(val) => setFeedbackCategory(val as typeof feedbackCategory)}
                  options={FEEDBACK_CATEGORY_OPTIONS}
                  placeholder="Select category"
                />

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Comment</label>
                  <textarea
                    rows={4}
                    required
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Write your message or question..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitFeedbackMutation.isPending || !feedbackText.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <span>{submitFeedbackMutation.isPending ? "Sending..." : "Submit Feedback"}</span>
                    <Send size={13} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
