"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Award, CheckCircle2, AlertCircle } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { useAttemptResult } from "../hooks/useAssessmentAttempt";
import {
  AssessmentAttemptResult,
  ManualGradeAttemptPayload,
} from "../types/assessment.types";
import { getAttemptStatusBadge, formatPercentage } from "@/shared/utils/assessment.util";

interface AssessmentManualGradeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (payload: ManualGradeAttemptPayload) => Promise<void>;
  readonly assessmentId: string;
  readonly attemptId: string;
  readonly initialAttempt?: AssessmentAttemptResult | null;
  readonly isLoading?: boolean;
}

export function AssessmentManualGradeModal({
  isOpen,
  onClose,
  onSubmit,
  assessmentId,
  attemptId,
  initialAttempt,
  isLoading = false,
}: AssessmentManualGradeModalProps) {
  const { data: fullAttempt, isLoading: isFetchingAttempt } = useAttemptResult(
    assessmentId,
    attemptId
  );

  const attempt = fullAttempt || initialAttempt;

  const [grades, setGrades] = useState<
    Map<string, { awardedPoints: number; feedback: string }>
  >(new Map());

  const [generalFeedback, setGeneralFeedback] = useState("");

  useEffect(() => {
    if (!attempt || !isOpen) return;

    const questions = attempt.assessment?.questions || [];
    const answers = attempt.answers || [];
    const map = new Map<string, { awardedPoints: number; feedback: string }>();

    if (questions.length > 0) {
      for (const q of questions) {
        const existingAns = answers.find(
          (a) => a.questionVersionId === q.questionVersionId
        );
        const defaultPts =
          existingAns?.awardedPoints != null
            ? Number(existingAns.awardedPoints)
            : existingAns?.isCorrect === true
            ? Number(q.points)
            : 0;

        map.set(q.questionVersionId, {
          awardedPoints: defaultPts,
          feedback: existingAns?.feedback || "",
        });
      }
    } else if (answers.length > 0) {
      for (const ans of answers) {
        map.set(ans.questionVersionId, {
          awardedPoints: ans.awardedPoints != null ? Number(ans.awardedPoints) : 0,
          feedback: ans.feedback || "",
        });
      }
    }

    setGrades(map);
  }, [attempt, isOpen]);

  const questionsList = useMemo(() => {
    if (attempt?.assessment?.questions && attempt.assessment.questions.length > 0) {
      return attempt.assessment.questions.map((q, idx) => {
        const ans = attempt.answers?.find((a) => a.questionVersionId === q.questionVersionId);
        return {
          questionVersionId: q.questionVersionId,
          orderIndex: q.orderIndex ?? idx + 1,
          maxPoints: Number(q.points) || 1,
          questionVersion: q.questionVersion,
          studentAnswer: ans,
        };
      });
    }

    if (attempt?.answers && attempt.answers.length > 0) {
      return attempt.answers.map((ans, idx) => ({
        questionVersionId: ans.questionVersionId,
        orderIndex: idx + 1,
        maxPoints: Number(ans.maxPoints) || 1,
        questionVersion: ans.questionVersion,
        studentAnswer: ans,
      }));
    }

    return [];
  }, [attempt]);

  const totalScoreStats = useMemo(() => {
    let awarded = 0;
    let max = 0;

    for (const item of questionsList) {
      max += item.maxPoints;
      const g = grades.get(item.questionVersionId);
      if (g) {
        awarded += Number(g.awardedPoints) || 0;
      }
    }

    return { awarded, max };
  }, [questionsList, grades]);

  if (!isOpen) return null;

  const updateGrade = (
    versionId: string,
    points: number,
    feedback: string
  ) => {
    setGrades((prev) => {
      const next = new Map(prev);
      next.set(versionId, { awardedPoints: points, feedback });
      return next;
    });
  };

  const handleQuickScore = (versionId: string, pts: number) => {
    const current = grades.get(versionId) || { awardedPoints: 0, feedback: "" };
    updateGrade(versionId, pts, current.feedback);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ManualGradeAttemptPayload = {
      grades: Array.from(grades.entries()).map(([qId, data]) => ({
        questionVersionId: qId,
        awardedPoints: Number(data.awardedPoints) || 0,
        feedback: data.feedback.trim() || undefined,
      })),
      generalFeedback: generalFeedback.trim() || undefined,
    };
    await onSubmit(payload);
  };

  const badge = attempt ? getAttemptStatusBadge(attempt.status) : null;
  const studentName = attempt?.student?.user
    ? `${attempt.student.user.firstName} ${attempt.student.user.lastName}`
    : "Student";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs">
      <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base text-foreground truncate">
                  Review & Grade Submission
                </h2>
                {badge && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.bg}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {studentName} &bull; Attempt #{attempt?.attemptNumber ?? 1}
                {attempt?.student?.studentCode ? ` (${attempt.student.studentCode})` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Total Score</span>
              <span className="text-xs font-bold text-foreground">
                {totalScoreStats.awarded} / {totalScoreStats.max} ({formatPercentage(totalScoreStats.awarded, totalScoreStats.max)})
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isFetchingAttempt && questionsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3 flex-1">
            <LoadingSpinner size={24} />
            <p className="text-xs text-muted-foreground">Loading student attempt details...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 flex-1">
            {questionsList.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 rounded-xl border border-border">
                <AlertCircle size={24} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-foreground font-semibold">No questions found for this attempt.</p>
              </div>
            ) : (
              questionsList.map((item, idx) => {
                const qv = item.questionVersion;
                const maxPts = item.maxPoints;
                const ans = item.studentAnswer;
                const currentGrade = grades.get(item.questionVersionId) || {
                  awardedPoints: 0,
                  feedback: "",
                };

                let responseDisplay = "No response submitted";
                if (ans?.answer !== undefined && ans?.answer !== null && ans?.answer !== "") {
                  if (typeof ans.answer === "string") {
                    responseDisplay = ans.answer;
                  } else if (typeof ans.answer === "number" || typeof ans.answer === "boolean") {
                    responseDisplay = String(ans.answer);
                  } else if (Array.isArray(ans.answer)) {
                    responseDisplay = ans.answer.join(", ");
                  } else if (typeof ans.answer === "object") {
                    const obj = ans.answer as Record<string, unknown>;
                    if (obj.text) responseDisplay = String(obj.text);
                    else if (obj.optionKey) responseDisplay = `Option ${obj.optionKey}`;
                    else responseDisplay = JSON.stringify(ans.answer);
                  }
                }

                return (
                  <div
                    key={item.questionVersionId || idx}
                    className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3.5"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          Question {idx + 1}
                        </span>
                        {qv?.type && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                            {qv.type}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold">
                        Max: <strong className="text-foreground">{maxPts}</strong> pts
                      </span>
                    </div>

                    <p className="text-xs text-foreground font-medium whitespace-pre-wrap leading-relaxed">
                      {qv?.questionText || "Question text not available"}
                    </p>

                    {/* Student Response */}
                    <div className="p-3 rounded-xl bg-muted/30 border border-border/80 text-xs space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Student Response:
                      </span>
                      <p className={`font-mono text-xs ${ans?.answer ? "text-foreground font-medium" : "text-muted-foreground italic"}`}>
                        {responseDisplay}
                      </p>
                    </div>

                    {/* Grading Controls */}
                    <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground">
                            Awarded Points (0 &ndash; {maxPts})
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuickScore(item.questionVersionId, 0)}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground cursor-pointer"
                            >
                              0
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickScore(item.questionVersionId, maxPts / 2)}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground cursor-pointer"
                            >
                              Half
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickScore(item.questionVersionId, maxPts)}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                            >
                              Full
                            </button>
                          </div>
                        </div>

                        <input
                          type="number"
                          min="0"
                          max={maxPts}
                          step="any"
                          value={currentGrade.awardedPoints}
                          onChange={(e) => {
                            const val = e.target.value === "" ? 0 : Number(e.target.value);
                            updateGrade(
                              item.questionVersionId,
                              Math.max(0, val),
                              currentGrade.feedback
                            );
                          }}
                          className="h-9 w-full px-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-7 space-y-1.5">
                        <label className="text-xs font-semibold text-foreground block">
                          Question Feedback (Optional)
                        </label>
                        <input
                          type="text"
                          value={currentGrade.feedback}
                          onChange={(e) =>
                            updateGrade(
                              item.questionVersionId,
                              currentGrade.awardedPoints,
                              e.target.value
                            )
                          }
                          placeholder="Provide specific feedback or justification..."
                          className="h-9 w-full px-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* General Feedback */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-foreground">
                Overall Assessment Feedback (Optional)
              </label>
              <textarea
                rows={2}
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                placeholder="Add general comments or encouragement for the student..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
              />
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground w-full sm:w-auto justify-between sm:justify-start">
                <span>Final Score:</span>
                <span className="font-bold text-foreground text-sm">
                  {totalScoreStats.awarded} / {totalScoreStats.max} ({formatPercentage(totalScoreStats.awarded, totalScoreStats.max)})
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <SubmitButton
                  isLoading={isLoading}
                  size="sm"
                  className="w-full sm:w-auto px-5"
                >
                  Save Grading
                </SubmitButton>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

