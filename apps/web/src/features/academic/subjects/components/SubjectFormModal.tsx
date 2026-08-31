"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Check } from "lucide-react";
import { useCreateSubject, useUpdateSubject } from "../hooks/useSubjects";
import { SubjectItem } from "../types/subject.types";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { SUBJECT_AVAILABLE_GRADE_LEVELS } from "@/shared/constants";

interface SubjectFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialSubject?: SubjectItem | null;
}

export function SubjectFormModal({
  isOpen,
  onClose,
  initialSubject,
}: SubjectFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const isEditing = Boolean(initialSubject);
  const createMutation = useCreateSubject();
  const updateMutation = useUpdateSubject();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<number[]>([7, 8, 9, 10, 11, 12]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setCode(initialSubject.code);
      setDescription(initialSubject.description || "");
      setSelectedGrades([...initialSubject.assignedGradeLevels]);
    } else {
      setName("");
      setCode("");
      setDescription("");
      setSelectedGrades([7, 8, 9, 10, 11, 12]);
    }
    setErrorMessage(null);
  }, [initialSubject, isOpen]);

  if (!isOpen || !mounted) return null;

  const toggleGrade = (level: number) => {
    setSelectedGrades((prev) =>
      prev.includes(level) ? prev.filter((g) => g !== level) : [...prev, level].sort((a, b) => a - b)
    );
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter a subject name.");
      return;
    }

    if (!isEditing && !code.trim()) {
      setErrorMessage("Please enter a subject code (e.g. MATH, ENG).");
      return;
    }

    try {
      if (isEditing && initialSubject) {
        await updateMutation.mutateAsync({
          id: initialSubject.id,
          payload: {
            name: name.trim(),
            description: description.trim() || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          gradeLevels: selectedGrades,
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to save subject"));
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
              {isEditing ? `Edit Subject: ${initialSubject?.name}` : "Add Curriculum Subject"}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isEditing
                ? "Update subject details and descriptions"
                : "Register a subject in the national secondary curriculum"}
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
                Subject Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isPending}
                placeholder="e.g. Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Subject Code <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditing || isPending}
                placeholder="e.g. MATH"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary uppercase disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              disabled={isPending}
              placeholder="Brief overview of curriculum content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary resize-none"
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">
                Assign to Grade Levels
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SUBJECT_AVAILABLE_GRADE_LEVELS.map((lvl) => {
                  const isSelected = selectedGrades.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      disabled={isPending}
                      onClick={() => toggleGrade(lvl)}
                      className={`h-9 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1 border cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 text-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                      <span>Grade {lvl}</span>
                    </button>
                  );
                })}
              </div>
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
                {isEditing ? "Save Changes" : "Create Subject"}
              </SubmitButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
