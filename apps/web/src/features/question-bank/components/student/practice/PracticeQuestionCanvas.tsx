"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  Strikethrough,
  Send,
  Check,
  X,
  Sparkles,
  HelpCircle,
  MessageSquare,
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

  // Sync state if question or selectedOptionKey changes
  useEffect(() => {
    setTextInput(selectedOptionKey || "");
    setNumericInput(selectedOptionKey || "");
  }, [question.id, selectedOptionKey]);

  const isAnswered = Boolean(selectedOptionKey);
  const isTf = question.type === "TRUE_FALSE";
  const isMcq = question.type === "MCQ" || (!question.type && !isTf);
  const isShortOrLongAnswer = question.type === "SHORT_ANSWER" || question.type === "LONG_ANSWER";
  const isNumeric = question.type === "NUMERIC";

  const correctOption = question.options?.find((o) => o.isCorrect) || question.options?.[0];
  const isUserCorrect =
    isAnswered &&
    correctOption &&
    (selectedOptionKey === correctOption.id ||
      selectedOptionKey === correctOption.text ||
      selectedOptionKey?.toLowerCase() === correctOption.text?.toLowerCase());

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

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsFeedbackSubmitted(true);
    setIsFeedbackOpen(false);
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-5 sm:p-8 shadow-xs space-y-6">
      {/* Question Meta Header */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3.5 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded-md font-mono">
            Q{questionNumber}
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span className="capitalize font-medium text-foreground">
            {question.type?.replace("_", " ").toLowerCase() || "Multiple Choice"}
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span
            className={`px-2 py-0.2 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
              question.difficulty === "HARD"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : question.difficulty === "EASY"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
            }`}
          >
            {question.difficulty || "MEDIUM"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-foreground text-xs">
            {question.defaultPoints} {question.defaultPoints === 1 ? "Point" : "Points"}
          </span>
          <button
            type="button"
            onClick={() => setIsFeedbackOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Leave question feedback"
          >
            <MessageSquare size={13} />
            <span>{isFeedbackSubmitted ? "Feedback Sent" : "Feedback"}</span>
          </button>
        </div>
      </div>

      {/* Question Feedback Drawer */}
      {isFeedbackOpen && !isFeedbackSubmitted && (
        <form onSubmit={handleFeedbackSubmit} className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2.5 text-xs">
          <span className="font-bold text-foreground block">
            Question Feedback & Study Notes
          </span>
          <textarea
            rows={2}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Report confusing wording, ask for clarification, or leave a private study note..."
            className="w-full p-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(false)}
              className="px-3 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!feedbackText.trim()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send size={12} />
              <span>Submit Note</span>
            </button>
          </div>
        </form>
      )}

      {/* Question Prompt */}
      <div className="text-sm sm:text-base font-semibold text-foreground leading-relaxed break-words whitespace-pre-wrap">
        {question.prompt}
      </div>

      {/* TRUE / FALSE Question Style */}
      {isTf && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {["True", "False"].map((tfValue) => {
            const isSelected = selectedOptionKey?.toLowerCase() === tfValue.toLowerCase();
            const optionObj = question.options?.find(
              (o) => o.text.toLowerCase() === tfValue.toLowerCase()
            );
            const isThisCorrect = optionObj?.isCorrect ?? (tfValue === "True");
            const isEliminated = eliminatedOptionKeys.has(tfValue);

            let cardStyle = "bg-card hover:bg-muted/40 border-border text-foreground hover:border-foreground/30";

            if (isAnswered) {
              if (isSelected) {
                cardStyle = isThisCorrect
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold"
                  : "bg-destructive/10 border-destructive text-destructive font-bold";
              } else if (isThisCorrect) {
                cardStyle = "bg-emerald-500/10 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 font-semibold";
              } else {
                cardStyle = "bg-card border-border text-muted-foreground opacity-40";
              }
            } else if (isEliminated) {
              cardStyle = "bg-muted/20 border-border/40 text-muted-foreground opacity-40 line-through";
            }

            return (
              <div
                key={tfValue}
                className={`rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-3 transition-all cursor-pointer ${cardStyle}`}
                onClick={() => onSelectOption(tfValue)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tfValue === "True"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tfValue === "True" ? <Check size={18} /> : <X size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{tfValue}</p>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Key: {tfValue === "True" ? "T / 1" : "F / 2"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isAnswered && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleEliminateOption(tfValue);
                      }}
                      className="p-1 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                      title={isEliminated ? "Restore option" : "Eliminate option"}
                    >
                      <Strikethrough size={14} />
                    </button>
                  )}

                  {isAnswered && isSelected && (
                    <span>
                      {isThisCorrect ? (
                        <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle size={20} className="text-destructive" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multiple Choice (MCQ) Question Style */}
      {isMcq && question.options && question.options.length > 0 && (
        <div className="space-y-3 pt-1">
          {question.options.map((opt, idx) => {
            const optKey = opt.id || opt.text || String(idx);
            const isSelected = selectedOptionKey === optKey;
            const isEliminated = eliminatedOptionKeys.has(optKey);

            let containerStyle = "bg-card hover:bg-muted/40 border-border text-foreground hover:border-foreground/30";

            if (isAnswered) {
              if (isSelected) {
                containerStyle = opt.isCorrect
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold"
                  : "bg-destructive/10 border-destructive text-destructive font-bold";
              } else if (opt.isCorrect) {
                containerStyle = "bg-emerald-500/10 border-emerald-500/60 text-emerald-700 dark:text-emerald-400 font-semibold";
              } else {
                containerStyle = "bg-card border-border text-muted-foreground opacity-40";
              }
            } else if (isEliminated) {
              containerStyle = "bg-muted/20 border-border/40 text-muted-foreground opacity-40 line-through";
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
                        <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle size={18} className="text-destructive" />
                      )}
                    </span>
                  )}

                  {isAnswered && !isSelected && opt.isCorrect && (
                    <span>
                      <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Short or Long Answer Question Style */}
      {isShortOrLongAnswer && (
        <form onSubmit={handleTextSubmit} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Your Written Response
            </label>
            <textarea
              rows={question.type === "LONG_ANSWER" ? 4 : 2}
              value={isAnswered ? selectedOptionKey : textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={isAnswered}
              placeholder="Type your response here..."
              className="w-full p-3.5 rounded-2xl bg-muted/30 border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:bg-background transition-all disabled:opacity-75"
            />
          </div>

          {!isAnswered && (
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>Submit Response</span>
              <Send size={13} />
            </button>
          )}

          {isAnswered && correctOption && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-400 space-y-1">
              <strong className="block font-bold">Standard Model Solution:</strong>
              <p>{correctOption.text}</p>
            </div>
          )}
        </form>
      )}

      {/* Numeric Question Style */}
      {isNumeric && (
        <form onSubmit={handleNumericSubmit} className="space-y-3 pt-1">
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
                className="w-full h-10 px-3.5 rounded-2xl bg-muted/30 border border-border text-xs sm:text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary focus:bg-background transition-all disabled:opacity-75"
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

      {/* Instant Feedback Banner & Detailed Explanation Drawer */}
      {isAnswered && (
        <div className="pt-4 border-t border-border space-y-3">
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold ${
              isUserCorrect
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            <div className="flex items-center gap-2">
              {isUserCorrect ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Correct Answer! (+{question.defaultPoints} pts)</span>
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  <span>Incorrect. Check the explanation below to master this concept.</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onToggleExplanation}
              className="inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer shrink-0"
            >
              <Lightbulb size={13} />
              <span>{isExplanationOpen ? "Hide Solution" : "View Solution"}</span>
            </button>
          </div>

          {isExplanationOpen && (
            <div className="p-4 sm:p-5 rounded-2xl bg-muted/60 border border-border text-xs sm:text-sm space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                <Sparkles size={14} className="text-amber-500" />
                <span>Step-by-Step Solution & Rationale</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {question.explanation ||
                  "No further detailed explanation was provided for this question item."}
              </p>
              {question.topic?.title && (
                <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Curriculum Topic:</span>
                  <span>{question.topic.title}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
