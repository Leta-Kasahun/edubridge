"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Layers } from "lucide-react";
import { useTeacherLoadSummary } from "../hooks/useTeacherAssignments";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import {
  getErrorMessage,
  formatTeacherAssignmentRole,
  getTeacherLoadBadgeClass,
  formatIsoDate,
} from "@/shared/utils";

interface TeacherLoadDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly teacherId: string;
  readonly teacherName: string;
  readonly academicYearId: string;
}

export function TeacherLoadDetailModal({
  isOpen,
  onClose,
  teacherId,
  teacherName,
  academicYearId,
}: TeacherLoadDetailModalProps) {
  const [mounted, setMounted] = useState(false);

  const { data: loadSummary, isLoading, error } = useTeacherLoadSummary(
    teacherId,
    academicYearId,
    Boolean(isOpen && teacherId && academicYearId)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-xl z-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-3 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Teacher Load Details</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                {teacherName} {loadSummary?.employeeCode ? `(${loadSummary.employeeCode})` : ""}
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

        <div className="flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center">
              <LoadingSpinner size={24} />
            </div>
          ) : error ? (
            <ErrorAlert message={getErrorMessage(error, "Failed to load teacher workload details.")} />
          ) : !loadSummary ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No workload records found for this teacher.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 shrink-0">
                <div className="p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border text-center">
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {loadSummary.activeAssignmentsCount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Total Classes</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border text-center">
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {loadSummary.homeroomCount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Homeroom</div>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-muted/30 border border-border text-center">
                  <div className="text-lg sm:text-xl font-bold text-foreground">
                    {loadSummary.subjectAssignmentsCount}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Subjects</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-foreground">Active Assignments</div>
                {loadSummary.assignments.length === 0 ? (
                  <div className="p-4 rounded-xl bg-muted/20 border border-border text-xs text-muted-foreground text-center">
                    No active assignments in this session.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {loadSummary.assignments.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-muted/30 border border-border space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            Grade {item.gradeLevel} — {item.sectionName}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                            {formatTeacherAssignmentRole(item.role)}
                          </span>
                        </div>

                        {item.subjectName && (
                          <div className="flex items-center justify-between text-muted-foreground">
                            <span>Subject</span>
                            <span className="font-medium text-foreground">
                              {item.subjectName} ({item.subjectCode})
                            </span>
                          </div>
                        )}

                        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                          Assigned on {formatIsoDate(item.startDate)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="pt-3.5 sm:pt-4 border-t border-border mt-3.5 sm:mt-4 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 h-9 rounded-xl text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
