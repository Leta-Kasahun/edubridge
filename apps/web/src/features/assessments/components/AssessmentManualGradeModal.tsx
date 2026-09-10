"use client";

import { useState } from "react";
import { X, CheckCircle2, Award } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import {
  AssessmentAttemptResult,
  ManualGradeAttemptPayload,
} from "../types/assessment.types";

interface AssessmentManualGradeModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (payload: ManualGradeAttemptPayload) => Promise<void>;
  readonly attempt: AssessmentAttemptResult;
  readonly isLoading?: boolean;
}

export function AssessmentManualGradeModal({
  isOpen,
  onClose,
  onSubmit,
  attempt,
  isLoading = false,
}: AssessmentManualGradeModalProps) {
  const [grades, setGrades] = useState<
    Map<string, { awardedPoints: number; feedback: string }>
  >(() => {
    const map = new Map<string, { awardedPoints: number; feedback: string }>();
    (attempt.answers || []).forEach((ans) => {
      map.set(ans.questionVersionId, {
        awardedPoints: Number(ans.awardedPoints) || 0,
        feedback: ans.feedback || "",
      });
    });
    return map;
  });

  const [generalFeedback, setGeneralFeedback] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ManualGradeAttemptPayload = {
      grades: Array.from(grades.entries()).map(([qId, data]) => ({
        questionVersionId: qId,
        awardedPoints: data.awardedPoints,
        feedback: data.feedback.trim() || undefined,
      })),
      generalFeedback: generalFeedback.trim() || undefined,
    };
    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">
                Manual Teacher Grading
              </h2>
              <p className="text-xs text-muted-foreground">
                Student: {attempt.student?.user?.firstName} {attempt.student?.user?.lastName} (Attempt #{attempt.attemptNumber})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {attempt.answers?.map((ans, idx) => {
            const qv = ans.questionVersion;
            const maxPts = Number(ans.maxPoints) || 1;
            const currentGrade = grades.get(ans.questionVersionId) || {
              awardedPoints: 0,
              feedback: "",
            };

            const responseText =
              typeof ans.answer === "string"
                ? ans.answer
                : typeof ans.answer === "object" && ans.answer !== null
                ? JSON.stringify(ans.answer)
                : "No response submitted";

            return (
              <div
                key={ans.id || idx}
                className="p-4 rounded-xl border border-border bg-muted/10 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Question {idx + 1} ({qv?.type || "Item"})
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    Max: {maxPts} pts
                  </span>
                </div>

                <p className="text-xs text-foreground font-medium">
                  {qv?.questionText || "Question text not available"}
                </p>

                <div className="p-2.5 rounded-lg bg-card border border-border text-xs">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                    Student Response:
                  </span>
                  <p className="text-foreground italic">{responseText}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Awarded Points (0 - {maxPts})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={maxPts}
                      step="0.5"
                      value={currentGrade.awardedPoints}
                      onChange={(e) =>
                        updateGrade(
                          ans.questionVersionId,
                          Math.min(maxPts, Math.max(0, Number(e.target.value))),
                          currentGrade.feedback
                        )
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-foreground mb-1">
                      Feedback (Optional)
                    </label>
                    <input
                      type="text"
                      value={currentGrade.feedback}
                      onChange={(e) =>
                        updateGrade(
                          ans.questionVersionId,
                          currentGrade.awardedPoints,
                          e.target.value
                        )
                      }
                      placeholder="Feedback for student..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-2">
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Overall Teacher Feedback (Optional)
            </label>
            <textarea
              rows={2}
              value={generalFeedback}
              onChange={(e) => setGeneralFeedback(e.target.value)}
              placeholder="Overall comments on student's performance..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isLoading}
              size="sm"
              className="w-auto"
            >
              Save Grading
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
