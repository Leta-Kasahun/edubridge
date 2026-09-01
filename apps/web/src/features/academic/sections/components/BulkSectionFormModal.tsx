"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Check, Calendar, GraduationCap } from "lucide-react";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useBulkCreateSections } from "../hooks/useSections";
import { STANDARD_SECTION_NAMES } from "@/shared/constants/section.constants";
import { ErrorAlert, SubmitButton, SelectDropdown, SelectDropdownOption } from "@/shared/components";

interface BulkSectionFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly defaultAcademicYearId?: string;
  readonly defaultGradeId?: string;
}

export function BulkSectionFormModal({
  isOpen,
  onClose,
  defaultAcademicYearId,
  defaultGradeId,
}: BulkSectionFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const bulkCreateMutation = useBulkCreateSections();

  const { data: academicYearsResponse } = useAcademicYears();
  const academicYears = academicYearsResponse?.data || [];

  const { data: grades = [] } = useGrades({ isActive: true });

  const [academicYearId, setAcademicYearId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [selectedNames, setSelectedNames] = useState<string[]>(["A", "B", "C"]);
  const [customNameInput, setCustomNameInput] = useState("");
  const [capacity, setCapacity] = useState("50");
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const activeYear = academicYears.find((y) => y.status === "ACTIVE");
    setAcademicYearId(defaultAcademicYearId || activeYear?.id || (academicYears[0]?.id ?? ""));
    setGradeId(defaultGradeId || (grades[0]?.id ?? ""));
    setSelectedNames(["A", "B", "C"]);
    setCustomNameInput("");
    setCapacity("50");
    setErrorMessage(null);
  }, [isOpen, defaultAcademicYearId, defaultGradeId, academicYears, grades]);

  if (!isOpen || !mounted) return null;

  const toggleStandardName = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAddCustom = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const trimmed = customNameInput.trim().toUpperCase();
    if (trimmed && !selectedNames.includes(trimmed)) {
      setSelectedNames((prev) => [...prev, trimmed]);
      setCustomNameInput("");
    }
  };

  const isPending = bulkCreateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedNames.length === 0) {
      setErrorMessage("Please select or add at least one section name.");
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
      await bulkCreateMutation.mutateAsync({
        academicYearId,
        gradeId,
        sectionNames: selectedNames,
        capacity: parsedCapacity,
      });
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to bulk generate sections.";
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
              Bulk Generate Sections
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
              Quickly create multiple class cohorts for a grade level
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
              disabled={isPending}
              value={academicYearId}
              onChange={(val) => setAcademicYearId(val)}
              options={academicYearOptions}
              placeholder="Select academic year..."
            />

            <SelectDropdown
              label="Grade Level"
              required
              disabled={isPending}
              value={gradeId}
              onChange={(val) => setGradeId(val)}
              options={gradeOptions}
              placeholder="Select grade level..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Section Names to Create <span className="text-destructive">*</span></span>
              <span className="text-[11px] font-normal text-muted-foreground">
                {selectedNames.length} selected
              </span>
            </label>

            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-muted/20 border border-border">
              {STANDARD_SECTION_NAMES.map((name) => {
                const isSelected = selectedNames.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={isPending}
                    onClick={() => toggleStandardName(name)}
                    className={`h-8 w-8 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-background text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                disabled={isPending}
                placeholder="Add custom name (e.g. D1, Rose)"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                className="flex-1 h-9 px-3 text-xs rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              <button
                type="button"
                disabled={isPending || !customNameInput.trim()}
                onClick={handleAddCustom}
                className="h-9 px-3 text-xs font-medium rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            {selectedNames.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                  >
                    Section {name}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => toggleStandardName(name)}
                      className="hover:text-destructive cursor-pointer ml-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Default Capacity per Section
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
              loadingText="Generating..."
              className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
            >
              Generate {selectedNames.length} Sections
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
