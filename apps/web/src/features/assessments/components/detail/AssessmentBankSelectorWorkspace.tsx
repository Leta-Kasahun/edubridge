"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Eye,
  BookOpen,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { AssessmentItem } from "../../types/assessment.types";
import {
  QuestionBankItem,
  QuestionListItem,
} from "@/features/question-bank/types/question-bank.types";
import { useQuestions } from "@/features/question-bank/hooks/useQuestions";
import {
  QuestionTypeBadge,
  QuestionDifficultyBadge,
} from "@/features/question-bank/components/questions/QuestionBadges";
import { QuestionPreviewModal } from "@/features/question-bank/components/questions/QuestionPreviewModal";
import { QuestionFormModal } from "@/features/question-bank/components/questions/QuestionFormModal";

interface SelectedQuestionAllocation {
  questionVersionId: string;
  points: number;
  orderIndex: number;
}

interface AssessmentBankSelectorWorkspaceProps {
  readonly assessment: AssessmentItem;
  readonly questionBanks: readonly QuestionBankItem[];
  readonly onCancel: () => void;
  readonly onSave: (
    questions: Array<{ questionVersionId: string; orderIndex: number; points: number }>
  ) => Promise<void>;
  readonly isSaving?: boolean;
}

const DIFFICULTY_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "ALL", label: "All Difficulties" },
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
];

const TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "ALL", label: "All Formats" },
  { value: "MCQ", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "LONG_ANSWER", label: "Essay / Open" },
  { value: "NUMERIC", label: "Numeric" },
  { value: "MATCHING", label: "Matching" },
  { value: "ORDERING", label: "Ordering" },
];

type ScopeFilter = "ALL" | "IN_ASSESSMENT" | "UNSELECTED";

