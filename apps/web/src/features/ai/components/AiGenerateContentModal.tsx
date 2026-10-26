"use client";

import React, { useState } from "react";
import { X, Check, FileText, ShieldCheck } from "lucide-react";
import { useGenerateContentMutation } from "../hooks/useAiGeneration";
import type { ContentTypeFormat, ContentTone } from "../types/ai.types";
import { ErrorAlert, SubmitButton } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface AiGenerateContentModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly topicId: string;
  readonly topicTitle?: string;
  readonly onGenerated?: (contentId: string, title: string) => void;
}

export function AiGenerateContentModal({
  isOpen,
  onClose,
  subjectId,
  gradeId,
  topicId,
  topicTitle = "Selected Topic",
  onGenerated,
}: AiGenerateContentModalProps) {
  const [contentType, setContentType] = useState<ContentTypeFormat>("LESSON_NOTE");
  const [tone, setTone] = useState<ContentTone>("ENGAGING");
  const [gradeLevel, setGradeLevel] = useState<number>(8);

  const generateMutation = useGenerateContentMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await generateMutation.mutateAsync({
        subjectId,
        gradeId,
        topicId,
        contentType,
        tone,
        targetGradeLevel: gradeLevel,
      });

      onGenerated?.(res.contentId, res.title);
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
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">Draft Lesson Material</h3>
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
          {/* Approval Notice */}
          <div className="flex items-start gap-2 p-2.5 bg-muted/60 border border-border rounded-xl">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              New lesson material is created as a <strong className="text-foreground">Draft</strong>. You can review, refine, and approve it before publishing to students.
            </p>
          </div>

          {generateMutation.isError && (
            <ErrorAlert
              message={getErrorMessage(
                generateMutation.error,
                "Unable to draft lesson material right now. Please try again."
              )}
            />
          )}

          <div>
            <label className="block font-medium text-foreground mb-1.5">
              Material Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { type: "LESSON_NOTE", label: "Lesson Note" },
                { type: "SUMMARY", label: "Quick Summary" },
                { type: "STUDY_GUIDE", label: "Study Guide" },
                { type: "WORKSHEET", label: "Worksheet" },
              ].map(({ type, label }) => {
                const isSelected = contentType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setContentType(type as ContentTypeFormat)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition-all text-center truncate cursor-pointer ${
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
            <label className="block font-medium text-foreground mb-1.5">
              Writing Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { toneKey: "FORMAL", label: "Standard" },
                { toneKey: "ENGAGING", label: "Engaging" },
                { toneKey: "SIMPLIFIED", label: "Simple" },
              ].map(({ toneKey, label }) => {
                const isSelected = tone === toneKey;
                return (
                  <button
                    key={toneKey}
                    type="button"
                    onClick={() => setTone(toneKey as ContentTone)}
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
                Target Grade
              </label>
              <span className="font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-md">
                Grade {gradeLevel}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Grade 1</span>
              <span>Grade 6</span>
              <span>Grade 12</span>
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
              loadingText="Drafting material..."
              icon={<Check className="w-3.5 h-3.5" />}
              iconPosition="left"
              className="rounded-xl px-4 py-2 text-xs font-medium"
            >
              Draft Material
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
