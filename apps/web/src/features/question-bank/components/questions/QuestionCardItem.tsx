"use client";

import { useState } from "react";
import {
  Calendar,
  Lightbulb,
  Image as ImageIcon,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  CheckSquare,
  Square,
  Layers,
  Tag,
  Bookmark,
  AlertCircle,
} from "lucide-react";
import { getErrorMessage } from "@/shared/utils";
import { QuestionListItem } from "../../types/question-bank.types";
import {
  QuestionTypeBadge,
  QuestionDifficultyBadge,
  QuestionStatusBadge,
  QuestionReportBadge,
} from "./QuestionBadges";
import { QuestionRowActions } from "./QuestionRowActions";

interface QuestionCardItemProps {
  readonly question: QuestionListItem;
  readonly qIndex: number;
  readonly isSelected?: boolean;
  readonly onToggleSelect?: () => void;
  readonly onPreview: (question: QuestionListItem) => void;
  readonly onEdit: (question: QuestionListItem) => void;
  readonly onPublish: (id: string) => void;
  readonly onArchive: (id: string) => void;
  readonly onActivate: (id: string) => void;
  readonly onDelete: (id: string, code: string) => void;
  readonly onResolveReport?: (
    questionId: string,
    reportId: string,
    resolutionNote?: string
  ) => Promise<void> | void;
  readonly isBusy: boolean;
}

