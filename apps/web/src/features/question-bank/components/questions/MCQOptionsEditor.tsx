"use client";

import { Plus, Trash2, CheckCircle2, Circle, CheckSquare, Square } from "lucide-react";
import { buildOptionLabel } from "@/shared/utils/question.util";
import { QuestionOptionItem } from "../../types/question-bank.types";

interface MCQOptionsEditorProps {
  readonly options: readonly QuestionOptionItem[];
  readonly onChange: (options: readonly QuestionOptionItem[]) => void;
  readonly isSingleChoice?: boolean;
  readonly onToggleChoiceMode?: (isSingle: boolean) => void;
}

export function MCQOptionsEditor({
  options,
  onChange,
  isSingleChoice = true,
  onToggleChoiceMode,
}: MCQOptionsEditorProps) {
  const handleAddOption = () => {
    const newIndex = options.length;
    const newOption: QuestionOptionItem = {
      text: "",
      isCorrect: options.length === 0,
      orderIndex: newIndex,
    };
    onChange([...options, newOption]);
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) return;
    const updated = options
      .filter((_, idx) => idx !== indexToRemove)
      .map((opt, idx) => ({ ...opt, orderIndex: idx }));
    onChange(updated);
  };

  const handleTextChange = (index: number, text: string) => {
    const updated = options.map((opt, idx) =>
      idx === index ? { ...opt, text } : opt
    );
    onChange(updated);
  };

  const handleToggleCorrect = (index: number) => {
    if (isSingleChoice) {
      const updated = options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === index,
      }));
      onChange(updated);
    } else {
      const updated = options.map((opt, idx) =>
        idx === index ? { ...opt, isCorrect: !opt.isCorrect } : opt
      );
      onChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-semibold text-foreground">
            Answer Choices <span className="text-destructive">*</span>
          </label>
          <p className="text-[11px] text-muted-foreground">
            {isSingleChoice
              ? "Select the correct option."
              : "Select all applicable correct options (multi-answer)."}
          </p>
        </div>

        {onToggleChoiceMode && (
          <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-[11px] font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onToggleChoiceMode(true)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                isSingleChoice
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Single Choice
            </button>
            <button
              type="button"
              onClick={() => onToggleChoiceMode(false)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                !isSingleChoice
                  ? "bg-card text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Multiple Answers
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          const label = buildOptionLabel(index);
          const isCorrect = option.isCorrect;

          return (
            <div
              key={index}
              className={`flex items-center gap-2 p-2 rounded-xl border transition-colors ${
                isCorrect
                  ? "bg-muted/60 border-primary/40 text-foreground"
                  : "bg-card border-border text-foreground"
              }`}
            >
              <button
                type="button"
                onClick={() => handleToggleCorrect(index)}
                className={`p-1 rounded-full transition-colors shrink-0 cursor-pointer ${
                  isCorrect
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={isCorrect ? "Correct answer" : "Mark as correct"}
              >
                {isSingleChoice ? (
                  isCorrect ? (
                    <CheckCircle2 size={18} className="fill-primary/20" />
                  ) : (
                    <Circle size={18} />
                  )
                ) : isCorrect ? (
                  <CheckSquare size={18} className="text-primary" />
                ) : (
                  <Square size={18} />
                )}
              </button>

              <span className="font-mono text-xs font-bold text-muted-foreground w-5 text-center shrink-0">
                {label}
              </span>

              <input
                value={option.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                placeholder={`Option ${label} answer text...`}
                className="flex-1 h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
                  title="Remove option"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {options.length < 6 && (
        <button
          type="button"
          onClick={handleAddOption}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors cursor-pointer"
        >
          <Plus size={13} />
          <span>Add Option</span>
        </button>
      )}
    </div>
  );
}
