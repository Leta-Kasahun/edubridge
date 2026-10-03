"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Check,
  Award,
} from "lucide-react";
import { useQuestionBank } from "../../hooks/useQuestionBanks";
import { useQuestions } from "../../hooks/useQuestions";
import { ROUTES } from "@/constants/routes";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { practiceSessionStorage } from "../../utils/practice-session.util";
import { useRecordPracticeEvidenceMutation } from "@/features/mastery/hooks/useMastery";
import { PracticeHeader } from "./practice/PracticeHeader";
import { PracticeQuestionCanvas } from "./practice/PracticeQuestionCanvas";
import { PracticeSummaryReport } from "./practice/PracticeSummaryReport";
import { PracticePaletteDrawer } from "./practice/PracticePaletteDrawer";

interface StudentQuestionPracticeViewProps {
  readonly bankId: string;
}

export function StudentQuestionPracticeView({
  bankId,
}: StudentQuestionPracticeViewProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<Set<string>>(new Set());
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, Set<string>>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);

  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const recordEvidenceMutation = useRecordPracticeEvidenceMutation();

  const { data: bank, isLoading: isBankLoading } = useQuestionBank(bankId);
  const {
    data: questionsData,
    isLoading: isQuestionsLoading,
    error,
  } = useQuestions(bankId, {
    status: "PUBLISHED",
    limit: 100,
  });

  const questions = questionsData?.items ?? [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;

  // Hydrate saved practice session from localStorage if available
  useEffect(() => {
    const saved = practiceSessionStorage.getSession(bankId);
    if (saved && Object.keys(saved.selectedAnswers || {}).length > 0) {
      if (saved.selectedAnswers) setSelectedAnswers(saved.selectedAnswers);
      if (saved.flaggedQuestionIds) setFlaggedQuestionIds(new Set(saved.flaggedQuestionIds));
      if (saved.revealedExplanations) setRevealedExplanations(saved.revealedExplanations);
      if (saved.eliminatedOptions) {
        const mapped: Record<string, Set<string>> = {};
        for (const [k, v] of Object.entries(saved.eliminatedOptions)) {
          mapped[k] = new Set(v);
        }
        setEliminatedOptions(mapped);
      }
      if (typeof saved.secondsElapsed === "number") setSecondsElapsed(saved.secondsElapsed);
      if (typeof saved.currentIndex === "number") setCurrentIndex(saved.currentIndex);
    }
  }, [bankId]);

  // Persist current practice state to localStorage
  useEffect(() => {
    if (isFinished || totalQuestions === 0) return;
    if (Object.keys(selectedAnswers).length === 0 && secondsElapsed === 0) return;

    const elimMap: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(eliminatedOptions)) {
      elimMap[k] = Array.from(v);
    }

    practiceSessionStorage.saveSession({
      bankId,
      bankTitle: bank?.name || "Practice Session",
      subjectCode: bank?.subject?.code,
      subjectName: bank?.subject?.name,
      currentIndex,
      selectedAnswers,
      flaggedQuestionIds: Array.from(flaggedQuestionIds),
      eliminatedOptions: elimMap,
      revealedExplanations,
      secondsElapsed,
      lastUpdated: Date.now(),
      totalQuestions,
    });
  }, [
    bankId,
    bank?.name,
    bank?.subject?.code,
    bank?.subject?.name,
    currentIndex,
    selectedAnswers,
    flaggedQuestionIds,
    eliminatedOptions,
    revealedExplanations,
    secondsElapsed,
    isFinished,
    totalQuestions,
  ]);

  useEffect(() => {
    if (!isTimerRunning || isFinished) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isFinished]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [secondsElapsed]);

  const handleSelectOption = useCallback(
    (optionKey: string) => {
      if (!currentQuestion) return;
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: optionKey,
      }));
    },
    [currentQuestion]
  );

  const handleClearCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      delete next[currentQuestion.id];
      return next;
    });
  }, [currentQuestion]);

  const handleToggleEliminateOption = useCallback(
    (optionKey: string) => {
      if (!currentQuestion) return;
      setEliminatedOptions((prev) => {
        const currentSet = new Set(prev[currentQuestion.id] || []);
        if (currentSet.has(optionKey)) {
          currentSet.delete(optionKey);
        } else {
          currentSet.add(optionKey);
        }
        return { ...prev, [currentQuestion.id]: currentSet };
      });
    },
    [currentQuestion]
  );

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    setFlaggedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id);
      } else {
        next.add(currentQuestion.id);
      }
      return next;
    });
  }, [currentQuestion]);

  const handleToggleExplanation = useCallback(() => {
    if (!currentQuestion) return;
    setRevealedExplanations((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  }, [currentQuestion]);

  const handleConfirmFinish = useCallback(() => {
    practiceSessionStorage.clearSession(bankId);
    setIsFinishConfirmOpen(false);
    setIsFinished(true);

    // Compute student response results and persist to database mastery
    const results = questions.map((q) => {
      const userAns = selectedAnswers[q.id];
      const defaultPts = Number(q.defaultPoints) || 1;
      let isCorrect = false;

      if (userAns) {
        if (q.type === "TRUE_FALSE") {
          const opt = q.options?.find((o) => o.text.toLowerCase() === userAns.toLowerCase());
          isCorrect = opt?.isCorrect ?? (userAns.toLowerCase() === "true");
        } else if (q.type === "NUMERIC") {
          const opt = q.options?.find((o) => o.isCorrect) || q.options?.[0];
          if (opt) {
            isCorrect = Number(userAns) === Number(opt.text);
          }
        } else {
          const opt = q.options?.find((o) => o.isCorrect) || q.options?.[0];
          if (opt) {
            isCorrect =
              userAns === opt.id ||
              userAns.toLowerCase() === opt.text?.toLowerCase();
          }
        }
      }

      return {
        questionId: q.id,
        isCorrect,
        awardedPoints: isCorrect ? defaultPts : 0,
        maxPoints: defaultPts,
        selectedOptionKey: userAns,
      };
    });

    if (results.length > 0) {
      recordEvidenceMutation.mutate({
        bankId,
        results,
      });
    }
  }, [bankId, questions, recordEvidenceMutation, selectedAnswers]);

  const handleRetake = () => {
    practiceSessionStorage.clearSession(bankId);
    setSelectedAnswers({});
    setFlaggedQuestionIds(new Set());
    setEliminatedOptions({});
    setRevealedExplanations({});
    setCurrentIndex(0);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setIsFinished(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished || isPaletteOpen || isFinishConfirmOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
      } else if (currentQuestion?.type === "TRUE_FALSE") {
        if (e.key.toLowerCase() === "t" || e.key === "1") {
          handleSelectOption("True");
        } else if (e.key.toLowerCase() === "f" || e.key === "2") {
          handleSelectOption("False");
        }
      } else if (["1", "2", "3", "4", "a", "b", "c", "d", "A", "B", "C", "D"].includes(e.key)) {
        if (!currentQuestion?.options || currentQuestion.options.length === 0) return;
        let optIndex = -1;
        if (["1", "a", "A"].includes(e.key)) optIndex = 0;
        if (["2", "b", "B"].includes(e.key)) optIndex = 1;
        if (["3", "c", "C"].includes(e.key)) optIndex = 2;
        if (["4", "d", "D"].includes(e.key)) optIndex = 3;

        const opt = currentQuestion.options[optIndex];
        if (opt) {
          handleSelectOption(opt.id || opt.text || String(optIndex));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFinished, isPaletteOpen, isFinishConfirmOpen, currentQuestion, totalQuestions, handleSelectOption]);

  if (isBankLoading || isQuestionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !bank) {
    return (
      <div className="max-w-3xl mx-auto p-6 min-h-screen flex flex-col justify-center">
        <ErrorAlert message={error?.message || "Failed to load practice questions."} />
        <div className="mt-4 text-center">
          <Link
            href={ROUTES.QUESTION_BANK.BANKS}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Question Banks</span>
          </Link>
        </div>
      </div>
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 min-h-screen flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-3">
          <Award size={24} />
        </div>
        <h2 className="text-base font-bold text-foreground mb-1">
          No Practice Questions Found
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          This question bank does not have any active published questions yet.
        </p>
        <Link
          href={ROUTES.QUESTION_BANK.BANKS}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Question Banks</span>
        </Link>
      </div>
    );
  }

  if (isFinished) {
    return (
      <PracticeSummaryReport
        bankTitle={bank.name}
        gradeLevel={bank.grade?.level}
        questions={questions}
        selectedAnswers={selectedAnswers}
        flaggedQuestionIds={flaggedQuestionIds}
        formattedTime={formattedTime}
        onRetake={handleRetake}
        onReviewIndex={(idx) => {
          setIsFinished(false);
          setCurrentIndex(idx);
        }}
      />
    );
  }

  const selectedOptionKey = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const isExplanationOpen = currentQuestion ? Boolean(revealedExplanations[currentQuestion.id]) : false;
  const isCurrentFlagged = currentQuestion ? flaggedQuestionIds.has(currentQuestion.id) : false;
  const currentEliminatedSet = (currentQuestion && eliminatedOptions[currentQuestion.id]) || new Set<string>();

  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <PracticeHeader
        bankTitle={bank.name}
        gradeLevel={bank.grade?.level}
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        formattedTime={formattedTime}
        isTimerRunning={isTimerRunning}
        onToggleTimer={() => setIsTimerRunning((prev) => !prev)}
        isCurrentFlagged={isCurrentFlagged}
        onToggleFlag={handleToggleFlag}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onFinish={() => setIsFinishConfirmOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {currentQuestion && (
          <PracticeQuestionCanvas
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionKey={selectedOptionKey}
            onSelectOption={handleSelectOption}
            eliminatedOptionKeys={currentEliminatedSet}
            onToggleEliminateOption={handleToggleEliminateOption}
            isExplanationOpen={isExplanationOpen}
            onToggleExplanation={handleToggleExplanation}
          />
        )}
      </main>

      <footer className="sticky bottom-0 z-30 bg-card/95 backdrop-blur-md border-t border-border px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="h-9 px-3.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted disabled:opacity-40 flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto max-w-md scrollbar-none py-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(selectedAnswers[q.id]);
              const isFlagged = flaggedQuestionIds.has(q.id);
              const isCurrent = idx === currentIndex;

              let dotStyle = "bg-muted text-muted-foreground border-border hover:bg-muted/80";
              if (isCurrent) {
                dotStyle = "bg-primary text-primary-foreground border-primary font-bold shadow-xs";
              } else if (isFlagged) {
                dotStyle = "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 font-semibold";
              } else if (isAnswered) {
                dotStyle = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 font-semibold";
              }

              return (
                <button
                  type="button"
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-[11px] font-mono border flex items-center justify-center shrink-0 transition-all cursor-pointer ${dotStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {Boolean(selectedOptionKey) && (
              <button
                type="button"
                onClick={handleClearCurrentAnswer}
                className="h-9 px-3 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-xs font-medium transition-colors cursor-pointer"
                title="Clear selected answer"
              >
                Clear
              </button>
            )}

            {currentIndex === totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setIsFinishConfirmOpen(true)}
                className="h-9 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Check size={16} />
                <span>Complete Practice</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(totalQuestions - 1, prev + 1)
                  )
                }
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Palette Drawer Modal */}
      <PracticePaletteDrawer
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        questions={questions}
        currentIndex={currentIndex}
        onSelectIndex={(idx) => setCurrentIndex(idx)}
        selectedAnswers={selectedAnswers}
        flaggedQuestionIds={flaggedQuestionIds}
        onFinish={() => {
          setIsPaletteOpen(false);
          setIsFinishConfirmOpen(true);
        }}
      />

      {/* Confirmation Modal Before Final Submission */}
      {isFinishConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-card rounded-3xl border border-border p-6 shadow-xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <Award size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground">
                Finish Practice Session?
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                You have answered <strong className="text-foreground">{answeredCount}</strong> of{" "}
                <strong className="text-foreground">{totalQuestions}</strong> questions.
                {unansweredCount > 0 && (
                  <span className="block text-amber-600 dark:text-amber-400 font-medium mt-1">
                    {unansweredCount} question{unansweredCount > 1 ? "s remain" : " remains"} unanswered.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFinishConfirmOpen(false)}
                className="flex-1 h-9 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition-colors cursor-pointer"
              >
                Review Questions
              </button>
              <button
                type="button"
                onClick={handleConfirmFinish}
                className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Submit & Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
