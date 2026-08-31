"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ArrowUpRight, Check, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { usePromotionPreview, useCommitPromotion } from "../hooks/useStudentAssignments";
import { PromotionPreviewRow, CommitPromotionItem } from "../types/student-assignment.types";
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
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGrade, setSelectedGrade] = useState<number>(availableGrades[0] || 7);
  const [targetYearId, setTargetYearId] = useState<string>("");
  const [studentRows, setStudentRows] = useState<readonly PromotionPreviewRow[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const eligibleTargetYears = useMemo(() => {
    const nonCurrent = academicYears.filter((y) => y.id !== currentAcademicYearId);
    return nonCurrent.length > 0 ? nonCurrent : academicYears;
  }, [academicYears, currentAcademicYearId]);

  const previewQuery = {
    sourceAcademicYearId: currentAcademicYearId,
    targetAcademicYearId: targetYearId,
    gradeLevel: selectedGrade,
  };

  const { data: previewData, isLoading: isLoadingPreview, error: previewError } =
    usePromotionPreview(previewQuery, Boolean(isOpen && targetYearId && selectedGrade));

  const commitMutation = useCommitPromotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormError(null);
      if (eligibleTargetYears.length > 0) {
        setTargetYearId(eligibleTargetYears[0]?.id || "");
      }
      if (availableGrades.length > 0) {
        setSelectedGrade(availableGrades[0] || 7);
      }
    }
  }, [isOpen, eligibleTargetYears, availableGrades]);

  useEffect(() => {
    if (previewData?.students) {
      setStudentRows(previewData.students);
    }
  }, [previewData]);

  if (!mounted || !isOpen) return null;

  const targetGradeLevel = Math.min(12, selectedGrade + 1);
  const promotedCount = studentRows.filter((s) => s.isPromoted).length;
  const retainedCount = studentRows.filter((s) => !s.isPromoted).length;

  const handleTogglePromoted = (studentId: string) => {
    setStudentRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        const nextPromoted = !row.isPromoted;
        const matchingGradeLevel = nextPromoted ? targetGradeLevel : selectedGrade;
        const eligibleSections = (previewData?.targetSections || []).filter(
          (ts) => ts.gradeLevel === matchingGradeLevel
        );
        const autoSection =
          eligibleSections.find((ts) => ts.sectionName.toLowerCase() === row.currentSectionName.toLowerCase()) ||
          eligibleSections[0] ||
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
    const targetSec = previewData?.targetSections.find((s) => s.sectionId === sectionId);
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

  const validateRows = (): boolean => {
    setFormError(null);
    if (!targetYearId) {
      setFormError("Please select a target academic year.");
      return false;
    }
    if (studentRows.length === 0) {
      setFormError("No active students found in the selected grade to promote.");
      return false;
    }
    const missingSection = studentRows.find((s) => !s.proposedSectionId || !s.proposedGradeId);
    if (missingSection) {
      setFormError(
        `Please ensure all students have an assigned target section (student "${missingSection.fullName}" is unassigned).`
      );
      return false;
    }
    return true;
  };

  const handleProceedToStep2 = () => {
    if (validateRows()) {
      setStep(2);
    }
  };

  const handleCommit = async () => {
    if (!validateRows()) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-xl z-10 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowUpRight size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Year-End Grade Promotion
              </h2>
              <p className="text-xs text-muted-foreground">
                {step === 1
                  ? "Step 1: Configure Grade Rollover & Section Placements"
                  : "Step 2: Review & Commit Promotion"}
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

        {formError && <div className="mb-4 shrink-0"><ErrorAlert message={formError} /></div>}
        {previewError && <div className="mb-4 shrink-0"><ErrorAlert message={getErrorMessage(previewError, "Failed to load promotion preview.")} /></div>}

        {step === 1 ? (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/30 border border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
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

            {isLoadingPreview ? (
              <div className="py-12 flex items-center justify-center">
                <LoadingSpinner size={24} />
              </div>
            ) : studentRows.length === 0 ? (
              <div className="p-8 rounded-xl bg-muted/20 border border-border text-center text-xs text-muted-foreground">
                No active students found in Grade {selectedGrade} to promote.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">
                    Students in Grade {selectedGrade} ({studentRows.length})
                  </span>
                  <span className="text-muted-foreground">
                    {promotedCount} to Grade {targetGradeLevel}, {retainedCount} retained
                  </span>
                </div>

                <div className="border border-border rounded-xl overflow-hidden divide-y divide-border/60">
                  {studentRows.map((row) => {
                    const candidateGradeLevel = row.isPromoted ? targetGradeLevel : selectedGrade;
                    const availableTargetSections = (previewData?.targetSections || []).filter(
                      (ts) => ts.gradeLevel === candidateGradeLevel
                    );

                    return (
                      <div
                        key={row.studentId}
                        className="p-3 bg-card hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleTogglePromoted(row.studentId)}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              row.isPromoted
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background border-border text-transparent"
                            }`}
                            title={row.isPromoted ? "Promoted to next grade" : "Retained in same grade"}
                          >
                            <Check size={12} strokeWidth={3} />
                          </button>

                          <div>
                            <div className="font-semibold text-foreground">{row.fullName}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {row.studentCode} • Current: {row.currentSectionName}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
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
                            className="h-8 px-2.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer min-w-[140px]"
                          >
                            <option value="">Select target section...</option>
                            {availableTargetSections.map((sec) => (
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

            <div className="flex items-center justify-between pt-4 border-t border-border mt-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  disabled={studentRows.length === 0 || !targetYearId}
                  className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Review Summary</span>
                  <ChevronRight size={14} />
                </button>
                <SubmitButton
                  isLoading={commitMutation.isPending}
                  onClick={handleCommit}
                  disabled={studentRows.length === 0 || !targetYearId}
                >
                  Save & Promote
                </SubmitButton>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Permanent Academic Transition</div>
                <p className="leading-relaxed">
                  Committing will complete active enrollments in the current academic year and create new active enrollments in the target academic year. This action is recorded in the permanent institutional audit log.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <div className="text-2xl font-bold text-foreground">{studentRows.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Processed</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <div className="text-2xl font-bold text-primary">{promotedCount}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Promoted to Grade {targetGradeLevel}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {retainedCount}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Retained in Grade {selectedGrade}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Back to Adjustments</span>
              </button>
              <SubmitButton
                isLoading={commitMutation.isPending}
                onClick={handleCommit}
              >
                Save & Commit Promotion
              </SubmitButton>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
