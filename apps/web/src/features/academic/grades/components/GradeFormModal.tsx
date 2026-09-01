"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, GraduationCap, CheckCircle } from "lucide-react";
import { SubmitButton, ErrorAlert, SelectDropdown, SelectDropdownOption } from "@/shared/components";
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
  const [level, setLevel] = useState<string>("7");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateGrade();
  const isSubmitting = createMutation.isPending;

  const levelOptions: readonly SelectDropdownOption[] = useMemo(() => {
    const secondaryLevels = [7, 8, 9, 10, 11, 12];
    return secondaryLevels.map((lvl) => {
      const isAdded = existingLevels.includes(lvl);
      return {
        value: String(lvl),
        label: `Grade ${lvl} (${getGradeCategoryLabel(lvl)})`,
        badge: isAdded ? "Already Added" : `G${lvl}`,
        disabled: isAdded,
      };
    });
  }, [existingLevels]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const secondaryLevels = [7, 8, 9, 10, 11, 12];
    const available = secondaryLevels.find((l) => !existingLevels.includes(l));
    setLevel(String(available || 7));
    setIsActive(true);
    setFormError(null);
  }, [isOpen, existingLevels]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numLevel = Number(level);
    if (existingLevels.includes(numLevel)) {
      setFormError(`Grade ${numLevel} already exists in this school.`);
      return;
    }

    try {
      await createMutation.mutateAsync({
        level: numLevel,
        isActive,
      });
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to create grade"));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <GraduationCap size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                Add Grade Level
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Configure curriculum level according to Ethiopian secondary education
              </p>
            </div>
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
          {formError && <ErrorAlert message={formError} />}

          <SelectDropdown
            label="Grade Level"
            required
            value={level}
            onChange={(val) => setLevel(val)}
            options={levelOptions}
            placeholder="Select grade level..."
            leftIcon={GraduationCap}
          />

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/20 border border-border">
            <input
              type="checkbox"
              id="grade-is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary cursor-pointer accent-primary"
            />
            <label
              htmlFor="grade-is-active"
              className="text-xs font-medium text-foreground cursor-pointer select-none"
            >
              Set grade as Active for section cohort creation
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 h-10 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={isSubmitting}
              loadingText="Creating..."
              className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
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
