"use client";

import { Trash2, Plus, Check } from "lucide-react";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import {
  QuestionType,
  DifficultyLevel,
  QuestionOptionItem,
} from "../../types/question-bank.types";

export interface BatchQuestionDraft {
  readonly id: string;
  readonly type: QuestionType;
  readonly difficulty: DifficultyLevel;
  readonly defaultPoints: number;
  readonly prompt: string;
  readonly options: readonly QuestionOptionItem[];
  readonly explanation?: string;
  readonly hint?: string;
}

const TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "MCQ", label: "Multiple Choice (MCQ)" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "NUMERIC", label: "Numeric Answer" },
  { value: "LONG_ANSWER", label: "Long Answer (Essay)" },
];

const DIFFICULTY_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "EASY", label: "Easy", badge: "Easy" },
  { value: "MEDIUM", label: "Medium", badge: "Medium" },
  { value: "HARD", label: "Hard", badge: "Hard" },
];

interface QuestionBatchItemCardProps {
  readonly index: number;
  readonly totalCount: number;
  readonly item: BatchQuestionDraft;
  readonly onChange: (updated: BatchQuestionDraft) => void;
  readonly onRemove: () => void;
}

export function QuestionBatchItemCard({
  index,
  totalCount,
  item,
  onChange,
  onRemove,
}: QuestionBatchItemCardProps) {
  const handleTypeChange = (newType: QuestionType) => {
    let newOptions = item.options;
    if (newType === "TRUE_FALSE") {
      newOptions = [
        { text: "True", isCorrect: true, orderIndex: 0 },
        { text: "False", isCorrect: false, orderIndex: 1 },
      ];
    } else if (newType === "MCQ" && (!item.options || item.options.length === 0)) {
      newOptions = [
        { text: "", isCorrect: true, orderIndex: 0 },
        { text: "", isCorrect: false, orderIndex: 1 },
        { text: "", isCorrect: false, orderIndex: 2 },
        { text: "", isCorrect: false, orderIndex: 3 },
      ];
    }
    onChange({
      ...item,
      type: newType,
      options: newOptions,
    });
  };

  const handleOptionTextChange = (optIndex: number, text: string) => {
    const next = item.options.map((opt, i) =>
      i === optIndex ? { ...opt, text } : opt
    );
    onChange({ ...item, options: next });
  };

  const handleSetCorrectOption = (optIndex: number) => {
    const next = item.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIndex,
    }));
    onChange({ ...item, options: next });
  };

  const handleAddOption = () => {
    if (item.options.length >= 8) return;
    const next = [
      ...item.options,
      {
        text: "",
        isCorrect: false,
        orderIndex: item.options.length,
      },
    ];
    onChange({ ...item, options: next });
  };

  const handleRemoveOption = (optIndex: number) => {
    if (item.options.length <= 2) return;
    const next = item.options
      .filter((_, i) => i !== optIndex)
      .map((opt, i) => ({ ...opt, orderIndex: i }));
    if (!next.some((o) => o.isCorrect)) {
      next[0] = { ...next[0], isCorrect: true };
    }
    onChange({ ...item, options: next });
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-foreground">
            Question #{index + 1}
          </span>
        </div>

        {totalCount > 1 && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove this question"
            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SelectDropdown
          label="Question Type"
          options={TYPE_OPTIONS}
          value={item.type}
          onChange={(val) => handleTypeChange(val as QuestionType)}
        />

        <SelectDropdown
          label="Difficulty"
          options={DIFFICULTY_OPTIONS}
          value={item.difficulty}
          onChange={(val) =>
            onChange({ ...item, difficulty: val as DifficultyLevel })
          }
        />

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground">
            Points
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="100"
            value={item.defaultPoints}
            onChange={(e) =>
              onChange({
                ...item,
                defaultPoints: Math.max(0.5, Number(e.target.value) || 1),
              })
            }
            className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-foreground">
          Question Prompt <span className="text-destructive">*</span>
        </label>
        <textarea
          rows={2}
          value={item.prompt}
          onChange={(e) => onChange({ ...item, prompt: e.target.value })}
          placeholder={`Enter prompt for Question #${index + 1}`}
          className="w-full p-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      {(item.type === "MCQ" || item.type === "TRUE_FALSE") && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Answer Choices (Click circle to select correct answer)
            </span>
            {item.type === "MCQ" && item.options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                <Plus size={11} />
                <span>Add Choice</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {item.options.map((opt, optIdx) => (
              <div
                key={optIdx}
                className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                  opt.isCorrect
                    ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
                    : "bg-card border-border hover:border-muted-foreground/30"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSetCorrectOption(optIdx)}
                  title={opt.isCorrect ? "Correct answer" : "Mark as correct"}
                  className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${
                    opt.isCorrect
                      ? "bg-primary text-primary-foreground shadow-xs scale-105"
                      : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  }`}
                >
                  {opt.isCorrect ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    String.fromCharCode(65 + optIdx)
                  )}
                </button>

                <input
                  type="text"
                  value={opt.text}
                  disabled={item.type === "TRUE_FALSE"}
                  onChange={(e) =>
                    handleOptionTextChange(optIdx, e.target.value)
                  }
                  placeholder={`Choice ${String.fromCharCode(65 + optIdx)}`}
                  className="flex-1 h-7 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />

                {item.type === "MCQ" && item.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(optIdx)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
