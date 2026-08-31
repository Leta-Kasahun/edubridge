"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { useAssignSubjectGrades } from "../hooks/useSubjects";
import { SubjectItem } from "../types/subject.types";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { SUBJECT_AVAILABLE_GRADE_LEVELS } from "@/shared/constants";

interface AssignGradesModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly subject: SubjectItem | null;
}

export function AssignGradesModal({
  isOpen,
  onClose,
  subject,
}: AssignGradesModalProps) {
  const [mounted, setMounted] = useState(false);
  const assignMutation = useAssignSubjectGrades();
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (subject) {
      setSelectedGrades([...subject.assignedGradeLevels]);
    }
    setErrorMessage(null);
  }, [subject, isOpen]);

  if (!isOpen || !mounted || !subject) return null;

  const toggleGrade = (level: number) => {
    setSelectedGrades((prev) =>
      prev.includes(level) ? prev.filter((g) => g !== level) : [...prev, level].sort((a, b) => a - b)
    );
  };

  const isPending = assignMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      await assignMutation.mutateAsync({
        id: subject.id,
        payload: {
          gradeLevels: selectedGrades,
        },
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to update grade assignments"));
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
          <div className="min-w-0 pr-4">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Assign Grades: {subject.name}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Select grade levels that take this subject in their curriculum
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

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUBJECT_AVAILABLE_GRADE_LEVELS.map((lvl) => {
                const isSelected = selectedGrades.includes(lvl);
                return (
                  <button
                    key={lvl}
                    type="button"
                    disabled={isPending}
                    onClick={() => toggleGrade(lvl)}
                    className={`h-10 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {isSelected && <Check size={13} className="stroke-[3]" />}
                    <span>Grade {lvl}</span>
                  </button>
                );
              })}
            </div>
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
            <div className="w-36">
              <SubmitButton
                isLoading={isPending}
                loadingText="Updating..."
                size="sm"
                className="h-10 rounded-xl text-xs font-semibold"
              >
                Save Grades
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
