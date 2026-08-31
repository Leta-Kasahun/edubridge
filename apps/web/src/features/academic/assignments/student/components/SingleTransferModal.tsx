"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRightLeft } from "lucide-react";
import { useGradeSectionsCapacity, useTransferStudent } from "../hooks/useStudentAssignments";
import { StudentRosterItem } from "../types/student-assignment.types";
import { SubmitButton, ErrorAlert, LoadingSpinner } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface SingleTransferModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly student: StudentRosterItem | null;
  readonly academicYearId: string;
}

export function SingleTransferModal({
  isOpen,
  onClose,
  student,
  academicYearId,
}: SingleTransferModalProps) {
  const [mounted, setMounted] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const transferMutation = useTransferStudent();

  const { data: sections = [], isLoading: isLoadingSections } = useGradeSectionsCapacity(
    academicYearId,
    student?.gradeLevel
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

  if (!mounted || !isOpen || !student) return null;

  const eligibleSections = sections.filter((s) => s.sectionId !== student.sectionId);
  const selectedSection = sections.find((s) => s.sectionId === targetSectionId);
  const isTargetFull = Boolean(
    selectedSection?.availableSeats !== null &&
    selectedSection?.availableSeats !== undefined &&
    selectedSection.availableSeats < 1
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!targetSectionId) {
      setFormError("Please select a target class section.");
      return;
    }

    if (!reason.trim() || reason.trim().length < 3) {
      setFormError("Please provide a valid transfer reason (minimum 3 characters).");
      return;
    }

    if (isTargetFull) {
      setFormError(`Target section "${selectedSection?.sectionName}" is at full capacity.`);
      return;
    }

    try {
      await transferMutation.mutateAsync({
        studentId: student.studentId,
        academicYearId,
        input: {
          targetSectionId,
          reason: reason.trim(),
        },
      });
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to transfer student."));
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
              <h2 className="text-base font-bold text-foreground">Transfer Section</h2>
              <p className="text-xs text-muted-foreground">
                Move student to another section in Grade {student.gradeLevel}
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

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Student Name</span>
              <span className="font-semibold text-foreground">{student.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Student Code</span>
              <span className="font-mono text-foreground">{student.studentCode}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current Section</span>
              <span className="font-medium text-foreground">
                Grade {student.gradeLevel} — {student.sectionName}
              </span>
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
            ) : eligibleSections.length === 0 ? (
              <div className="p-3 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground text-center">
                No other active sections available in Grade {student.gradeLevel}.
              </div>
            ) : (
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                required
              >
                <option value="">Select target section...</option>
                {eligibleSections.map((sec) => {
                  const seatsText =
                    sec.availableSeats !== null
                      ? sec.availableSeats > 0
                        ? `${sec.availableSeats} seat(s) available`
                        : "Full"
                      : "Uncapped";

                  return (
                    <option
                      key={sec.sectionId}
                      value={sec.sectionId}
                      disabled={sec.availableSeats !== null && sec.availableSeats < 1}
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
              placeholder="Provide reason for student section transfer (recorded in audit log)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              required
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
              isLoading={transferMutation.isPending}
              disabled={!targetSectionId || isTargetFull || eligibleSections.length === 0}
            >
              Confirm Transfer
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
