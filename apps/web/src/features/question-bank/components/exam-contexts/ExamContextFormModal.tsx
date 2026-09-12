"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Award } from "lucide-react";
import { SelectDropdown, SelectDropdownOption } from "@/shared/components/SelectDropdown";
import { SubmitButton } from "@/shared/components/SubmitButton";
import { ErrorAlert } from "@/shared/components/ErrorAlert";
import {
  ExamContextItem,
  ExamScope,
  ExamContextStatus,
} from "../../types/question-bank.types";
import {
  useCreateExamContext,
  useUpdateExamContext,
} from "../../hooks/useExamContexts";
import { useAcademicYears } from "@/features/academic/academic-years";
import { getErrorMessage } from "@/shared/utils";

const examContextSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  scope: z.enum(["NATIONAL", "REGIONAL", "SCHOOL", "GENERAL"]),
  year: z.union([z.number(), z.string()]).optional(),
  status: z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]),
});

type ExamContextFormData = z.infer<typeof examContextSchema>;

const SCOPE_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "NATIONAL", label: "National Exam", badge: "National" },
  { value: "REGIONAL", label: "Regional Exam", badge: "Regional" },
  { value: "SCHOOL", label: "School Level", badge: "School" },
  { value: "GENERAL", label: "General Assessment", badge: "General" },
];

const STATUS_OPTIONS: readonly SelectDropdownOption[] = [
  { value: "ACTIVE", label: "Active", badge: "Active" },
  { value: "DRAFT", label: "Draft", badge: "Draft" },
  { value: "ARCHIVED", label: "Archived", badge: "Archived" },
];

interface ExamContextFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialData?: ExamContextItem | null;
}

export function ExamContextFormModal({
  isOpen,
  onClose,
  initialData,
}: ExamContextFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const isEditing = Boolean(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: yearsResponse } = useAcademicYears();
  const academicYears = yearsResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExamContextFormData>({
    resolver: zodResolver(examContextSchema),
    defaultValues: {
      name: "",
      description: "",
      scope: "NATIONAL",
      year: "",
      status: "ACTIVE",
    },
  });

  const selectedScope = watch("scope");
  const selectedYear = watch("year");
  const selectedStatus = watch("status");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setErrorMessage(null);
    if (initialData) {
      reset({
        name: initialData.name,
        description: initialData.description || "",
        scope: initialData.scope,
        year: initialData.year ? String(initialData.year) : "",
        status: initialData.status,
      });
    } else {
      reset({
        name: "",
        description: "",
        scope: "NATIONAL",
        year: "",
        status: "ACTIVE",
      });
    }
  }, [initialData, reset, isOpen]);

  const yearOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const fallbackYears = Array.from({ length: 8 }, (_, i) => {
      const y = currentYear - i;
      return { value: String(y), label: String(y) };
    });

    if (academicYears.length === 0) return fallbackYears;

    return academicYears.map((ay) => ({
      value: ay.name,
      label: ay.name,
    }));
  }, [academicYears]);

  const createMutation = useCreateExamContext();
  const updateMutation = useUpdateExamContext(initialData?.id || "");

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (!isOpen || !mounted) return null;

  const onSubmit = async (formData: ExamContextFormData) => {
    setErrorMessage(null);
    try {
      const parsedYear = formData.year
        ? isNaN(Number(formData.year))
          ? undefined
          : Number(formData.year)
        : undefined;

      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          scope: formData.scope as ExamScope,
          year: parsedYear,
          status: formData.status as ExamContextStatus,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          scope: formData.scope as ExamScope,
          year: parsedYear,
          status: formData.status as ExamContextStatus,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to save exam type."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 my-auto max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Exam Type" : "New Exam Type"}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
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
                Exam Type Name <span className="text-destructive">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Enter exam type name (e.g. National Exam, Midterm)"
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.name && (
                <p className="text-[11px] text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SelectDropdown
                label="Exam Scope"
                options={SCOPE_OPTIONS}
                value={selectedScope}
                onChange={(val) => setValue("scope", val as ExamScope)}
              />

              <SelectDropdown
                label="Exam Year"
                options={yearOptions}
                value={selectedYear ? String(selectedYear) : ""}
                onChange={(val) => setValue("year", val)}
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
                setValue("status", val as "ACTIVE" | "DRAFT" | "ARCHIVED")
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
              {isEditing ? "Save Changes" : "Create Exam Type"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
