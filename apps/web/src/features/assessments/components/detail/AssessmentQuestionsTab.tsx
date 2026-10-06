"use client";

import { useState, useMemo, useRef } from "react";
import {
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  Trash2,
  CheckSquare,
  Square,
  Binary,
  Lightbulb,
  Image as ImageIcon,
  AlertTriangle,
  Check,
  Filter,
  ChevronDown,
  RotateCcw,
  MessageSquare,
} from "lucide-react";
import { AssessmentQuestionItem } from "../../types/assessment.types";
import { QuestionListItem, QuestionReportItem } from "@/features/question-bank/types/question-bank.types";
import {
  QuestionTypeBadge,
  QuestionDifficultyBadge,
} from "@/features/question-bank/components/questions/QuestionBadges";
import { useClickOutside } from "@/shared/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import { questionBankService } from "@/features/question-bank/services/question-bank.service";

interface FilterOption {
  readonly label: string;
  readonly value: string;
}

interface FilterGroupItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: React.ElementType;
  readonly selectedValue: string;
  readonly onSelect: (val: string) => void;
  readonly options: readonly FilterOption[];
}

interface AssessmentQuestionFiltersToolbarProps {
  readonly filters: readonly FilterGroupItem[];
  readonly hasActiveFilters: boolean;
  readonly onResetAll: () => void;
  readonly resultCount?: number;
  readonly pendingReportsCount?: number;
  readonly onTogglePendingOnly?: () => void;
  readonly isPendingOnlyActive?: boolean;
}

