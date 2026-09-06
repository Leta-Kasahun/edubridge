import { useMemo, useEffect } from "react";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useInfiniteStudentRoster } from "@/features/academic/assignments/student";
import type { ChartSliceItem } from "@/shared/components/dashboard-tabs-overview/types";

export function useTeacherAssignedStudents() {
  const { data: academicYearsResponse, isLoading: isYearsLoading } = useAcademicYears();
  const academicYears = academicYearsResponse?.data || [];

  const activeYear = useMemo(
    () => academicYears.find((y) => y.status === "ACTIVE") || academicYears[0],
    [academicYears]
  );
  const academicYearId = activeYear?.id;

  const {
    data: rosterPages,
    isLoading: isRosterLoading,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = useInfiniteStudentRoster({
    academicYearId: academicYearId || "",
    limit: 100,
  });

  useEffect(() => {
    if (hasNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);

  const students = useMemo(() => {
    if (!rosterPages) return [];
    return rosterPages.pages.flatMap((p) => [...p.items]);
  }, [rosterPages]);

  const totalStudents = rosterPages?.pages[0]?.pagination?.total ?? students.length;

  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "ACTIVE").length,
    [students]
  );

  const transferredStudents = useMemo(
    () => students.filter((s) => s.status === "TRANSFERRED").length,
    [students]
  );

  const withdrawnStudents = useMemo(
    () => students.filter((s) => s.status === "WITHDRAWN").length,
    [students]
  );

  const suspendedStudents = useMemo(
    () => students.filter((s) => s.status === "SUSPENDED").length,
    [students]
  );

  const completedStudents = useMemo(
    () => students.filter((s) => s.status === "COMPLETED").length,
    [students]
  );

  const maleStudents = useMemo(
    () => students.filter((s) => s.gender === "MALE").length,
    [students]
  );

  const femaleStudents = useMemo(
    () => students.filter((s) => s.gender === "FEMALE").length,
    [students]
  );

  const studentStatusSlices: readonly ChartSliceItem[] = useMemo(() => {
    const slices: ChartSliceItem[] = [];
    if (activeStudents > 0) {
      slices.push({ name: "Active", value: activeStudents, color: "#10B981" });
    }
    if (transferredStudents > 0) {
      slices.push({ name: "Transferred", value: transferredStudents, color: "#3B82F6" });
    }
    if (withdrawnStudents > 0) {
      slices.push({ name: "Withdrawn", value: withdrawnStudents, color: "#EF4444" });
    }
    if (suspendedStudents > 0) {
      slices.push({ name: "Suspended", value: suspendedStudents, color: "#F59E0B" });
    }
    if (completedStudents > 0) {
      slices.push({ name: "Completed", value: completedStudents, color: "#8B5CF6" });
    }
    if (slices.length === 0 && totalStudents > 0) {
      slices.push({ name: "Active", value: totalStudents, color: "#10B981" });
    }
    return slices;
  }, [activeStudents, transferredStudents, withdrawnStudents, suspendedStudents, completedStudents, totalStudents]);

  const studentGenderSlices: readonly ChartSliceItem[] = useMemo(
    () => [
      { name: "Male", value: maleStudents, color: "#0EA5E9" },
      { name: "Female", value: femaleStudents, color: "#F97316" },
    ],
    [maleStudents, femaleStudents]
  );

  const isLoading = isYearsLoading || (Boolean(academicYearId) && isRosterLoading && !rosterPages);

  return {
    students,
    totalStudents,
    activeStudents,
    transferredStudents,
    withdrawnStudents,
    suspendedStudents,
    completedStudents,
    maleStudents,
    femaleStudents,
    studentStatusSlices,
    studentGenderSlices,
    isLoading,
    isFetching,
  };
}
