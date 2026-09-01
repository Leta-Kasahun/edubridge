"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, GraduationCap, User, Activity } from "lucide-react";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useStaffQualificationsDirectory } from "@/features/staff-qualifications";
import { useCreateSection, useUpdateSection } from "../hooks/useSections";
import { SectionRecord } from "../types/section.types";
import { SECTION_STATUS_LABELS, SectionStatusType } from "@/shared/constants/section.constants";
import { ErrorAlert, SubmitButton, SelectDropdown, SelectDropdownOption } from "@/shared/components";

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

  const academicYearOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return academicYears.map((y) => ({
      value: y.id,
      label: y.name,
      badge: y.status === "ACTIVE" ? "Active" : undefined,
    }));
  }, [academicYears]);

  const gradeOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return grades.map((g) => ({
      value: g.id,
      label: `Grade ${g.level} (${g.category})`,
      badge: `G${g.level}`,
    }));
  }, [grades]);

  const teacherOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const list: SelectDropdownOption[] = [
      { value: "", label: "-- Unassigned --" },
      ...teachers.map((t) => ({
        value: t.id,
        label: `${t.firstName} ${t.middleName || ""} ${t.lastName}`.trim(),
        description: t.employeeCode,
        badge: t.employeeCode,
        icon: User,
      })),
    ];
    return list;
  }, [teachers]);

  const statusOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return (["ACTIVE", "INACTIVE", "ARCHIVED"] as const).map((st) => ({
      value: st,
      label: SECTION_STATUS_LABELS[st],
      badge: st,
    }));
  }, []);

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
      setErrorMessage("Please enter a section name (e.g. Section A, Section B).");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="min-w-0 pr-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {isEditing ? `Edit Section ${initialSection?.name}` : "Create Class Section"}
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
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

        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 max-h-[calc(88vh-100px)] overflow-y-auto">
          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <SelectDropdown
              label="Academic Year"
              required
              disabled={isEditing || isPending}
              value={academicYearId}
              onChange={(val) => setAcademicYearId(val)}
              options={academicYearOptions}
              placeholder="Select academic year..."
            />

            <SelectDropdown
              label="Grade Level"
              required
              disabled={isEditing || isPending}
              value={gradeId}
              onChange={(val) => setGradeId(val)}
              options={gradeOptions}
              placeholder="Select grade level..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Section Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isPending}
                placeholder="e.g. Section A, Section B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
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
                className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          <SelectDropdown
            label="Homeroom Teacher"
            disabled={isPending}
            value={homeroomTeacherId}
            onChange={(val) => setHomeroomTeacherId(val)}
            options={teacherOptions}
            placeholder="Select homeroom teacher..."
            searchable
            searchPlaceholder="Search teacher..."
          />

          {isEditing && (
            <SelectDropdown
              label="Section Status"
              disabled={isPending}
              value={status}
              onChange={(val) => setStatus(val as SectionStatusType)}
              options={statusOptions}
            />
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto px-4 h-10 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isPending}
              loadingText="Saving..."
              className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
            >
              {isEditing ? "Save Changes" : "Create Section"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
