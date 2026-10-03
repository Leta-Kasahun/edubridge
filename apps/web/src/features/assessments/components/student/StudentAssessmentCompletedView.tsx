"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  MessageSquare,
  Send,
  AlertCircle,
} from "lucide-react";
import { AssessmentAttemptResult } from "../../types/assessment.types";
import { ROUTES } from "@/constants/routes";
import { getAttemptStatusBadge } from "@/shared/utils/assessment.util";
import { useSubmitQuestionFeedback } from "../../hooks/useAssessmentAttempt";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";

const FEEDBACK_CATEGORY_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "CLARIFICATION", label: "Need Help" },
  { value: "TYPO_REPORT", label: "Typo Error" },
  { value: "CONTENT_ISSUE", label: "Incorrect Answer" },
  { value: "GENERAL", label: "General" },
];

interface StudentAssessmentCompletedViewProps {
  readonly attempt: AssessmentAttemptResult;
  readonly onRetake?: () => void;
  readonly canRetake?: boolean;
}

export function StudentAssessmentCompletedView({
  attempt,
  onRetake,
  canRetake = true,
}: StudentAssessmentCompletedViewProps) {
  const isGraded = attempt.status === "GRADED";
  const isPendingGrading = attempt.status === "GRADING";
  const scoreNum = Number(attempt.score) || 0;
  const maxScoreNum = Number(attempt.maxScore) || 1;
  const percentageNum = Number(attempt.percentage) || Math.round((scoreNum / maxScoreNum) * 100);
  const isPassed = percentageNum >= 50;

  const statusBadge = getAttemptStatusBadge(attempt.status);

  const [expandedExplanations, setExpandedExplanations] = useState<Set<string>>(new Set());
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackCategory, setFeedbackCategory] = useState<"CLARIFICATION" | "TYPO_REPORT" | "CONTENT_ISSUE" | "GENERAL">("CLARIFICATION");
  const [feedbackTexts, setFeedbackTexts] = useState<Map<string, string>>(new Map());
  const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState<Set<string>>(new Set());
  const submitFeedbackMutation = useSubmitQuestionFeedback();

  const toggleExplanation = (questionId: string) => {
    setExpandedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleFeedbackSubmit = async (questionVersionId: string) => {
    const text = feedbackTexts.get(questionVersionId);
    if (!text || !text.trim() || !attempt.assessmentId) return;

    try {
      await submitFeedbackMutation.mutateAsync({
        assessmentId: attempt.assessmentId,
        payload: {
          questionVersionId,
          message: text.trim(),
          category: feedbackCategory,
        },
      });
      setSubmittedFeedbackIds((prev) => new Set(prev).add(questionVersionId));
      setActiveFeedbackId(null);
    } catch {
      // Handled by mutation error state
    }
  };

  const displayAnswers = (attempt.answers && attempt.answers.length > 0)
    ? attempt.answers
    : (attempt.assessment?.questions || []).map((q, idx) => ({
        id: q.questionVersionId || String(idx),
        questionVersionId: q.questionVersionId,
        questionVersion: q.questionVersion,
        answer: null,
        isCorrect: null,
        awardedPoints: 0,
        maxPoints: Number(q.points) || 1,
        feedback: null,
      }));

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in-0 duration-300">
      <div className="flex items-center justify-between gap-3 px-1">
        <Link
          href={ROUTES.STUDENT.PRACTICE}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Practice</span>
        </Link>

        <Link
          href={ROUTES.STUDENT.PROGRESS}
          className="text-xs font-semibold text-primary hover:underline transition-colors"
        >
          View Progress Matrix
        </Link>
      </div>
      <div className="bg-card rounded-2xl border border-border shadow-xs p-6 sm:p-8 text-center space-y-4">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
            isGraded
              ? isPassed
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          {isGraded ? <Award size={32} /> : <CheckCircle2 size={32} />}
        </div>

        <div className="space-y-1">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}
          >
            {statusBadge.label}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {isGraded
              ? isPassed
                ? "Exam Completed Successfully"
                : "Exam Completed"
              : "Exam Submitted"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {isGraded
              ? "Your responses have been graded. Review your score and question breakdown below."
              : isPendingGrading
              ? "Your exam responses are recorded and queued for evaluation."
              : "Your exam responses have been recorded."}
          </p>
        </div>

        {isGraded && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-lg mx-auto">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Score
              </span>
              <span className="text-lg font-bold text-foreground">
                {scoreNum} / {maxScoreNum}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Percentage
              </span>
              <span
                className={`text-lg font-bold ${
                  isPassed
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {percentageNum}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border col-span-2 sm:col-span-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
                Result
              </span>
              <span
                className={`text-sm font-bold block mt-1 ${
                  isPassed
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {isPassed ? "Passed" : "Needs Practice"}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          {canRetake && (
            <button
              type="button"
              onClick={onRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Try Again</span>
            </button>
          )}

          <Link
            href={ROUTES.STUDENT.PROGRESS}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <span>View My Progress</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {displayAnswers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground px-1">
            Question Breakdown
          </h2>

          <div className="space-y-3">
            {displayAnswers.map((ans, idx) => {
              const matchedAssessmentQ = attempt.assessment?.questions?.find(
                (q) => q.questionVersionId === ans.questionVersionId
              );
              const qv = ans.questionVersion || matchedAssessmentQ?.questionVersion;
              const qKey = ans.questionVersionId || String(idx);
              const isCorrect = ans.isCorrect === true;
              const isWrong = ans.isCorrect === false;
              const awardedPts = Number(ans.awardedPoints) || 0;
              const maxPts = Number(ans.maxPoints) || Number(matchedAssessmentQ?.points) || 1;
              const isExplanationOpen = expandedExplanations.has(qKey);
              const isFeedbackOpen = activeFeedbackId === qKey;
              const isFeedbackSubmitted = submittedFeedbackIds.has(qKey);

              return (
                <div
                  key={ans.id || idx}
                  className="bg-card rounded-2xl border border-border shadow-xs p-5 space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Question {idx + 1}
                      </span>
                      {ans.isCorrect === true ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                          <Check size={12} strokeWidth={3} /> Correct
                        </span>
                      ) : ans.isCorrect === false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400">
                          <X size={12} strokeWidth={3} /> Incorrect
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                          Pending Evaluation
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold font-mono text-muted-foreground">
                      {ans.isCorrect !== null ? `${awardedPts} / ${maxPts} pts` : `— / ${maxPts} pts`}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    {qv?.questionText || "Question prompt"}
                  </p>

                  <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      Your Response:
                    </span>
                    <p className="text-foreground font-medium">
                      {typeof ans.answer === "string"
                        ? ans.answer
                        : typeof ans.answer === "object" && ans.answer !== null
                        ? JSON.stringify(ans.answer)
                        : "No response provided"}
                    </p>
                  </div>

                  {/* Teacher Feedback / Grading Remarks Banner */}
                  {ans.feedback && (
                    <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1.5">
                        <MessageSquare size={13} />
                        Instructor Feedback:
                      </span>
                      <p className="text-foreground font-medium leading-relaxed">
                        {ans.feedback}
                      </p>
                    </div>
                  )}

                  {/* Correct Option preview for incorrect MCQ/TF */}
                  {isWrong && qv?.options && qv.options.some((o) => o.isCorrect) && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Correct Option:
                      </span>
                      <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                        {qv.options.find((o) => o.isCorrect)?.optionText ||
                          qv.options.find((o) => o.isCorrect)?.optionKey}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-border/70 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => toggleExplanation(qKey)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <Lightbulb size={14} className="text-amber-500" />
                      <span>{isExplanationOpen ? "Hide Solution" : "View Solution"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFeedbackId(isFeedbackOpen ? null : qKey)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>{isFeedbackSubmitted ? "Feedback Sent" : "Feedback"}</span>
                    </button>
                  </div>

                  {isExplanationOpen && (
                    <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground block mb-1">
                        Solution & Rationale:
                      </strong>
                      <p>
                        {qv?.explanation || "No solution note provided for this question."}
                      </p>
                    </div>
                  )}

                  {isFeedbackOpen && !isFeedbackSubmitted && (
                    <div className="p-4 rounded-xl bg-card border border-border text-xs space-y-3 animate-in fade-in-0 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground block">
                          Question Feedback
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveFeedbackId(null)}
                          className="text-muted-foreground hover:text-foreground p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {submitFeedbackMutation.isError && (
                        <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-1.5">
                          <AlertCircle size={13} className="shrink-0" />
                          <span>Failed to submit feedback. Please try again.</span>
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
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Comment</label>
                        <textarea
                          rows={3}
                          placeholder="Write your message or question..."
                          value={feedbackTexts.get(qKey) || ""}
                          onChange={(e) =>
                            setFeedbackTexts((prev) => new Map(prev).set(qKey, e.target.value))
                          }
                          className="w-full p-2.5 rounded-xl border border-border bg-background text-foreground text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveFeedbackId(null)}
                          className="px-3 py-1.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedbackSubmit(qKey)}
                          disabled={!feedbackTexts.get(qKey)?.trim() || submitFeedbackMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          <Send size={12} />
                          <span>{submitFeedbackMutation.isPending ? "Sending..." : "Submit Feedback"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
