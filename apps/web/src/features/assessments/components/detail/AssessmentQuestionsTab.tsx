"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { AssessmentQuestionItem } from "../../types/assessment.types";
import { QuestionListItem } from "@/features/question-bank/types/question-bank.types";
import {
  QuestionTypeBadge,
  QuestionDifficultyBadge,
} from "@/features/question-bank/components/questions/QuestionBadges";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";

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
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openExplanations, setOpenExplanations] = useState<Set<string>>(new Set());

  const toolbarFilters: readonly FilterGroup[] = useMemo(() => {
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
    ];
  }, [typeFilter, difficultyFilter]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const v = q.questionVersion;
      if (!v) return true;
      if (search.trim()) {
        const query = search.toLowerCase();
        const text = (v.questionText || "").toLowerCase();
        if (!text.includes(query)) return false;
      }
      if (typeFilter !== "ALL" && v.type !== typeFilter) {
        return false;
      }
      if (difficultyFilter !== "ALL" && v.difficulty !== difficultyFilter) {
        return false;
      }
      return true;
    });
  }, [questions, search, typeFilter, difficultyFilter]);

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

  const handleBulkPreview = () => {
    const firstSelectedId = Array.from(selectedIds)[0];
    const target = questions.find((q) => q.questionVersionId === firstSelectedId) || questions[0];
    if (target?.questionVersion) {
      const v = target.questionVersion;
      const actualIdx = questions.findIndex((q) => q.questionVersionId === target.questionVersionId);
      onPreviewQuestion({
        id: v.questionId,
        prompt: v.questionText,
        type: v.type,
        difficulty: v.difficulty,
        status: "APPROVED",
        defaultPoints: Number(target.points) || 1,
        code: `Q-${actualIdx + 1}`,
        currentVersionNumber: v.version,
        questionBankId: "",
        imageUrl: v.imageUrl || null,
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
      {/* Search & Filters Toolbar */}
      <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search questions by text..."
          filters={toolbarFilters}
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
              onClick={handleBulkPreview}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
            >
              <Eye size={13} className="text-primary" />
              <span>Preview Selected</span>
            </button>

            {onBulkRemoveQuestions && (
              <button
                type="button"
                onClick={handleBulkRemove}
                disabled={isBusy}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>Remove Selected ({selectedIds.size})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            No questions match your current search or filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setTypeFilter("ALL");
              setDifficultyFilter("ALL");
            }}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => {
            const actualIndex = questions.findIndex((item) => item.questionVersionId === q.questionVersionId);
            const version = q.questionVersion;
            const promptText = version?.questionText || "Question text unavailable";
            const isSelected = selectedIds.has(q.questionVersionId);
            const isExplanationOpen = openExplanations.has(q.questionVersionId);

            return (
              <div
                key={q.questionVersionId}
                className={`rounded-2xl border p-4 transition-all duration-200 space-y-3 ${
                  isSelected
                    ? "bg-card border-primary/50 ring-1 ring-primary/20 shadow-xs"
                    : "bg-card border-border hover:border-primary/40 shadow-2xs"
                }`}
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
                    {version && (
                      <button
                        type="button"
                        onClick={() =>
                          onPreviewQuestion({
                            id: version.questionId,
                            prompt: version.questionText,
                            type: version.type,
                            difficulty: version.difficulty,
                            status: "APPROVED",
                            defaultPoints: Number(version.points) || 1,
                            code: `Q-${actualIndex + 1}`,
                            currentVersionNumber: version.version,
                            questionBankId: "",
                            imageUrl: version.imageUrl || null,
                            options: (version.options || []).map((o, oIdx) => ({
                              id: o.id || String(oIdx),
                              text: o.optionText,
                              isCorrect: Boolean(o.isCorrect),
                              orderIndex: o.orderIndex,
                            })),
                            explanation: version.explanation || null,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          })
                        }
                        className="h-8 w-8 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Preview question and solution"
                        aria-label="Preview question"
                      >
                        <Eye size={14} />
                      </button>
                    )}

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => onRemoveQuestion(q.questionVersionId)}
                      disabled={isBusy}
                      className="h-8 w-8 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50"
                      title="Remove from Assessment"
                      aria-label="Remove question"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Attached Diagram / Illustration */}
                {version?.imageUrl && (
                  <div className="ml-7 p-2.5 rounded-xl bg-muted/30 border border-border flex items-center gap-3">
                    <div className="h-16 w-24 rounded-lg bg-card border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={version.imageUrl}
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
                    </div>
                  </div>
                )}

                {/* Options Grid */}
                {version?.options && version.options.length > 0 && (
                  <div className="ml-7 pt-2.5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {version.options.map((opt, oIdx) => {
                      const isCorrect = opt.isCorrect;

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
