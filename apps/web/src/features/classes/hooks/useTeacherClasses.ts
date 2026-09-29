import { useMemo } from "react";
import { useSections } from "@/features/academic/sections/hooks/useSections";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useMyTeacherProfile } from "@/features/teacher-profile";
import { useAuthStore } from "@/stores/auth.store";
import { SectionFilterParams, SectionRecord } from "@/features/academic/sections/types/section.types";

export type TeacherRoleFilter = "ALL" | "HOMEROOM" | "SUBJECT";

export interface UseTeacherClassesOptions {
  readonly filters?: SectionFilterParams;
  readonly roleFilter?: TeacherRoleFilter;
}

export function useTeacherClasses(options: UseTeacherClassesOptions = {}) {
  const { filters = {}, roleFilter = "ALL" } = options;
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMyTeacherProfile();

  const { data: academicYearsResponse, isLoading: isLoadingYears } = useAcademicYears();
  const academicYears = academicYearsResponse?.data || [];

  const { data: grades = [], isLoading: isLoadingGrades } = useGrades({ isActive: true });

  const activeYear = useMemo(
    () => academicYears.find((y) => y.status === "ACTIVE"),
    [academicYears]
  );

  const effectiveAcademicYearId = filters.academicYearId || activeYear?.id || "";

  const {
    data: rawSections = [],
    isLoading: isLoadingSections,
    error,
    refetch,
  } = useSections({
    ...filters,
    academicYearId: effectiveAcademicYearId || undefined,
  });

  const teacherProfileId = profile?.id;
  const authUserId = user?.id;

  const isHomeroomSection = (sec: SectionRecord): boolean => {
    if (!sec.homeroomTeacher) return false;
    return Boolean(
      (teacherProfileId && sec.homeroomTeacher.teacherId === teacherProfileId) ||
      (teacherProfileId && sec.homeroomTeacher.id === teacherProfileId) ||
      (authUserId && sec.homeroomTeacher.teacherId === authUserId) ||
      (authUserId && sec.homeroomTeacher.id === authUserId)
    );
  };

  const sections = useMemo(() => {
    if (roleFilter === "ALL") return rawSections;
    return rawSections.filter((sec) => {
      const isHomeroom = isHomeroomSection(sec);
      return roleFilter === "HOMEROOM" ? isHomeroom : !isHomeroom;
    });
  }, [rawSections, roleFilter, teacherProfileId, authUserId]);

  const stats = useMemo(() => {
    let homeroomCount = 0;
    let subjectCount = 0;
    let totalStudents = 0;

    for (const sec of rawSections) {
      if (isHomeroomSection(sec)) {
        homeroomCount++;
      } else {
        subjectCount++;
      }
      totalStudents += sec.studentCount || 0;
    }

    return {
      totalClasses: rawSections.length,
      homeroomClasses: homeroomCount,
      subjectClasses: subjectCount,
      totalStudents,
    };
  }, [rawSections, teacherProfileId, authUserId]);

  const availableGrades = useMemo(() => {
    const gradeIdSet = new Set(rawSections.map((s) => s.gradeId));
    const gradeLevelSet = new Set(rawSections.map((s) => s.gradeLevel));
    return grades.filter((g) => gradeIdSet.has(g.id) || gradeLevelSet.has(g.level));
  }, [grades, rawSections]);

  return {
    sections,
    allSections: rawSections,
    stats,
    academicYears,
    activeYear,
    effectiveAcademicYearId,
    availableGrades,
    grades,
    isLoading: isLoadingSections || isLoadingYears || isLoadingGrades,
    error,
    refetch,
    isHomeroomSection,
  };
}
