"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, UserCheck } from "lucide-react";
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
import { SubmitButton, ErrorAlert } from "@/shared/components";
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
  const [sectionId, setSectionId] = useState("");
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

  const selectedSection = useMemo(() => {
    return sections.find((s) => s.id === sectionId);
  }, [sections, sectionId]);

  const selectedSectionGradeLevel = useMemo(() => {
    if (!selectedSection) return undefined;
    const g = grades.find((gr) => gr.id === selectedSection.gradeId);
    return g?.level;
  }, [selectedSection, grades]);

  const availableSubjects = useMemo(() => {
    if (allSubjects.length === 0) return [];
    if (selectedSectionGradeLevel !== undefined) {
      const mapped = allSubjects.filter((s) =>
        s.assignedGradeLevels?.includes(selectedSectionGradeLevel)
      );
      if (mapped.length > 0) {
        return mapped;
      }
    }
    return allSubjects;
  }, [allSubjects, selectedSectionGradeLevel]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const activeYear = academicYears.find((y) => y.status === "ACTIVE");
      const fallbackYearId = defaultAcademicYearId || activeYear?.id || academicYears[0]?.id || "";
      setAcademicYearId(fallbackYearId);
      setTeacherId("");
      setSectionId("");
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

    if (!sectionId) {
      setFormError("Please select a class section.");
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
        sectionId,
        subjectId: role === "SUBJECT_TEACHER" ? subjectId : undefined,
        role,
      });
      onClose();
    } catch (err: unknown) {
      setFormError(getErrorMessage(err, "Failed to create teacher assignment."));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-4 sm:p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">Assign Teacher</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                Link teaching staff to class cohorts and subjects
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <ErrorAlert message={formError} />}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Academic Year <span className="text-destructive">*</span>
            </label>
            <select
              value={academicYearId}
              onChange={(e) => {
                setAcademicYearId(e.target.value);
                setSectionId("");
                setSubjectId("");
              }}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              required
            >
              <option value="">Select academic year...</option>
              {academicYears.map((yr) => (
                <option key={yr.id} value={yr.id}>
                  {yr.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Teacher <span className="text-destructive">*</span>
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              required
            >
              <option value="">
                {activeTeachers.length === 0 ? "Loading teachers..." : "Select teacher..."}
              </option>
              {activeTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.middleName || ""} {t.lastName} ({t.employeeCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Assignment Role <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("SUBJECT_TEACHER")}
                className={`h-9 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  role === "SUBJECT_TEACHER"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                Subject Teacher
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("HOMEROOM_TEACHER");
                  setSubjectId("");
                }}
                className={`h-9 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  role === "HOMEROOM_TEACHER"
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                Homeroom
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Class Section <span className="text-destructive">*</span>
            </label>
            <select
              value={sectionId}
              onChange={(e) => {
                setSectionId(e.target.value);
                setSubjectId("");
              }}
              className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              required
            >
              <option value="">
                {sections.length === 0 ? "No sections available for selected year" : "Select class section..."}
              </option>
              {sections.map((sec) => {
                const g = grades.find((gr) => gr.id === sec.gradeId);
                return (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({g ? `Grade ${g.level}` : sec.code})
                  </option>
                );
              })}
            </select>
          </div>

          {role === "SUBJECT_TEACHER" && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Subject <span className="text-destructive">*</span>
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                required
              >
                <option value="">
                  {availableSubjects.length === 0 ? "No subjects available" : "Select curriculum subject..."}
                </option>
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-2.5 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <SubmitButton isLoading={createMutation.isPending}>
              Assign Teacher
            </SubmitButton>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
