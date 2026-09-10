"use client";

import { AlertTriangle, CheckCircle2, Flag, HelpCircle, X } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";

interface AssessmentSubmitConfirmModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void>;
  readonly totalQuestions: number;
  readonly answeredCount: number;
  readonly flaggedCount: number;
  readonly timeRemainingFormatted: string;
  readonly isSubmitting?: boolean;
}

export function AssessmentSubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  flaggedCount,
  timeRemainingFormatted,
  isSubmitting = false,
}: AssessmentSubmitConfirmModalProps) {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const hasUnanswered = unansweredCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div
        className="fixed inset-0"
        onClick={isSubmitting ? undefined : onClose}
      />
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                hasUnanswered
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {hasUnanswered ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h3 className="text-base font-bold text-foreground">
                Ready to Submit Your Assessment?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Once submitted, your answers will be finalized and evaluated according to grading policies.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5 py-2">
            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Answered
              </span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {answeredCount}/{totalQuestions}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Unanswered
              </span>
              <span
                className={`text-base font-bold ${
                  hasUnanswered
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
                }`}
              >
                {unansweredCount}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border text-center space-y-0.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Flagged
              </span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                {flaggedCount}
              </span>
            </div>
          </div>

          {hasUnanswered && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300">
              <HelpCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                You still have <strong>{unansweredCount}</strong> unanswered question
                {unansweredCount > 1 ? "s" : ""}. Unanswered questions will receive zero points.
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 px-1">
            <span>Time Remaining:</span>
            <span className="font-mono font-bold text-foreground">
              {timeRemainingFormatted}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              Return to Test
            </button>
            <SubmitButton
              onClick={onConfirm}
              isLoading={isSubmitting}
              loadingText="Submitting..."
              className="h-10 px-5 text-xs font-semibold"
            >
              Confirm Submission
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