function AssessmentQuestionFiltersToolbar({
  filters,
  hasActiveFilters,
  onResetAll,
  resultCount,
  pendingReportsCount = 0,
  onTogglePendingOnly,
  isPendingOnlyActive = false,
}: AssessmentQuestionFiltersToolbarProps) {
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpenFilterId(null));

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-between gap-2.5 flex-wrap w-full"
    >
      <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
        {filters.map((group, index) => {
          const isOpen = openFilterId === group.id;
          const selectedOption = group.options.find(
            (o) => o.value === group.selectedValue
          );
          const GroupIcon = group.icon || Filter;
          const isActive = Boolean(group.selectedValue && group.selectedValue !== "ALL");
          const isTrailing = index >= Math.max(1, filters.length - 2);

          return (
            <div key={group.id} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setOpenFilterId(isOpen ? null : group.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15"
                    : "bg-card text-foreground border-border hover:bg-muted"
                )}
              >
                <GroupIcon size={13} className={isActive ? "text-primary" : "text-muted-foreground"} />
                <span className={cn("font-medium", isActive ? "text-primary/80" : "text-muted-foreground")}>
                  {group.label}:
                </span>
                <span className={cn("font-semibold", isActive ? "text-primary" : "text-foreground")}>
                  {selectedOption ? selectedOption.label : "All"}
                </span>
                <ChevronDown
                  size={13}
                  className={cn(
                    "ml-0.5 transition-transform duration-150",
                    isOpen && "rotate-180",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </button>

              {isOpen && (
                <div
                  className={cn(
                    "absolute top-full mt-1.5 z-50 min-w-44 max-w-64 max-h-60 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95",
                    isTrailing ? "right-0" : "left-0"
                  )}
                >
                  {group.options.map((opt) => {
                    const isSelected = opt.value === group.selectedValue;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          group.onSelect(opt.value);
                          setOpenFilterId(null);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between gap-2 cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isSelected && <Check size={12} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {pendingReportsCount > 0 && onTogglePendingOnly && (
          <button
            type="button"
            onClick={onTogglePendingOnly}
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap",
              isPendingOnlyActive
                ? "bg-amber-500 text-white border-amber-600 dark:bg-amber-600"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
            )}
            title="Toggle questions needing feedback review"
          >
            <AlertTriangle size={13} />
            <span>{pendingReportsCount} Feedback Pending</span>
          </button>
        )}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 h-9 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shrink-0"
            title="Reset filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {resultCount !== undefined && (
        <span className="text-xs text-muted-foreground font-medium shrink-0 ml-auto">
          {resultCount} {resultCount === 1 ? "question" : "questions"}
        </span>
      )}
    </div>
  );
}

interface AssessmentQuestionsTabProps {
  readonly questions: readonly AssessmentQuestionItem[];
  readonly onOpenSelector: () => void;
  readonly onOpenAuthor: () => void;
  readonly onMoveQuestion: (index: number, direction: "up" | "down") => void;
  readonly onUpdatePoints: (questionVersionId: string, points: number) => void;
  readonly onRemoveQuestion: (questionVersionId: string) => void;
  readonly onBulkRemoveQuestions?: (questionVersionIds: string[]) => void;
  readonly onPreviewQuestion: (question: QuestionListItem) => void;
  readonly hasBankAvailable: boolean;
  readonly isBusy?: boolean;
}

export function AssessmentQuestionsTab({
  questions,
  onOpenSelector,
  onOpenAuthor,
  onMoveQuestion,
  onUpdatePoints,
  onRemoveQuestion,
  onBulkRemoveQuestions,
  onPreviewQuestion,
  hasBankAvailable,
  isBusy = false,
}: AssessmentQuestionsTabProps) {
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [feedbackFilter, setFeedbackFilter] = useState<"ALL" | "PENDING" | "RESOLVED">("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openExplanations, setOpenExplanations] = useState<Set<string>>(new Set());

  // Collapsible feedback drawer & report resolution state
  const [expandedReportsQuestionId, setExpandedReportsQuestionId] = useState<string | null>(null);
  const [activeResolvingId, setActiveResolvingId] = useState<string | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedReportIds, setResolvedReportIds] = useState<Set<string>>(new Set());

  const questionsWithPendingReports = useMemo(() => {
    return questions.filter((q) => {
      const v = q.questionVersion;
      const vConfig = v?.configuration && typeof v.configuration === "object" ? (v.configuration as Record<string, unknown>) : null;
      const reports = (vConfig && Array.isArray(vConfig.reports) ? vConfig.reports : []) as Array<Record<string, unknown>>;
      return reports.some((r) => r.status === "PENDING" && !resolvedReportIds.has(r.id as string));
    });
  }, [questions, resolvedReportIds]);

  const questionsWithResolvedReports = useMemo(() => {
    return questions.filter((q) => {
      const v = q.questionVersion;
      const vConfig = v?.configuration && typeof v.configuration === "object" ? (v.configuration as Record<string, unknown>) : null;
      const reports = (vConfig && Array.isArray(vConfig.reports) ? vConfig.reports : []) as Array<Record<string, unknown>>;
      return reports.some((r) => r.status === "RESOLVED" || resolvedReportIds.has(r.id as string));
    });
  }, [questions, resolvedReportIds]);

  const pendingReportsCount = questionsWithPendingReports.length;
  const resolvedReportsCount = questionsWithResolvedReports.length;

  const toolbarFilters: readonly FilterGroupItem[] = useMemo(() => {
    return [
      {
        id: "type",
        label: "Type",
        icon: CheckSquare,
        selectedValue: typeFilter,
        onSelect: (val) => setTypeFilter(val),
        options: [
          { label: "All Types", value: "ALL" },
          { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
          { label: "Multiple Response", value: "MULTIPLE_RESPONSE" },
          { label: "True / False", value: "TRUE_FALSE" },
          { label: "Short Answer", value: "SHORT_ANSWER" },
          { label: "Essay", value: "ESSAY" },
          { label: "Matching", value: "MATCHING" },
        ],
      },
      {
        id: "difficulty",
        label: "Difficulty",
        icon: Binary,
        selectedValue: difficultyFilter,
        onSelect: (val) => setDifficultyFilter(val),
        options: [
          { label: "All Difficulties", value: "ALL" },
          { label: "Easy", value: "EASY" },
          { label: "Medium", value: "MEDIUM" },
          { label: "Hard", value: "HARD" },
        ],
      },
      {
        id: "feedback",
        label: "Feedback",
        icon: MessageSquare,
        selectedValue: feedbackFilter,
        onSelect: (val) => setFeedbackFilter(val as typeof feedbackFilter),
        options: [
          { label: "All Questions", value: "ALL" },
          { label: `Needs Review (${pendingReportsCount})`, value: "PENDING" },
          { label: `Resolved (${resolvedReportsCount})`, value: "RESOLVED" },
        ],
      },
    ];
  }, [typeFilter, difficultyFilter, feedbackFilter, pendingReportsCount, resolvedReportsCount]);

  const hasActiveFilters = typeFilter !== "ALL" || difficultyFilter !== "ALL" || feedbackFilter !== "ALL";

  const handleResetFilters = () => {
    setTypeFilter("ALL");
    setDifficultyFilter("ALL");
    setFeedbackFilter("ALL");
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const v = q.questionVersion;
      if (!v) return true;
      if (typeFilter !== "ALL" && v.type !== typeFilter) {
        return false;
      }
      if (difficultyFilter !== "ALL" && v.difficulty !== difficultyFilter) {
        return false;
      }
      if (feedbackFilter === "PENDING") {
        const vConfig = v.configuration && typeof v.configuration === "object" ? (v.configuration as Record<string, unknown>) : null;
        const reports = (vConfig && Array.isArray(vConfig.reports) ? vConfig.reports : []) as Array<Record<string, unknown>>;
        return reports.some((r) => r.status === "PENDING" && !resolvedReportIds.has(r.id as string));
      }
      if (feedbackFilter === "RESOLVED") {
        const vConfig = v.configuration && typeof v.configuration === "object" ? (v.configuration as Record<string, unknown>) : null;
        const reports = (vConfig && Array.isArray(vConfig.reports) ? vConfig.reports : []) as Array<Record<string, unknown>>;
        return reports.some((r) => r.status === "RESOLVED" || resolvedReportIds.has(r.id as string));
      }
      return true;
    });
  }, [questions, typeFilter, difficultyFilter, feedbackFilter, resolvedReportIds]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map((q) => q.questionVersionId)));
    }
  };

  const handleBulkRemove = () => {
    if (!onBulkRemoveQuestions || selectedIds.size === 0) return;
    onBulkRemoveQuestions(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleResolveReport = async (questionId: string, reportId: string, note?: string) => {
    try {
      setIsResolving(true);
      await questionBankService.resolveQuestionReport(questionId, reportId, note);
      setResolvedReportIds((prev) => new Set(prev).add(reportId));
      setActiveResolvingId(null);
      setResolutionNoteInput("");
    } catch {
      // Graceful fallback
    } finally {
      setIsResolving(false);
    }
  };

  const handlePreview = (target: AssessmentQuestionItem, actualIdx: number) => {
    const v = target.questionVersion;
    if (v) {
      const vConfig = v.configuration && typeof v.configuration === "object" ? (v.configuration as Record<string, unknown>) : null;
      const rawReports = (vConfig && Array.isArray(vConfig.reports) ? vConfig.reports : []) as unknown as readonly QuestionReportItem[];
      const vReports = rawReports.map((r) =>
        resolvedReportIds.has(r.id) ? { ...r, status: "RESOLVED" as const } : r
      );

      onPreviewQuestion({
        id: target.questionVersionId,
        prompt: v.questionText || "Question Prompt",
        type: v.type,
        difficulty: v.difficulty || "MEDIUM",
        status: "APPROVED",
        defaultPoints: Number(target.points) || 1,
        code: `Q-${actualIdx + 1}`,
        currentVersionNumber: v.version,
        questionBankId: "",
        imageUrl: v.imageUrl || null,
        configuration: vConfig || undefined,
        reports: vReports,
        options: (v.options || []).map((o, oIdx) => ({
          id: o.id || String(oIdx),
          text: o.optionText,
          isCorrect: Boolean(o.isCorrect),
          orderIndex: o.orderIndex,
        })),
        explanation: v.explanation || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const toggleExplanation = (id: string) => {
    setOpenExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-card shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-3">
          <Layers size={24} />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">
          No Questions Added Yet
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mb-4">
          Add questions from your question bank or create a question directly.
        </p>
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          {hasBankAvailable && (
            <button
              type="button"
              onClick={onOpenAuthor}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={14} />
              <span>Question</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSelector}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted transition-colors shadow-2xs cursor-pointer"
          >
            <Layers size={14} className="text-primary" />
            <span>+ Add from Bank</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Responsive Filters Toolbar (No Search Bar) */}
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-3.5 shadow-xs">
        <AssessmentQuestionFiltersToolbar
          filters={toolbarFilters}
          hasActiveFilters={hasActiveFilters}
          onResetAll={handleResetFilters}
          resultCount={filteredQuestions.length}
          pendingReportsCount={pendingReportsCount}
          onTogglePendingOnly={() => setFeedbackFilter((prev) => (prev === "PENDING" ? "ALL" : "PENDING"))}
          isPendingOnlyActive={feedbackFilter === "PENDING"}
        />
      </div>

      {/* Bulk Selection & Management Toolbar */}
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            {selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0 ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} className="text-muted-foreground" />
            )}
            <span>
              {selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0
                ? "Deselect All"
                : "Select All"}
            </span>
          </button>

          <span className="text-xs text-muted-foreground font-medium">
            {selectedIds.size} of {filteredQuestions.length} selected
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            <button
              type="button"
              onClick={handleBulkRemove}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/30 transition-colors cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <Trash2 size={13} />
              <span>Remove Selected ({selectedIds.size})</span>
            </button>
          </div>
        )}
      </div>

      {/* Question List */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-border p-8 text-center bg-card shadow-xs">
          <p className="text-xs text-muted-foreground">
            No questions match your current filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const actualIndex = questions.findIndex(
              (item) => item.questionVersionId === q.questionVersionId
            );
            const version = q.questionVersion;
            const promptText = version?.questionText || "Question text unavailable";
            const isSelected = selectedIds.has(q.questionVersionId);
            const isExplanationOpen = openExplanations.has(q.questionVersionId);
            const isReportsExpanded = expandedReportsQuestionId === q.questionVersionId;

            const vConfig = version?.configuration && typeof version.configuration === "object" ? (version.configuration as Record<string, unknown>) : null;
            const rawReports = (vConfig && Array.isArray(vConfig.reports) ? vConfig.reports : []) as unknown as readonly QuestionReportItem[];
            const allReports = rawReports.map((r) =>
              resolvedReportIds.has(r.id) ? { ...r, status: "RESOLVED" as const } : r
            );
            const pendingList = allReports.filter((r) => r.status === "PENDING");
            const resolvedList = allReports.filter((r) => r.status === "RESOLVED");

            return (
              <div
                key={q.questionVersionId}
                className={cn(
                  "bg-card rounded-2xl border transition-all shadow-xs p-4 sm:p-4.5 space-y-3",
                  isSelected
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-border/90"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleSelect(q.questionVersionId)}
                    className="mt-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                    title={isSelected ? "Deselect question" : "Select question"}
                  >
                    {isSelected ? (
                      <CheckSquare size={16} className="text-primary" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {actualIndex + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          Question {actualIndex + 1}
                        </span>
                      </div>
                      {version?.type && <QuestionTypeBadge type={version.type} />}
                      {version?.difficulty && (
                        <QuestionDifficultyBadge difficulty={version.difficulty} />
                      )}

                      {/* Interactive Feedback Badges */}
                      {pendingList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedReportsQuestionId((prev) => (prev === q.questionVersionId ? null : q.questionVersionId))}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30 transition-colors cursor-pointer"
                          title="Click to view student feedback"
                        >
                          <AlertTriangle size={11} /> {pendingList.length} Feedback Pending
                        </button>
                      )}
                      {pendingList.length === 0 && resolvedList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setExpandedReportsQuestionId((prev) => (prev === q.questionVersionId ? null : q.questionVersionId))}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/20 transition-colors cursor-pointer"
                          title="Click to view resolved feedback"
                        >
                          <Check size={11} /> Feedback Resolved ({resolvedList.length})
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-foreground break-words leading-relaxed pt-1">
                      {promptText}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start shrink-0">
                    {/* Points Control */}
                    <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-xl border border-border">
                      <label className="text-[11px] font-semibold text-muted-foreground">
                        Pts:
                      </label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={Number(q.points) || 1}
                        onChange={(e) =>
                          onUpdatePoints(
                            q.questionVersionId,
                            Number(e.target.value)
                          )
                        }
                        className="w-14 px-1.5 py-0.5 text-xs rounded-lg border border-border bg-background text-foreground text-center font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Reorder Buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onMoveQuestion(actualIndex, "up")}
                        disabled={actualIndex === 0 || isBusy}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMoveQuestion(actualIndex, "down")}
                        disabled={actualIndex === questions.length - 1 || isBusy}
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => handlePreview(q, actualIndex)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Preview Question"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveQuestion(q.questionVersionId)}
                      disabled={isBusy}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer disabled:opacity-30"
                      title="Remove from assessment"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Collapsible Student Feedback Panel */}
                {isReportsExpanded && allReports.length > 0 && (
                  <div className="ml-7 p-3.5 rounded-xl bg-muted/40 border border-border space-y-3 animate-in fade-in-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-amber-500" />
                        <span>Student Feedback & Issue Reports</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedReportsQuestionId(null)}
                        className="text-[11px] text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                      >
                        Hide
                      </button>
                    </div>

                    {pendingList.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">
                          Pending Feedback ({pendingList.length})
                        </span>
                        {pendingList.map((report) => (
                          <div
                            key={report.id as string}
                            className="p-3 rounded-xl bg-card border border-border space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-foreground">
                                    {String(report.reason || "General")}
                                  </span>
                                  {report.studentName && (
                                    <span className="text-[10px] text-muted-foreground">
                                      by {String(report.studentName)}
                                    </span>
                                  )}
                                </div>
                                {report.comment && (
                                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                                    &ldquo;{String(report.comment)}&rdquo;
                                  </p>
                                )}
                              </div>

                              {activeResolvingId !== report.id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveResolvingId(report.id as string);
                                    setResolutionNoteInput("");
                                  }}
                                  disabled={isResolving}
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
                                  onChange={(e) => setResolutionNoteInput(e.target.value)}
                                  placeholder="e.g. Corrected typo in option B, verified answer key..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                />
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setActiveResolvingId(null)}
                                    className="px-2.5 py-1 rounded-lg text-xs border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleResolveReport(q.questionVersionId, report.id as string, resolutionNoteInput)}
                                    disabled={isResolving}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-60"
                                  >
                                    <Check size={12} />
                                    <span>{isResolving ? "Resolving..." : "Confirm Resolve"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {resolvedList.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
                          Resolved Feedback ({resolvedList.length})
                        </span>
                        {resolvedList.map((report) => (
                          <div
                            key={report.id as string}
                            className="p-2.5 rounded-xl bg-card border border-border/70 text-xs flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <span className="font-semibold text-foreground text-[11px]">
                                {String(report.reason || "General")}
                              </span>
                              {report.comment && (
                                <p className="text-muted-foreground text-[10px] truncate max-w-md">
                                  &ldquo;{String(report.comment)}&rdquo;
                                </p>
                              )}
                              {report.resolutionNote && (
                                <p className="text-emerald-600 dark:text-emerald-400 text-[10px] mt-0.5">
                                  Note: {String(report.resolutionNote)}
                                </p>
                              )}
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                              <Check size={11} /> Resolved
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Question Image Attachment */}
                {version?.imageUrl && (
                  <div className="ml-7 pt-1">
                    <div className="relative inline-block rounded-xl border border-border overflow-hidden max-h-40 max-w-xs shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={version.imageUrl}
                        alt="Question context"
                        className="object-cover max-h-40 w-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Options List */}
                {version?.options && version.options.length > 0 && (
                  <div className="ml-7 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {version.options.map((opt, oIdx) => {
                      const isCorrect = Boolean(opt.isCorrect);
                      return (
                        <div
                          key={opt.id || oIdx}
                          className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between gap-2 transition-all select-none ${
                            isCorrect
                              ? "bg-primary/5 border-primary/40 text-foreground font-medium"
                              : "bg-card border-border text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-start gap-2 min-w-0">
                            <span
                              className={`font-mono text-xs font-bold shrink-0 mt-0.5 ${
                                isCorrect ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="break-words text-xs">{opt.optionText}</span>
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

                {/* Explanation Toggle */}
                {version?.explanation && (
                  <div className="ml-7 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleExplanation(q.questionVersionId)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <Lightbulb size={12} />
                      <span>
                        {isExplanationOpen ? "Hide Explanation" : "View Explanation & Solution"}
                      </span>
                    </button>
                    {isExplanationOpen && (
                      <p className="mt-1.5 p-2.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
                        {version.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
