"use client";

import React, { useState } from "react";
import { Sparkles, StopCircle, RefreshCw, BookOpen, X } from "lucide-react";
import { useExplanationStream } from "../hooks/useExplanationStream";
import { ErrorAlert } from "@/shared/components";

interface AiExplanationBoxProps {
  readonly questionId: string;
  readonly studentAnswer?: string;
  readonly defaultOpen?: boolean;
}

function sanitizeAiOutput(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/\*{3,}/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

export function AiExplanationBox({
  questionId,
  studentAnswer,
  defaultOpen = false,
}: AiExplanationBoxProps) {
  const { text, isStreaming, error, startStream, stopStream, reset } =
    useExplanationStream();
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const cleanedText = sanitizeAiOutput(text);

  const handleStart = () => {
    setIsOpen(true);
    startStream(questionId, studentAnswer);
  };

  const handleClose = () => {
    stopStream();
    reset();
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleStart}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:text-primary-foreground bg-primary/10 hover:bg-primary border border-primary/20 rounded-md transition-all shadow-xs cursor-pointer select-none"
        title="Get step-by-step help explaining this question"
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">Explain Question</span>
      </button>
    );
  }

  return (
    <div className="mt-3 p-3 sm:p-4 bg-card text-card-foreground border border-border rounded-xl shadow-xs w-full min-w-0">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-border flex-wrap">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 bg-primary text-primary-foreground rounded-md shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-foreground tracking-tight truncate">
            Explanation Assistant
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-primary bg-primary/15 rounded-full animate-pulse shrink-0">
              Writing...
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isStreaming ? (
            <button
              type="button"
              onClick={stopStream}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 border border-destructive/20 rounded-md transition-colors cursor-pointer"
            >
              <StopCircle className="w-3 h-3 text-destructive" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 border border-primary/20 rounded-md transition-colors cursor-pointer"
              title="Generate explanation again"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors cursor-pointer"
            title="Close explanation"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-2">
          <ErrorAlert message={error} />
        </div>
      )}

      {cleanedText ? (
        <div className="text-xs text-foreground/90 leading-relaxed space-y-2 whitespace-pre-wrap break-words font-sans">
          {cleanedText}
          {isStreaming && (
            <span className="inline-block w-1.5 h-3.5 ml-1 bg-primary animate-pulse align-middle" />
          )}
        </div>
      ) : isStreaming ? (
        <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
          <BookOpen className="w-4 h-4 text-primary animate-bounce shrink-0" />
          <span className="truncate">Preparing a clear step-by-step explanation...</span>
        </div>
      ) : null}
    </div>
  );
}
