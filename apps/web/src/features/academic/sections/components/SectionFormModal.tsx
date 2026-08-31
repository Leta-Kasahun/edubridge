"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useStaffQualificationsDirectory } from "@/features/staff-qualifications";
import { useCreateSection, useUpdateSection } from "../hooks/useSections";
import { SectionRecord } from "../types/section.types";
import { SECTION_STATUS_LABELS, SectionStatusType } from "@/shared/constants/section.constants";
import { ErrorAlert, SubmitButton } from "@/shared/components";

interface SectionFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialSection?: SectionRecord | null;
  readonly defaultAcademicYearId?: string;
  readonly defaultGradeId?: string;
}

export function SectionFormModal({
  isOpen,
  onClose,
  initialSection,
  defaultAcademicYearId,
  defaultGradeId,
}: SectionFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const isEditing = Boolean(initialSection);
  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();

  const { data: academicYearsResponse } = useAcademicYears();
  const academicYears = academicYearsResponse?.data || [];

  const { data: grades = [] } = useGrades({ isActive: true });

  const { data: staffDirectoryResponse } = useStaffQualificationsDirectory({
    status: "ACTIVE",
    limit: 100,
  });
  const teachers = staffDirectoryResponse?.data || [];

  const [academicYearId, setAcademicYearId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState<string>("50");
  const [homeroomTeacherId, setHomeroomTeacherId] = useState("");
  const [status, setStatus] = useState<SectionStatusType>("ACTIVE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialSection) {
      setAcademicYearId(initialSection.academicYearId);
      setGradeId(initialSection.gradeId);
      setName(initialSection.name);
      setCapacity(initialSection.capacity ? String(initialSection.capacity) : "");
      setHomeroomTeacherId(initialSection.homeroomTeacher?.teacherId || "");
      setStatus(initialSection.status);
    } else {
      const activeYear = academicYears.find((y) => y.status === "ACTIVE");
      setAcademicYearId(defaultAcademicYearId || activeYear?.id || (academicYears[0]?.id ?? ""));
      setGradeId(defaultGradeId || (grades[0]?.id ?? ""));
      setName("");
      setCapacity("50");
      setHomeroomTeacherId("");
      setStatus("ACTIVE");
    }
    setErrorMessage(null);
  }, [initialSection, isOpen, defaultAcademicYearId, defaultGradeId, academicYears, grades]);

  if (!isOpen || !mounted) return null;

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter a section name (e.g. A, B, 1).");
      return;
    }

    if (!academicYearId) {
      setErrorMessage("Please select an academic year.");
      return;
    }

    if (!gradeId) {
      setErrorMessage("Please select a grade level.");
      return;
    }

    const parsedCapacity = capacity.trim() ? Number(capacity) : null;
    if (parsedCapacity !== null && (isNaN(parsedCapacity) || parsedCapacity < 1)) {
      setErrorMessage("Capacity must be a positive number.");
      return;
    }

    try {
      if (isEditing && initialSection) {
        await updateMutation.mutateAsync({
          id: initialSection.id,
          payload: {
            name: name.trim(),
            capacity: parsedCapacity,
            status,
            homeroomTeacherId: homeroomTeacherId || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          academicYearId,
          gradeId,
          name: name.trim(),
          capacity: parsedCapacity,
          homeroomTeacherId: homeroomTeacherId || null,
        });
      }
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save section.";
      setErrorMessage(message);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0 pr-4">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {isEditing ? `Edit Section ${initialSection?.name}` : "Create Class Section"}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isEditing
                ? "Update section details and homeroom assignment"
                : "Add a new class cohort to grade level"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Academic Year <span className="text-destructive">*</span>
              </label>
              <select
                disabled={isEditing || isPending}
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary disabled:opacity-60"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.status === "ACTIVE" ? "(Active)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Grade Level <span className="text-destructive">*</span>
              </label>
              <select
                disabled={isEditing || isPending}
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary disabled:opacity-60"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    Grade {g.level} ({g.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Section Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isPending}
                placeholder="e.g. A, B, 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Max Capacity
              </label>
              <input
                type="number"
                min="1"
                max="200"
                disabled={isPending}
                placeholder="e.g. 50"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Homeroom Teacher
            </label>
            <select
              disabled={isPending}
              value={homeroomTeacherId}
              onChange={(e) => setHomeroomTeacherId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary"
            >
              <option value="">-- Unassigned --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.employeeCode})
                </option>
              ))}
            </select>
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Section Status
              </label>
              <select
                disabled={isPending}
                value={status}
                onChange={(e) => setStatus(e.target.value as SectionStatusType)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary"
              >
                {(["ACTIVE", "INACTIVE", "ARCHIVED"] as const).map((st) => (
                  <option key={st} value={st}>
                    {SECTION_STATUS_LABELS[st]}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="w-36">
              <SubmitButton
                isLoading={isPending}
                loadingText="Saving..."
                size="sm"
                className="h-10 rounded-xl text-xs font-semibold"
              >
                {isEditing ? "Save Changes" : "Create Section"}
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
