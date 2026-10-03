"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Lightbulb,
  MessageSquare,
  Send,
} from "lucide-react";
import { AssessmentAttemptResult } from "../../types/assessment.types";
import { ROUTES } from "@/constants/routes";
import { formatPercentage, getAttemptStatusBadge } from "@/shared/utils/assessment.util";

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
  const [feedbackTexts, setFeedbackTexts] = useState<Map<string, string>>(new Map());
  const [submittedFeedbackIds, setSubmittedFeedbackIds] = useState<Set<string>>(new Set());

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

  const handleFeedbackSubmit = (questionId: string) => {
    const text = feedbackTexts.get(questionId);
    if (!text || !text.trim()) return;
    setSubmittedFeedbackIds((prev) => new Set(prev).add(questionId));
    setActiveFeedbackId(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4 animate-in fade-in-0 duration-300">
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

      {isGraded && attempt.answers && attempt.answers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-foreground px-1">
            Question Breakdown
          </h2>

          <div className="space-y-3">
            {attempt.answers.map((ans, idx) => {
              const qv = ans.questionVersion;
              const qKey = ans.questionVersionId || String(idx);
              const isCorrect = ans.isCorrect === true;
              const isWrong = ans.isCorrect === false;
              const awardedPts = Number(ans.awardedPoints) || 0;
              const maxPts = Number(ans.maxPoints) || 1;
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
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          isCorrect
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                            : isWrong
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <Check size={12} strokeWidth={3} /> Correct
                          </>
                        ) : isWrong ? (
                          <>
                            <X size={12} strokeWidth={3} /> Incorrect
                          </>
                        ) : (
                          "Pending Review"
                        )}
                      </span>
                    </div>

                    <span className="text-xs font-bold font-mono text-muted-foreground">
                      {awardedPts} / {maxPts} pts
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
                      <span>{isExplanationOpen ? "Hide Solution & Explanation" : "View Solution & Explanation"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveFeedbackId(isFeedbackOpen ? null : qKey)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      <span>{isFeedbackSubmitted ? "Comment Submitted" : "Submit Question Feedback"}</span>
                    </button>
                  </div>

                  {isExplanationOpen && (
                    <div className="p-4 rounded-xl bg-muted/50 border border-border text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <strong className="text-foreground block mb-1">
                        Step-by-Step Solution & Rationale:
                      </strong>
                      <p>
                        {qv?.explanation || "No additional solution note provided for this question."}
                      </p>
                    </div>
                  )}

                  {isFeedbackOpen && !isFeedbackSubmitted && (
                    <div className="p-4 rounded-xl bg-card border border-border text-xs space-y-3 animate-in fade-in-0 shadow-xs">
                      <span className="font-semibold text-foreground block">
                        Leave feedback or question note:
                      </span>
                      <textarea
                        rows={2}
                        placeholder="Write your feedback or comment about this question..."
                        value={feedbackTexts.get(qKey) || ""}
                        onChange={(e) =>
                          setFeedbackTexts((prev) => new Map(prev).set(qKey, e.target.value))
                        }
                        className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveFeedbackId(null)}
                          className="px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedbackSubmit(qKey)}
                          disabled={!feedbackTexts.get(qKey)?.trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send size={12} />
                          <span>Submit Comment</span>
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
