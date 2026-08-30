"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, Edit2, Archive, RotateCcw } from "lucide-react";
import { LoadingSpinner } from "@/shared/components";
import {
  formatAcademicDate,
  formatAcademicDateRange,
  formatAcademicYearStatus,
} from "@/shared/utils/academic-year.util";
import { AcademicYearItem } from "../types/academic-year.types";
import {
  useSetActiveAcademicYear,
  useArchiveAcademicYear,
  useRestoreAcademicYear,
} from "../hooks/useAcademicYears";

interface AcademicYearDetailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly year: AcademicYearItem | null;
  readonly onEdit: (year: AcademicYearItem) => void;
}

export function AcademicYearDetailModal({
  isOpen,
  onClose,
  year,
  onEdit,
}: AcademicYearDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const setActiveMutation = useSetActiveAcademicYear();
  const archiveMutation = useArchiveAcademicYear();
  const restoreMutation = useRestoreAcademicYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || !year) return null;

  const isActive = year.status === "ACTIVE";
  const isArchived = year.status === "ARCHIVED";
  const isBusy =
    setActiveMutation.isPending ||
    archiveMutation.isPending ||
    restoreMutation.isPending;

  const handleSetActive = async () => {
    await setActiveMutation.mutateAsync(year.id);
  };

  const handleArchive = async () => {
    await archiveMutation.mutateAsync(year.id);
  };

  const handleRestore = async () => {
    await restoreMutation.mutateAsync(year.id);
  };

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
              {year.name}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Academic calendar cycle details
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

        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Academic Year Code
              </span>
              <p className="text-xs font-mono font-bold text-foreground">
                {year.code}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Status
              </span>
              <p className="text-xs font-semibold text-foreground">
                {formatAcademicYearStatus(year.status)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                Start Date
              </span>
              <p className="text-xs font-medium text-foreground">
                {formatAcademicDate(year.startDate)}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                End Date
              </span>
              <p className="text-xs font-medium text-foreground">
                {formatAcademicDate(year.endDate)}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Academic Term Span
            </span>
            <p className="text-xs font-medium text-foreground">
              {formatAcademicDateRange(year.startDate, year.endDate)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">
                Sections
              </span>
              <p className="text-sm font-bold text-foreground">
                {year.sectionCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">
                Students
              </span>
              <p className="text-sm font-bold text-foreground">
                {year.studentEnrollmentCount}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/20 border border-border text-center space-y-0.5">
              <span className="text-[10px] text-muted-foreground block">
                Assignments
              </span>
              <p className="text-sm font-bold text-foreground">
                {year.teacherAssignmentCount}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              {!isActive && !isArchived && (
                <button
                  type="button"
                  onClick={handleSetActive}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isBusy ? (
                    <LoadingSpinner size={12} />
                  ) : (
                    <>
                      <CheckCircle2 size={13} className="text-primary" />
                      <span>Set as Active</span>
                    </>
                  )}
                </button>
              )}

              {isArchived ? (
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={isBusy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw size={13} className="text-primary" />
                  <span>Restore</span>
                </button>
              ) : (
                !isActive && (
                  <button
                    type="button"
                    onClick={handleArchive}
                    disabled={isBusy}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Archive size={13} className="text-destructive" />
                    <span>Archive</span>
                  </button>
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(year);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground text-xs font-semibold border border-border shadow-2xs transition-colors cursor-pointer"
            >
              <Edit2 size={13} />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
