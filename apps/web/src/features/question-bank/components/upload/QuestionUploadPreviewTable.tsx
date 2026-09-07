"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  QuestionUploadResponse,
  ExtractedQuestionDraft,
} from "../../types/question-bank.types";
import { useConfirmQuestionUpload } from "../../hooks/useQuestionUpload";
import { buildOptionLabel } from "@/shared/utils/question.util";

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

  const initialQuestions: readonly ExtractedQuestionDraft[] =
    uploadData.extractedQuestions ??
    (uploadData as unknown as { candidates?: Array<{ questionText: string; type: ExtractedQuestionDraft["type"]; difficulty: ExtractedQuestionDraft["difficulty"]; points: number; explanation?: string; options?: Array<{ optionText: string; isCorrect: boolean; orderIndex: number }> }> }).candidates?.map((c) => ({
      type: c.type,
      prompt: c.questionText,
      difficulty: c.difficulty,
      defaultPoints: c.points,
      explanation: c.explanation,
      options: c.options?.map((o, idx) => ({
        text: o.optionText,
        isCorrect: o.isCorrect,
        orderIndex: o.orderIndex ?? idx,
      })),
    })) ??
    [];

  const [questions, setQuestions] = useState<readonly ExtractedQuestionDraft[]>(initialQuestions);
  const [selectedIndices, setSelectedIndices] = useState<ReadonlySet<number>>(
    new Set(initialQuestions.map((_, i) => i))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const confirmMutation = useConfirmQuestionUpload(bankId);

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
    if (editingIndex === indexToRemove) {
      setEditingIndex(null);
    }
  };

  const handleUpdatePrompt = (index: number, newPrompt: string) => {
    const updated = questions.map((q, idx) =>
      idx === index ? { ...q, prompt: newPrompt } : q
    );
    setQuestions(updated);
  };

  const handleConfirmImport = async () => {
    setErrorMessage(null);
    const selectedQuestions = questions.filter((_, idx) =>
      selectedIndices.has(idx)
    );

    if (selectedQuestions.length === 0) {
      setErrorMessage("Please select at least one question to import.");
      return;
    }

    try {
      await confirmMutation.mutateAsync({
        uploadId: uploadData.uploadId,
        payload: {
          questions: selectedQuestions.map((q) => ({
            prompt: q.prompt,
            type: q.type,
            difficulty: q.difficulty,
            defaultPoints: q.defaultPoints,
            explanation: q.explanation,
            hint: q.hint,
            options: q.options,
          })),
        },
      });

      if (onComplete) {
        onComplete();
      } else {
        router.push(`/dashboard/question-banks/${bankId}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to import selected questions.";
      setErrorMessage(msg);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              Document Analysis Complete
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
              {uploadData.fileName}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {uploadData.pageCount} page(s) analyzed · {questions.length} questions extracted
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel || onReset}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-foreground hover:bg-muted border border-border transition-colors cursor-pointer"
          >
            Upload Different File
          </button>
          <SubmitButton
            onClick={handleConfirmImport}
            isLoading={confirmMutation.isPending}
            loadingText="Importing..."
            icon={<ArrowRight size={14} />}
          >
            Import {selectedIndices.size} Questions
          </SubmitButton>
        </div>
      </div>

      {errorMessage && <ErrorAlert message={errorMessage} />}

      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={toggleSelectAll}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {selectedIndices.size === questions.length ? (
            <CheckSquare size={16} className="text-primary" />
          ) : (
            <Square size={16} />
          )}
          <span>
            {selectedIndices.size === questions.length
              ? "Deselect All"
              : "Select All"}
          </span>
        </button>

        <span className="text-xs text-muted-foreground">
          {selectedIndices.size} of {questions.length} selected
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q, idx) => {
          const isSelected = selectedIndices.has(idx);
          const isEditing = editingIndex === idx;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                isSelected
                  ? "bg-card border-border shadow-2xs"
                  : "bg-muted/30 border-border opacity-70"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleSelectIndex(idx)}
                  className="mt-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare size={16} className="text-primary" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-foreground">
                        Q{idx + 1}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        {q.type}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        {q.difficulty}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {q.defaultPoints} pt{q.defaultPoints === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingIndex(isEditing ? null : idx)
                        }
                        className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title={isEditing ? "Done editing" : "Edit prompt"}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Discard question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={q.prompt}
                      onChange={(e) => handleUpdatePrompt(idx, e.target.value)}
                      rows={3}
                      className="w-full p-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  ) : (
                    <p className="text-xs font-medium text-foreground whitespace-pre-wrap break-words">
                      {q.prompt}
                    </p>
                  )}

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                            opt.isCorrect
                              ? "bg-muted/70 border-foreground/20 text-foreground font-semibold"
                              : "bg-background border-border text-muted-foreground"
                          }`}
                        >
                          <span className="font-mono text-[11px] opacity-70">
                            {buildOptionLabel(optIdx)}.
                          </span>
                          <span className="truncate">{opt.text}</span>
                          {opt.isCorrect && (
                            <CheckCircle2
                              size={13}
                              className="text-primary ml-auto shrink-0"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border">
                      <strong className="text-foreground">Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
