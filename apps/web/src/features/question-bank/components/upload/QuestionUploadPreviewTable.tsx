"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Square,
  Lightbulb,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Plus,
  HelpCircle,
  FileCheck2,
  Check,
  RotateCcw,
} from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { getErrorMessage } from "@/shared/utils";
import {
  QuestionUploadResponse,
  ExtractedQuestionDraft,
  QuestionType,
  DifficultyLevel,
  QuestionOptionItem,
} from "../../types/question-bank.types";
import { useConfirmQuestionUpload } from "../../hooks/useQuestionUpload";
import { buildOptionLabel } from "@/shared/utils/question.util";

const TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "MCQ", label: "Multiple Choice (MCQ)" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "NUMERIC", label: "Numeric" },
  { value: "LONG_ANSWER", label: "Essay / Long Answer" },
];

const DIFFICULTY_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "EASY", label: "Easy", badge: "Easy" },
  { value: "MEDIUM", label: "Medium", badge: "Medium" },
  { value: "HARD", label: "Hard", badge: "Hard" },
];

interface QuestionUploadPreviewTableProps {
  readonly bankId: string;
  readonly uploadData: QuestionUploadResponse;
  readonly onReset?: () => void;
  readonly onComplete?: () => void;
  readonly onCancel?: () => void;
}

