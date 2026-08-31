"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { formatGradeName, getGradeCategoryLabel } from "@/shared/utils/grade.util";
import { useCreateGrade } from "../hooks/useGrades";

interface GradeFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly existingLevels: readonly number[];
}

export function GradeFormModal({
  isOpen,
  onClose,
  existingLevels,
}: GradeFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [level, setLevel] = useState<number>(7);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateGrade();
  const isSubmitting = createMutation.isPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const secondaryLevels = [7, 8, 9, 10, 11, 12];
    const available = secondaryLevels.find((l) => !existingLevels.includes(l));
    setLevel(available || 7);
    setIsActive(true);
    setFormError(null);
  }, [isOpen, existingLevels]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (existingLevels.includes(level)) {
      setFormError(`Grade ${level} already exists in this school.`);
      return;
    }

    try {
      await createMutation.mutateAsync({
        level,
        isActive,
      });
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to create grade"));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Add Grade Level
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Configure curriculum level according to Ethiopian secondary education
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {formError && <ErrorAlert message={formError} />}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Grade Level <span className="text-destructive">*</span>
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <optgroup label="Elementary (Grades 7–8)">
                {[7, 8].map((lvl) => (
                  <option
                    key={lvl}
                    value={lvl}
                    disabled={existingLevels.includes(lvl)}
                  >
                    {formatGradeName(lvl)} — {getGradeCategoryLabel(lvl)}{" "}
                    {existingLevels.includes(lvl) ? "(Added)" : ""}
                  </option>
                ))}
              </optgroup>

              <optgroup label="High School (Grades 9–10)">
                {[9, 10].map((lvl) => (
                  <option
                    key={lvl}
                    value={lvl}
                    disabled={existingLevels.includes(lvl)}
                  >
                    {formatGradeName(lvl)} — {getGradeCategoryLabel(lvl)}{" "}
                    {existingLevels.includes(lvl) ? "(Added)" : ""}
                  </option>
                ))}
              </optgroup>

              <optgroup label="High School Preparatory (Grades 11–12 · Streamed)">
                {[11, 12].map((lvl) => (
                  <option
                    key={lvl}
                    value={lvl}
                    disabled={existingLevels.includes(lvl)}
                  >
                    {formatGradeName(lvl)} — {getGradeCategoryLabel(lvl)} (Natural / Social Science){" "}
                    {existingLevels.includes(lvl) ? "(Added)" : ""}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="grade-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-input bg-background text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="grade-is-active"
              className="text-xs font-medium text-foreground cursor-pointer"
            >
              Set grade as Active for section cohort creation
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Creating..."
              className="w-auto h-10 px-5 text-xs font-semibold"
            >
              Add Grade Level
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
