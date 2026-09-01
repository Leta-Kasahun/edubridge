"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ArrowUpRight, Check, AlertTriangle, Calendar, GraduationCap, Layers } from "lucide-react";
import { usePromotionPreview, useCommitPromotion } from "../hooks/useStudentAssignments";
import { useSections } from "@/features/academic/sections";
import { useGrades } from "@/features/academic/grades";
import { PromotionPreviewRow, CommitPromotionItem, SectionCapacityInfo } from "../types/student-assignment.types";
import { SubmitButton, ErrorAlert, LoadingSpinner, SelectDropdown, SelectDropdownOption } from "@/shared/components";
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

  const sourceGradeOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return availableGrades.map((g) => ({
      value: String(g),
      label: `Grade ${g} (Promoting to Grade ${Math.min(12, g + 1)})`,
      badge: `G${g} → G${Math.min(12, g + 1)}`,
      icon: GraduationCap,
    }));
  }, [availableGrades]);

  const targetYearOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return eligibleTargetYears.map((yr) => ({
      value: yr.id,
      label: yr.name,
      badge: yr.status === "ACTIVE" ? "Active" : undefined,
      icon: Calendar,
    }));
  }, [eligibleTargetYears]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormError(null);
      const defaultTargetYear = eligibleTargetYears[0]?.id || "";
      setTargetYearId((prev) => prev || defaultTargetYear);
      const defaultGrade = availableGrades[0] || 7;
      setSelectedGrade((prev) => prev || defaultGrade);
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
  }, [previewData?.targetSections, allSections, grades]);

  useEffect(() => {
    if (previewData?.students) {
      const backendSections = previewData.targetSections || [];
      const fallbackSections =
        backendSections.length > 0
          ? backendSections
          : allSections.map((s) => {
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

      setStudentRows(
        previewData.students.map((st) => {
          if (st.proposedSectionId && st.proposedGradeId) {
            return st;
          }
          const candidateGrade = st.isPromoted ? Math.min(12, selectedGrade + 1) : selectedGrade;
          const candidateSections = fallbackSections.filter(
            (ts) => ts.gradeLevel === candidateGrade
          );
          const matched =
            candidateSections.find(
              (ts) => ts.sectionName.toLowerCase() === st.currentSectionName.toLowerCase()
            ) ||
            candidateSections[0] ||
            fallbackSections[0];

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
  }, [previewData?.students, selectedGrade, allSections, grades]);

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
          eligibleSections[0];

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
    const sec = allAvailableTargetSections.find((s) => s.sectionId === sectionId);
    setStudentRows((prev) =>
      prev.map((row) => {
        if (row.studentId !== studentId) return row;
        return {
          ...row,
          proposedSectionId: sectionId || null,
          proposedSectionName: sec ? sec.sectionName : null,
          proposedGradeId: sec ? sec.gradeId : row.proposedGradeId,
          proposedGradeLevel: sec ? sec.gradeLevel : row.proposedGradeLevel,
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
      setFormError("No students available to promote.");
      return;
    }

    const missingSection = studentRows.find((r) => !r.proposedSectionId);
    if (missingSection) {
      setFormError(`Please assign a target section for student "${missingSection.fullName}".`);
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
      onClose();
      onPromotionSuccess?.();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to commit grade promotion."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl lg:max-w-3xl rounded-2xl bg-card border border-border p-3.5 sm:p-6 shadow-2xl z-10 max-h-[92vh] flex flex-col my-auto min-w-0">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-3 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowUpRight size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">
                Year-End Grade Promotion
              </h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Rollover cohort placements into next academic year
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

        {formError && <div className="mb-3 shrink-0"><ErrorAlert message={formError} /></div>}
        {previewError && <div className="mb-3 shrink-0"><ErrorAlert message={getErrorMessage(previewError, "Failed to load promotion preview.")} /></div>}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 sm:pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 rounded-xl bg-muted/20 border border-border">
              <SelectDropdown
                label="Source Grade Level"
                value={String(selectedGrade)}
                onChange={(val) => setSelectedGrade(Number(val))}
                options={sourceGradeOptions}
                placeholder="Select grade level..."
                leftIcon={GraduationCap}
              />

              <SelectDropdown
                label="Target Academic Year"
                required
                value={targetYearId}
                onChange={(val) => setTargetYearId(val)}
                options={targetYearOptions}
                placeholder="Select target year..."
                leftIcon={Calendar}
              />
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

                    const rowSectionOptions: readonly SelectDropdownOption[] = finalSections.map((sec) => ({
                      value: sec.sectionId,
                      label: sec.sectionName,
                      badge: sec.availableSeats !== null ? `${sec.availableSeats} seats` : "Open",
                    }));

                    return (
                      <div
                        key={row.studentId}
                        className="p-3 bg-card hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs min-w-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
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

                          <div className="truncate min-w-0">
                            <div className="font-semibold text-foreground truncate">{row.fullName}</div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {row.studentCode} • Section {row.currentSectionName}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto shrink-0">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                              row.isPromoted
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                            }`}
                          >
                            {row.isPromoted ? `Grade ${targetGradeLevel}` : `Retain Gr. ${selectedGrade}`}
                          </span>

                          <div className="w-full sm:w-44">
                            <SelectDropdown
                              value={row.proposedSectionId || ""}
                              onChange={(val) => handleSectionChange(row.studentId, val)}
                              options={rowSectionOptions}
                              placeholder="Select section..."
                              leftIcon={Layers}
                            />
                          </div>
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
              className="w-full sm:w-auto px-4 h-10 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
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
