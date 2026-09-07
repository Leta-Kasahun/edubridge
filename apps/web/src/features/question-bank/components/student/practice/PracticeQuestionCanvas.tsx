"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Strikethrough,
  Send,
} from "lucide-react";
import { QuestionListItem } from "../../../types/question-bank.types";

interface PracticeQuestionCanvasProps {
  readonly question: QuestionListItem;
  readonly questionNumber: number;
  readonly selectedOptionKey?: string;
  readonly onSelectOption: (optionKey: string) => void;
  readonly eliminatedOptionKeys: ReadonlySet<string>;
  readonly onToggleEliminateOption: (optionKey: string) => void;
  readonly isExplanationOpen: boolean;
  readonly onToggleExplanation: () => void;
}

export function PracticeQuestionCanvas({
  question,
  questionNumber,
  selectedOptionKey,
  onSelectOption,
  eliminatedOptionKeys,
  onToggleEliminateOption,
  isExplanationOpen,
  onToggleExplanation,
}: PracticeQuestionCanvasProps): React.JSX.Element {
  const [textInput, setTextInput] = useState(selectedOptionKey || "");
  const [numericInput, setNumericInput] = useState(selectedOptionKey || "");

  const isAnswered = Boolean(selectedOptionKey);
  const isMcqOrTf = question.type === "MCQ" || question.type === "TRUE_FALSE" || !question.type;
  const isShortOrLongAnswer = question.type === "SHORT_ANSWER" || question.type === "LONG_ANSWER";
  const isNumeric = question.type === "NUMERIC";

  const correctOption = question.options?.find((o) => o.isCorrect) || question.options?.[0];

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onSelectOption(textInput.trim());
    }
  };

  const handleNumericSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericInput.trim()) {
      onSelectOption(numericInput.trim());
    }
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-5 sm:p-8 shadow-xs space-y-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground">
            Question {questionNumber}
          </span>
          <span>•</span>
          <span className="capitalize">{question.difficulty?.toLowerCase() || "Medium"}</span>
        </div>
        <span className="font-medium text-muted-foreground">
          {question.defaultPoints} {question.defaultPoints === 1 ? "Point" : "Points"}
        </span>
      </div>

      <div className="text-sm sm:text-base font-semibold text-foreground leading-relaxed break-words whitespace-pre-wrap">
        {question.prompt}
      </div>

      {isMcqOrTf && question.options && question.options.length > 0 && (
        <div className="space-y-3">
          {question.options.map((opt, idx) => {
            const optKey = opt.id || opt.text || String(idx);
            const isSelected = selectedOptionKey === optKey;
            const isEliminated = eliminatedOptionKeys.has(optKey);

            let containerStyle =
              "bg-card hover:bg-muted/40 border-border text-foreground";

            if (isAnswered) {
              if (isSelected) {
                containerStyle = opt.isCorrect
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold"
                  : "bg-destructive/10 border-destructive text-destructive font-semibold";
              } else if (opt.isCorrect) {
                containerStyle =
                  "bg-emerald-500/10 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 font-medium";
              } else {
                containerStyle =
                  "bg-card border-border text-muted-foreground opacity-50";
              }
            } else if (isEliminated) {
              containerStyle =
                "bg-muted/20 border-border/40 text-muted-foreground opacity-40 line-through";
            }

            return (
              <div
                key={optKey}
                className={`w-full rounded-2xl border flex items-center justify-between gap-3 p-3.5 sm:p-4 transition-all ${containerStyle}`}
              >
                <button
                  type="button"
                  onClick={() => onSelectOption(optKey)}
                  className="flex-1 flex items-center gap-3 min-w-0 text-left cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center font-mono text-xs font-bold text-muted-foreground shrink-0 select-none">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm break-words leading-snug">
                    {opt.text}
                  </span>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  {!isAnswered && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEliminateOption(optKey);
                      }}
                      className="p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title={isEliminated ? "Restore option" : "Eliminate option"}
                    >
                      <Strikethrough size={14} />
                    </button>
                  )}

                  {isAnswered && isSelected && (
                    <span>
                      {opt.isCorrect ? (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      ) : (
                        <XCircle size={18} className="text-destructive" />
                      )}
                    </span>
                  )}

                  {isAnswered && !isSelected && opt.isCorrect && (
                    <span>
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isShortOrLongAnswer && (
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Your Answer
            </label>
            <textarea
              rows={question.type === "LONG_ANSWER" ? 4 : 2}
              value={isAnswered ? selectedOptionKey : textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isAnswered}
              placeholder="Type your response here..."
              className="w-full p-3.5 rounded-2xl bg-muted/30 border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all disabled:opacity-75"
            />
          </div>

          {!isAnswered && (
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>Submit Answer</span>
              <Send size={13} />
            </button>
          )}

          {isAnswered && correctOption && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
              <strong className="block font-bold">Expected Solution:</strong>
              <p>{correctOption.text}</p>
            </div>
          )}
        </form>
      )}

      {isNumeric && (
        <form onSubmit={handleNumericSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Enter Numeric Value
            </label>
            <div className="relative max-w-xs">
              <input
                type="number"
                step="any"
                value={isAnswered ? selectedOptionKey : numericInput}
                onChange={(e) => setNumericInput(e.target.value)}
                disabled={isAnswered}
                placeholder="e.g. 42 or 3.14"
                className="w-full h-10 px-3.5 rounded-2xl bg-muted/30 border border-border text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all disabled:opacity-75"
              />
            </div>
          </div>

          {!isAnswered && (
            <button
              type="submit"
              disabled={!numericInput.trim()}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>Submit Answer</span>
              <Send size={13} />
            </button>
          )}

          {isAnswered && correctOption && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
              <strong className="block font-bold">Correct Numeric Value:</strong>
              <p className="font-mono">{correctOption.text}</p>
            </div>
          )}
        </form>
      )}

      {isAnswered && (
        <div className="pt-4 border-t border-border space-y-2.5">
          <button
            type="button"
            onClick={onToggleExplanation}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Lightbulb size={14} className="text-amber-500" />
            <span>
              {isExplanationOpen ? "Hide Explanation" : "View Explanation & Solution"}
            </span>
          </button>

          {isExplanationOpen && (
            <div className="p-4 rounded-2xl bg-muted/60 border border-border text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in-0">
              <strong className="text-foreground block mb-1">
                Solution Note:
              </strong>
              {question.explanation ||
                "No further explanation provided for this question."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
