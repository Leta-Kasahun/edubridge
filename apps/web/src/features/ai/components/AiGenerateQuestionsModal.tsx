"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  X,
  Check,
  ShieldCheck,
  CheckSquare,
  Binary,
  PenTool,
  Calculator,
  Sliders,
  ListPlus,
} from "lucide-react";
import { useGenerateQuestionsMutation } from "../hooks/useAiGeneration";
import type {
  QuestionDifficulty,
  QuestionTypeFormat,
  QuestionScope,
  QuestionTypeDistribution,
} from "../types/ai.types";
import { ErrorAlert, SubmitButton, SelectDropdown, SelectDropdownOption } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useCurricula, useCurriculumDetails } from "@/features/curriculum/curricula/hooks/useCurricula";
import {
  useCurriculumSubjects,
  useCurriculumUnits,
  useCurriculumTopics,
} from "@/features/curriculum/structure/hooks/useStructure";
import { useExamContexts } from "@/features/question-bank/hooks/useExamContexts";

interface AiGenerateQuestionsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly subjectId: string;
  readonly gradeId?: string;
  readonly unitId?: string;
  readonly topicId?: string;
  readonly questionBankId?: string;
  readonly topicTitle?: string;
  readonly onGenerated?: (count: number, bankId: string) => void;
}

const SCOPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "TOPIC", label: "Topic", description: "Target a specific topic or lesson" },
  { value: "UNIT", label: "Unit", description: "Target a complete curriculum unit" },
  { value: "SUBJECT", label: "Subject", description: "Comprehensive subject coverage" },
  { value: "MOCK_EXAM", label: "Mock Exam", description: "Standardized benchmark examination paper" },
];

const DIFFICULTY_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Challenging" },
  { value: "MIXED", label: "Balanced" },
];

const QUESTION_TYPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "MCQ", label: "Multiple Choice" },
  { value: "TRUE_FALSE", label: "True False" },
  { value: "SHORT_ANSWER", label: "Short Answer" },
  { value: "NUMERIC", label: "Calculations" },
  { value: "MIXED", label: "Balanced Format" },
];

