"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X } from "lucide-react";
import { useCreateSubject } from "../hooks/useStructure";
import { useGrades } from "@/features/academic/grades/hooks/useGrades";
import { useSubjects } from "@/features/academic/subjects/hooks/useSubjects";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface SubjectFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly versionId: string;
}

export function SubjectFormModal({
  isOpen,
  onClose,
  versionId,
}: SubjectFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [gradeId, setGradeId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [externalId, setExternalId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: grades = [], isLoading: isLoadingGrades } = useGrades();
  const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjects();
  const createMutation = useCreateSubject();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setGradeId("");
    setSubjectId("");
    setExternalId("");
    setFormError(null);
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!gradeId) {
      setFormError("Please select a grade level");
      return;
    }
    if (!subjectId) {
      setFormError("Please select a subject");
      return;
    }

    try {
      await createMutation.mutateAsync({
        curriculumVersionId: versionId,
        gradeId,
        subjectId,
        externalId: externalId.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to add subject to curriculum version"));
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={createMutation.isPending ? undefined : onClose}
      />
      <div className="relative w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Add Subject to Version
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Configure a grade-specific subject in this curriculum version
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {formError && <ErrorAlert message={formError} />}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Grade Level <span className="text-destructive">*</span>
            </label>
            <select
              value={gradeId}
              onChange={(e) => setGradeId(e.target.value)}
              disabled={isLoadingGrades || createMutation.isPending}
              className="w-full h-9 px-3 rounded-lg text-xs bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary transition-colors cursor-pointer"
            >
              <option value="">Select Grade Level</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  Grade {g.level} ({g.category})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Subject <span className="text-destructive">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={isLoadingSubjects || createMutation.isPending}
              className="w-full h-9 px-3 rounded-lg text-xs bg-muted/40 border border-border text-foreground focus:outline-hidden focus:border-primary transition-colors cursor-pointer"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              External ID <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. MOE-SUB-01"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              disabled={createMutation.isPending}
              className="w-full h-9 px-3 rounded-lg text-xs bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="h-9 px-4 rounded-lg text-xs font-semibold border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <SubmitButton
              type="submit"
              isLoading={createMutation.isPending}
              loadingText="Adding Subject..."
              className="h-9 px-4 text-xs font-semibold"
            >
              Add Subject
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
