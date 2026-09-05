"use client";

import { useState } from "react";
import { Plus, GraduationCap } from "lucide-react";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage } from "@/shared/utils";
import { useSubjects } from "../hooks/useSubjects";
import { useGrades } from "@/features/academic/grades";
import { SubjectsTable } from "./SubjectsTable";
import { SubjectFormModal } from "./SubjectFormModal";
import { SubjectDetailModal } from "./SubjectDetailModal";
import { AssignGradesModal } from "./AssignGradesModal";
import { SubjectItem, SubjectFilters } from "../types/subject.types";
import { useAuthStore } from "@/stores/auth.store";
import { useMemo } from "react";

export function SubjectsView() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = Boolean(
    user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SCHOOL_ADMIN") &&
      !user?.roles?.includes("SYSTEM_ADMIN")
  );

  const [filters, setFilters] = useState<SubjectFilters>({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignGradesOpen, setIsAssignGradesOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [subjectToEdit, setSubjectToEdit] = useState<SubjectItem | null>(null);

  const { data: grades = [] } = useGrades({ isActive: true });

  const {
    data: rawSubjects = [],
    isLoading,
    error,
  } = useSubjects(filters);

  const subjects = rawSubjects;

  const visibleGrades = useMemo(() => {
    if (!isTeacher) return grades;
    const gradeLevels = new Set(rawSubjects.flatMap((s) => s.assignedGradeLevels));
    return grades.filter((g) => gradeLevels.has(g.level));
  }, [grades, isTeacher, rawSubjects]);

  const handleOpenAdd = () => {
    setSubjectToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (subject: SubjectItem) => {
    setSubjectToEdit(subject);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (subject: SubjectItem) => {
    setSelectedSubject(subject);
    setIsDetailModalOpen(true);
  };

  const handleOpenAssignGrades = (subject: SubjectItem) => {
    setSelectedSubject(subject);
    setIsAssignGradesOpen(true);
  };

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      search: val || undefined,
    }));
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "grade",
      label: "Grade",
      icon: GraduationCap,
      selectedValue: filters.gradeLevel ? String(filters.gradeLevel) : "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...visibleGrades.map((g) => ({
          label: `Grade ${g.level}`,
          value: String(g.level),
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          gradeLevel: val === "ALL" ? undefined : Number(val),
        }));
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorAlert message={getErrorMessage(error, "Failed to load subjects.")} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search subjects..."
          filters={filterGroups}
          actionButton={
            isTeacher ? undefined : (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
              >
                <Plus size={14} />
                <span>Subject</span>
              </button>
            )
          }
        />
      </div>

      <SubjectsTable
        items={subjects}
        onViewDetails={handleOpenDetail}
        onEdit={handleOpenEdit}
        onAssignGrades={handleOpenAssignGrades}
        isReadOnly={isTeacher}
      />

      {!isTeacher && (
        <>
          <SubjectFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setSubjectToEdit(null);
            }}
            initialSubject={subjectToEdit}
          />

          <AssignGradesModal
            isOpen={isAssignGradesOpen}
            onClose={() => {
              setIsAssignGradesOpen(false);
              setSelectedSubject(null);
            }}
            subject={selectedSubject}
          />
        </>
      )}

      <SubjectDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSubject(null);
        }}
        subjectId={selectedSubject?.id || ""}
      />
    </div>
  );
}
