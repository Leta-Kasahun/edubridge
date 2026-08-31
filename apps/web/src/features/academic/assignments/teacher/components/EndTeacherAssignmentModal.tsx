"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, UserX, AlertTriangle } from "lucide-react";
import { useEndTeacherAssignment } from "../hooks/useTeacherAssignments";
import { TeacherAssignmentListItem } from "../types/teacher-assignment.types";
import { ErrorAlert } from "@/shared/components";
import { getErrorMessage, formatTeacherAssignmentRole } from "@/shared/utils";

interface EndTeacherAssignmentModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly assignment: TeacherAssignmentListItem | null;
}

export function EndTeacherAssignmentModal({
  isOpen,
  onClose,
  assignment,
}: EndTeacherAssignmentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const endMutation = useEndTeacherAssignment();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setFormError(null);
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !assignment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!reason.trim() || reason.trim().length < 3) {
      setFormError("Please provide a valid reason (minimum 3 characters).");
      return;
    }

    try {
      await endMutation.mutateAsync({
        assignmentId: assignment.id,
        input: {
          reason: reason.trim(),
        },
      });
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to end teacher assignment."));
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
              <UserX size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">End Assignment</h2>
              <p className="text-xs text-muted-foreground">
                Close out active teaching assignment
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
              <div className="font-semibold mb-1">Assignment Termination</div>
              <p className="leading-relaxed">
                Ending this assignment will mark it inactive as of today. The class section will no longer have an assigned {formatTeacherAssignmentRole(assignment.role).toLowerCase()} until reassigned.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Teacher Name</span>
              <span className="font-semibold text-foreground">{assignment.teacherName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium text-foreground">
                {formatTeacherAssignmentRole(assignment.role)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Section</span>
              <span className="font-medium text-foreground">
                Grade {assignment.gradeLevel} — {assignment.sectionName}
              </span>
            </div>
            {assignment.subjectName && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium text-foreground">
                  {assignment.subjectName} ({assignment.subjectCode})
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Termination Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for ending teacher assignment (recorded in audit log)..."
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
              disabled={endMutation.isPending}
              className="inline-flex items-center justify-center h-9 px-4 rounded-xl text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              {endMutation.isPending ? "Ending..." : "Confirm End Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
