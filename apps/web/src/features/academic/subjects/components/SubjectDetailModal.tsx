"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, GraduationCap, Users } from "lucide-react";
import { useSubjectDetail } from "../hooks/useSubjects";
import { LoadingSpinner } from "@/shared/components";

interface SubjectDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly subjectId: string;
}

export function SubjectDetailModal({
  isOpen,
  onClose,
  subjectId,
}: SubjectDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const { data: subject, isLoading } = useSubjectDetail(subjectId);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const assignedGrades = subject?.assignedGrades || [];
  const assignedTeachers = subject?.assignedTeachers || [];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-lg bg-card rounded-2xl border border-border shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border bg-card">
          <div className="min-w-0 pr-4">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
              {subject?.name || "Subject Overview"}
            </h2>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
              Code: {subject?.code} · Status: {subject?.isActive ? "Active" : "Inactive"}
            </p>
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

        <div className="p-5 sm:p-6 space-y-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner size={22} />
            </div>
          ) : !subject ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Subject record could not be found.
            </p>
          ) : (
            <>
              {subject.description && (
                <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Curriculum Description
                  </span>
                  <p className="text-xs text-foreground leading-relaxed">
                    {subject.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Assigned Grades
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {assignedGrades.length}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Active Teachers
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {assignedTeachers.length}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs font-bold text-foreground block flex items-center gap-1.5">
                  <GraduationCap size={14} />
                  Assigned Grade Levels ({assignedGrades.length})
                </span>
                {assignedGrades.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {assignedGrades.map((g) => (
                      <span
                        key={g.id}
                        className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border"
                      >
                        Grade {g.level}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-1">
                    Not currently assigned to any grade level.
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-xs font-bold text-foreground block flex items-center gap-1.5">
                  <Users size={14} />
                  Assigned Subject Teachers ({assignedTeachers.length})
                </span>
                {assignedTeachers.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                    {assignedTeachers.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card text-xs"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {t.fullName}
                          </p>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {t.employeeCode} · Grade {t.gradeLevel} ({t.sectionName})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-1">
                    No teachers assigned to teach this subject yet.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
