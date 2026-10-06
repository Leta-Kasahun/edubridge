import { useState } from "react";
import { Trash2, Plus, Check, Image as ImageIcon, Lightbulb, X } from "lucide-react";
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
  readonly imageUrl?: string;
}

const TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "MCQ", label: "Multiple Choice" },
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
  const [showImageInput, setShowImageInput] = useState(Boolean(item.imageUrl));

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
    } else if (newType === "SHORT_ANSWER" || newType === "NUMERIC" || newType === "LONG_ANSWER") {
      newOptions = [];
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
            Question {index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const next = !showImageInput;
              setShowImageInput(next);
              if (!next && item.imageUrl) {
                onChange({ ...item, imageUrl: undefined });
              }
            }}
            aria-pressed={showImageInput}
            aria-label="Toggle diagram or image input"
            className={`inline-flex items-center gap-1 h-7 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
              item.imageUrl || showImageInput
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <ImageIcon size={12} />
            <span>{item.imageUrl ? "Diagram Added" : "Add Image"}</span>
          </button>

          {totalCount > 1 && (
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove question ${index + 1}`}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
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
          <label className="text-xs font-semibold text-foreground" htmlFor={`points-${item.id}`}>
            Points
          </label>
          <input
            id={`points-${item.id}`}
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
        <label className="text-xs font-semibold text-foreground" htmlFor={`prompt-${item.id}`}>
          Question Text <span className="text-destructive">*</span>
        </label>
        <textarea
          id={`prompt-${item.id}`}
          rows={2}
          value={item.prompt}
          onChange={(e) => onChange({ ...item, prompt: e.target.value })}
          placeholder={`Enter question text for Question ${index + 1}`}
          className="w-full p-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
        />
      </div>

      {showImageInput && (
        <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2.5 animate-in fade-in-0 duration-150">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5" htmlFor={`image-url-${item.id}`}>
              <ImageIcon size={13} className="text-primary" />
              <span>Diagram / Image URL</span>
            </label>
            {item.imageUrl && (
              <button
                type="button"
                onClick={() => onChange({ ...item, imageUrl: undefined })}
                className="text-[11px] font-semibold text-destructive hover:underline cursor-pointer flex items-center gap-1"
              >
                <X size={11} />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          <input
            id={`image-url-${item.id}`}
            type="url"
            value={item.imageUrl || ""}
            onChange={(e) => onChange({ ...item, imageUrl: e.target.value })}
            placeholder="https://example.com/diagram.png"
            className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />

          {item.imageUrl && item.imageUrl.trim() !== "" && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-card border border-border">
              <div className="h-16 w-24 rounded-md border border-border bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt="Question Diagram Preview"
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div className="text-[11px] text-muted-foreground min-w-0">
                <span className="font-semibold text-foreground block truncate">Diagram Preview</span>
                <span className="truncate block opacity-80">{item.imageUrl}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {(item.type === "MCQ" || item.type === "TRUE_FALSE") && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground">
              Choices (Select correct answer)
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
                  aria-pressed={opt.isCorrect}
                  aria-label={`Mark choice ${String.fromCharCode(65 + optIdx)} as correct`}
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
                  aria-label={`Choice ${String.fromCharCode(65 + optIdx)} text`}
                  placeholder={`Choice ${String.fromCharCode(65 + optIdx)}`}
                  className="flex-1 h-7 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />

                {item.type === "MCQ" && item.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(optIdx)}
                    aria-label={`Remove choice ${String.fromCharCode(65 + optIdx)}`}
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

      <div className="space-y-1.5 pt-1">
        <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5" htmlFor={`explanation-${item.id}`}>
          <Lightbulb size={13} className="text-amber-500" />
          <span>Answer Explanation</span>
        </label>
        <input
          id={`explanation-${item.id}`}
          type="text"
          value={item.explanation || ""}
          onChange={(e) => onChange({ ...item, explanation: e.target.value })}
          placeholder="Explain the correct answer"
          className="w-full h-9 px-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
