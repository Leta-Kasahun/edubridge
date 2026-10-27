"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Check,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useGenerateContentMutation } from "../hooks/useAiGeneration";
import type { ContentTypeFormat, ContentTone, ContentScope } from "../types/ai.types";
import { ErrorAlert, SubmitButton, SelectDropdown, SelectDropdownOption } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useCurricula, useCurriculumDetails } from "@/features/curriculum/curricula/hooks/useCurricula";
import {
  useCurriculumSubjects,
  useCurriculumUnits,
  useCurriculumTopics,
} from "@/features/curriculum/structure/hooks/useStructure";

interface AiGenerateContentModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly unitId?: string;
  readonly topicId?: string;
  readonly topicTitle?: string;
  readonly onGenerated?: (contentId: string, title: string) => void;
}

const SCOPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "TOPIC", label: "Lesson", description: "Target a specific lesson" },
  { value: "UNIT", label: "Chapter", description: "Target a complete chapter" },
  { value: "SUBJECT", label: "Subject", description: "Broad subject overview" },
];

const CONTENT_TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "LESSON_NOTE", label: "Lesson Note" },
  { value: "SUMMARY", label: "Quick Summary" },
  { value: "STUDY_GUIDE", label: "Study Guide" },
  { value: "WORKSHEET", label: "Worksheet" },
];

const TONE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "ENGAGING", label: "Engaging" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "SIMPLIFIED", label: "Simple" },
];

