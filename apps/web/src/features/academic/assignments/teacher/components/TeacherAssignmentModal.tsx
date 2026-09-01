"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, UserCheck, Check, CheckSquare, Square, Layers, BookOpen, Calendar, User } from "lucide-react";
import { useCreateTeacherAssignment } from "../hooks/useTeacherAssignments";
import { useStaffQualificationsDirectory } from "@/features/staff-qualifications";
import { useTeachers } from "@/features/provisioning/teacher/hooks/useTeacherProvisioning";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useSections } from "@/features/academic/sections";
import { useSubjects } from "@/features/academic/subjects";
import { SectionRecord } from "@/features/academic/sections/types/section.types";
import { GradeItem } from "@/features/academic/grades/types/grade.types";
import { TeacherAssignmentRoleType } from "@/shared/constants/teacher-assignment.constants";
import { SubmitButton, ErrorAlert, SelectDropdown, SelectDropdownOption } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";

interface AcademicYearOption {
  readonly id: string;
  readonly name: string;
  readonly status: string;
}

interface TeacherAssignmentModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly defaultAcademicYearId?: string;
  readonly academicYears?: readonly AcademicYearOption[];
  readonly sections?: readonly SectionRecord[];
  readonly grades?: readonly GradeItem[];
}

export function TeacherAssignmentModal({
  isOpen,
  onClose,
  defaultAcademicYearId,
  academicYears: propAcademicYears,
}: TeacherAssignmentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [academicYearId, setAcademicYearId] = useState(defaultAcademicYearId || "");
  const [teacherId, setTeacherId] = useState("");
  const [selectedSectionIds, setSelectedSectionIds] = useState<readonly string[]>([]);
  const [subjectId, setSubjectId] = useState("");
  const [role, setRole] = useState<TeacherAssignmentRoleType>("SUBJECT_TEACHER");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateTeacherAssignment();

  const { data: yearsResponse } = useAcademicYears();
  const academicYears = propAcademicYears && propAcademicYears.length > 0
    ? propAcademicYears
    : yearsResponse?.data || [];

  const { data: grades = [] } = useGrades({ isActive: true });

  const { data: sections = [] } = useSections({
    academicYearId: academicYearId || undefined,
  });

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

  const activeTeachers = useMemo(() => {
    return teachers.filter((t) => !t.status || t.status === "ACTIVE");
  }, [teachers]);

  const { data: allSubjects = [] } = useSubjects({ isActive: true });

  const academicYearOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return academicYears.map((yr) => ({
      value: yr.id,
      label: yr.name,
      badge: yr.status === "ACTIVE" ? "Current" : undefined,
    }));
  }, [academicYears]);

  const teacherOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return activeTeachers.map((t) => ({
      value: t.id,
      label: `${t.firstName} ${t.middleName || ""} ${t.lastName}`.trim(),
      description: t.employeeCode,
      badge: t.employeeCode,
    }));
  }, [activeTeachers]);

  const subjectOptions: readonly SelectDropdownOption[] = useMemo(() => {
    return allSubjects.map((s) => ({
      value: s.id,
      label: s.name,
      description: `Code: ${s.code}`,
      badge: s.code,
    }));
  }, [allSubjects]);

  const groupedSections = useMemo(() => {
    const map = new Map<number, { grade: GradeItem | null; sections: SectionRecord[] }>();

    for (const sec of sections) {
      const g = grades.find((gr) => gr.id === sec.gradeId) || null;
      const level = g ? g.level : 0;

      if (!map.has(level)) {
        map.set(level, { grade: g, sections: [] });
      }
      map.get(level)?.sections.push(sec);
    }

    const sortedLevels = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedLevels.map((lvl) => ({
      level: lvl,
      grade: map.get(lvl)?.grade || null,
      sections: (map.get(lvl)?.sections || []).sort((a, b) => a.name.localeCompare(b.name)),
    }));
  }, [sections, grades]);

  const toggleSection = (secId: string) => {
    setSelectedSectionIds((prev) => {
      if (prev.includes(secId)) {
        return prev.filter((id) => id !== secId);
      }
      return [...prev, secId];
    });
  };

  const toggleGradeSections = (gradeSections: readonly SectionRecord[]) => {
    const gradeSectionIds = gradeSections.map((s) => s.id);
    const allSelected = gradeSectionIds.every((id) => selectedSectionIds.includes(id));

    if (allSelected) {
      setSelectedSectionIds((prev) => prev.filter((id) => !gradeSectionIds.includes(id)));
    } else {
      setSelectedSectionIds((prev) => Array.from(new Set([...prev, ...gradeSectionIds])));
    }
  };

  const selectAllSections = () => {
    setSelectedSectionIds(sections.map((s) => s.id));
  };

  const clearAllSections = () => {
    setSelectedSectionIds([]);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const activeYear = academicYears.find((y) => y.status === "ACTIVE");
      const fallbackYearId = defaultAcademicYearId || activeYear?.id || academicYears[0]?.id || "";
      setAcademicYearId(fallbackYearId);
      setTeacherId("");
      setSelectedSectionIds([]);
      setSubjectId("");
      setRole("SUBJECT_TEACHER");
      setFormError(null);
    }
  }, [isOpen, defaultAcademicYearId, academicYears]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!teacherId) {
      setFormError("Please select an active teacher.");
      return;
    }

    if (selectedSectionIds.length === 0) {
      setFormError("Please select at least one class section.");
      return;
    }

    if (role === "SUBJECT_TEACHER" && !subjectId) {
      setFormError("Please select a subject for subject teacher assignment.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        teacherId,
        academicYearId,
        sectionIds: selectedSectionIds,
        subjectId: role === "SUBJECT_TEACHER" ? subjectId : undefined,
        role,
      });
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to create teacher assignment."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg sm:max-w-xl rounded-2xl bg-card border border-border p-3.5 sm:p-6 shadow-2xl z-10 max-h-[94vh] flex flex-col my-auto min-w-0">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">Assign Teacher</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Assign single or multiple class sections and subjects
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            <X size={16} className="sm:w-4 sm:h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto py-3.5 sm:py-4 space-y-3.5 sm:space-y-4 pr-0.5">
          {formError && <ErrorAlert message={formError} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <SelectDropdown
              label="Academic Year"
              required
              value={academicYearId}
              onChange={(val) => {
                setAcademicYearId(val);
                setSelectedSectionIds([]);
                setSubjectId("");
              }}
              options={academicYearOptions}
              placeholder="Select academic year..."
            />

            <SelectDropdown
              label="Teacher"
              required
              value={teacherId}
              onChange={(val) => setTeacherId(val)}
              options={teacherOptions}
              placeholder={teacherOptions.length === 0 ? "Loading teachers..." : "Select teacher..."}
              searchable
              searchPlaceholder="Search teacher name or code..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Assignment Role <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("SUBJECT_TEACHER")}
                className={`h-9 sm:h-10 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  role === "SUBJECT_TEACHER"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <BookOpen size={14} className="sm:w-4 sm:h-4" />
                Subject Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("HOMEROOM_TEACHER");
                  setSubjectId("");
                }}
                className={`h-9 sm:h-10 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  role === "HOMEROOM_TEACHER"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Layers size={14} className="sm:w-4 sm:h-4" />
                Homeroom Teacher
              </button>
            </div>
          </div>

          {role === "SUBJECT_TEACHER" && (
            <SelectDropdown
              label="Curriculum Subject"
              required
              value={subjectId}
              onChange={(val) => setSubjectId(val)}
              options={subjectOptions}
              placeholder={subjectOptions.length === 0 ? "No subjects available" : "Select curriculum subject..."}
              searchable
              searchPlaceholder="Search subject name or code..."
            />
          )}

          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-between gap-1 flex-wrap">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers size={13} className="text-muted-foreground shrink-0" />
                Class Sections <span className="text-destructive">*</span>
              </label>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {selectedSectionIds.length} selected
                </span>
                {sections.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={selectAllSections}
                      className="text-[11px] font-medium text-primary hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-muted-foreground text-xs">•</span>
                    <button
                      type="button"
                      onClick={clearAllSections}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            {sections.length === 0 ? (
              <div className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border text-center text-xs text-muted-foreground">
                No sections available for the selected academic year.
              </div>
            ) : (
              <div className="space-y-3 max-h-52 sm:max-h-56 overflow-y-auto p-2 sm:p-2.5 rounded-xl bg-muted/20 border border-border">
                {groupedSections.map((group) => {
                  const gradeSectionIds = group.sections.map((s) => s.id);
                  const allInGradeSelected = gradeSectionIds.every((id) => selectedSectionIds.includes(id));
                  const someInGradeSelected = gradeSectionIds.some((id) => selectedSectionIds.includes(id));

                  return (
                    <div key={group.level} className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[11px] font-bold text-foreground">
                          {group.level > 0 ? `Grade ${group.level}` : "Ungraded Cohorts"}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleGradeSections(group.sections)}
                          className="text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {allInGradeSelected ? (
                            <CheckSquare size={12} className="text-primary" />
                          ) : someInGradeSelected ? (
                            <CheckSquare size={12} className="text-primary/70" />
                          ) : (
                            <Square size={12} />
                          )}
                          {allInGradeSelected ? "Deselect Grade" : "Select Grade"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {group.sections.map((sec) => {
                          const isSelected = selectedSectionIds.includes(sec.id);
                          return (
                            <button
                              key={sec.id}
                              type="button"
                              onClick={() => toggleSection(sec.id)}
                              className={`p-2 rounded-lg border text-left transition-all flex items-center justify-between cursor-pointer min-h-[38px] min-w-0 ${
                                isSelected
                                  ? "bg-primary/10 border-primary text-primary font-medium ring-1 ring-primary"
                                  : "bg-background border-border text-foreground hover:border-muted-foreground/40 hover:bg-muted/50"
                              }`}
                            >
                              <div className="min-w-0 pr-1 truncate">
                                <p className="text-xs font-semibold truncate">{sec.name}</p>
                                <p className="text-[10px] opacity-70 truncate">{sec.code}</p>
                              </div>
                              <div
                                className={`h-4 w-4 rounded shrink-0 flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border bg-background"
                                }`}
                              >
                                {isSelected && <Check size={11} strokeWidth={3} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-3.5 sm:pt-4 border-t border-border mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton
              isLoading={createMutation.isPending}
              disabled={selectedSectionIds.length === 0 || !teacherId}
            >
              Assign {selectedSectionIds.length > 1 ? `${selectedSectionIds.length} Sections` : "Teacher"}
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