export function QuestionCardItem({
  question,
  qIndex,
  isSelected = false,
  onToggleSelect,
  onPreview,
  onEdit,
  onPublish,
  onArchive,
  onActivate,
  onDelete,
  onResolveReport,
  isBusy,
}: QuestionCardItemProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const [showReportsPanel, setShowReportsPanel] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
  const [activeResolvingId, setActiveResolvingId] = useState<string | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState<string>("");
  const [resolveErrorMessage, setResolveErrorMessage] = useState<string | null>(null);

  const formattedDate = question.createdAt
    ? new Date(question.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const imageUrl =
    question.imageUrl ||
    (typeof question.configuration?.imageUrl === "string"
      ? question.configuration.imageUrl
      : null);

  const pendingReports = (question.reports || []).filter(
    (r) => r.status === "PENDING"
  );
  const resolvedReports = (question.reports || []).filter(
    (r) => r.status === "RESOLVED"
  );

  const handleResolve = async (reportId: string, note?: string) => {
    if (!onResolveReport) return;
    setResolvingReportId(reportId);
    setResolveErrorMessage(null);
    try {
      await onResolveReport(question.id, reportId, note);
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

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-200 space-y-3 ${
        isSelected
          ? "bg-card border-primary/50 ring-1 ring-primary/20 shadow-xs"
          : "bg-card border-border hover:border-primary/40 shadow-2xs"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {onToggleSelect && (
          <button
            type="button"
            onClick={onToggleSelect}
            className="mt-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            title={isSelected ? "Deselect question" : "Select question"}
          >
            {isSelected ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} />
            )}
          </button>
        )}

        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                {qIndex + 1}
              </span>
              <span className="text-xs font-bold text-foreground">
                Question {qIndex + 1}
              </span>
            </div>
            <QuestionTypeBadge type={question.type} />
            <QuestionDifficultyBadge difficulty={question.difficulty} />
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
              {question.defaultPoints} pt{question.defaultPoints === 1 ? "" : "s"}
            </span>
            <QuestionStatusBadge status={question.status} />
            {pendingReports.length > 0 && (
              <QuestionReportBadge
                count={pendingReports.length}
                onClick={() => setShowReportsPanel((prev) => !prev)}
              />
            )}
            {pendingReports.length === 0 && resolvedReports.length > 0 && (
              <button
                type="button"
                onClick={() => setShowReportsPanel((prev) => !prev)}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                title="View resolved feedback"
              >
                <Check size={11} /> Feedback Resolved ({resolvedReports.length})
              </button>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </span>
          </div>

          {(question.unit?.title || question.topic?.title || (question.source && question.source !== "TEACHER")) && (
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {question.unit?.title && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium border border-primary/20">
                  <Layers size={11} />
                  <span>{question.unit.title}</span>
                </span>
              )}
              {question.topic?.title && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground font-semibold border border-border">
                  <Tag size={11} />
                  <span>Topic: {question.topic.title}</span>
                </span>
              )}
              {question.source && question.source !== "TEACHER" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium border border-border">
                  <Bookmark size={11} />
                  <span>{question.source.replace(/_/g, " ")}</span>
                </span>
              )}
            </div>
          )}

          <p className="text-xs sm:text-sm font-semibold text-foreground break-words leading-relaxed">
            {question.prompt}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(question)}
            className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Edit2 size={12} className="text-muted-foreground" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <QuestionRowActions
            question={question}
            onPreview={onPreview}
            onEdit={onEdit}
            onPublish={onPublish}
            onArchive={onArchive}
            onActivate={onActivate}
            onDelete={onDelete}
            isBusy={isBusy}
          />
        </div>
      </div>

      {imageUrl && (
        <div className="p-2.5 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
          <div className="h-16 w-24 rounded-lg bg-card border border-border overflow-hidden flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Question Diagram"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div className="text-[11px] text-muted-foreground min-w-0">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <ImageIcon size={12} className="text-primary" />
              <span>Attached Diagram / Illustration</span>
            </span>
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline truncate block mt-0.5"
            >
              View Full Image
            </a>
          </div>
        </div>
      )}

      {question.options && question.options.length > 0 && (
        <div className="pt-2.5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {question.options.map((opt, idx) => {
            const optKey = opt.id || opt.text || String(idx);
            const isCorrect = opt.isCorrect;

            return (
              <div
                key={optKey}
                className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${
                  isCorrect
                    ? "bg-primary/5 border-primary/40 text-foreground font-medium"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${
                      isCorrect ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="break-words text-xs">{opt.text}</span>
                </div>

                {isCorrect && (
                  <span className="h-5 px-1.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center shrink-0">
                    Answer Key
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showReportsPanel && (pendingReports.length > 0 || resolvedReports.length > 0) && (
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3 animate-in fade-in-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-500" />
              <span>Student Feedback & Issue Reports</span>
            </span>
            <button
              type="button"
              onClick={() => setShowReportsPanel(false)}
              className="text-[11px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
            >
              Hide
            </button>
          </div>

          {pendingReports.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">
                Pending Feedback ({pendingReports.length})
              </span>
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3 rounded-xl bg-card border border-border space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {report.reason}
                        </span>
                        {report.studentName && (
                          <span className="text-[10px] text-muted-foreground">
                            by {report.studentName}
                          </span>
                        )}
                      </div>
                      {report.comment && (
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          &ldquo;{report.comment}&rdquo;
                        </p>
                      )}
                    </div>

                    {onResolveReport && activeResolvingId !== report.id && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveResolvingId(report.id);
                          setResolutionNoteInput("");
                          setResolveErrorMessage(null);
                        }}
                        disabled={resolvingReportId === report.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                      >
                        <Check size={12} />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>

                  {activeResolvingId === report.id && (
                    <div className="pt-2 border-t border-border space-y-2">
                      <label className="text-[11px] font-medium text-foreground block">
                        Resolution Note (Optional reply to student):
                      </label>
                      <input
                        type="text"
                        value={resolutionNoteInput}
                        onChange={(e) => {
                          setResolutionNoteInput(e.target.value);
                          if (resolveErrorMessage) setResolveErrorMessage(null);
                        }}
                        placeholder="e.g. Corrected typo in option B, verified answer key..."
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
                          onClick={() => handleResolve(report.id, resolutionNoteInput)}
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
            <div className="pt-2 border-t border-border/50 space-y-1.5">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                Resolved Feedback ({resolvedReports.length})
              </span>
              {resolvedReports.map((report) => (
                <div
                  key={report.id}
                  className="p-2.5 rounded-lg bg-card/60 border border-border/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-medium text-foreground">
                      {report.reason} {report.studentName ? `by ${report.studentName}` : ""}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      Resolved
                    </span>
                  </div>
                  {report.comment && (
                    <p className="text-muted-foreground text-[11px] italic">
                      &ldquo;{report.comment}&rdquo;
                    </p>
                  )}
                  {report.resolutionNote && (
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

      {question.explanation && (
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Lightbulb size={12} className="text-amber-500" />
            <span>
              {showExplanation
                ? "Hide Answer Explanation"
                : "View Answer Explanation"}
            </span>
            {showExplanation ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>

          {showExplanation && (
            <div className="mt-2 p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed animate-in fade-in-0 duration-150">
              <strong className="text-foreground block mb-0.5">
                Answer Explanation:
              </strong>
              {question.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
