"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, History } from "lucide-react";
import { useStudentEnrollmentHistory } from "../hooks/useStudentAssignments";
import { StudentRosterItem } from "../types/student-assignment.types";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { getErrorMessage, getEnrollmentStatusBadgeClass, formatEnrollmentStatus, formatIsoDate } from "@/shared/utils";

interface StudentEnrollmentHistoryModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly student: StudentRosterItem | null;
}

export function StudentEnrollmentHistoryModal({
  isOpen,
  onClose,
  student,
}: StudentEnrollmentHistoryModalProps) {
  const [mounted, setMounted] = useState(false);

  const { data: history = [], isLoading, error } = useStudentEnrollmentHistory(
    student?.studentId || "",
    Boolean(isOpen && student?.studentId)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !student) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-xl z-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <History size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Enrollment History</h2>
              <p className="text-xs text-muted-foreground">
                {student.fullName} ({student.studentCode})
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

        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <LoadingSpinner size={24} />
            </div>
          ) : error ? (
            <ErrorAlert message={getErrorMessage(error, "Failed to load enrollment history.")} />
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No enrollment history found for this student.
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-foreground">{item.academicYearName}</div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${getEnrollmentStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {formatEnrollmentStatus(item.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Placement</span>
                    <span className="font-medium text-foreground">
                      Grade {item.gradeLevel} — {item.sectionName}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    <span>Enrolled: {formatIsoDate(item.enrolledAt)}</span>
                    {item.endedAt && <span>Ended: {formatIsoDate(item.endedAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border mt-4 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-xl text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
