"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Check, BookOpen, CheckSquare, Square, Layers } from "lucide-react";
import { useCreateSubject, useUpdateSubject } from "../hooks/useSubjects";
import { SubjectItem } from "../types/subject.types";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface SubjectFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly initialSubject?: SubjectItem | null;
}

interface GradeGroupDef {
  readonly title: string;
  readonly levels: readonly number[];
}

const GRADE_GROUPS: readonly GradeGroupDef[] = [
  { title: "Elementary (Middle)", levels: [7, 8] },
  { title: "General Secondary", levels: [9, 10] },
  { title: "Preparatory Secondary", levels: [11, 12] },
];

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
  const [selectedGrades, setSelectedGrades] = useState<readonly number[]>([7, 8, 9, 10, 11, 12]);
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
    setSelectedGrades((prev) => {
      if (prev.includes(level)) {
        return prev.filter((g) => g !== level);
      }
      return [...prev, level].sort((a, b) => a - b);
    });
  };

  const toggleGradeGroup = (levels: readonly number[]) => {
    const allSelected = levels.every((lvl) => selectedGrades.includes(lvl));
    if (allSelected) {
      setSelectedGrades((prev) => prev.filter((lvl) => !levels.includes(lvl)));
    } else {
      setSelectedGrades((prev) => Array.from(new Set([...prev, ...levels])).sort((a, b) => a - b));
    }
  };

  const selectAllGrades = () => {
    setSelectedGrades([7, 8, 9, 10, 11, 12]);
  };

  const clearAllGrades = () => {
    setSelectedGrades([]);
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

    if (!isEditing && selectedGrades.length === 0) {
      setErrorMessage("Please assign at least one grade level to this subject.");
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
          gradeLevels: [...selectedGrades],
        });
      }
      onClose();
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err, "Failed to save subject"));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg sm:max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0 flex flex-col max-h-[92vh]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {isEditing ? `Edit Subject: ${initialSubject?.name}` : "Add Curriculum Subject"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {isEditing
                  ? "Update subject details and descriptions"
                  : "Register a subject and assign target curriculum grade cohorts"}
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 pr-1">
          {errorMessage && <ErrorAlert message={errorMessage} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
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
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all uppercase disabled:opacity-60 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Description (Optional)
            </label>
            <input
              type="text"
              disabled={isPending}
              placeholder="e.g. Core Ethiopian national secondary education curriculum"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-10 px-3.5 text-xs sm:text-sm rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>

          {!isEditing && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between gap-1 flex-wrap">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Layers size={13} className="text-muted-foreground shrink-0" />
                  Assign to Grade Cohorts <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {selectedGrades.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={selectAllGrades}
                    className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground text-xs">•</span>
                  <button
                    type="button"
                    onClick={clearAllGrades}
                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-2.5 rounded-xl bg-muted/20 border border-border">
                {GRADE_GROUPS.map((group) => {
                  const allInGroupSelected = group.levels.every((lvl) => selectedGrades.includes(lvl));
                  const someInGroupSelected = group.levels.some((lvl) => selectedGrades.includes(lvl));

                  return (
                    <div key={group.title} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-bold text-foreground">
                          {group.title}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGradeGroup(group.levels)}
                          className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {allInGroupSelected ? (
                            <CheckSquare size={12} className="text-primary" />
                          ) : someInGroupSelected ? (
                            <CheckSquare size={12} className="text-primary/70" />
                          ) : (
                            <Square size={12} />
                          )}
                          {allInGroupSelected ? "Deselect Group" : "Select Group"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
                        {group.levels.map((lvl) => {
                          const isSelected = selectedGrades.includes(lvl);
                          return (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => toggleGrade(lvl)}
                              className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer min-h-[38px] ${
                                isSelected
                                  ? "bg-primary/10 border-primary text-primary font-medium ring-1 ring-primary"
                                  : "bg-background border-border text-foreground hover:border-muted-foreground/40 hover:bg-muted/50"
                              }`}
                            >
                              <div className="min-w-0 pr-1 truncate">
                                <p className="text-xs font-semibold">Grade {lvl}</p>
                                <p className="text-[10px] opacity-70 truncate">
                                  {lvl >= 11 ? "Streamed Prep" : `Level ${lvl}`}
                                </p>
                              </div>
                              <div
                                className={`h-4 w-4 rounded shrink-0 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border bg-background"
                                }`}
                              >
                                {isSelected && <Check size={11} strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
              {isEditing ? "Save Changes" : "Create Subject"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
