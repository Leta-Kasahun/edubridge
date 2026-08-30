"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Briefcase } from "lucide-react";
import { FormField, SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import {
  TeacherExperience,
  CreateExperiencePayload,
  UpdateExperiencePayload,
} from "../types/teacher-experience.types";
import {
  useCreateTeacherExperience,
  useUpdateTeacherExperience,
} from "../hooks/useTeacherExperience";

export interface ExperienceFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly experienceToEdit?: TeacherExperience | null;
}

export function ExperienceFormModal({
  isOpen,
  onClose,
  experienceToEdit,
}: ExperienceFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState("");
  const [institution, setInstitution] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrentRole, setIsCurrentRole] = useState(false);

  const createMutation = useCreateTeacherExperience();
  const updateMutation = useUpdateTeacherExperience();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (experienceToEdit) {
      setPosition(experienceToEdit.position || "");
      setInstitution(experienceToEdit.institution || "");
      const sDate = experienceToEdit.startDate
        ? new Date(experienceToEdit.startDate).toISOString().slice(0, 10)
        : "";
      const eDate = experienceToEdit.endDate
        ? new Date(experienceToEdit.endDate).toISOString().slice(0, 10)
        : "";
      setStartDate(sDate);
      setEndDate(eDate);
      setIsCurrentRole(!experienceToEdit.endDate);
    } else {
      setPosition("");
      setInstitution("");
      setStartDate("");
      setEndDate("");
      setIsCurrentRole(false);
    }
  }, [experienceToEdit, isOpen]);

  const isEditing = Boolean(experienceToEdit);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const currentError = createMutation.error || updateMutation.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payloadStartDate = new Date(startDate).toISOString();
    const payloadEndDate =
      isCurrentRole || !endDate.trim()
        ? null
        : new Date(endDate).toISOString();

    if (isEditing && experienceToEdit) {
      const payload: UpdateExperiencePayload = {
        position: position.trim() || null,
        institution: institution.trim(),
        startDate: payloadStartDate,
        endDate: payloadEndDate,
      };

      await updateMutation.mutateAsync(
        { id: experienceToEdit.id, payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      const payload: CreateExperiencePayload = {
        position: position.trim() || null,
        institution: institution.trim(),
        startDate: payloadStartDate,
        endDate: payloadEndDate,
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
            <div className="p-2 rounded-xl bg-muted text-foreground border border-border">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                {isEditing ? "Edit Work Experience" : "Add Work Experience"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Update your teaching and professional roles"
                  : "Add your previous and current teaching appointments"}
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
                "Failed to save work experience. Please try again."
              )}
            />
          )}

          <FormField
            id="expPosition"
            label="Position / Role Title"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="e.g. Math teacher, Senior Physics Lecturer"
            required
          />

          <FormField
            id="expInstitution"
            label="School / Institution Name"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="e.g. Demo school, Unity Secondary School"
            required
          />

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                id="expStartDate"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />

              {!isCurrentRole ? (
                <FormField
                  id="expEndDate"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground/80 block">
                    End Date
                  </label>
                  <div className="h-11 sm:h-12 w-full rounded-xl border border-border bg-muted/40 px-3.5 flex items-center text-xs sm:text-sm font-medium text-muted-foreground">
                    Present (Current Role)
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={isCurrentRole}
                onChange={(e) => {
                  setIsCurrentRole(e.target.checked);
                  if (e.target.checked) setEndDate("");
                }}
                className="w-4 h-4 rounded-sm border-border text-foreground accent-foreground cursor-pointer"
              />
              <span className="font-medium">I currently work in this role</span>
            </label>
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
              {isEditing ? "Update Experience" : "Save Experience"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
