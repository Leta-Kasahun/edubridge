"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { formatDateForInput } from "@/shared/utils/academic-year.util";
import {
  AcademicYearItem,
  AcademicYearStatus,
} from "../types/academic-year.types";
import {
  useCreateAcademicYear,
  useUpdateAcademicYear,
} from "../hooks/useAcademicYears";

interface AcademicYearFormModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly yearToEdit?: AcademicYearItem | null;
}

export function AcademicYearFormModal({
  isOpen,
  onClose,
  yearToEdit,
}: AcademicYearFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<AcademicYearStatus>("UPCOMING");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateAcademicYear();
  const updateMutation = useUpdateAcademicYear();

  const isEditing = Boolean(yearToEdit);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (yearToEdit) {
      setName(yearToEdit.name);
      setCode(yearToEdit.code);
      setStartDate(formatDateForInput(yearToEdit.startDate));
      setEndDate(formatDateForInput(yearToEdit.endDate));
      setStatus(yearToEdit.status);
    } else {
      setName("");
      setCode("");
      setStartDate("");
      setEndDate("");
      setStatus("UPCOMING");
    }
    setFormError(null);
  }, [yearToEdit, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError("Academic year name is required");
      return;
    }
    if (!code.trim()) {
      setFormError("Academic year code is required");
      return;
    }
    if (!startDate) {
      setFormError("Start date is required");
      return;
    }
    if (!endDate) {
      setFormError("End date is required");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      setFormError("End date must be chronologically after start date");
      return;
    }

    try {
      if (isEditing && yearToEdit) {
        await updateMutation.mutateAsync({
          id: yearToEdit.id,
          payload: {
            name: name.trim(),
            code: code.trim().toUpperCase(),
            startDate,
            endDate,
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          startDate,
          endDate,
          status,
        });
      }
      onClose();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to save academic year"));
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
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {isEditing ? "Edit Academic Year" : "Add Academic Year"}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isEditing
                ? "Update Ethiopian academic calendar dates and status"
                : "Define a new Ethiopian academic calendar cycle"}
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
              Academic Year Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2018 E.C. Academic Year"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Academic Year Code <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. AY-2018"
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Start Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                End Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AcademicYearStatus)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
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
              loadingText={isEditing ? "Saving..." : "Creating..."}
              className="w-auto h-10 px-5 text-xs font-semibold"
            >
              {isEditing ? "Save Changes" : "Create Academic Year"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
