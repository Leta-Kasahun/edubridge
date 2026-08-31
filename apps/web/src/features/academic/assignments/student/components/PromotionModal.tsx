"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ArrowUpRight, Check, AlertTriangle } from "lucide-react";
import { usePromotionPreview, useCommitPromotion } from "../hooks/useStudentAssignments";
import { useSections } from "@/features/academic/sections";
import { useGrades } from "@/features/academic/grades";
import { PromotionPreviewRow, CommitPromotionItem, SectionCapacityInfo } from "../types/student-assignment.types";
import { SubmitButton, ErrorAlert, LoadingSpinner } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface AcademicYearOption {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

interface PromotionModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly currentAcademicYearId: string;
  readonly academicYears: readonly AcademicYearOption[];
  readonly availableGrades: readonly number[];
  readonly onPromotionSuccess?: () => void;
}

export function PromotionModal({
  isOpen,
  onClose,
  currentAcademicYearId,
  academicYears,
  availableGrades,
  onPromotionSuccess,
}: PromotionModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<number>(availableGrades[0] || 7);
  const [targetYearId, setTargetYearId] = useState<string>("");
  const [studentRows, setStudentRows] = useState<readonly PromotionPreviewRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const eligibleTargetYears = useMemo(() => {
    const nonCurrent = academicYears.filter((y) => y.id !== currentAcademicYearId);
    return nonCurrent.length > 0 ? nonCurrent : academicYears;
  }, [academicYears, currentAcademicYearId]);

  const { data: allSections = [] } = useSections({
    status: "ACTIVE",
  });
  const { data: grades = [] } = useGrades({ isActive: true });

  const previewQuery = {
    sourceAcademicYearId: currentAcademicYearId,
    targetAcademicYearId: targetYearId || currentAcademicYearId,
    gradeLevel: selectedGrade,
  };

  const { data: previewData, isLoading: isLoadingPreview, error: previewError } =
    usePromotionPreview(previewQuery, Boolean(isOpen && (targetYearId || currentAcademicYearId) && selectedGrade));

  const commitMutation = useCommitPromotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      if (eligibleTargetYears.length > 0) {
        setTargetYearId(eligibleTargetYears[0]?.id || "");
      }
      if (availableGrades.length > 0) {
        setSelectedGrade(availableGrades[0] || 7);
      }
    }
  }, [isOpen, eligibleTargetYears, availableGrades]);

  const targetGradeLevel = Math.min(12, selectedGrade + 1);

  const allAvailableTargetSections: readonly SectionCapacityInfo[] = useMemo(() => {
    if (previewData?.targetSections && previewData.targetSections.length > 0) {
      return previewData.targetSections;
    }

    return allSections.map((s) => {
      const g = grades.find((gr) => gr.id === s.gradeId);
      return {
        sectionId: s.id,
        sectionName: s.name,
        gradeId: s.gradeId,
        gradeLevel: g?.level || 0,
        capacity: s.capacity,
        activeCount: 0,
        availableSeats: s.capacity,
      };
    });
  }, [previewData, allSections, grades]);

  useEffect(() => {
    if (previewData?.students) {
      setStudentRows(
        previewData.students.map((st) => {
          if (st.proposedSectionId && st.proposedGradeId) {
            return st;
          }
          const candidateGrade = st.isPromoted ? targetGradeLevel : selectedGrade;
          const candidateSections = allAvailableTargetSections.filter(
            (ts) => ts.gradeLevel === candidateGrade
          );
          const matched =
            candidateSections.find(
              (ts) => ts.sectionName.toLowerCase() === st.currentSectionName.toLowerCase()
            ) ||
            candidateSections[0] ||
            allAvailableTargetSections[0];

          return {
            ...st,
            proposedGradeLevel: candidateGrade,
            proposedGradeId: matched?.gradeId || st.proposedGradeId,
            proposedSectionId: matched?.sectionId || null,
            proposedSectionName: matched?.sectionName || null,
          };
        })
      );
    }
  }, [previewData, allAvailableTargetSections, targetGradeLevel, selectedGrade]);

  if (!mounted || !isOpen) return null;

  const promotedCount = studentRows.filter((s) => s.isPromoted).length;
  const retainedCount = studentRows.filter((s) => !s.isPromoted).length;

  const handleTogglePromoted = (studentId: string) => {
    setStudentRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        const nextPromoted = !row.isPromoted;
        const matchingGradeLevel = nextPromoted ? targetGradeLevel : selectedGrade;
        const eligibleSections = allAvailableTargetSections.filter(
          (ts) => ts.gradeLevel === matchingGradeLevel
        );
        const autoSection =
          eligibleSections.find((ts) => ts.sectionName.toLowerCase() === row.currentSectionName.toLowerCase()) ||
          eligibleSections[0] ||
          allAvailableTargetSections[0] ||
          null;

        return {
          ...row,
          isPromoted: nextPromoted,
          proposedGradeLevel: matchingGradeLevel,
          proposedGradeId: autoSection?.gradeId || row.proposedGradeId,
          proposedSectionId: autoSection?.sectionId || null,
          proposedSectionName: autoSection?.sectionName || null,
        };
      })
    );
  };

  const handleSectionChange = (studentId: string, sectionId: string) => {
    const targetSec = allAvailableTargetSections.find((s) => s.sectionId === sectionId);
    setStudentRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        return {
          ...row,
          proposedSectionId: sectionId,
          proposedSectionName: targetSec?.sectionName || null,
          proposedGradeId: targetSec?.gradeId || row.proposedGradeId,
        };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!targetYearId) {
      setFormError("Please select a target academic year.");
      return;
    }

    if (studentRows.length === 0) {
      setFormError("No active students found in the selected grade to promote.");
      return;
    }

    const missingSection = studentRows.find((s) => !s.proposedSectionId || !s.proposedGradeId);
    if (missingSection) {
      setFormError(
        `Please ensure all students have an assigned target section (student "${missingSection.fullName}" is unassigned).`
      );
      return;
    }

    const items: CommitPromotionItem[] = studentRows.map((r) => ({
      studentId: r.studentId,
      targetGradeId: r.proposedGradeId || "",
      targetSectionId: r.proposedSectionId || "",
      isPromoted: r.isPromoted,
    }));

    try {
      await commitMutation.mutateAsync({
        sourceAcademicYearId: currentAcademicYearId,
        targetAcademicYearId: targetYearId,
        items,
      });
      onPromotionSuccess?.();
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to commit grade promotion."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-xl z-10 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-3 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowUpRight size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Year-End Grade Promotion
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Rollover cohort placements into next academic year
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

        {formError && <div className="mb-3 shrink-0"><ErrorAlert message={formError} /></div>}
        {previewError && <div className="mb-3 shrink-0"><ErrorAlert message={getErrorMessage(previewError, "Failed to load promotion preview.")} /></div>}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 sm:pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 p-3 rounded-xl bg-muted/30 border border-border">
              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                  Source Grade Level
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                >
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      Grade {g} (Promoting to Grade {Math.min(12, g + 1)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] sm:text-xs font-semibold text-foreground">
                  Target Academic Year <span className="text-destructive">*</span>
                </label>
                <select
                  value={targetYearId}
                  onChange={(e) => setTargetYearId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                  required
                >
                  {eligibleTargetYears.map((yr) => (
                    <option key={yr.id} value={yr.id}>
                      {yr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] sm:text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Promoting completes active enrollments in the current academic year and registers new enrollments in the target session.
              </p>
            </div>

            {isLoadingPreview ? (
              <div className="py-10 flex items-center justify-center">
                <LoadingSpinner size={24} />
              </div>
            ) : studentRows.length === 0 ? (
              <div className="p-6 rounded-xl bg-muted/20 border border-border text-center text-xs text-muted-foreground">
                No active students found in Grade {selectedGrade} to promote.
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs px-0.5">
                  <span className="font-semibold text-foreground">
                    Students ({studentRows.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    <strong className="text-foreground">{promotedCount}</strong> promoted • <strong className="text-foreground">{retainedCount}</strong> retained
                  </span>
                </div>

                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/60">
                  {studentRows.map((row) => {
                    const candidateGradeLevel = row.isPromoted ? targetGradeLevel : selectedGrade;
                    const availableTargetSections = allAvailableTargetSections.filter(
                      (ts) => ts.gradeLevel === candidateGradeLevel
                    );
                    const finalSections = availableTargetSections.length > 0
                      ? availableTargetSections
                      : allAvailableTargetSections;

                    return (
                      <div
                        key={row.studentId}
                        className="p-3 bg-card hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePromoted(row.studentId)}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              row.isPromoted
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border text-transparent"
                            }`}
                            title={row.isPromoted ? "Promoted" : "Retained"}
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>

                          <div className="truncate">
                            <div className="font-semibold text-foreground truncate">{row.fullName}</div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {row.studentCode} • Section {row.currentSectionName}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                              row.isPromoted
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            }`}
                          >
                            {row.isPromoted ? `Grade ${targetGradeLevel}` : `Retain Gr. ${selectedGrade}`}
                          </span>

                          <select
                            value={row.proposedSectionId || ""}
                            onChange={(e) => handleSectionChange(row.studentId, e.target.value)}
                            className="h-8 px-2 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer w-full sm:w-auto sm:min-w-[150px]"
                          >
                            <option value="">Select section...</option>
                            {finalSections.map((sec) => (
                              <option key={sec.sectionId} value={sec.sectionId}>
                                {sec.sectionName} ({sec.availableSeats !== null ? `${sec.availableSeats} seats` : "No limit"})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-3.5 sm:mt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={commitMutation.isPending}
              disabled={studentRows.length === 0 || !targetYearId}
            >
              Commit Promotion ({promotedCount})
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
