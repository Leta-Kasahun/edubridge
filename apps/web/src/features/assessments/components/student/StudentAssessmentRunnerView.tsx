import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Flag,
  Send,
  Menu,
  X,
  Eye,
} from "lucide-react";
import {
  StudentActiveAttemptSession,
  AssessmentAttemptResult,
} from "../../types/assessment.types";
import { useSaveAnswer, useSubmitAttempt } from "../../hooks/useAssessmentAttempt";
import { StudentAssessmentQuestionCard } from "./StudentAssessmentQuestionCard";
import { AssessmentSubmitConfirmModal } from "./AssessmentSubmitConfirmModal";
import { StudentAssessmentCompletedView } from "./StudentAssessmentCompletedView";
import { formatTimeRemaining } from "@/shared/utils/assessment.util";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth.store";

interface StudentAssessmentRunnerViewProps {
  readonly session: StudentActiveAttemptSession;
  readonly onFinish?: (result: AssessmentAttemptResult) => void;
  readonly onRetake?: () => void;
}

export function StudentAssessmentRunnerView({
  session,
  onFinish,
  onRetake,
}: StudentAssessmentRunnerViewProps) {
  const user = useAuthStore((s) => s.user);
  const isTeacherOrStaff = Boolean(
    session.isStaffPreview ||
      (user?.roles?.some((r) => ["TEACHER", "SCHOOL_ADMIN", "SYSTEM_ADMIN"].includes(r)) &&
        !user?.roles?.includes("STUDENT"))
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, unknown>>(() => {
    const map = new Map<string, unknown>();
    session.questions.forEach((q) => {
      if (q.savedAnswer !== undefined && q.savedAnswer !== null) {
        map.set(q.questionVersionId, q.savedAnswer);
      }
    });
    return map;
  });

  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<AssessmentAttemptResult | null>(null);

  const saveAnswerMutation = useSaveAnswer();
  const submitAttemptMutation = useSubmitAttempt();

  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const initialRemainingSeconds = useMemo(() => {
    if (!session.deadline && !session.timeLimitMinutes) return null;

    if (session.deadline) {
      const diffMs = new Date(session.deadline).getTime() - Date.now();
      return Math.max(0, Math.floor(diffMs / 1000));
    }

    if (session.timeLimitMinutes) {
      const startedMs = new Date(session.startedAt).getTime();
      const endMs = startedMs + session.timeLimitMinutes * 60 * 1000;
      return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    }

    return null;
  }, [session.deadline, session.timeLimitMinutes, session.startedAt]);

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    initialRemainingSeconds
  );

  const handleFinalSubmit = useCallback(async () => {
    if (submittedResult || submitAttemptMutation.isPending) return;

    const answersPayload = Array.from(answers.entries()).map(([qId, val]) => ({
      questionVersionId: qId,
      response: val,
    }));

    try {
      const result = await submitAttemptMutation.mutateAsync({
        assessmentId: session.assessmentId,
        attemptId: session.attemptId,
        answers: answersPayload,
      });
      setSubmittedResult(result);
      setIsConfirmModalOpen(false);
      onFinish?.(result);
    } catch {
      setIsConfirmModalOpen(false);
    }
  }, [
    answers,
    onFinish,
    session.assessmentId,
    session.attemptId,
    submitAttemptMutation,
    submittedResult,
  ]);

  useEffect(() => {
    if (secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      handleFinalSubmit();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleFinalSubmit, secondsRemaining]);

  const handleAnswerChange = useCallback(
    (questionVersionId: string, value: unknown) => {
      setAnswers((prev) => {
        const next = new Map(prev);
        if (value === undefined || value === null || value === "") {
          next.delete(questionVersionId);
        } else {
          next.set(questionVersionId, value);
        }
        return next;
      });

      const existingTimer = debounceTimersRef.current.get(questionVersionId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        saveAnswerMutation.mutate({
          assessmentId: session.assessmentId,
          attemptId: session.attemptId,
          questionVersionId,
          response: value,
        });
        debounceTimersRef.current.delete(questionVersionId);
      }, 600);

      debounceTimersRef.current.set(questionVersionId, timer);
    },
    [saveAnswerMutation, session.assessmentId, session.attemptId]
  );

  const toggleFlag = (questionVersionId: string) => {
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(questionVersionId)) {
        next.delete(questionVersionId);
      } else {
        next.add(questionVersionId);
      }
      return next;
    });
  };

  const answeredCount = answers.size;
  const totalCount = session.questions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
  const currentQuestion = session.questions[activeIdx];
  const isUrgentTime = secondsRemaining !== null && secondsRemaining <= 300;

  const handleRetake = async () => {
    setSubmittedResult(null);
    setAnswers(new Map());
    setFlaggedIds(new Set());
    setActiveIdx(0);
    if (onRetake) {
      await onRetake();
    }
  };

  if (submittedResult) {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
        <StudentAssessmentCompletedView
          attempt={submittedResult}
          canRetake={Boolean(onRetake)}
          onRetake={handleRetake}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            <Link
              href={isTeacherOrStaff ? ROUTES.ASSESSMENTS.LIST : ROUTES.STUDENT.PRACTICE}
              className="p-1.5 sm:p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold shrink-0"
              title={isTeacherOrStaff ? "Exit Preview" : "Exit Exam"}
            >
              <ArrowLeft size={15} />
              <span className="hidden md:inline">{isTeacherOrStaff ? "Exit Preview" : "Exit"}</span>
            </Link>

            {isTeacherOrStaff && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 text-[11px] font-bold">
                <Eye size={13} />
                <span>Preview Mode</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => setIsDrawerOpen((prev) => !prev)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              title="Toggle Question Grid"
            >
              <Menu size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {secondsRemaining !== null && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-colors ${
                  isUrgentTime
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 animate-pulse"
                    : "bg-muted/50 border-border text-foreground"
                }`}
              >
                <Clock size={15} className={isUrgentTime ? "text-rose-500" : "text-primary"} />
                <span>{formatTimeRemaining(secondsRemaining)}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              <Send size={13} />
              <span className="hidden sm:inline">Review & Submit</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-2">
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full p-3.5 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <main className="lg:col-span-8 xl:col-span-9 space-y-5 sm:space-y-6 flex flex-col justify-between">
          {currentQuestion ? (
            <StudentAssessmentQuestionCard
              assessmentId={session.assessmentId}
              question={currentQuestion}
              questionIndex={activeIdx}
              totalQuestions={session.questions.length}
              currentAnswer={answers.get(currentQuestion.questionVersionId)}
              isFlagged={flaggedIds.has(currentQuestion.questionVersionId)}
              onAnswerChange={(val) =>
                handleAnswerChange(currentQuestion.questionVersionId, val)
              }
              onToggleFlag={() => toggleFlag(currentQuestion.questionVersionId)}
            />
          ) : (
            <div className="bg-card rounded-2xl border border-border p-12 text-center text-muted-foreground">
              No questions found for this attempt session.
            </div>
          )}

          <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveIdx((prev) => Math.max(0, prev - 1))}
              disabled={activeIdx === 0}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span className="hidden sm:inline text-xs text-muted-foreground font-semibold">
              {activeIdx + 1} / {totalCount}
            </span>

            {activeIdx < totalCount - 1 ? (
              <button
                type="button"
                onClick={() => setActiveIdx((prev) => Math.min(totalCount - 1, prev + 1))}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                <span>Finish & Submit</span>
                <Send size={14} />
              </button>
            )}
          </div>
        </main>

        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold text-foreground">Question Navigator</span>
              <span className="text-xs text-muted-foreground font-semibold">
                {answeredCount}/{totalCount} Answered
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {session.questions.map((q, idx) => {
                const isCurrent = idx === activeIdx;
                const isAnswered = answers.has(q.questionVersionId);
                const isFlagged = flaggedIds.has(q.questionVersionId);

                return (
                  <button
                    key={q.questionVersionId}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`h-10 rounded-xl text-xs font-bold flex items-center justify-center relative transition-all cursor-pointer border ${
                      isCurrent
                        ? "ring-2 ring-primary ring-offset-2 bg-primary text-primary-foreground border-primary shadow-xs"
                        : isAnswered
                        ? "bg-primary/15 border-primary/40 text-primary font-bold"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white">
                        <Flag size={8} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-xs"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-card border-l border-border h-full p-5 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="text-sm font-bold text-foreground">Question Navigator</span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5 max-h-[60vh] overflow-y-auto">
                {session.questions.map((q, idx) => {
                  const isCurrent = idx === activeIdx;
                  const isAnswered = answers.has(q.questionVersionId);
                  const isFlagged = flaggedIds.has(q.questionVersionId);

                  return (
                    <button
                      key={q.questionVersionId}
                      type="button"
                      onClick={() => {
                        setActiveIdx(idx);
                        setIsDrawerOpen(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center relative transition-all border ${
                        isCurrent
                          ? "ring-2 ring-primary ring-offset-1 bg-primary text-primary-foreground border-primary"
                          : isAnswered
                          ? "bg-primary/15 border-primary/40 text-primary font-bold"
                          : "bg-muted/30 border-border text-muted-foreground"
                      }`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center text-[8px] text-white">
                          <Flag size={8} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Total Answered:</span>
                <span className="font-bold text-foreground">{answeredCount} / {totalCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AssessmentSubmitConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalSubmit}
        answeredCount={answeredCount}
        totalQuestions={totalCount}
        flaggedCount={flaggedIds.size}
        timeRemainingFormatted={
          secondsRemaining !== null ? formatTimeRemaining(secondsRemaining) : "Untimed"
        }
        isSubmitting={submitAttemptMutation.isPending}
      />
    </div>
  );
}
