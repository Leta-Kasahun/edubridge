"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  HelpCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  Lightbulb,
  Edit2,
  Send,
  Archive,
  Layers,
  Tag,
  Bookmark,
  MessageSquare,
  Check,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { QuestionListItem, QuestionDetailItem, QuestionReportItem } from "../../types/question-bank.types";
import { buildOptionLabel } from "@/shared/utils/question.util";
import { getErrorMessage } from "@/shared/utils";
import { AiExplanationBox } from "@/features/ai";

interface QuestionPreviewModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly question: QuestionListItem | QuestionDetailItem | null;
  readonly onEdit?: (question: QuestionListItem | QuestionDetailItem) => void;
  readonly onPublish?: (id: string) => void;
  readonly onArchive?: (id: string) => void;
  readonly onResolveReport?: (
    questionId: string,
    reportId: string,
    resolutionNote?: string
  ) => Promise<void> | void;
}

export function QuestionPreviewModal({
  isOpen,
  onClose,
  question,
  onEdit,
  onPublish,
  onArchive,
  onResolveReport,
}: QuestionPreviewModalProps) {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [revealSolution, setRevealSolution] = useState(false);
  const [activeResolvingId, setActiveResolvingId] = useState<string | null>(null);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState<string>("");
  const [resolveErrorMessage, setResolveErrorMessage] = useState<string | null>(null);
  const [localReports, setLocalReports] = useState<readonly QuestionReportItem[] | null>(null);

  if (!isOpen || !question) return null;

  const rawReports: readonly QuestionReportItem[] =
    localReports ||
    question.reports ||
    ((question.configuration as Record<string, unknown>)?.reports as readonly QuestionReportItem[]) ||
    [];
  const pendingReports = rawReports.filter((r) => r.status === "PENDING");
  const resolvedReports = rawReports.filter((r) => r.status === "RESOLVED");

  const handleResolve = async (reportId: string, note?: string) => {
    if (!onResolveReport) return;
    setResolvingReportId(reportId);
    setResolveErrorMessage(null);
    try {
      await onResolveReport(question.id, reportId, note);
      setLocalReports((prev) => {
        const base = prev || rawReports;
        return base.map((r) =>
          r.id === reportId
            ? { ...r, status: "RESOLVED", resolutionNote: note?.trim() || undefined, resolvedAt: new Date().toISOString() }
            : r
        );
      });
      setActiveResolvingId(null);
      setResolutionNoteInput("");
    } catch (err: unknown) {
      setResolveErrorMessage(
        getErrorMessage(
          err,
          "Unable to resolve feedback report right now. Please try again."
        )
      );
    } finally {
      setResolvingReportId(null);
    }
  };

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
                {pendingReports.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                    <AlertTriangle size={11} /> {pendingReports.length} Feedback Pending
                  </span>
                )}
                {pendingReports.length === 0 && resolvedReports.length > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    <Check size={11} /> Feedback Resolved ({resolvedReports.length})
                  </span>
                )}
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
                <Lightbulb size={14} className="text-amber-500" />
                <span>Answer Explanation</span>
              </div>
              <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {/* AI Concept Explanation */}
          <div className="pt-1">
            <AiExplanationBox questionId={question.id} />
          </div>

          {/* Student Feedback & Reports Panel */}
          {(pendingReports.length > 0 || resolvedReports.length > 0) && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-amber-500" />
                  <span>Student Feedback ({pendingReports.length} pending)</span>
                </span>
              </div>

              {pendingReports.length > 0 && (
                <div className="space-y-2.5">
                  {pendingReports.map((report) => (
                    <div
                      key={String(report.id)}
                      className="p-3 rounded-xl bg-card border border-border space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">
                          {String(report.reason || "Feedback")}
                          {report.studentName ? ` · by ${String(report.studentName)}` : ""}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          Pending Review
                        </span>
                      </div>
                      {Boolean(report.comment) && (
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          &ldquo;{report.comment}&rdquo;
                        </p>
                      )}

                      {onResolveReport && activeResolvingId !== report.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveResolvingId(String(report.id));
                            setResolutionNoteInput("");
                            setResolveErrorMessage(null);
                          }}
                          disabled={resolvingReportId === report.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-60"
                        >
                          <Check size={12} />
                          <span>Resolve</span>
                        </button>
                      )}

                      {activeResolvingId === report.id && (
                        <div className="pt-2 border-t border-border space-y-2">
                          <label className="text-[11px] font-medium text-foreground block">
                            Teacher Response Note (Optional):
                          </label>
                          <input
                            type="text"
                            value={resolutionNoteInput}
                            onChange={(e) => {
                              setResolutionNoteInput(e.target.value);
                              if (resolveErrorMessage) setResolveErrorMessage(null);
                            }}
                            placeholder="e.g. Corrected typo in option B, answer verified..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                          />
                          {resolveErrorMessage && (
                            <div className="text-[11px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2.5 flex items-start gap-2 animate-in fade-in-0">
                              <AlertCircle size={14} className="shrink-0 mt-0.5 text-destructive" />
                              <span>{resolveErrorMessage}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveResolvingId(null);
                                setResolveErrorMessage(null);
                              }}
                              className="px-2.5 py-1 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResolve(String(report.id), resolutionNoteInput)}
                              disabled={resolvingReportId === report.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-60"
                            >
                              <Check size={12} />
                              <span>{resolvingReportId === report.id ? "Resolving..." : "Confirm Resolve"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {resolvedReports.length > 0 && (
                <div className="pt-2 border-t border-border/50 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                    Resolved Feedback ({resolvedReports.length})
                  </span>
                  {resolvedReports.map((report) => (
                    <div
                      key={String(report.id)}
                      className="p-2.5 rounded-lg bg-card/60 border border-border/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-medium text-foreground">
                          {String(report.reason || "Feedback")}
                          {report.studentName ? ` · by ${String(report.studentName)}` : ""}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          Resolved
                        </span>
                      </div>
                      {Boolean(report.comment) && (
                        <p className="text-muted-foreground text-[11px] italic">
                          &ldquo;{report.comment}&rdquo;
                        </p>
                      )}
                      {Boolean(report.resolutionNote) && (
                        <p className="text-foreground text-[11px] font-medium bg-muted/50 p-1.5 rounded-md">
                          Teacher response: {report.resolutionNote}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
            {onEdit && (
              <button
                type="button"
                onClick={handleEditClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Question</span>
              </button>
            )}

            {onPublish && question.status !== "PUBLISHED" && (
              <button
                type="button"
                onClick={handlePublishClick}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send size={13} />
                <span>Publish</span>
              </button>
            )}

            {onArchive && question.status === "PUBLISHED" && (
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

