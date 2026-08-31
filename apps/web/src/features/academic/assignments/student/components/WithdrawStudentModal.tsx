"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserMinus, AlertTriangle } from "lucide-react";
import { useWithdrawStudent } from "../hooks/useStudentAssignments";
import { StudentRosterItem } from "../types/student-assignment.types";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface WithdrawStudentModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly student: StudentRosterItem | null;
  readonly academicYearId: string;
}

export function WithdrawStudentModal({
  isOpen,
  onClose,
  student,
  academicYearId,
}: WithdrawStudentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const withdrawMutation = useWithdrawStudent();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setFormError(null);
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reason.trim() || reason.trim().length < 3) {
      setFormError("Please provide a valid withdrawal reason (minimum 3 characters).");
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        studentId: student.studentId,
        academicYearId,
        input: {
          reason: reason.trim(),
        },
      });
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to withdraw student."));
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
            <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <UserMinus size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Withdraw Student</h2>
              <p className="text-xs text-muted-foreground">
                End student enrollment for this academic session
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

          <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold mb-1">Destructive Action</div>
              <p className="leading-relaxed">
                Withdrawing this student will end their active section placement in the current academic year. The student profile remains intact.
              </p>
            </div>
          </div>

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
              <span className="text-muted-foreground">Current Placement</span>
              <span className="font-medium text-foreground">
                Grade {student.gradeLevel} — {student.sectionName}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Withdrawal Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for student withdrawal (recorded in audit log)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-destructive transition-all resize-none"
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
            <button
              type="submit"
              disabled={withdrawMutation.isPending}
              className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Confirm Withdrawal"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