export function AiGenerateContentModal({
  isOpen,
  onClose,
  subjectId,
  gradeId,
  unitId: initialUnitId,
  topicId: initialTopicId,
  topicTitle = "Selected Topic",
  onGenerated,
}: AiGenerateContentModalProps) {
  const [scope, setScope] = useState<ContentScope>(
    initialTopicId ? "TOPIC" : initialUnitId ? "UNIT" : "TOPIC"
  );
  const [contentType, setContentType] = useState<ContentTypeFormat>("LESSON_NOTE");
  const [tone, setTone] = useState<ContentTone>("ENGAGING");
  const [gradeLevel, setGradeLevel] = useState<number>(8);

  // Curriculum cascading selection
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || "");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || "");

  const { data: curriculaData } = useCurricula({ limit: 10 });
  const curricula = curriculaData?.data ?? [];
  const primaryCurriculumId = curricula[0]?.id || "";
  const { data: curriculumDetail } = useCurriculumDetails(primaryCurriculumId || null);
  const versions = curriculumDetail?.versions ?? [];
  const activeVersion =
    versions.find((v) => v.status === "ACTIVE") ||
    versions.find((v) => v.status === "DRAFT") ||
    versions[0];
  const versionId = activeVersion?.id || "";

  const { data: curriculumSubjects = [] } = useCurriculumSubjects(versionId);
  const matchedCurriculumSubject = curriculumSubjects.find(
    (cs) => cs.subjectId === subjectId && (!gradeId || cs.gradeId === gradeId)
  );
  const curriculumSubjectId = matchedCurriculumSubject?.id || "";

  const { data: units = [] } = useCurriculumUnits(
    curriculumSubjectId,
    Boolean(curriculumSubjectId)
  );

  const activeUnitId = selectedUnitId || initialUnitId || units[0]?.id || "";
  const { data: topics = [] } = useCurriculumTopics(
    activeUnitId,
    Boolean(activeUnitId)
  );

  useEffect(() => {
    if (!selectedUnitId && units.length > 0) {
      setSelectedUnitId(initialUnitId || units[0].id);
    }
  }, [units, selectedUnitId, initialUnitId]);

  useEffect(() => {
    if (!selectedTopicId && topics.length > 0) {
      setSelectedTopicId(initialTopicId || topics[0].id);
    }
  }, [topics, selectedTopicId, initialTopicId]);

  const unitOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return units.map((u) => ({
      value: u.id,
      label: u.title,
    }));
  }, [units]);

  const topicOptions: readonly SelectDropdownOption[] = useMemo(() => {
    if (topics.length === 0) {
      return [{ value: "", label: topicTitle || "General Lesson" }];
    }
    return topics.map((t) => ({
      value: t.id,
      label: t.title,
    }));
  }, [topics, topicTitle]);

  const generateMutation = useGenerateContentMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await generateMutation.mutateAsync({
        scope,
        subjectId,
        gradeId: gradeId || undefined,
        unitId: (scope === "UNIT" || scope === "TOPIC") && activeUnitId ? activeUnitId : undefined,
        topicId:
          scope === "TOPIC" && (selectedTopicId || initialTopicId)
            ? selectedTopicId || initialTopicId
            : undefined,
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

  const currentUnitTitle =
    units.find((u) => u.id === activeUnitId)?.title || "Selected Chapter";
  const currentTopicTitle =
    topics.find((t) => t.id === (selectedTopicId || initialTopicId))?.title || topicTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl sm:max-w-2xl max-w-[calc(100vw-1.5rem)] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary-foreground/15 rounded-xl shrink-0">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">Draft Content with AI</h3>
              <p className="text-xs text-primary-foreground/80 truncate max-w-[280px] sm:max-w-[420px]">
                {scope === "TOPIC" && `Lesson: ${currentTopicTitle}`}
                {scope === "UNIT" && `Chapter: ${currentUnitTitle}`}
                {scope === "SUBJECT" && "Subject Overview"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-primary-foreground/75 hover:text-primary-foreground hover:bg-primary-foreground/15 transition-colors shrink-0 cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {/* Approval Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-muted/60 border border-border rounded-xl">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              New lesson material is created as a <strong className="text-foreground">Draft</strong>. You can review, refine, and approve it before publishing to students.
            </p>
          </div>

          {generateMutation.isError && (
            <ErrorAlert
              message={getErrorMessage(
                generateMutation.error,
                "Unable to draft lesson material right now. Please verify your entries and try again."
              )}
            />
          )}

          {/* Scope Selection using SelectDropdown */}
          <SelectDropdown
            label="Scope"
            value={scope}
            onChange={(val) => setScope(val as ContentScope)}
            options={SCOPE_OPTIONS}
            placeholder="Select target scope..."
          />

          {/* Unit / Topic Selectors using SelectDropdown */}
          {(scope === "TOPIC" || scope === "UNIT") && units.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 bg-muted/40 border border-border/80 rounded-xl">
              <SelectDropdown
                label="Chapter"
                value={activeUnitId}
                onChange={(val) => {
                  setSelectedUnitId(val);
                  setSelectedTopicId("");
                }}
                options={unitOptions}
                placeholder="Select chapter..."
                searchable={unitOptions.length > 5}
              />

              {scope === "TOPIC" && (
                <SelectDropdown
                  label="Lesson"
                  value={selectedTopicId || initialTopicId || ""}
                  onChange={(val) => setSelectedTopicId(val)}
                  options={topicOptions}
                  placeholder="Select lesson..."
                  searchable={topicOptions.length > 5}
                />
              )}
            </div>
          )}

          {/* Format and Tone Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <SelectDropdown
              label="Material Format"
              value={contentType}
              onChange={(val) => setContentType(val as ContentTypeFormat)}
              options={CONTENT_TYPE_OPTIONS}
              placeholder="Select format..."
            />

            <SelectDropdown
              label="Writing Style"
              value={tone}
              onChange={(val) => setTone(val as ContentTone)}
              options={TONE_OPTIONS}
              placeholder="Select style..."
            />
          </div>

          {/* Grade Level */}
          <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground text-xs">
                Target Grade Level
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={gradeLevel}
                  onChange={(e) =>
                    setGradeLevel(Math.max(1, Math.min(12, Number(e.target.value) || 1)))
                  }
                  className="w-16 bg-card border border-border rounded-md px-2 py-1 text-xs font-semibold text-primary text-center focus:outline-hidden focus:ring-1 focus:ring-primary"
                />
                <span className="text-[11px] text-muted-foreground">Grade</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Grade 1</span>
              <span>Grade 6</span>
              <span>Grade 12</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 shrink-0 border-t border-border mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={generateMutation.isPending}
              className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              size="sm"
              isLoading={generateMutation.isPending}
              loadingText="Drafting material..."
              icon={<Check className="w-3.5 h-3.5" />}
              iconPosition="left"
              className="rounded-xl px-5 py-2 text-xs font-medium"
            >
              Draft Material
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
