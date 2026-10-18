"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Calendar, GraduationCap, BookOpen, Shield } from "lucide-react";
import { LoadingSpinner, ErrorAlert, SearchQueryProvider } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { getErrorMessage } from "@/shared/utils";
import { useTeacherAssignments } from "../hooks/useTeacherAssignments";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useSections } from "@/features/academic/sections";
import { useSubjects } from "@/features/academic/subjects";
import { TeacherAssignmentsTable } from "./TeacherAssignmentsTable";
import { TeacherAssignmentModal } from "./TeacherAssignmentModal";
import { ReassignTeacherModal } from "./ReassignTeacherModal";
import { EndTeacherAssignmentModal } from "./EndTeacherAssignmentModal";
import { TeacherLoadDetailModal } from "./TeacherLoadDetailModal";
import {
  TeacherAssignmentListItem,
  TeacherAssignmentFilters,
} from "../types/teacher-assignment.types";
import { TeacherAssignmentRoleType } from "@/shared/constants/teacher-assignment.constants";

export function TeacherAssignmentsView() {
  const [filters, setFilters] = useState<TeacherAssignmentFilters>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setFilters((prev) => {
      const nextSearch = debouncedSearch.trim() || undefined;
      if (prev.search === nextSearch) return prev;
      return {
        ...prev,
        search: nextSearch,
        page: 1,
      };
    });
  }, [debouncedSearch]);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [reassignAssignment, setReassignAssignment] = useState<TeacherAssignmentListItem | null>(null);
  const [endAssignment, setEndAssignment] = useState<TeacherAssignmentListItem | null>(null);
  const [loadTeacher, setLoadTeacher] = useState<{ id: string; name: string } | null>(null);

  const { data: yearsResponse, isLoading: isLoadingYears } = useAcademicYears();
  const years = yearsResponse?.data || [];
  const { data: grades = [] } = useGrades({ isActive: true });

  const activeYear = useMemo(() => {
    return years.find((y) => y.status === "ACTIVE") || years[0] || null;
  }, [years]);

  const effectiveAcademicYearId = filters.academicYearId || activeYear?.id || "";

  const { data: sections = [] } = useSections({
    academicYearId: effectiveAcademicYearId || undefined,
    gradeId: filters.gradeId,
  });

  const { data: subjects = [] } = useSubjects();

  const queryFilters = useMemo(
    () => ({
      ...filters,
      academicYearId: effectiveAcademicYearId || undefined,
    }),
    [filters, effectiveAcademicYearId]
  );

  const {
    data: assignmentsResponse,
    isLoading: isLoadingAssignments,
    error: assignmentsError,
  } = useTeacherAssignments(queryFilters);

  const assignments = assignmentsResponse?.items || [];
  const pagination = assignmentsResponse?.pagination;

  const filteredAssignments = useMemo(() => {
    if (!search.trim()) return assignments;
    const q = search.trim().toLowerCase();
    return assignments.filter(
      (a) =>
        a.teacherName.toLowerCase().includes(q) ||
        (a.employeeCode && a.employeeCode.toLowerCase().includes(q)) ||
        (a.subjectName && a.subjectName.toLowerCase().includes(q)) ||
        (a.sectionName && a.sectionName.toLowerCase().includes(q))
    );
  }, [assignments, search]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "academicYear",
      label: "Academic Year",
      icon: Calendar,
      selectedValue: filters.academicYearId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...years.map((y) => ({
          label: y.name.replace(/Academic Year/i, "").trim() || y.name,
          value: y.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          academicYearId: val === "ALL" ? "" : val,
          page: 1,
        }));
      },
    },
    {
      id: "role",
      label: "Role",
      icon: Shield,
      selectedValue: filters.role || "ALL",
      options: [
        { label: "All", value: "ALL" },
        { label: "Subject Teacher", value: "SUBJECT_TEACHER" },
        { label: "Homeroom Teacher", value: "HOMEROOM_TEACHER" },
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          role: val === "ALL" ? undefined : (val as TeacherAssignmentRoleType),
          page: 1,
        }));
      },
    },
    {
      id: "grade",
      label: "Grade",
      icon: GraduationCap,
      selectedValue: filters.gradeId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...grades.map((g) => ({
          label: `Grade ${g.level}`,
          value: g.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          gradeId: val === "ALL" ? undefined : val,
          page: 1,
        }));
      },
    },
    {
      id: "subject",
      label: "Subject",
      icon: BookOpen,
      selectedValue: filters.subjectId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...subjects.map((sub) => ({
          label: sub.name,
          value: sub.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          subjectId: val === "ALL" ? undefined : val,
          page: 1,
        }));
      },
    },
  ];

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({
      ...prev,
      limit,
      page: 1,
    }));
  };

  if (isLoadingYears) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by teacher, code, section, or subject..."
          filters={filterGroups}
          actionButton={
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs whitespace-nowrap w-full sm:w-auto"
            >
              <Plus size={14} />
              <span>Assign Teacher</span>
            </button>
          }
        />
      </div>

      {assignmentsError ? (
        <ErrorAlert message={getErrorMessage(assignmentsError, "Failed to load teacher assignments.")} />
      ) : isLoadingAssignments && assignments.length === 0 ? (
        <div className="min-h-[300px] flex items-center justify-center p-8 bg-card rounded-none border border-border">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <TeacherAssignmentsTable
            items={filteredAssignments}
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            onReassign={(assignment) => setReassignAssignment(assignment)}
            onEndAssignment={(assignment) => setEndAssignment(assignment)}
            onViewLoad={(assignment) =>
              setLoadTeacher({
                id: assignment.teacherId,
                name: assignment.teacherName,
              })
            }
          />
        </SearchQueryProvider>
      )}

      {/* Modals */}
      <TeacherAssignmentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        defaultAcademicYearId={filters.academicYearId || ""}
        academicYears={years}
        sections={sections}
        grades={grades}
      />

      <ReassignTeacherModal
        isOpen={Boolean(reassignAssignment)}
        onClose={() => setReassignAssignment(null)}
        assignment={reassignAssignment}
      />

      <EndTeacherAssignmentModal
        isOpen={Boolean(endAssignment)}
        onClose={() => setEndAssignment(null)}
        assignment={endAssignment}
      />

      <TeacherLoadDetailModal
        isOpen={Boolean(loadTeacher)}
        onClose={() => setLoadTeacher(null)}
        teacherId={loadTeacher?.id || ""}
        teacherName={loadTeacher?.name || ""}
        academicYearId={filters.academicYearId || ""}
      />
    </div>
  );
}
