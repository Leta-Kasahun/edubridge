"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRightLeft, User } from "lucide-react";
import { useReassignTeacher } from "../hooks/useTeacherAssignments";
import { TeacherAssignmentListItem } from "../types/teacher-assignment.types";
import { useStaffQualificationsDirectory } from "@/features/staff-qualifications";
import { useTeachers } from "@/features/provisioning/teacher/hooks/useTeacherProvisioning";
import { SubmitButton, ErrorAlert, SelectDropdown, SelectDropdownOption } from "@/shared/components";
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

  const eligibleTeachers = useMemo(() => {
    return teachers.filter((t) => (!t.status || t.status === "ACTIVE") && t.id !== assignment?.teacherId);
  }, [teachers, assignment?.teacherId]);

  const teacherOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return eligibleTeachers.map((t) => ({
      value: t.id,
      label: `${t.firstName} ${t.middleName || ""} ${t.lastName}`.trim(),
      description: t.employeeCode,
      badge: t.employeeCode,
      icon: User,
    }));
  }, [eligibleTeachers]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-3.5 sm:p-6 shadow-2xl z-10 max-h-[92vh] overflow-y-auto my-auto min-w-0">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-3.5 sm:mb-5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowRightLeft size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">Reassign Teacher</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Transfer class responsibilities to a replacement staff member
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

          <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
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

          <SelectDropdown
            label="Replacement Teacher"
            required
            value={replacementTeacherId}
            onChange={(val) => setReplacementTeacherId(val)}
            options={teacherOptions}
            placeholder="Select replacement teacher..."
            searchable
            searchPlaceholder="Search replacement teacher..."
            leftIcon={User}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Reassignment Reason <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for reassigning teacher (recorded in audit log)..."
              rows={3}
              className="w-full p-3 rounded-xl bg-background border border-border text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none min-h-[70px]"
              required
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-5 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
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
