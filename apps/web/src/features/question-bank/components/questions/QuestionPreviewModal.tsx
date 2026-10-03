"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Sparkles,
  Edit2,
  Send,
  Archive,
  Layers,
  Tag,
  Bookmark,
} from "lucide-react";
import { QuestionListItem, QuestionDetailItem } from "../../types/question-bank.types";
import { buildOptionLabel } from "@/shared/utils/question.util";

interface QuestionPreviewModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly question: QuestionListItem | QuestionDetailItem | null;
  readonly onEdit?: (question: QuestionListItem | QuestionDetailItem) => void;
  readonly onPublish?: (id: string) => void;
  readonly onArchive?: (id: string) => void;
  readonly isStudent?: boolean;
}

export function QuestionPreviewModal({
  isOpen,
  onClose,
  question,
  onEdit,
  onPublish,
  onArchive,
  isStudent = false,
}: QuestionPreviewModalProps) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [revealSolution, setRevealSolution] = useState(false);

  if (!isOpen || !question) return null;

  const handleEditClick = () => {
    onClose();
    if (onEdit) {
      onEdit(question);
    }
  };

  const handlePublishClick = () => {
    if (onPublish) {
      onPublish(question.id);
      onClose();
    }
  };

  const handleArchiveClick = () => {
    if (onArchive) {
      onArchive(question.id);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Question Preview
                </h3>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                  {question.code}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {question.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {question.type} · {question.difficulty} · {question.defaultPoints} pt{question.defaultPoints === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {(question.unit?.title || question.topic?.title || (question.source && question.source !== "TEACHER")) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {question.unit?.title && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium border border-blue-500/20">
                  <Layers size={13} />
                  <span>{question.unit.title}</span>
                </span>
              )}
              {question.topic?.title && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                  <Tag size={13} />
                  <span>Topic: {question.topic.title}</span>
                </span>
              )}
              {question.source && question.source !== "TEACHER" && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/20">
                  <Bookmark size={13} />
                  <span>Source: {question.source.replace(/_/g, " ")}</span>
                </span>
              )}
            </div>
          )}

          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-foreground whitespace-pre-wrap break-words leading-relaxed">
              {question.prompt}
            </p>

            {(question.imageUrl || (question.configuration?.imageUrl as string)) && (
              <div className="p-2 rounded-xl bg-card border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    question.imageUrl ||
                    (question.configuration?.imageUrl as string)
                  }
                  alt="Question Diagram"
                  className="max-h-56 mx-auto object-contain rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {question.options && question.options.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-foreground">
                Options:
              </div>
              {question.options.map((option, index) => {
                const label = buildOptionLabel(index);
                const isSelected = selectedOptionIndex === index;
                const isCorrect = option.isCorrect;

                let style = "bg-card border-border hover:bg-muted/30 text-foreground";
                if (revealSolution) {
                  if (isCorrect) {
                    style = "bg-primary/10 border-primary/50 text-foreground font-semibold ring-1 ring-primary/20";
                  } else if (isSelected && !isCorrect) {
                    style = "bg-destructive/10 border-destructive/30 text-destructive";
                  }
                } else if (isSelected) {
                  style = "bg-muted border-foreground/30 text-foreground font-semibold";
                }

                return (
                  <button
                    key={option.id || index}
                    type="button"
                    onClick={() => setSelectedOptionIndex(index)}
                    className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${style}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-muted-foreground shrink-0">
                        {label}.
                      </span>
                      <span className="truncate">{option.text}</span>
                    </div>

                    {revealSolution && isCorrect && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-primary shrink-0">
                        <CheckCircle2 size={14} />
                        Correct
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {question.hint && (
            <div className="p-3 rounded-xl border border-border bg-card text-xs text-muted-foreground">
              <strong className="text-foreground">Hint:</strong> {question.hint}
            </div>
          )}

          {revealSolution && question.explanation && (
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1 animate-in fade-in-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Sparkles size={14} className="text-primary" />
                <span>Answer Explanation</span>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-border bg-card/50 flex items-center justify-between gap-2.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setRevealSolution((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted border border-border rounded-xl transition-colors cursor-pointer"
          >
            {revealSolution ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{revealSolution ? "Hide Answer" : "Show Answer Key"}</span>
          </button>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {!isStudent && onEdit && (
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Question</span>
              </button>
            )}

            {!isStudent && onPublish && question.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={handlePublishClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send size={13} />
                <span>Publish</span>
              </button>
            )}

            {!isStudent && onArchive && question.status === "PUBLISHED" && (
              <button
                type="button"
                onClick={handleArchiveClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <Archive size={13} />
                <span>Archive</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

