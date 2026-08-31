"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, UserX } from "lucide-react";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import {
  formatGradeName,
  getGradeCategoryLabel,
  formatGradeStreamLabel,
} from "@/shared/utils/grade.util";
import { GradeItem } from "../types/grade.types";
import { useGradeDetail, useToggleGradeStatus } from "../hooks/useGrades";

interface GradeDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly grade: GradeItem | null;
}

export function GradeDetailModal({
  isOpen,
  onClose,
  grade,
}: GradeDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: detail, isLoading } = useGradeDetail(
    grade?.id || "",
    undefined
  );

  const toggleStatusMutation = useToggleGradeStatus();
  const isToggling = toggleStatusMutation.isPending;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActionError(null);
  }, [isOpen, grade]);

  if (!isOpen || !mounted || !grade) return null;

  const handleToggleStatus = async () => {
    setActionError(null);
    try {
      await toggleStatusMutation.mutateAsync(grade.id);
    } catch (err) {
      setActionError(getErrorMessage(err, "Failed to update grade status"));
    }
  };

  const activeSections = detail?.sections || [];
  const assignedSubjects = detail?.subjects || [];
  const availableStreams = grade.availableStreams || ["NONE"];

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
              {formatGradeName(grade.level)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {getGradeCategoryLabel(grade.level)} · Grade Cohort Overview
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
          {actionError && <ErrorAlert message={actionError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Educational Category
              </span>
              <p className="text-xs font-semibold text-foreground">
                {getGradeCategoryLabel(grade.level)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Status
              </span>
              <p className="text-xs font-semibold text-foreground">
                {grade.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Curriculum Streams
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableStreams.map((stream) => (
                <span
                  key={stream}
                  className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-background text-foreground border border-border"
                >
                  {formatGradeStreamLabel(stream)}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">
                Sections
              </span>
              <p className="text-sm font-bold text-foreground">
                {grade.sectionCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">
                Students
              </span>
              <p className="text-sm font-bold text-foreground">
                {grade.studentCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">
                Subjects
              </span>
              <p className="text-sm font-bold text-foreground">
                {grade.subjectCount}
              </p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-bold text-foreground block">
              Active Sections ({activeSections.length})
            </span>

            {isLoading ? (
              <div className="py-4 flex justify-center">
                <LoadingSpinner size={20} />
              </div>
            ) : activeSections.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-2">
                No sections have been created for this grade yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-2.5 rounded-xl border border-border bg-card flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{sec.name}</p>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {sec.code}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {sec.studentCount}{" "}
                        {sec.capacity ? `/ ${sec.capacity}` : "Students"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {assignedSubjects.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs font-bold text-foreground block">
                Curriculum Subjects ({assignedSubjects.length})
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {assignedSubjects.map((sub) => (
                  <span
                    key={sub.id}
                    className="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-medium bg-muted text-foreground border border-border"
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={isToggling}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
            >
              {isToggling ? (
                <LoadingSpinner size={13} />
              ) : grade.isActive ? (
                <>
                  <UserX size={13} className="text-destructive" />
                  <span className="text-destructive">Deactivate Grade</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-muted-foreground" />
                  <span>Activate Grade</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
