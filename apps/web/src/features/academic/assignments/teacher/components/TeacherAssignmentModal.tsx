"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, UserCheck } from "lucide-react";
import { useCreateTeacherAssignment } from "../hooks/useTeacherAssignments";
import { useStaffQualificationsDirectory } from "@/features/staff-qualifications";
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
  readonly defaultAcademicYearId: string;
  readonly academicYears: readonly AcademicYearOption[];
  readonly sections: readonly SectionRecord[];
  readonly grades: readonly GradeItem[];
}

export function TeacherAssignmentModal({
  isOpen,
  onClose,
  defaultAcademicYearId,
  academicYears,
  sections,
  grades,
}: TeacherAssignmentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [academicYearId, setAcademicYearId] = useState(defaultAcademicYearId);
  const [teacherId, setTeacherId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [role, setRole] = useState<TeacherAssignmentRoleType>("SUBJECT_TEACHER");
  const [formError, setFormError] = useState<string | null>(null);

  const createMutation = useCreateTeacherAssignment();

  const { data: staffDirectoryResponse } = useStaffQualificationsDirectory({
    status: "ACTIVE",
    limit: 100,
  });
  const teachers = staffDirectoryResponse?.data || [];

  const selectedSection = useMemo(() => {
    return sections.find((s) => s.id === sectionId);
  }, [sections, sectionId]);

  const selectedSectionGradeLevel = useMemo(() => {
    if (!selectedSection) return undefined;
    const g = grades.find((gr) => gr.id === selectedSection.gradeId);
    return g?.level;
  }, [selectedSection, grades]);

  const { data: subjects = [] } = useSubjects({
    gradeLevel: selectedSectionGradeLevel,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAcademicYearId(defaultAcademicYearId);
      setTeacherId("");
      setSectionId("");
      setSubjectId("");
      setRole("SUBJECT_TEACHER");
      setFormError(null);
    }
  }, [isOpen, defaultAcademicYearId]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border p-5 sm:p-6 shadow-xl z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserCheck size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Assign Teacher</h2>
              <p className="text-xs text-muted-foreground">
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
              onChange={(e) => setAcademicYearId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              required
            >
              {academicYears.map((yr) => (
                <option key={yr.id} value={yr.id}>
                  {yr.name} ({yr.status})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Teaching Staff <span className="text-destructive">*</span>
            </label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              required
            >
              <option value="">Select active teacher...</option>
              {teachers.map((t) => (
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
                onClick={() => {
                  setRole("SUBJECT_TEACHER");
                }}
                className={`h-9 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  role === "SUBJECT_TEACHER"
                    ? "bg-primary text-primary-foreground border-primary"
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
                className={`h-9 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  role === "HOMEROOM_TEACHER"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-foreground hover:bg-muted"
                }`}
              >
                Homeroom Teacher
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
              className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              required
            >
              <option value="">Select class section...</option>
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
                className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
                required
                disabled={!sectionId}
              >
                <option value="">
                  {sectionId ? "Select curriculum subject..." : "Select class section first..."}
                </option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-9 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
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
