"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, GraduationCap, Award } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { DocumentUploadField } from "./DocumentUploadField";
import {
  TeacherQualification,
  QualificationLevel,
  CreateQualificationPayload,
  UpdateQualificationPayload,
  QUALIFICATION_LEVEL_LABELS,
} from "../types/teacher-qualification.types";
import {
  useCreateTeacherQualification,
  useUpdateTeacherQualification,
} from "../hooks/useTeacherQualifications";

export interface QualificationFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly qualificationToEdit?: TeacherQualification | null;
}

export function QualificationFormModal({
  isOpen,
  onClose,
  qualificationToEdit,
}: QualificationFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [level, setLevel] = useState<QualificationLevel>("BACHELOR");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [institution, setInstitution] = useState("");
  const [startYear, setStartYear] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const createMutation = useCreateTeacherQualification();
  const updateMutation = useUpdateTeacherQualification();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (qualificationToEdit) {
      setLevel(qualificationToEdit.level);
      setFieldOfStudy(qualificationToEdit.fieldOfStudy);
      setInstitution(qualificationToEdit.institution || "");
      setStartYear(
        qualificationToEdit.startYear ? String(qualificationToEdit.startYear) : ""
      );
      setGraduationYear(
        qualificationToEdit.graduationYear
          ? String(qualificationToEdit.graduationYear)
          : ""
      );
      setDocumentUrl(qualificationToEdit.documentUrl || null);
    } else {
      setLevel("BACHELOR");
      setFieldOfStudy("");
      setInstitution("");
      setStartYear("");
      setGraduationYear("");
      setDocumentUrl(null);
    }
  }, [qualificationToEdit, isOpen]);

  const isEditing = Boolean(qualificationToEdit);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const currentError = createMutation.error || updateMutation.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedStartYear = startYear.trim() ? Number(startYear.trim()) : null;
    const parsedGradYear = graduationYear.trim()
      ? Number(graduationYear.trim())
      : null;

    if (isEditing && qualificationToEdit) {
      const payload: UpdateQualificationPayload = {
        level,
        fieldOfStudy: fieldOfStudy.trim(),
        institution: institution.trim() || null,
        startYear: parsedStartYear,
        graduationYear: parsedGradYear,
        documentUrl: documentUrl || null,
      };

      await updateMutation.mutateAsync(
        { id: qualificationToEdit.id, payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      const payload: CreateQualificationPayload = {
        level,
        fieldOfStudy: fieldOfStudy.trim(),
        institution: institution.trim() || null,
        startYear: parsedStartYear,
        graduationYear: parsedGradYear,
        documentUrl: documentUrl || null,
      };

      await createMutation.mutateAsync(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              {isEditing ? <Award size={18} /> : <GraduationCap size={18} />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Qualification" : "Add Qualification"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Update academic qualification and certificate"
                  : "Add a new degree, diploma, or certificate to your lifetime record"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {currentError && (
            <ErrorAlert
              message={getErrorMessage(
                currentError,
                "Failed to save qualification. Please check the entries and try again."
              )}
            />
          )}

          <div className="space-y-2">
            <label
              htmlFor="qualLevel"
              className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block"
            >
              Qualification Level
            </label>
            <select
              id="qualLevel"
              value={level}
              onChange={(e) => setLevel(e.target.value as QualificationLevel)}
              className="h-11 sm:h-12 w-full rounded-xl border border-input bg-background/50 px-3.5 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-foreground/40 focus:bg-background transition-colors"
            >
              {(
                Object.keys(
                  QUALIFICATION_LEVEL_LABELS
                ) as QualificationLevel[]
              ).map((lvl) => (
                <option key={lvl} value={lvl}>
                  {QUALIFICATION_LEVEL_LABELS[lvl]}
                </option>
              ))}
            </select>
          </div>

          <FormField
            id="qualField"
            label="Field of Study / Major"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
            placeholder="e.g. Mathematics, Educational Leadership, Physics"
            required
          />

          <FormField
            id="qualInstitution"
            label="Institution / University"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. Addis Ababa University, Hawassa University"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <FormField
              id="qualStartYear"
              label="Start Year (E.C.)"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value)}
              placeholder="e.g. 2012"
              min="1950"
              max="2100"
            />

            <FormField
              id="qualGradYear"
              label="Graduation Year (E.C.)"
              type="number"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="e.g. 2016"
              min="1950"
              max="2100"
            />
          </div>

          <div className="pt-2 border-t border-border">
            <DocumentUploadField
              key={qualificationToEdit?.id ?? "new"}
              initialDocumentUrl={documentUrl}
              onDocumentSelect={(url) => setDocumentUrl(url)}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <SubmitButton
              type="submit"
              isLoading={isPending}
              loadingText="Saving..."
              className="w-auto h-9 px-4 text-xs font-semibold"
            >
              {isEditing ? "Update Qualification" : "Save Qualification"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