export function AssessmentBankSelectorWorkspace({
  assessment,
  questionBanks,
  onCancel,
  onSave,
  isSaving = false,
}: AssessmentBankSelectorWorkspaceProps) {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(
    questionBanks[0]?.id || null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("ALL");
  const [batchPoints, setBatchPoints] = useState<string>("1");
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [previewingQuestion, setPreviewingQuestion] = useState<QuestionListItem | null>(null);
  const [isAuthoringQuestion, setIsAuthoringQuestion] = useState(false);
  const [openExplanations, setOpenExplanations] = useState<Set<string>>(new Set());

  // Track initial IDs present in the assessment
  const initialIds = useMemo(() => {
    return new Set((assessment.questions || []).map((q) => q.questionVersionId));
  }, [assessment.questions]);

  const currentBank = useMemo(() => {
    return questionBanks.find((b) => b.id === selectedBankId) || questionBanks[0] || null;
  }, [questionBanks, selectedBankId]);

  const { data: questionsData, isLoading: isLoadingQuestions } = useQuestions(
    selectedBankId || ""
  );
  const availableQuestions = useMemo(() => questionsData?.items || [], [questionsData]);

  // Questions allocated to this assessment
  const [allocations, setAllocations] = useState<Map<string, SelectedQuestionAllocation>>(() => {
    const map = new Map<string, SelectedQuestionAllocation>();
    (assessment.questions || []).forEach((q) => {
      map.set(q.questionVersionId, {
        questionVersionId: q.questionVersionId,
        points: Number(q.points) || 1,
        orderIndex: q.orderIndex,
      });
    });
    return map;
  });

  const getQuestionVersionId = (q: QuestionListItem): string => {
    return q.latestVersionId || q.versionId || q.id;
  };

  // Filter questions based on scope, difficulty, and type
  const filteredQuestions = useMemo(() => {
    return availableQuestions.filter((q) => {
      const versionId = getQuestionVersionId(q);
      const isAllocated = Boolean(versionId && allocations.has(versionId));

      if (scopeFilter === "IN_ASSESSMENT" && !isAllocated) {
        return false;
      }
      if (scopeFilter === "UNSELECTED" && isAllocated) {
        return false;
      }
      if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedType !== "ALL" && q.type !== selectedType) {
        return false;
      }
      return true;
    });
  }, [availableQuestions, allocations, scopeFilter, selectedDifficulty, selectedType]);

  const inAssessmentCount = useMemo(() => {
    return availableQuestions.filter((q) => {
      const vId = getQuestionVersionId(q);
      return vId && allocations.has(vId);
    }).length;
  }, [availableQuestions, allocations]);

  const unselectedCount = availableQuestions.length - inAssessmentCount;

  // Selected counts within current filtered list
  const unaddedSelectedCount = useMemo(() => {
    return filteredQuestions.filter((q) => {
      const vId = getQuestionVersionId(q);
      return vId && selectedQuestionIds.has(vId) && !allocations.has(vId);
    }).length;
  }, [filteredQuestions, selectedQuestionIds, allocations]);

  const addedSelectedCount = useMemo(() => {
    return filteredQuestions.filter((q) => {
      const vId = getQuestionVersionId(q);
      return vId && selectedQuestionIds.has(vId) && allocations.has(vId);
    }).length;
  }, [filteredQuestions, selectedQuestionIds, allocations]);

  const unaddedFilteredCount = useMemo(() => {
    return filteredQuestions.filter((q) => {
      const vId = getQuestionVersionId(q);
      return vId && !allocations.has(vId);
    }).length;
  }, [filteredQuestions, allocations]);

  const isAllFilteredSelected =
    filteredQuestions.length > 0 &&
    filteredQuestions.every((q) => {
      const vId = getQuestionVersionId(q);
      return vId && selectedQuestionIds.has(vId);
    });

  // Toggle selection checkbox for batch actions
  const handleToggleSelect = (versionId: string) => {
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.add(versionId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedQuestionIds(new Set());
    } else {
      setSelectedQuestionIds(
        new Set(filteredQuestions.map((q) => getQuestionVersionId(q)).filter(Boolean))
      );
    }
  };

  // Add individual question to assessment
  const handleAddQuestion = (q: QuestionListItem) => {
    const versionId = getQuestionVersionId(q);
    if (!versionId) return;

    const pts = Math.max(0.5, Number(batchPoints) || Number(q.defaultPoints) || 1);
    setAllocations((prev) => {
      const next = new Map(prev);
      next.set(versionId, {
        questionVersionId: versionId,
        points: pts,
        orderIndex: next.size + 1,
      });
      return next;
    });

    // Also mark selected
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      next.add(versionId);
      return next;
    });
  };

  // Remove individual question from assessment
  const handleRemoveQuestion = (versionId: string) => {
    setAllocations((prev) => {
      const next = new Map(prev);
      next.delete(versionId);
      return next;
    });
  };

  // Bulk add selected questions to assessment
  const handleAddSelected = () => {
    const pts = Math.max(0.5, Number(batchPoints) || 1);
    setAllocations((prev) => {
      const next = new Map(prev);
      filteredQuestions.forEach((q) => {
        const vId = getQuestionVersionId(q);
        if (vId && selectedQuestionIds.has(vId) && !next.has(vId)) {
          next.set(vId, {
            questionVersionId: vId,
            points: Number(q.defaultPoints) || pts,
            orderIndex: next.size + 1,
          });
        }
      });
      return next;
    });
  };

  // Bulk remove selected questions from assessment
  const handleRemoveSelected = () => {
    setAllocations((prev) => {
      const next = new Map(prev);
      filteredQuestions.forEach((q) => {
        const vId = getQuestionVersionId(q);
        if (vId && selectedQuestionIds.has(vId)) {
          next.delete(vId);
        }
      });
      return next;
    });
  };

  // Add all filtered questions to assessment
  const handleAddAllFiltered = () => {
    const pts = Math.max(0.5, Number(batchPoints) || 1);
    setAllocations((prev) => {
      const next = new Map(prev);
      filteredQuestions.forEach((q) => {
        const vId = getQuestionVersionId(q);
        if (vId && !next.has(vId)) {
          next.set(vId, {
            questionVersionId: vId,
            points: Number(q.defaultPoints) || pts,
            orderIndex: next.size + 1,
          });
        }
      });
      return next;
    });
  };

  // Apply batch points to selected questions or all allocated questions
  const applyBatchPoints = () => {
    const pts = Math.max(0.5, Number(batchPoints) || 1);
    setAllocations((prev) => {
      const next = new Map(prev);

      if (selectedQuestionIds.size > 0) {
        // Apply points to all selected questions in the current filtered view
        filteredQuestions.forEach((q) => {
          const vId = getQuestionVersionId(q);
          if (vId && selectedQuestionIds.has(vId)) {
            const existing = next.get(vId);
            next.set(vId, {
              questionVersionId: vId,
              points: pts,
              orderIndex: existing ? existing.orderIndex : next.size + 1,
            });
          }
        });
      } else {
        // Apply points to all allocated questions
        next.forEach((item, key) => {
          next.set(key, { ...item, points: pts });
        });
      }

      return next;
    });
  };

  const updatePoints = (versionId: string, points: number) => {
    setAllocations((prev) => {
      const next = new Map(prev);
      const existing = next.get(versionId);
      if (existing) {
        next.set(versionId, {
          ...existing,
          points: Math.max(0.5, points),
        });
      }
      return next;
    });
  };

  const toggleExplanation = (questionId: string) => {
    setOpenExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    const sorted = Array.from(allocations.values()).map((item, idx) => ({
      ...item,
      orderIndex: idx + 1,
    }));
    await onSave(sorted);
  };

  const totalSelectedPoints = Array.from(allocations.values()).reduce(
    (acc, curr) => acc + curr.points,
    0
  );

  const newlyAddedCount = Array.from(allocations.keys()).filter(
    (id) => !initialIds.has(id)
  ).length;

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      {/* Enterprise Single-Row Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-1 rounded-lg transition-colors shrink-0 cursor-pointer"
            title="Back to Assessment Questions"
          >
            <ArrowLeft size={14} />
            <span>Back to Questions</span>
          </button>

          <span className="text-border text-xs font-light select-none">|</span>

          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
              {currentBank?.name || "Question Bank"}
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                {allocations.size} Selected ({totalSelectedPoints} Pts)
              </span>
              {newlyAddedCount > 0 && (
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                  +{newlyAddedCount} New
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer border border-border bg-card shadow-2xs"
          >
            Cancel
          </button>
          <SubmitButton
            isLoading={isSaving}
            size="sm"
            className="w-auto px-4"
            onClick={handleSubmit}
          >
            Save Questions ({allocations.size})
          </SubmitButton>
        </div>
      </div>

      {/* Top Filter & Question Bank Selector Toolbar */}
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs space-y-3">
        {/* Row 1: Filters Strip (Clean & Spacious without search bar) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <SelectDropdown
              value={selectedBankId || ""}
              onChange={(val) => {
                setSelectedBankId(val || null);
                setSelectedQuestionIds(new Set());
              }}
              options={questionBanks.map((b) => ({
                value: b.id,
                label: b.name,
                badge: `${b.questionCount} q`,
              }))}
              placeholder="Select Question Bank"
            />
          </div>

          <div className="w-full sm:w-48 min-w-[140px]">
            <SelectDropdown
              value={selectedDifficulty}
              onChange={setSelectedDifficulty}
              options={DIFFICULTY_OPTIONS}
              placeholder="Difficulty"
            />
          </div>

          <div className="w-full sm:w-52 min-w-[150px]">
            <SelectDropdown
              value={selectedType}
              onChange={setSelectedType}
              options={TYPE_OPTIONS}
              placeholder="Format"
            />
          </div>

          {selectedBankId && (
            <button
              type="button"
              onClick={() => setIsAuthoringQuestion(true)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-xs"
              title="Create new question in this bank"
            >
              <Plus size={14} />
              <span>Question</span>
            </button>
          )}
        </div>

        {/* Row 2: Sub-Action Bar with Scope Filters, Bulk Add/Remove & Batch Points */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/80 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Checkbox Select All */}
            {filteredQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {isAllFilteredSelected ? (
                  <CheckSquare size={16} className="text-primary" />
                ) : (
                  <Square size={16} className="text-muted-foreground" />
                )}
                <span>{isAllFilteredSelected ? "Deselect All" : "Select All"}</span>
              </button>
            )}

            {selectedQuestionIds.size > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                {selectedQuestionIds.size} of {filteredQuestions.length} selected
              </span>
            )}

            {/* Dynamic Bulk Action Buttons */}
            {unaddedSelectedCount > 0 && (
              <button
                type="button"
                onClick={handleAddSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                title="Add selected questions to assessment"
              >
                <Plus size={14} />
                <span>Add Selected ({unaddedSelectedCount})</span>
              </button>
            )}

            {addedSelectedCount > 0 && (
              <button
                type="button"
                onClick={handleRemoveSelected}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                title="Remove selected questions from assessment"
              >
                <Trash2 size={13} />
                <span>Remove Selected ({addedSelectedCount})</span>
              </button>
            )}

            {selectedQuestionIds.size === 0 && unaddedFilteredCount > 0 && (
              <button
                type="button"
                onClick={handleAddAllFiltered}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                title="Add all filtered questions to assessment"
              >
                <Plus size={14} />
                <span>Add All ({unaddedFilteredCount})</span>
              </button>
            )}

            {/* Scope Filter Tabs */}
            <div className="flex items-center bg-muted/50 p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setScopeFilter("ALL")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  scopeFilter === "ALL"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({availableQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("IN_ASSESSMENT")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  scopeFilter === "IN_ASSESSMENT"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                In Assessment ({inAssessmentCount})
              </button>
              <button
                type="button"
                onClick={() => setScopeFilter("UNSELECTED")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                  scopeFilter === "UNSELECTED"
                    ? "bg-card text-foreground shadow-2xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Not Added ({unselectedCount})
              </button>
            </div>
          </div>

          {/* Batch Points Toolbar */}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium">Batch Points:</span>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={batchPoints}
              onChange={(e) => setBatchPoints(e.target.value)}
              className="w-14 px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground text-center font-mono font-bold"
            />
            <button
              type="button"
              onClick={applyBatchPoints}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-semibold text-xs cursor-pointer transition-colors shadow-2xs"
              title="Apply batch points to selected questions"
            >
              Apply to Selected
            </button>
          </div>
        </div>
      </div>

      {/* Question Cards List */}
      {isLoadingQuestions ? (
        <div className="p-16 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center space-y-3 shadow-xs">
          <BookOpen size={28} className="mx-auto text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">No Questions Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No questions match your current filter criteria in this bank.
          </p>
          {selectedBankId && (
            <button
              type="button"
              onClick={() => setIsAuthoringQuestion(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Create Question in Bank</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q, idx) => {
            const versionId = getQuestionVersionId(q);
            const isSelected = Boolean(versionId && selectedQuestionIds.has(versionId));
            const isInAssessment = Boolean(versionId && allocations.has(versionId));
            const currentAlloc = versionId ? allocations.get(versionId) : undefined;
            const wasInitiallyInAssessment = Boolean(versionId && initialIds.has(versionId));
            const isExplanationOpen = openExplanations.has(q.id);

            return (
              <div
                key={q.id || idx}
                className={`p-4 rounded-2xl border transition-all duration-150 space-y-3 ${
                  isSelected
                    ? "bg-card border-primary/50 ring-1 ring-primary/20 shadow-xs"
                    : isInAssessment
                    ? "bg-card border-border shadow-xs"
                    : "bg-card border-border hover:border-primary/40 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={() => versionId && handleToggleSelect(versionId)}
                    className="mt-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                    title={isSelected ? "Deselect question" : "Select question"}
                  >
                    {isSelected ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>

                  {/* Question Content */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-foreground">
                          Question {idx + 1}
                        </span>
                      </div>
                      <QuestionTypeBadge type={q.type} />
                      <QuestionDifficultyBadge difficulty={q.difficulty} />
                      {isInAssessment && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            wasInitiallyInAssessment
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {wasInitiallyInAssessment ? "In Assessment" : "Added"}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-foreground break-words leading-relaxed pt-0.5">
                      {q.prompt}
                    </p>
                  </div>

                  {/* Action Group: Points + Add/Remove + Preview */}
                  <div className="flex items-center gap-2 self-start shrink-0">
                    {isInAssessment && versionId && (
                      <div className="flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-xl border border-border">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                          Pts:
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={currentAlloc?.points || 1}
                          onChange={(e) => updatePoints(versionId, Number(e.target.value))}
                          className="w-14 px-1.5 py-0.5 text-xs rounded-lg border border-border bg-background text-foreground text-center font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    )}

                    {/* Action button: Add or Remove */}
                    {isInAssessment ? (
                      <button
                        type="button"
                        onClick={() => versionId && handleRemoveQuestion(versionId)}
                        className="h-8 w-8 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Remove question from assessment"
                        aria-label="Remove question"
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddQuestion(q)}
                        className="h-8 w-8 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                        title="Add question to assessment"
                        aria-label="Add question"
                      >
                        <Plus size={15} />
                      </button>
                    )}

                    {/* Preview Button */}
                    <button
                      type="button"
                      onClick={() => setPreviewingQuestion(q)}
                      className="h-8 w-8 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Preview question and solution"
                      aria-label="Preview question"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>

                {/* Attached Diagram / Illustration thumbnail */}
                {q.imageUrl && (
                  <div className="ml-7 p-2 rounded-xl bg-muted/30 border border-border flex items-center gap-2.5">
                    <div className="h-12 w-16 rounded-lg bg-card border border-border overflow-hidden flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.imageUrl}
                        alt="Diagram"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <ImageIcon size={12} className="text-primary" />
                      <span>Attached Diagram / Illustration</span>
                    </span>
                  </div>
                )}

                {/* Options Grid preview */}
                {q.options && q.options.length > 0 && (
                  <div className="ml-7 pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt.isCorrect;

                      return (
                        <div
                          key={opt.id || oIdx}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-1.5 text-xs transition-all select-none ${
                            isCorrect
                              ? "bg-primary/5 border-primary/40 text-foreground font-medium"
                              : "bg-card border-border text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-start gap-1.5 min-w-0">
                            <span
                              className={`font-mono text-[11px] font-bold shrink-0 ${
                                isCorrect ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <span className="break-words truncate text-[11px]">
                              {opt.text}
                            </span>
                          </div>

                          {isCorrect && (
                            <span className="h-4 px-1 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0">
                              Answer Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation Toggle */}
                {q.explanation && (
                  <div className="ml-7 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleExplanation(q.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      <Lightbulb size={12} />
                      <span>
                        {isExplanationOpen ? "Hide Answer Explanation" : "View Answer Explanation"}
                      </span>
                      {isExplanationOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                    {isExplanationOpen && (
                      <p className="mt-1.5 p-2.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {previewingQuestion && (
        <QuestionPreviewModal
          isOpen={Boolean(previewingQuestion)}
          onClose={() => setPreviewingQuestion(null)}
          question={previewingQuestion}
        />
      )}

      {isAuthoringQuestion && selectedBankId && (
        <QuestionFormModal
          isOpen={Boolean(isAuthoringQuestion)}
          onClose={() => setIsAuthoringQuestion(false)}
          bankId={selectedBankId}
        />
      )}
    </div>
  );
}