export function AiGenerateQuestionsModal({
  isOpen,
  onClose,
  subjectId,
  gradeId,
  unitId: initialUnitId,
  topicId: initialTopicId,
  questionBankId,
  topicTitle = "Selected Scope",
  onGenerated,
}: AiGenerateQuestionsModalProps) {
  const [scope, setScope] = useState<QuestionScope>(
    initialTopicId ? "TOPIC" : initialUnitId ? "UNIT" : "TOPIC"
  );
  const [generationMode, setGenerationMode] = useState<"SINGLE" | "MULTI">("MULTI");

  // Single mode state
  const [singleCount, setSingleCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<QuestionTypeFormat>("MCQ");

  // Multi-type distribution state (Direct numeric inputs)
  const [mcqCount, setMcqCount] = useState<number>(10);
  const [trueFalseCount, setTrueFalseCount] = useState<number>(10);
  const [shortAnswerCount, setShortAnswerCount] = useState<number>(5);
  const [numericCount, setNumericCount] = useState<number>(5);

  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("MEDIUM");

  // Curriculum & Cascading selection
  const [selectedUnitId, setSelectedUnitId] = useState<string>(initialUnitId || "");
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId || "");
  const [selectedExamContextId, setSelectedExamContextId] = useState<string>("");

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

  const { data: examContextsData } = useExamContexts({ limit: 50 });
  const examContexts = examContextsData?.items ?? [];

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
      return [{ value: "", label: topicTitle || "General Topic" }];
    }
    return topics.map((t) => ({
      value: t.id,
      label: t.title,
    }));
  }, [topics, topicTitle]);

  const contextOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const list: SelectDropdownOption[] = [
      { value: "", label: "Standard Mock Exam" },
    ];
    for (const ctx of examContexts) {
      list.push({
        value: ctx.id,
        label: `${ctx.name} (${ctx.scope}${ctx.examYear ? ` ${ctx.examYear}` : ""})`,
      });
    }
    return list;
  }, [examContexts]);

  const totalMultiCount = useMemo(
    () => mcqCount + trueFalseCount + shortAnswerCount + numericCount,
    [mcqCount, trueFalseCount, shortAnswerCount, numericCount]
  );

  const effectiveCount = generationMode === "MULTI" ? totalMultiCount : singleCount;

  const generateMutation = useGenerateQuestionsMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (effectiveCount < 1) return;

    const distribution: QuestionTypeDistribution | undefined =
      generationMode === "MULTI"
        ? {
            MCQ: mcqCount > 0 ? mcqCount : undefined,
            TRUE_FALSE: trueFalseCount > 0 ? trueFalseCount : undefined,
            SHORT_ANSWER: shortAnswerCount > 0 ? shortAnswerCount : undefined,
            NUMERIC: numericCount > 0 ? numericCount : undefined,
          }
        : undefined;

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
        examContextId:
          scope === "MOCK_EXAM" && selectedExamContextId ? selectedExamContextId : undefined,
        count: effectiveCount,
        difficulty,
        questionType: generationMode === "MULTI" ? "MIXED" : questionType,
        typeDistribution: distribution,
        questionBankId,
      });

      onGenerated?.(res.questionsCreated, res.questionBankId);
      onClose();
    } catch {
      // Error handled by mutation state and ErrorAlert
    }
  };

  const currentUnitTitle =
    units.find((u) => u.id === activeUnitId)?.title || "Selected Unit";
  const currentTopicTitle =
    topics.find((t) => t.id === (selectedTopicId || initialTopicId))?.title || topicTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl sm:max-w-2xl max-w-[calc(100vw-1.5rem)] bg-card text-card-foreground rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-primary text-primary-foreground shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary-foreground/15 rounded-xl shrink-0">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold truncate">Generate Questions with AI</h3>
              <p className="text-xs text-primary-foreground/80 truncate max-w-[280px] sm:max-w-[420px]">
                {scope === "TOPIC" && `Topic: ${currentTopicTitle}`}
                {scope === "UNIT" && `Unit: ${currentUnitTitle}`}
                {scope === "SUBJECT" && "Subject Scope"}
                {scope === "MOCK_EXAM" && "Standardized Mock Exam"}
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
          {/* Draft Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-muted/60 border border-border rounded-xl">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Questions are created as <strong className="text-foreground">Drafts</strong>. You can review, refine, edit, and approve them before publishing to students.
            </p>
          </div>

          {generateMutation.isError && (
            <ErrorAlert
              message={getErrorMessage(
                generateMutation.error,
                "Unable to generate questions right now. Please verify your entries and try again."
              )}
            />
          )}

          {/* 1. Scope Selection using Shared SelectDropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <SelectDropdown
              label="Scope"
              value={scope}
              onChange={(val) => setScope(val as QuestionScope)}
              options={SCOPE_OPTIONS}
              placeholder="Select scope..."
            />

            <SelectDropdown
              label="Difficulty"
              value={difficulty}
              onChange={(val) => setDifficulty(val as QuestionDifficulty)}
              options={DIFFICULTY_OPTIONS}
              placeholder="Select difficulty..."
            />
          </div>

          {/* Cascading Scope Target Selectors using Shared SelectDropdown */}
          {(scope === "TOPIC" || scope === "UNIT") && units.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3 bg-muted/40 border border-border/80 rounded-xl">
              <SelectDropdown
                label="Unit"
                value={activeUnitId}
                onChange={(val) => {
                  setSelectedUnitId(val);
                  setSelectedTopicId("");
                }}
                options={unitOptions}
                placeholder="Select unit..."
                searchable={unitOptions.length > 5}
              />

              {scope === "TOPIC" && (
                <SelectDropdown
                  label="Topic"
                  value={selectedTopicId || initialTopicId || ""}
                  onChange={(val) => setSelectedTopicId(val)}
                  options={topicOptions}
                  placeholder="Select topic..."
                  searchable={topicOptions.length > 5}
                />
              )}
            </div>
          )}

          {scope === "MOCK_EXAM" && examContexts.length > 0 && (
            <div className="p-3 bg-muted/40 border border-border/80 rounded-xl">
              <SelectDropdown
                label="Exam Scope"
                value={selectedExamContextId}
                onChange={(val) => setSelectedExamContextId(val)}
                options={contextOptions}
                placeholder="Choose examination scope..."
                searchable={contextOptions.length > 5}
              />
            </div>
          )}

          {/* 2. Generation Mode: Multi-Type vs Single Type */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground text-xs">
                Question Format
              </label>
              <div className="flex items-center rounded-xl border border-border bg-muted/50 p-1">
                <button
                  type="button"
                  onClick={() => setGenerationMode("MULTI")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    generationMode === "MULTI"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListPlus className="w-3.5 h-3.5 text-primary" />
                  Multi Type
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode("SINGLE")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    generationMode === "SINGLE"
                      ? "bg-card text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                  Single Format
                </button>
              </div>
            </div>

            {generationMode === "MULTI" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* MCQ Input */}
                  <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                        <CheckSquare className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground truncate">
                        Multiple Choice
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={mcqCount}
                        onChange={(e) =>
                          setMcqCount(Math.max(0, Math.min(30, Number(e.target.value) || 0)))
                        }
                        className="w-16 bg-muted/40 border border-border rounded-lg px-2 py-1 text-xs font-semibold text-foreground text-center focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-muted-foreground">qs</span>
                    </div>
                  </div>

                  {/* True False Input */}
                  <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg shrink-0">
                        <Binary className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-medium text-foreground truncate">
                        True False
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={trueFalseCount}
                        onChange={(e) =>
                          setTrueFalseCount(
                            Math.max(0, Math.min(30, Number(e.target.value) || 0))
                          )
                        }
                        className="w-16 bg-muted/40 border border-border rounded-lg px-2 py-1 text-xs font-semibold text-foreground text-center focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-muted-foreground">qs</span>
                    </div>
                  </div>

                  {/* Short Answer Input */}
                  <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-amber-500/10 rounded-lg shrink-0">
                        <PenTool className="w-4 h-4 text-amber-500" />
                      </div>
                      <span className="font-medium text-foreground truncate">
                        Short Answer
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={shortAnswerCount}
                        onChange={(e) =>
                          setShortAnswerCount(
                            Math.max(0, Math.min(30, Number(e.target.value) || 0))
                          )
                        }
                        className="w-16 bg-muted/40 border border-border rounded-lg px-2 py-1 text-xs font-semibold text-foreground text-center focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-muted-foreground">qs</span>
                    </div>
                  </div>

                  {/* Calculations Input */}
                  <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg shrink-0">
                        <Calculator className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="font-medium text-foreground truncate">
                        Calculations
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        min={0}
                        max={30}
                        value={numericCount}
                        onChange={(e) =>
                          setNumericCount(
                            Math.max(0, Math.min(30, Number(e.target.value) || 0))
                          )
                        }
                        className="w-16 bg-muted/40 border border-border rounded-lg px-2 py-1 text-xs font-semibold text-foreground text-center focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-muted-foreground">qs</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-3.5 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                  <span className="text-xs font-medium text-foreground">
                    Total Questions to Generate
                  </span>
                  <span className="text-xs font-bold text-primary">
                    {totalMultiCount} Questions
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <SelectDropdown
                  label="Question Format"
                  value={questionType}
                  onChange={(val) => setQuestionType(val as QuestionTypeFormat)}
                  options={QUESTION_TYPE_OPTIONS}
                  placeholder="Select question format..."
                />

                <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      Number of Questions
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={singleCount}
                        onChange={(e) =>
                          setSingleCount(
                            Math.max(1, Math.min(50, Number(e.target.value) || 1))
                          )
                        }
                        className="w-16 bg-card border border-border rounded-md px-2 py-1 text-xs font-semibold text-primary text-center focus:outline-hidden focus:ring-1 focus:ring-primary"
                      />
                      <span className="text-[11px] text-muted-foreground">qs</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={singleCount}
                    onChange={(e) => setSingleCount(Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                    <span>25</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
            )}
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
              loadingText="Creating questions..."
              icon={<Check className="w-3.5 h-3.5" />}
              iconPosition="left"
              className="rounded-xl px-5 py-2 text-xs font-medium"
            >
              Generate {effectiveCount} Questions
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}
