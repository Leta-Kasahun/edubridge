"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Check } from "lucide-react";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useBulkCreateSections } from "../hooks/useSections";
import { STANDARD_SECTION_NAMES } from "@/shared/constants/section.constants";
import { ErrorAlert, SubmitButton } from "@/shared/components";

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
              Bulk Generate Sections
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Academic Year <span className="text-destructive">*</span>
              </label>
              <select
                disabled={isPending}
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary"
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
                disabled={isPending}
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary"
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    Grade {g.level} ({g.category})
                  </option>
                ))}
              </select>
            </div>
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
              className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground block">
              Select Sections to Generate
            </label>
            <div className="flex flex-wrap gap-2">
              {STANDARD_SECTION_NAMES.map((letter) => {
                const isSelected = selectedNames.includes(letter);
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={isPending}
                    onClick={() => toggleStandardName(letter)}
                    className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {isSelected && <Check size={12} className="stroke-[3]" />}
                    <span>Section {letter}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                disabled={isPending}
                placeholder="Custom section identifier (e.g. Red, 1)"
                value={customNameInput}
                onChange={(e) => setCustomNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCustom(e);
                }}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
              />
              <button
                type="button"
                disabled={isPending || !customNameInput.trim()}
                onClick={handleAddCustom}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-muted/40 border border-border text-foreground hover:bg-muted disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>

            {selectedNames.length > 0 && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground mr-1">
                  Selected ({selectedNames.length}):
                </span>
                {selectedNames.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground border border-border font-bold text-[11px]"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedNames((prev) => prev.filter((n) => n !== name))
                      }
                      className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <div className="w-48">
              <SubmitButton
                isLoading={isPending}
                loadingText="Generating..."
                size="sm"
                disabled={selectedNames.length === 0}
                className="h-10 rounded-xl text-xs font-semibold"
              >
                Generate {selectedNames.length} Sections
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
