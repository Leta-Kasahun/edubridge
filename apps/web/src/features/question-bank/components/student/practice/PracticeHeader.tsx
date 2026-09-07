"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Timer,
  Pause,
  Play,
  Bookmark,
  BookmarkCheck,
  Grid,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

interface PracticeHeaderProps {
  readonly bankTitle: string;
  readonly gradeLevel?: number | null;
  readonly currentIndex: number;
  readonly totalQuestions: number;
  readonly formattedTime: string;
  readonly isTimerRunning: boolean;
  readonly onToggleTimer: () => void;
  readonly isCurrentFlagged: boolean;
  readonly onToggleFlag: () => void;
  readonly onOpenPalette: () => void;
  readonly onFinish: () => void;
}

export function PracticeHeader({
  bankTitle,
  gradeLevel,
  currentIndex,
  totalQuestions,
  formattedTime,
  isTimerRunning,
  onToggleTimer,
  isCurrentFlagged,
  onToggleFlag,
  onOpenPalette,
  onFinish,
}: PracticeHeaderProps): React.JSX.Element {
  const progressPercent = totalQuestions > 0
    ? Math.round(((currentIndex + 1) / totalQuestions) * 100)
    : 0;

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={ROUTES.QUESTION_BANK.BANKS}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
            title="Exit Practice"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-foreground truncate">
              {bankTitle}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Question {currentIndex + 1} of {totalQuestions}</span>
              {gradeLevel && (
                <>
                  <span>•</span>
                  <span>Grade {gradeLevel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onToggleFlag}
            className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              isCurrentFlagged
                ? "bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 font-semibold"
                : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title="Flag question for review"
          >
            {isCurrentFlagged ? (
              <BookmarkCheck size={14} className="text-amber-500" />
            ) : (
              <Bookmark size={14} />
            )}
            <span className="hidden md:inline">
              {isCurrentFlagged ? "Flagged" : "Flag"}
            </span>
          </button>

          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-mono font-semibold text-foreground">
            <Timer size={13} className="text-primary" />
            <span>{formattedTime}</span>
            <button
              type="button"
              onClick={onToggleTimer}
              className="ml-1 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
            >
              {isTimerRunning ? <Pause size={11} /> : <Play size={11} />}
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenPalette}
            className="p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer sm:hidden"
            title="Question Palette"
          >
            <Grid size={15} />
          </button>

          <button
            type="button"
            onClick={onFinish}
            className="h-8.5 px-3.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
          >
            Finish
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-2.5">
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
}
