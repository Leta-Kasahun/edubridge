"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Filter } from "lucide-react";
import { SubmitButton, ErrorAlert, SelectDropdown, SelectDropdownOption } from "@/shared/components";
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

  const statusOptions: readonly SelectDropdownOption[] = useMemo(() => [
    { value: "UPCOMING", label: "Upcoming" },
    { value: "ACTIVE", label: "Active" },
    { value: "COMPLETED", label: "Completed" },
    { value: "ARCHIVED", label: "Archived" },
  ], []);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 min-w-0">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                {isEditing ? "Edit Academic Year" : "Add Academic Year"}
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                {isEditing
                  ? "Update Ethiopian academic calendar dates and status"
                  : "Define a new Ethiopian academic calendar cycle"}
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Academic Year Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2018 E.C"
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
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
              className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm font-mono font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all uppercase"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground block">
                Start Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
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
                className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs sm:text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                required
              />
            </div>
          </div>

          <SelectDropdown
            label="Academic Year Status"
            value={status}
            onChange={(val) => setStatus(val as AcademicYearStatus)}
            options={statusOptions}
            placeholder="Select status..."
            leftIcon={Filter}
          />

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
              loadingText={isEditing ? "Saving..." : "Creating..."}
              className="w-full sm:w-auto h-10 px-5 text-xs sm:text-sm font-semibold"
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
