"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRightLeft, AlertCircle, Layers } from "lucide-react";
import { useGradeSectionsCapacity, useBulkTransferStudents } from "../hooks/useStudentAssignments";
import { StudentRosterItem } from "../types/student-assignment.types";
import { SubmitButton, ErrorAlert, LoadingSpinner, SelectDropdown, SelectDropdownOption } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface BulkTransferModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly selectedStudents: readonly StudentRosterItem[];
  readonly academicYearId: string;
  readonly onTransferSuccess?: () => void;
}

export function BulkTransferModal({
  isOpen,
  onClose,
  selectedStudents,
  academicYearId,
  onTransferSuccess,
}: BulkTransferModalProps) {
  const [mounted, setMounted] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const bulkTransferMutation = useBulkTransferStudents();

  const firstStudentGrade = selectedStudents[0]?.gradeLevel;
  const isUniformGrade = selectedStudents.every((s) => s.gradeLevel === firstStudentGrade);

  const { data: sections = [], isLoading: isLoadingSections } = useGradeSectionsCapacity(
    academicYearId,
    firstStudentGrade
  );

  const selectedCount = selectedStudents.length;

  const targetSectionOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return sections.map((sec) => {
      const isInsufficient = sec.availableSeats !== null && sec.availableSeats < selectedCount;
      const seatsBadge = sec.availableSeats !== null
        ? isInsufficient
          ? `${sec.availableSeats} seats (insufficient)`
          : `${sec.availableSeats} seats`
        : "Open";

      return {
        value: sec.sectionId,
        label: sec.sectionName,
        description: `${sec.activeCount}${sec.capacity ? `/${sec.capacity}` : ""} enrolled • ${seatsBadge}`,
        badge: isInsufficient ? "Insufficient" : seatsBadge,
        disabled: isInsufficient,
      };
    });
  }, [sections, selectedCount]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTargetSectionId("");
      setReason("");
      setFormError(null);
    }
  }, [isOpen]);

  if (!mounted || !isOpen || selectedStudents.length === 0) return null;

  const selectedSection = sections.find((s) => s.sectionId === targetSectionId);
  const hasInsufficientSeats = Boolean(
    selectedSection?.availableSeats !== null &&
    selectedSection?.availableSeats !== undefined &&
    selectedSection.availableSeats < selectedCount
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isUniformGrade) {
      setFormError("All selected students must belong to the same grade level for bulk transfer.");
      return;
    }

    if (!targetSectionId) {
      setFormError("Please select a target class section.");
      return;
    }

    if (hasInsufficientSeats && selectedSection) {
      setFormError(
        `Target section "${selectedSection.sectionName}" only has ${selectedSection.availableSeats} seat(s) available, but ${selectedCount} students were selected.`
      );
      return;
    }

    if (!reason.trim() || reason.trim().length < 3) {
      setFormError("Please provide a valid transfer reason (minimum 3 characters).");
      return;
    }

    try {
      await bulkTransferMutation.mutateAsync({
        academicYearId,
        input: {
          studentIds: selectedStudents.map((s) => s.studentId),
          targetSectionId,
          reason: reason.trim(),
        },
      });
      onTransferSuccess?.();
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to complete bulk transfer."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-3.5 sm:p-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto my-auto min-w-0">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-3.5 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowRightLeft size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">Bulk Section Transfer</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Move {selectedCount} selected student{selectedCount > 1 ? "s" : ""} to another section
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
          {formError && <ErrorAlert message={formError} />}

          {!isUniformGrade && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                Selected students span multiple grade levels. Please select students from a single grade level to transfer.
              </span>
            </div>
          )}

          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Selected Students</span>
              <span className="font-semibold text-foreground">{selectedCount} Students</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Grade Level</span>
              <span className="font-medium text-foreground">Grade {firstStudentGrade}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {isLoadingSections ? (
              <div className="h-10 flex items-center justify-center bg-muted/30 border border-border rounded-xl">
                <LoadingSpinner size={16} />
              </div>
            ) : sections.length === 0 ? (
              <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground text-center">
                No active sections found for Grade {firstStudentGrade}.
              </div>
            ) : (
              <SelectDropdown
                label="Target Section"
                required
                disabled={!isUniformGrade}
                value={targetSectionId}
                onChange={(val) => setTargetSectionId(val)}
                options={targetSectionOptions}
                placeholder="Select target section..."
              />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Transfer Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for bulk section transfer (recorded in audit log)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-background border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none min-h-[70px]"
              required
              disabled={!isUniformGrade}
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-5 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-10 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={bulkTransferMutation.isPending}
              disabled={
                !isUniformGrade ||
                !targetSectionId ||
                hasInsufficientSeats ||
                sections.length === 0
              }
            >
              Transfer {selectedCount} Students
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