export function QuestionUploadPreviewTable({
  bankId,
  uploadData,
  onReset,
  onComplete,
  onCancel,
}: QuestionUploadPreviewTableProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initialQuestions: readonly ExtractedQuestionDraft[] = useMemo(() => {
    return uploadData.extractedQuestions || [];
  }, [uploadData]);

  const [questions, setQuestions] = useState<readonly ExtractedQuestionDraft[]>(initialQuestions);
  const [selectedIndices, setSelectedIndices] = useState<ReadonlySet<number>>(
    new Set(initialQuestions.map((_, i) => i))
  );
  const [editingIndices, setEditingIndices] = useState<ReadonlySet<number>>(new Set());

  const confirmMutation = useConfirmQuestionUpload(bankId);

  const isAllEditing = questions.length > 0 && editingIndices.size === questions.length;

  const toggleEditAll = () => {
    if (isAllEditing) {
      setEditingIndices(new Set());
    } else {
      setEditingIndices(new Set(questions.map((_, i) => i)));
    }
  };

  const toggleEditSingle = (index: number) => {
    const updated = new Set(editingIndices);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setEditingIndices(updated);
  };

  const totalPoints = useMemo(() => {
    return questions.reduce((acc, q, idx) => {
      if (selectedIndices.has(idx)) {
        return acc + (q.defaultPoints || 1);
      }
      return acc;
    }, 0);
  }, [questions, selectedIndices]);

  const toggleSelectAll = () => {
    if (selectedIndices.size === questions.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(questions.map((_, i) => i)));
    }
  };

  const toggleSelectIndex = (index: number) => {
    const updated = new Set(selectedIndices);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setSelectedIndices(updated);
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = questions.filter((_, idx) => idx !== indexToRemove);
    setQuestions(updated);
    const updatedSelected = new Set<number>();
    updated.forEach((_, newIdx) => {
      updatedSelected.add(newIdx);
    });
    setSelectedIndices(updatedSelected);
    setEditingIndices((prev) => {
      const next = new Set<number>();
      for (const idx of prev) {
        if (idx < indexToRemove) next.add(idx);
        else if (idx > indexToRemove) next.add(idx - 1);
      }
      return next;
    });
  };

  const handleBulkDiscardSelected = () => {
    const updated = questions.filter((_, idx) => !selectedIndices.has(idx));
    setQuestions(updated);
    setSelectedIndices(new Set(updated.map((_, idx) => idx)));
    setEditingIndices(new Set());
  };


  const handleUpdateQuestion = (index: number, updatedQuestion: ExtractedQuestionDraft) => {
    const updated = questions.map((q, idx) => (idx === index ? updatedQuestion : q));
    setQuestions(updated);
  };

  const handleTypeChange = (index: number, newType: QuestionType) => {
    const current = questions[index];
    let newOptions = current.options;

    if (newType === "TRUE_FALSE") {
      newOptions = [
        { text: "True", isCorrect: true, orderIndex: 0 },
        { text: "False", isCorrect: false, orderIndex: 1 },
      ];
    } else if (newType === "MCQ" && (!current.options || current.options.length === 0)) {
      newOptions = [
        { text: "", isCorrect: true, orderIndex: 0 },
        { text: "", isCorrect: false, orderIndex: 1 },
        { text: "", isCorrect: false, orderIndex: 2 },
        { text: "", isCorrect: false, orderIndex: 3 },
      ];
    } else if (newType === "SHORT_ANSWER" || newType === "NUMERIC" || newType === "LONG_ANSWER") {
      newOptions = [];
    }

    handleUpdateQuestion(index, {
      ...current,
      type: newType,
      options: newOptions,
    });
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    const current = questions[qIndex];
    if (!current.options) return;
    const nextOptions = current.options.map((opt, i) =>
      i === optIndex ? { ...opt, text } : opt
    );
    handleUpdateQuestion(qIndex, { ...current, options: nextOptions });
  };

  const handleSetCorrectOption = (qIndex: number, optIndex: number) => {
    const current = questions[qIndex];
    if (!current.options) return;
    const nextOptions = current.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIndex,
    }));
    handleUpdateQuestion(qIndex, { ...current, options: nextOptions });
  };

  const handleAddOption = (qIndex: number) => {
    const current = questions[qIndex];
    const existing = current.options ?? [];
    if (existing.length >= 8) return;
    const nextOptions: readonly QuestionOptionItem[] = [
      ...existing,
      {
        text: "",
        isCorrect: false,
        orderIndex: existing.length,
      },
    ];
    handleUpdateQuestion(qIndex, { ...current, options: nextOptions });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const current = questions[qIndex];
    if (!current.options || current.options.length <= 2) return;
    const nextOptions = current.options
      .filter((_, i) => i !== optIndex)
      .map((opt, i) => ({ ...opt, orderIndex: i }));
    if (!nextOptions.some((o) => o.isCorrect)) {
      nextOptions[0] = { ...nextOptions[0], isCorrect: true };
    }
    handleUpdateQuestion(qIndex, { ...current, options: nextOptions });
  };

  const handleConfirmImport = async () => {
    setErrorMessage(null);
    const selectedQuestions = questions.filter((_, idx) => selectedIndices.has(idx));

    if (selectedQuestions.length === 0) {
      setErrorMessage("Please select at least one question to import.");
      return;
    }

    // Client-side sanity check
    for (let i = 0; i < selectedQuestions.length; i++) {
      const q = selectedQuestions[i];
      if (!q.prompt || q.prompt.trim().length < 3) {
        setErrorMessage(`Question ${i + 1} prompt must be at least 3 characters.`);
        return;
      }

      if (q.type === "MCQ" || q.type === "TRUE_FALSE") {
        const validOptions = (q.options || []).filter((o) => o.text.trim().length > 0);
        if (validOptions.length < 2) {
          setErrorMessage(
            `Question ${i + 1} (${q.type}) must have at least 2 choices with text.`
          );
          return;
        }
      }
    }

    try {
      await confirmMutation.mutateAsync({
        uploadId: uploadData.uploadId,
        payload: {
          questions: selectedQuestions.map((q) => {
            const rawOptions = (q.options || []).map((o, optIdx) => ({
              optionKey: buildOptionLabel(optIdx),
              optionText: o.text.trim(),
              text: o.text.trim(),
              orderIndex: o.orderIndex ?? optIdx,
              isCorrect: Boolean(o.isCorrect),
            }));

            // Ensure at least one option is marked correct if options exist
            const hasCorrect = rawOptions.some((o) => o.isCorrect);
            if (rawOptions.length > 0 && !hasCorrect) {
              rawOptions[0].isCorrect = true;
            }

            return {
              prompt: q.prompt.trim(),
              questionText: q.prompt.trim(),
              type: q.type,
              difficulty: q.difficulty || "MEDIUM",
              defaultPoints: q.defaultPoints || 1,
              points: q.defaultPoints || 1,
              explanation: q.explanation?.trim() || null,
              hint: q.hint?.trim() || null,
              options: rawOptions,
            };
          }),
        },
      });

      if (onComplete) {
        onComplete();
      } else {
        router.push(`/dashboard/question-banks/${bankId}`);
      }
    } catch (err: unknown) {
      setErrorMessage(
        getErrorMessage(
          err,
          "Failed to import selected questions. Please verify all questions have valid text and choices."
        )
      );
    }
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Top Document Summary Banner */}
      <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileCheck2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span className="text-xs sm:text-sm font-bold text-foreground">
                Document Analysis Complete
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-foreground border border-border truncate max-w-[200px] sm:max-w-xs">
                {uploadData.fileName}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {uploadData.pageCount} page(s) analyzed · {questions.length} questions extracted
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onCancel || onReset}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
          >
            Upload Different File
          </button>
          <div className="hidden md:inline-flex">
            <SubmitButton
              onClick={handleConfirmImport}
              isLoading={confirmMutation.isPending}
              loadingText="Importing..."
              disabled={selectedIndices.size === 0}
              icon={<ArrowRight size={14} />}
            >
              Import {selectedIndices.size} Questions
            </SubmitButton>
          </div>
        </div>
      </div>

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {/* Batch Selection & Metrics Toolbar */}
      <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border flex-wrap min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            {selectedIndices.size === questions.length ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} className="text-muted-foreground" />
            )}
            <span>
              {selectedIndices.size === questions.length ? "Deselect All" : "Select All"}
            </span>
          </button>

          <span className="text-xs text-muted-foreground font-medium">
            {selectedIndices.size} of {questions.length} selected
          </span>

          <span className="text-muted-foreground font-mono text-xs">·</span>

          <span className="text-xs text-muted-foreground">
            Total Points: <strong className="text-foreground">{totalPoints}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          <button
            type="button"
            onClick={toggleEditAll}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              isAllEditing
                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {isAllEditing ? (
              <>
                <Check size={13} />
                <span>Done Editing All</span>
              </>
            ) : (
              <>
                <Edit2 size={13} />
                <span>Edit All Questions</span>
              </>
            )}
          </button>

          {selectedIndices.size > 0 && selectedIndices.size < questions.length && (
            <button
              type="button"
              onClick={handleBulkDiscardSelected}
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border border-destructive/30 transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Discard Selected ({selectedIndices.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-3.5 min-w-0">
        {questions.map((q, idx) => {
          const isSelected = selectedIndices.has(idx);
          const isEditing = editingIndices.has(idx);

          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden min-w-0 ${
                isSelected
                  ? "bg-card border-border shadow-xs"
                  : "bg-muted/20 border-border/70 opacity-75"
              }`}
            >
              {/* Question Card Header */}
              <div className="p-3.5 sm:p-4 flex items-start gap-3 bg-card border-b border-border/60 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleSelectIndex(idx)}
                  className="mt-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  title={isSelected ? "Unselect question" : "Select question"}
                >
                  {isSelected ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        Q{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                        {q.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                        {q.defaultPoints} pt{q.defaultPoints === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleEditSingle(idx)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                          isEditing
                            ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                            : "border-border text-foreground hover:bg-muted"
                        }`}
                        title={isEditing ? "Save & finish editing" : "Edit question inline"}
                      >
                        {isEditing ? (
                          <>
                            <Check size={12} />
                            <span>Done</span>
                          </>
                        ) : (
                          <>
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Discard question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Card Content: View Mode vs In-Place Edit Mode */}
              <div className="p-4 sm:p-5 space-y-3.5 min-w-0">
                {!isEditing ? (
                  // VIEW MODE
                  <div className="space-y-3 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground whitespace-pre-wrap break-words leading-relaxed">
                      {q.prompt}
                    </p>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 min-w-0">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-2.5 transition-colors min-w-0 ${
                              opt.isCorrect
                                ? "bg-primary/5 border-primary/40 text-foreground font-semibold ring-1 ring-primary/20"
                                : "bg-background border-border text-muted-foreground"
                            }`}
                          >
                            <span className="font-mono text-xs font-bold opacity-75 shrink-0">
                              {buildOptionLabel(optIdx)}.
                            </span>
                            <span className="truncate flex-1 min-w-0">{opt.text}</span>
                            {opt.isCorrect && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-semibold ml-auto shrink-0">
                                <CheckCircle2 size={13} />
                                <span>Correct</span>
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40 border border-border text-xs text-foreground min-w-0">
                        <Lightbulb size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-bold text-foreground">Answer Explanation: </span>
                          <span className="text-muted-foreground whitespace-pre-wrap break-words">
                            {q.explanation}
                          </span>
                        </div>
                      </div>
                    )}

                    {q.hint && (
                      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground min-w-0">
                        <HelpCircle size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="font-bold text-foreground">Hint: </span>
                          <span className="whitespace-pre-wrap break-words">{q.hint}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // IN-PLACE INLINE EDIT MODE (Enterprise, no nested modals!)
                  <div className="space-y-4 bg-muted/10 p-3.5 sm:p-4 rounded-xl border border-border animate-in fade-in-0 duration-150 min-w-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-0">
                      <SelectDropdown
                        label="Question Type"
                        options={TYPE_OPTIONS}
                        value={q.type}
                        onChange={(val) => handleTypeChange(idx, val as QuestionType)}
                      />

                      <SelectDropdown
                        label="Difficulty"
                        options={DIFFICULTY_OPTIONS}
                        value={q.difficulty}
                        onChange={(val) =>
                          handleUpdateQuestion(idx, {
                            ...q,
                            difficulty: val as DifficultyLevel,
                          })
                        }
                      />

                      <div className="space-y-1.5 min-w-0">
                        <label
                          className="text-xs font-semibold text-foreground"
                          htmlFor={`points-input-${idx}`}
                        >
                          Points
                        </label>
                        <input
                          id={`points-input-${idx}`}
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="100"
                          value={q.defaultPoints}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, {
                              ...q,
                              defaultPoints: Math.max(0.5, Number(e.target.value) || 1),
                            })
                          }
                          className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <label
                        className="text-xs font-semibold text-foreground"
                        htmlFor={`prompt-input-${idx}`}
                      >
                        Question Prompt <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        id={`prompt-input-${idx}`}
                        rows={3}
                        value={q.prompt}
                        onChange={(e) =>
                          handleUpdateQuestion(idx, { ...q, prompt: e.target.value })
                        }
                        placeholder="Enter the question text..."
                        className="w-full p-3 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                    </div>

                    {/* Options Editor for MCQ / True-False */}
                    {(q.type === "MCQ" || q.type === "TRUE_FALSE") && (
                      <div className="space-y-2 pt-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            Answer Choices (Click letter badge to set correct answer)
                          </span>
                          {q.type === "MCQ" && (q.options?.length ?? 0) < 6 && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(idx)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              <Plus size={12} />
                              <span>Add Choice</span>
                            </button>
                          )}
                        </div>

                        <div className="space-y-2 min-w-0">
                          {q.options?.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-2 rounded-xl border transition-colors min-w-0 ${
                                opt.isCorrect
                                  ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                                  : "bg-card border-border hover:border-muted-foreground/30"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleSetCorrectOption(idx, optIdx)}
                                aria-label={`Set option ${buildOptionLabel(optIdx)} as correct`}
                                className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${
                                  opt.isCorrect
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                                }`}
                              >
                                {opt.isCorrect ? (
                                  <Check size={14} strokeWidth={3} />
                                ) : (
                                  buildOptionLabel(optIdx)
                                )}
                              </button>

                              <input
                                type="text"
                                value={opt.text}
                                disabled={q.type === "TRUE_FALSE"}
                                onChange={(e) =>
                                  handleOptionTextChange(idx, optIdx, e.target.value)
                                }
                                placeholder={`Option ${buildOptionLabel(optIdx)} text...`}
                                className="flex-1 min-w-0 h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              />

                              {q.type === "MCQ" && (q.options?.length ?? 0) > 2 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx, optIdx)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                                  title="Remove option"
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 min-w-0">
                      <div className="space-y-1.5 min-w-0">
                        <label
                          className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                          htmlFor={`explanation-input-${idx}`}
                        >
                          <Lightbulb size={13} className="text-amber-500" />
                          <span>Answer Explanation</span>
                        </label>
                        <input
                          id={`explanation-input-${idx}`}
                          type="text"
                          value={q.explanation || ""}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, { ...q, explanation: e.target.value })
                          }
                          placeholder="Explain why this answer is correct..."
                          className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <label
                          className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                          htmlFor={`hint-input-${idx}`}
                        >
                          <HelpCircle size={12} className="text-muted-foreground" />
                          <span>Hint (Optional)</span>
                        </label>
                        <input
                          id={`hint-input-${idx}`}
                          type="text"
                          value={q.hint || ""}
                          onChange={(e) =>
                            handleUpdateQuestion(idx, { ...q, hint: e.target.value })
                          }
                          placeholder="Optional guidance for students..."
                          className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => toggleEditSingle(idx)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Check size={13} />
                        <span>Done Editing Q{idx + 1}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Sticky Bottom Action Bar - ZERO NEGATIVE MARGINS */}
      <div className="sticky bottom-0 bg-card/95 backdrop-blur-md border-t border-border pt-3.5 pb-2 -mt-1 w-full min-w-0 flex items-center justify-between gap-3 flex-wrap z-10">
        <button
          type="button"
          onClick={onCancel || onReset}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted border border-border transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw size={13} />
          <span>Upload Different File</span>
        </button>

        <div className="flex items-center gap-3 ml-auto shrink-0 flex-wrap">
          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            <strong className="text-foreground">{selectedIndices.size}</strong> of {questions.length} selected ({totalPoints} pts)
          </span>

          <SubmitButton
            onClick={handleConfirmImport}
            isLoading={confirmMutation.isPending}
            loadingText="Importing..."
            disabled={selectedIndices.size === 0}
            icon={<ArrowRight size={15} />}
          >
            Import {selectedIndices.size} Question{selectedIndices.size === 1 ? "" : "s"}
          </SubmitButton>
        </div>
      </div>
    </div>
  );
}


