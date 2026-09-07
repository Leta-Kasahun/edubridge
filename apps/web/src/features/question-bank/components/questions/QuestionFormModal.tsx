"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, HelpCircle, Plus } from "lucide-react";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  QuestionListItem,
  QuestionDetailItem,
  CreateQuestionDto,
  QuestionType,
  DifficultyLevel,
} from "../../types/question-bank.types";
import {
  useCreateBatchQuestions,
  useUpdateQuestion,
} from "../../hooks/useQuestions";
import { useExamContexts } from "../../hooks/useExamContexts";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useAcademicYears } from "@/features/academic/academic-years";
import {
  QuestionBatchItemCard,
  BatchQuestionDraft,
} from "./QuestionBatchItemCard";
import { getErrorMessage } from "@/shared/utils";

interface QuestionFormModalProps {
  readonly bankId: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialData?: QuestionListItem | QuestionDetailItem | null;
}

function createDefaultDraft(index: number): BatchQuestionDraft {
  return {
    id: `draft-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
    type: "MCQ",
    difficulty: "MEDIUM",
    defaultPoints: 1,
    prompt: "",
    options: [
      { text: "", isCorrect: true, orderIndex: 0 },
      { text: "", isCorrect: false, orderIndex: 1 },
      { text: "", isCorrect: false, orderIndex: 2 },
      { text: "", isCorrect: false, orderIndex: 3 },
    ],
  };
}

export function QuestionFormModal({
  bankId,
  isOpen,
  onClose,
  initialData,
}: QuestionFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const isEditing = Boolean(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [subjectId, setSubjectId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [examContextId, setExamContextId] = useState("");
  const [examYear, setExamYear] = useState("");

  const [questions, setQuestions] = useState<readonly BatchQuestionDraft[]>([
    createDefaultDraft(0),
  ]);

  const { data: yearsResponse } = useAcademicYears();
  const academicYears = yearsResponse?.data ?? [];
  const { data: subjectsList = [] } = useSubjects();
  const { data: gradesList = [] } = useGrades();
  const { data: examContextsData } = useExamContexts({ limit: 100 });
  const examContexts = examContextsData?.items ?? [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setErrorMessage(null);
    if (initialData) {
      setSubjectId(initialData.subjectId || "");
      setGradeId(initialData.gradeId || "");
      setExamContextId(initialData.examContextId || "");
      setExamYear(initialData.examYear ? String(initialData.examYear) : "");

      const initialOpts =
        initialData.options && initialData.options.length > 0
          ? initialData.options
          : [
              { text: "", isCorrect: true, orderIndex: 0 },
              { text: "", isCorrect: false, orderIndex: 1 },
              { text: "", isCorrect: false, orderIndex: 2 },
              { text: "", isCorrect: false, orderIndex: 3 },
            ];

      setQuestions([
        {
          id: initialData.id,
          type: initialData.type,
          difficulty: initialData.difficulty,
          defaultPoints: initialData.defaultPoints,
          prompt: initialData.prompt,
          explanation: initialData.explanation || undefined,
          hint: initialData.hint || undefined,
          options: initialOpts,
        },
      ]);
    } else {
      setSubjectId("");
      setGradeId("");
      setExamContextId("");
      setExamYear("");
      setQuestions([createDefaultDraft(0)]);
    }
  }, [initialData, isOpen]);

  const subjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return [
      { value: "", label: "General Subject" },
      ...subjectsList.map((s) => ({ value: s.id, label: s.name })),
    ];
  }, [subjectsList]);

  const gradeOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return [
      { value: "", label: "General Grade" },
      ...gradesList.map((g) => ({ value: g.id, label: `Grade ${g.level}` })),
    ];
  }, [gradesList]);

  const contextOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return [
      { value: "", label: "General Exam" },
      ...examContexts.map((ec) => ({ value: ec.id, label: ec.name })),
    ];
  }, [examContexts]);

  const yearOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const defaultYears = Array.from({ length: 8 }, (_, i) => {
      const y = new Date().getFullYear() - i;
      return { value: String(y), label: String(y) };
    });
    if (academicYears.length === 0) return defaultYears;
    return [
      { value: "", label: "All Years" },
      ...academicYears.map((ay) => ({
        value: ay.name.replace(/Academic Year/i, "").trim() || ay.name,
        label: ay.name.replace(/Academic Year/i, "").trim() || ay.name,
      })),
    ];
  }, [academicYears]);

  const batchCreateMutation = useCreateBatchQuestions(bankId);
  const updateMutation = useUpdateQuestion(bankId, initialData?.id || "");
  const isLoading = batchCreateMutation.isPending || updateMutation.isPending;

  if (!isOpen || !mounted) return null;

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createDefaultDraft(prev.length)]);
  };

  const handleAddMultiple = (count: number) => {
    setQuestions((prev) => {
      const next = [...prev];
      for (let i = 0; i < count; i++) {
        next.push(createDefaultDraft(next.length));
      }
      return next;
    });
  };

  const handleUpdateDraft = (index: number, updated: BatchQuestionDraft) => {
    setQuestions((prev) =>
      prev.map((item, i) => (i === index ? updated : item))
    );
  };

  const handleRemoveDraft = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        setErrorMessage(`Question #${i + 1} prompt cannot be empty.`);
        return;
      }
      if (q.type === "MCQ") {
        const hasEmptyOption = q.options.some((o) => !o.text.trim());
        if (hasEmptyOption) {
          setErrorMessage(`All choices in Question #${i + 1} must have text.`);
          return;
        }
        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          setErrorMessage(`Question #${i + 1} must have at least one correct choice.`);
          return;
        }
      }
    }

    try {
      const parsedYear = examYear
        ? isNaN(Number(examYear))
          ? undefined
          : Number(examYear)
        : undefined;

      if (isEditing && initialData) {
        const single = questions[0];
        await updateMutation.mutateAsync({
          type: single.type,
          difficulty: single.difficulty,
          defaultPoints: single.defaultPoints,
          prompt: single.prompt.trim(),
          explanation: single.explanation || undefined,
          hint: single.hint || undefined,
          examContextId: examContextId || undefined,
          subjectId: subjectId || undefined,
          gradeId: gradeId || undefined,
          examYear: parsedYear,
          options:
            single.type === "MCQ" || single.type === "TRUE_FALSE"
              ? [...single.options]
              : undefined,
        });
      } else {
        const dtos: readonly CreateQuestionDto[] = questions.map((q) => ({
          type: q.type,
          difficulty: q.difficulty,
          defaultPoints: q.defaultPoints,
          prompt: q.prompt.trim(),
          explanation: q.explanation || undefined,
          hint: q.hint || undefined,
          examContextId: examContextId || undefined,
          subjectId: subjectId || undefined,
          gradeId: gradeId || undefined,
          examYear: parsedYear,
          options:
            q.type === "MCQ" || q.type === "TRUE_FALSE"
              ? [...q.options]
              : undefined,
        }));
        await batchCreateMutation.mutateAsync(dtos);
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to save questions."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-auto max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Question" : "Author Questions"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {errorMessage && <ErrorAlert message={errorMessage} />}

            <div className="bg-muted/30 rounded-2xl border border-border p-3.5 space-y-3">
              <span className="text-xs font-bold text-foreground block">
                Target Alignment
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectDropdown
                  label="Subject"
                  options={subjectOptions}
                  value={subjectId}
                  onChange={(val) => setSubjectId(val)}
                />

                <SelectDropdown
                  label="Grade Level"
                  options={gradeOptions}
                  value={gradeId}
                  onChange={(val) => setGradeId(val)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectDropdown
                  label="Exam Framework"
                  options={contextOptions}
                  value={examContextId}
                  onChange={(val) => setExamContextId(val)}
                />

                <SelectDropdown
                  label="Exam Year"
                  options={yearOptions}
                  value={examYear}
                  onChange={(val) => setExamYear(val)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-bold text-foreground">
                  Questions ({questions.length})
                </span>

                {!isEditing && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddMultiple(5)}
                      className="h-7 px-2.5 rounded-lg text-[11px] font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      +5 Questions
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddMultiple(10)}
                      className="h-7 px-2.5 rounded-lg text-[11px] font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      +10 Questions
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-lg text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Question</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3.5">
                {questions.map((q, idx) => (
                  <QuestionBatchItemCard
                    key={q.id}
                    index={idx}
                    totalCount={questions.length}
                    item={q}
                    onChange={(upd) => handleUpdateDraft(idx, upd)}
                    onRemove={() => handleRemoveDraft(idx)}
                  />
                ))}
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-primary/50 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-card/50"
                >
                  <Plus size={14} />
                  <span>Add Another Question</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-5 border-t border-border bg-card/50 flex items-center justify-between gap-2 shrink-0">
            <span className="text-xs text-muted-foreground font-medium">
              {questions.length} question{questions.length === 1 ? "" : "s"} ready
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 text-xs font-semibold text-foreground hover:bg-muted border border-border rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <SubmitButton type="submit" isLoading={isLoading} size="sm">
                {isEditing
                  ? "Save Changes"
                  : `Create ${questions.length} Question${questions.length === 1 ? "" : "s"}`}
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
