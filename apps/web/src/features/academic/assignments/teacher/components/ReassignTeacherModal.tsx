"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRightLeft } from "lucide-react";
import { useReassignTeacher } from "../hooks/useTeacherAssignments";
import { TeacherAssignmentListItem } from "../types/teacher-assignment.types";
import { useStaffQualificationsDirectory } from "@/features/staff-qualifications";
import { useTeachers } from "@/features/provisioning/teacher/hooks/useTeacherProvisioning";
import { SubmitButton, ErrorAlert } from "@/shared/components";
import { getErrorMessage, formatTeacherAssignmentRole } from "@/shared/utils";

interface ReassignTeacherModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly assignment: TeacherAssignmentListItem | null;
}

export function ReassignTeacherModal({
  isOpen,
  onClose,
  assignment,
}: ReassignTeacherModalProps) {
  const [mounted, setMounted] = useState(false);
  const [replacementTeacherId, setReplacementTeacherId] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const reassignMutation = useReassignTeacher();

  const { data: staffDirectoryResponse } = useStaffQualificationsDirectory({
    limit: 100,
  });
  const { data: teacherProvisionResponse } = useTeachers({
    limit: 100,
  });

  const teachers = useMemo(() => {
    if (staffDirectoryResponse?.data && staffDirectoryResponse.data.length > 0) {
      return staffDirectoryResponse.data.map((t) => ({
        id: t.id,
        firstName: t.firstName,
        middleName: t.middleName,
        lastName: t.lastName,
        employeeCode: t.employeeCode,
        status: t.status,
      }));
    }
    if (teacherProvisionResponse?.data && teacherProvisionResponse.data.length > 0) {
      return teacherProvisionResponse.data.map((t) => ({
        id: t.teacherProfileId || t.id,
        firstName: t.firstName,
        middleName: t.middleName,
        lastName: t.lastName,
        employeeCode: t.employeeCode,
        status: t.teacherStatus || t.status,
      }));
    }
    return [];
  }, [staffDirectoryResponse, teacherProvisionResponse]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setReplacementTeacherId("");
      setReason("");
      setFormError(null);
    }
  }, [isOpen]);

  if (!mounted || !isOpen || !assignment) return null;

  const eligibleTeachers = teachers.filter((t) => t.id !== assignment.teacherId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!replacementTeacherId) {
      setFormError("Please select a replacement teacher.");
      return;
    }

    if (!reason.trim() || reason.trim().length < 3) {
      setFormError("Please provide a valid reassignment reason (minimum 3 characters).");
      return;
    }

    try {
      await reassignMutation.mutateAsync({
        assignmentId: assignment.id,
        input: {
          replacementTeacherId,
          reason: reason.trim(),
        },
      });
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to reassign teacher."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Reassign Teacher</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Transfer class responsibilities to a replacement staff member
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
              <span className="text-muted-foreground">Current Teacher</span>
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
              Replacement Teacher <span className="text-destructive">*</span>
            </label>
            <select
              value={replacementTeacherId}
              onChange={(e) => setReplacementTeacherId(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              required
            >
              <option value="">Select replacement teacher...</option>
              {eligibleTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.middleName || ""} {t.lastName} ({t.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Reassignment Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for reassigning teacher (recorded in audit log)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={reassignMutation.isPending}
              disabled={!replacementTeacherId}
            >
              Confirm Reassignment
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
