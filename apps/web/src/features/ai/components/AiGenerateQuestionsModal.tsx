"use client";

import React, { useState } from "react";
import { Sparkles, X, Check, ShieldCheck } from "lucide-react";
import { useGenerateQuestionsMutation } from "../hooks/useAiGeneration";
import type { QuestionDifficulty, QuestionTypeFormat } from "../types/ai.types";
import { ErrorAlert, SubmitButton } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface AiGenerateQuestionsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly topicId: string;
  readonly questionBankId?: string;
  readonly topicTitle?: string;
  readonly onGenerated?: (count: number, bankId: string) => void;
}

export function AiGenerateQuestionsModal({
  isOpen,
  onClose,
  subjectId,
  gradeId,
  topicId,
  questionBankId,
  topicTitle = "Selected Topic",
  onGenerated,
}: AiGenerateQuestionsModalProps) {
  const [count, setCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("MEDIUM");
  const [questionType, setQuestionType] = useState<QuestionTypeFormat>("MCQ");

  const generateMutation = useGenerateQuestionsMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await generateMutation.mutateAsync({
        subjectId,
        gradeId,
        topicId,
        questionBankId,
        count,
        difficulty,
        questionType,
      });

      onGenerated?.(res.questionsCreated, res.questionBankId);
      onClose();
    } catch {
      // Error handled by mutation state and ErrorAlert
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md max-w-[calc(100vw-1rem)] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 bg-primary-foreground/15 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">Create Questions with AI</h3>
              <p className="text-xs text-primary-foreground/80 truncate max-w-[220px] sm:max-w-[280px]">
                {topicTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/15 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {/* Draft Approval Notice */}
          <div className="flex items-start gap-2 p-2.5 bg-muted/60 border border-border rounded-xl">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              New questions will be saved as <strong className="text-foreground">Drafts</strong>. You can review, edit, and approve them before publishing.
            </p>
          </div>

          {generateMutation.isError && (
            <ErrorAlert
              message={getErrorMessage(
                generateMutation.error,
                "Unable to create questions right now. Please try again."
              )}
            />
          )}

          <div>
            <label className="block font-medium text-foreground mb-1.5">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["EASY", "MEDIUM", "HARD"] as const).map((level) => {
                const isSelected = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2 px-1.5 text-xs font-medium rounded-xl border transition-all text-center truncate cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {level === "EASY" && "Easy"}
                    {level === "MEDIUM" && "Medium"}
                    {level === "HARD" && "Challenging"}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-medium text-foreground mb-1.5">
              Question Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { format: "MCQ", label: "Multiple Choice" },
                { format: "TRUE_FALSE", label: "True / False" },
                { format: "SHORT_ANSWER", label: "Short Answer" },
              ].map(({ format, label }) => {
                const isSelected = questionType === format;
                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => setQuestionType(format as QuestionTypeFormat)}
                    className={`py-2 px-1.5 text-xs font-medium rounded-xl border transition-all text-center truncate cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary font-semibold shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-medium text-foreground">
                How many questions?
              </label>
              <span className="font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                {count} questions
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={15}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={generateMutation.isPending}
              className="px-3.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              size="sm"
              isLoading={generateMutation.isPending}
              loadingText="Creating questions..."
              icon={<Check className="w-3.5 h-3.5" />}
              iconPosition="left"
              className="rounded-xl px-4 py-2 text-xs font-medium"
            >
              Generate {count} Questions
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
