"use client";

import { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
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
} from "lucide-react";
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
  readonly isStudent?: boolean;
  readonly isSelected?: boolean;
  readonly onToggleSelect?: () => void;
  readonly selectedOptKey?: string;
  readonly onOptionSelect?: (questionId: string, optKey: string) => void;
  readonly isExplanationOpen?: boolean;
  readonly onToggleExplanation?: (questionId: string) => void;
  readonly onPreview: (question: QuestionListItem) => void;
  readonly onEdit: (question: QuestionListItem) => void;
  readonly onPublish: (id: string) => void;
  readonly onArchive: (id: string) => void;
  readonly onActivate: (id: string) => void;
  readonly onDelete: (id: string, code: string) => void;
  readonly onResolveReport?: (questionId: string, reportId: string) => void;
  readonly isBusy: boolean;
}

export function QuestionCardItem({
  question,
  qIndex,
  isStudent = false,
  isSelected = false,
  onToggleSelect,
  selectedOptKey,
  onOptionSelect,
  isExplanationOpen = false,
  onToggleExplanation,
  onPreview,
  onEdit,
  onPublish,
  onArchive,
  onActivate,
  onDelete,
  onResolveReport,
  isBusy,
}: QuestionCardItemProps) {
  const [showTeacherExplanation, setShowTeacherExplanation] = useState(false);
  const [showReportsPanel, setShowReportsPanel] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);

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

  const handleResolve = async (reportId: string) => {
    if (!onResolveReport) return;
    setResolvingReportId(reportId);
    try {
      await onResolveReport(question.id, reportId);
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
        {!isStudent && onToggleSelect && (
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
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
              #{qIndex + 1}
            </span>
            <QuestionTypeBadge type={question.type} />
            <QuestionDifficultyBadge difficulty={question.difficulty} />
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
              {question.defaultPoints} pt{question.defaultPoints === 1 ? "" : "s"}
            </span>
            {!isStudent && <QuestionStatusBadge status={question.status} />}
            {!isStudent && pendingReports.length > 0 && (
              <QuestionReportBadge
                count={pendingReports.length}
                onClick={() => setShowReportsPanel((prev) => !prev)}
              />
            )}
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
              <Calendar size={12} />
              <span>{formattedDate}</span>
            </span>
          </div>

          {(question.unit?.title || question.topic?.title || (question.source && question.source !== "TEACHER")) && (
            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
              {question.unit?.title && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium border border-blue-500/20">
                  <Layers size={11} />
                  <span>{question.unit.title}</span>
                </span>
              )}
              {question.topic?.title && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                  <Tag size={11} />
                  <span>Topic: {question.topic.title}</span>
                </span>
              )}
              {question.source && question.source !== "TEACHER" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 font-medium border border-amber-500/20">
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

        {!isStudent && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit(question)}
              className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Edit2 size={12} className="text-muted-foreground" />
              <span>Edit</span>
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
        )}
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
            const isSelected = selectedOptKey === optKey;

            let optionStyle =
              "bg-card border-border text-foreground hover:bg-muted/50 cursor-pointer";

            if (isStudent) {
              if (selectedOptKey) {
                if (isSelected) {
                  optionStyle = opt.isCorrect
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "bg-destructive/10 border-destructive text-destructive font-semibold";
                } else if (opt.isCorrect) {
                  optionStyle =
                    "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-400 font-medium";
                } else {
                  optionStyle =
                    "bg-card border-border text-muted-foreground opacity-50";
                }
              }
            } else {
              optionStyle = opt.isCorrect
                ? "bg-primary/5 border-primary/40 text-foreground font-medium"
                : "bg-card border-border text-muted-foreground";
            }

            return (
              <div
                key={optKey}
                onClick={() =>
                  isStudent && onOptionSelect?.(question.id, optKey)
                }
                className={`w-full text-left px-3 py-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${optionStyle} ${isStudent ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${opt.isCorrect && !isStudent ? "text-primary" : "text-muted-foreground"}`}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="break-words text-xs">{opt.text}</span>
                </div>

                {isStudent && selectedOptKey && isSelected && (
                  <span className="shrink-0">
                    {opt.isCorrect ? (
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    ) : (
                      <XCircle size={16} className="text-destructive" />
                    )}
                  </span>
                )}

                {isStudent && selectedOptKey && !isSelected && opt.isCorrect && (
                  <span className="shrink-0">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </span>
                )}

                {!isStudent && opt.isCorrect && (
                  <span className="h-5 px-1.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 flex items-center shrink-0">
                    Answer Key
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isStudent && showReportsPanel && pendingReports.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5 animate-in fade-in-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle size={13} />
              <span>Student Issue Reports ({pendingReports.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setShowReportsPanel(false)}
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Hide
            </button>
          </div>

          <div className="space-y-2">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
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
                    <p className="text-muted-foreground text-[11px]">
                      &ldquo;{report.comment}&rdquo;
                    </p>
                  )}
                </div>

                {onResolveReport && (
                  <button
                    type="button"
                    onClick={() => handleResolve(report.id)}
                    disabled={resolvingReportId === report.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shrink-0 disabled:opacity-60"
                  >
                    <Check size={12} />
                    <span>
                      {resolvingReportId === report.id
                        ? "Resolving..."
                        : "Mark Resolved"}
                    </span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isStudent && question.explanation && (
        <div className="pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowTeacherExplanation((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Lightbulb size={12} className="text-amber-500" />
            <span>
              {showTeacherExplanation
                ? "Hide Answer Explanation"
                : "View Answer Explanation"}
            </span>
            {showTeacherExplanation ? (
              <ChevronUp size={12} />
            ) : (
              <ChevronDown size={12} />
            )}
          </button>

          {showTeacherExplanation && (
            <div className="mt-2 p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed animate-in fade-in-0 duration-150">
              <strong className="text-foreground block mb-0.5">
                Answer Explanation:
              </strong>
              {question.explanation}
            </div>
          )}
        </div>
      )}

      {isStudent && (
        <div className="pt-2 border-t border-border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onToggleExplanation?.(question.id)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
            >
              <Lightbulb size={13} className="text-amber-500" />
              <span>
                {isExplanationOpen ? "Hide Explanation" : "View Explanation"}
              </span>
            </button>
            {selectedOptKey && (
              <span className="text-[11px] text-muted-foreground">Attempted</span>
            )}
          </div>

          {isExplanationOpen && (
            <div className="p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground leading-relaxed animate-in fade-in-0 duration-200">
              <strong className="text-foreground block mb-0.5">
                Explanation:
              </strong>
              {question.explanation ||
                "No explanation provided for this question."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
