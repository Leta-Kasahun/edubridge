"use client";

import { useState } from "react";
import { X, Check, Search, Layers, Eye, BookOpen, Plus } from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { LoadingSpinner } from "@/shared/components/LoadingSpinner";
import { AssessmentItem } from "../types/assessment.types";
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

interface AssessmentQuestionSelectorModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (
    questions: Array<{ questionVersionId: string; orderIndex: number; points: number }>
  ) => Promise<void>;
  readonly assessment: AssessmentItem;
  readonly questionBanks: readonly QuestionBankItem[];
  readonly isLoading?: boolean;
}

export function AssessmentQuestionSelectorModal({
  isOpen,
  onClose,
  onSubmit,
  assessment,
  questionBanks,
  isLoading = false,
}: AssessmentQuestionSelectorModalProps) {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(
    questionBanks[0]?.id || null
  );
  const [search, setSearch] = useState("");
  const [previewingQuestion, setPreviewingQuestion] = useState<QuestionListItem | null>(null);
  const [isAuthoringQuestion, setIsAuthoringQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionListItem | null>(null);

  const { data: questionsData, isLoading: isLoadingQuestions } = useQuestions(
    selectedBankId || ""
  );
  const availableQuestions = questionsData?.items || [];

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

  if (!isOpen) return null;

  const filteredQuestions = availableQuestions.filter((q) => {
    return !search.trim() || q.prompt.toLowerCase().includes(search.toLowerCase());
  });

  const getQuestionVersionId = (q: QuestionListItem): string => {
    return q.latestVersionId || q.versionId || q.id;
  };

  const toggleQuestion = (q: QuestionListItem) => {
    const versionId = getQuestionVersionId(q);
    if (!versionId) return;

    setAllocations((prev) => {
      const next = new Map(prev);
      if (next.has(versionId)) {
        next.delete(versionId);
      } else {
        next.set(versionId, {
          questionVersionId: versionId,
          points: Number(q.defaultPoints) || 1,
          orderIndex: next.size + 1,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sorted = Array.from(allocations.values()).map((item, idx) => ({
      ...item,
      orderIndex: idx + 1,
    }));
    await onSubmit(sorted);
  };

  const totalSelectedPoints = Array.from(allocations.values()).reduce(
    (acc, curr) => acc + curr.points,
    0
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
        <div className="bg-card w-full max-w-4xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
          <div className="px-5 sm:px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Layers size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm sm:text-base text-foreground truncate">
                  Select Assessment Questions
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {assessment.title} · {allocations.size} questions ({totalSelectedPoints} pts total)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-3.5 sm:p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
              {questionBanks.map((bank) => {
                const isSelected = selectedBankId === bank.id;
                return (
                  <button
                    key={bank.id}
                    type="button"
                    onClick={() => setSelectedBankId(bank.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {bank.name}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions in bank..."
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {selectedBankId && (
                <button
                  type="button"
                  onClick={() => setIsAuthoringQuestion(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  <Plus size={13} />
                  <span className="hidden sm:inline">Author Question</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1">
            {isLoadingQuestions ? (
              <div className="p-12 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen size={24} className="mx-auto text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  No questions found in this question bank.
                </p>
                {selectedBankId && (
                  <button
                    type="button"
                    onClick={() => setIsAuthoringQuestion(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus size={13} />
                    <span>Author New Question</span>
                  </button>
                )}
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const versionId = getQuestionVersionId(q);
                const isChecked = Boolean(versionId && allocations.has(versionId));
                const currentAlloc = versionId ? allocations.get(versionId) : undefined;

                return (
                  <div
                    key={q.id || idx}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isChecked
                        ? "bg-primary/5 border-primary/40 shadow-2xs ring-1 ring-primary/20"
                        : "bg-card border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleQuestion(q)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground shadow-xs"
                            : "border-border bg-card"
                        }`}
                      >
                        {isChecked && <Check size={13} strokeWidth={3} />}
                      </button>

                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-bold text-muted-foreground">
                            #{q.code || idx + 1}
                          </span>
                          <QuestionTypeBadge type={q.type} />
                          <QuestionDifficultyBadge difficulty={q.difficulty} />
                        </div>

                        <p className="text-xs sm:text-sm font-semibold text-foreground break-words line-clamp-2">
                          {q.prompt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewingQuestion(q)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                        title="Preview question and solution"
                      >
                        <Eye size={13} />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      {isChecked && versionId && (
                        <div className="flex items-center gap-1.5">
                          <label className="text-xs text-muted-foreground font-semibold">
                            Pts:
                          </label>
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={currentAlloc?.points || 1}
                            onChange={(e) => updatePoints(versionId, Number(e.target.value))}
                            className="w-16 px-2.5 py-1.5 text-xs rounded-xl border border-border bg-background text-foreground text-center font-mono font-bold focus:outline-hidden focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </form>

          <div className="p-4 sm:p-5 border-t border-border bg-card flex items-center justify-between shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              <strong>{allocations.size}</strong> selected ({totalSelectedPoints} points)
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <SubmitButton
                isLoading={isLoading}
                size="sm"
                className="w-auto px-5"
                onClick={handleSubmit}
              >
                Save Assessment Questions ({allocations.size})
              </SubmitButton>
            </div>
          </div>
        </div>
      </div>

      {previewingQuestion && (
        <QuestionPreviewModal
          isOpen={Boolean(previewingQuestion)}
          onClose={() => setPreviewingQuestion(null)}
          question={previewingQuestion}
        />
      )}

      {(isAuthoringQuestion || editingQuestion) && selectedBankId && (
        <QuestionFormModal
          isOpen={Boolean(isAuthoringQuestion || editingQuestion)}
          onClose={() => {
            setIsAuthoringQuestion(false);
            setEditingQuestion(null);
          }}
          bankId={selectedBankId}
          initialData={editingQuestion}
        />
      )}
    </>
  );
}
