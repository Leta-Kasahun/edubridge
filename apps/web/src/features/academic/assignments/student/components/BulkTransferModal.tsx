"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRightLeft, AlertCircle } from "lucide-react";
import { useGradeSectionsCapacity, useBulkTransferStudents } from "../hooks/useStudentAssignments";
import { StudentRosterItem } from "../types/student-assignment.types";
import { SubmitButton, ErrorAlert, LoadingSpinner } from "@/shared/components";
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

  const selectedCount = selectedStudents.length;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Bulk Section Transfer</h2>
              <p className="text-xs text-muted-foreground">
                Move {selectedCount} selected student{selectedCount > 1 ? "s" : ""} to another section
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorAlert message={formError} />}

          {!isUniformGrade && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                Selected students span multiple grade levels. Please select students from a single grade level to transfer.
              </span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
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
            <label className="text-xs font-semibold text-foreground">
              Target Section <span className="text-destructive">*</span>
            </label>
            {isLoadingSections ? (
              <div className="h-10 flex items-center justify-center bg-muted/20 border border-border rounded-xl">
                <LoadingSpinner size={16} />
              </div>
            ) : sections.length === 0 ? (
              <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground text-center">
                No active sections found for Grade {firstStudentGrade}.
              </div>
            ) : (
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                required
                disabled={!isUniformGrade}
              >
                <option value="">Select target section...</option>
                {sections.map((sec) => {
                  const seatsText =
                    sec.availableSeats !== null
                      ? sec.availableSeats >= selectedCount
                        ? `${sec.availableSeats} seat(s) available`
                        : `${sec.availableSeats} seat(s) available (insufficient)`
                      : "Uncapped";

                  const isInsufficient =
                    sec.availableSeats !== null && sec.availableSeats < selectedCount;

                  return (
                    <option
                      key={sec.sectionId}
                      value={sec.sectionId}
                      disabled={isInsufficient}
                    >
                      {sec.sectionName} ({sec.activeCount}
                      {sec.capacity ? `/${sec.capacity}` : ""} students — {seatsText})
                    </option>
                  );
                })}
              </select>
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
              className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              required
              disabled={!isUniformGrade}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
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
