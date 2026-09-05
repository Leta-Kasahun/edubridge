import { useMemo } from "react";
import { useMyTeacherProfile } from "@/features/teacher-profile/hooks/useTeacherProfile";
import { useTeacherAssignments } from "./useTeacherAssignments";
import { TeacherAssignmentListItem } from "../types/teacher-assignment.types";

export interface AssignedSubject {
  readonly id: string;
  readonly name: string;
  readonly code: string | null;
}

export interface AssignedGrade {
  readonly id: string;
  readonly level: number;
}

export interface AssignedSection {
  readonly id: string;
  readonly name: string;
  readonly gradeId: string;
  readonly gradeLevel: number;
}

export function useMyTeacherAssignments() {
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useMyTeacherProfile();

  const teacherId = profile?.id;

  const {
    data: assignmentsData,
    isLoading: isAssignmentsLoading,
    error: assignmentsError,
    refetch,
  } = useTeacherAssignments({
    teacherId: teacherId ?? undefined,
    limit: 100,
  });

  const assignments: readonly TeacherAssignmentListItem[] = useMemo(
    () => assignmentsData?.items ?? [],
    [assignmentsData?.items]
  );

  const assignedSubjects: readonly AssignedSubject[] = useMemo(() => {
    const map = new Map<string, AssignedSubject>();
    for (const a of assignments) {
      if (a.subjectId && a.subjectName) {
        map.set(a.subjectId, {
          id: a.subjectId,
          name: a.subjectName,
          code: a.subjectCode,
        });
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  const assignedGrades: readonly AssignedGrade[] = useMemo(() => {
    const map = new Map<string, AssignedGrade>();
    for (const a of assignments) {
      if (a.gradeId) {
        map.set(a.gradeId, {
          id: a.gradeId,
          level: a.gradeLevel,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.level - b.level);
  }, [assignments]);

  const assignedSections: readonly AssignedSection[] = useMemo(() => {
    const map = new Map<string, AssignedSection>();
    for (const a of assignments) {
      if (a.sectionId) {
        map.set(a.sectionId, {
          id: a.sectionId,
          name: a.sectionName,
          gradeId: a.gradeId,
          gradeLevel: a.gradeLevel,
        });
      }
    }
    return Array.from(map.values());
  }, [assignments]);

  const allowedSubjectIds: readonly string[] = useMemo(
    () => assignedSubjects.map((s) => s.id),
    [assignedSubjects]
  );

  const allowedGradeIds: readonly string[] = useMemo(
    () => assignedGrades.map((g) => g.id),
    [assignedGrades]
  );

  return {
    teacherProfile: profile,
    assignments,
    assignedSubjects,
    assignedGrades,
    assignedSections,
    allowedSubjectIds,
    allowedGradeIds,
    isLoading: isProfileLoading || isAssignmentsLoading,
    error: profileError || assignmentsError,
    refetch,
  };
}
