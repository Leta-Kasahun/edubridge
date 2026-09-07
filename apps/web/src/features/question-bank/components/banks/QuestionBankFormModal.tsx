"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, FolderArchive } from "lucide-react";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  QuestionBankItem,
  QuestionBankStatus,
} from "../../types/question-bank.types";
import {
  useCreateQuestionBank,
  useUpdateQuestionBank,
} from "../../hooks/useQuestionBanks";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { getErrorMessage } from "@/shared/utils";

const questionBankSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  subjectId: z.string().optional(),
  gradeId: z.string().optional(),
});

type QuestionBankFormData = z.infer<typeof questionBankSchema>;

const STATUS_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "DRAFT", label: "Draft", badge: "Draft" },
  { value: "ACTIVE", label: "Active", badge: "Active" },
  { value: "ARCHIVED", label: "Archived", badge: "Archived" },
];

interface QuestionBankFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialData?: QuestionBankItem | null;
}

export function QuestionBankFormModal({
  isOpen,
  onClose,
  initialData,
}: QuestionBankFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const isEditing = Boolean(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: subjectsList = [] } = useSubjects();
  const { data: gradesList = [] } = useGrades();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<QuestionBankFormData>({
    resolver: zodResolver(questionBankSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "DRAFT",
      subjectId: "",
      gradeId: "",
    },
  });

  const selectedStatus = watch("status");
  const selectedSubjectId = watch("subjectId");
  const selectedGradeId = watch("gradeId");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setErrorMessage(null);
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
        status: initialData.status,
        subjectId: initialData.subjectId || "",
        gradeId: initialData.gradeId || "",
      });
    } else {
      reset({
        name: "",
        description: "",
        status: "DRAFT",
        subjectId: "",
        gradeId: "",
      });
    }
  }, [initialData, reset, isOpen]);

  const subjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return [
      { value: "", label: "General Bank (All Subjects)" },
      ...subjectsList.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    ];
  }, [subjectsList]);

  const gradeOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return [
      { value: "", label: "General Level (All Grades)" },
      ...gradesList.map((g) => ({
        value: g.id,
        label: `Grade ${g.level}`,
      })),
    ];
  }, [gradesList]);

  const createMutation = useCreateQuestionBank();
  const updateMutation = useUpdateQuestionBank(initialData?.id || "");

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (!isOpen || !mounted) return null;

  const onSubmit = async (formData: QuestionBankFormData) => {
    setErrorMessage(null);
    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          status: formData.status as QuestionBankStatus,
          subjectId: formData.subjectId || undefined,
          gradeId: formData.gradeId || undefined,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          status: formData.status as QuestionBankStatus,
          subjectId: formData.subjectId || undefined,
          gradeId: formData.gradeId || undefined,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to save question bank."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FolderArchive size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Question Bank" : "New Question Bank"}
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

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
            {errorMessage && <ErrorAlert message={errorMessage} />}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Bank Name <span className="text-destructive">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Enter bank name"
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectDropdown
                label="Subject"
                options={subjectOptions}
                value={selectedSubjectId || ""}
                onChange={(val) => setValue("subjectId", val)}
              />

              <SelectDropdown
                label="Grade Level"
                options={gradeOptions}
                value={selectedGradeId || ""}
                onChange={(val) => setValue("gradeId", val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder="Optional description or notes"
                className="w-full p-3 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            <SelectDropdown
              label="Status"
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={(val) =>
                setValue("status", val as "DRAFT" | "ACTIVE" | "ARCHIVED")
              }
            />
          </div>

          <div className="flex items-center justify-end gap-2 p-4 sm:p-5 border-t border-border bg-card shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-xl text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <SubmitButton
              type="submit"
              isLoading={isLoading}
              size="sm"
            >
              {isEditing ? "Save Changes" : "Create Bank"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
