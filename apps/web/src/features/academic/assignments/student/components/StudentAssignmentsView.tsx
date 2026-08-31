"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowRightLeft, ArrowUpRight, Calendar, GraduationCap, Users } from "lucide-react";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage } from "@/shared/utils";
import { useStudentRoster } from "../hooks/useStudentAssignments";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useSections } from "@/features/academic/sections";
import { StudentAssignmentsTable } from "./StudentAssignmentsTable";
import { SingleTransferModal } from "./SingleTransferModal";
import { BulkTransferModal } from "./BulkTransferModal";
import { PromotionModal } from "./PromotionModal";
import { StudentEnrollmentHistoryModal } from "./StudentEnrollmentHistoryModal";
import { WithdrawStudentModal } from "./WithdrawStudentModal";
import { StudentRosterItem, StudentRosterFilters } from "../types/student-assignment.types";

export function StudentAssignmentsView() {
  const [filters, setFilters] = useState<StudentRosterFilters>({});
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [singleTransferStudent, setSingleTransferStudent] = useState<StudentRosterItem | null>(null);
  const [historyStudent, setHistoryStudent] = useState<StudentRosterItem | null>(null);
  const [withdrawStudent, setWithdrawStudent] = useState<StudentRosterItem | null>(null);
  const [isBulkTransferOpen, setIsBulkTransferOpen] = useState(false);
  const [isPromotionOpen, setIsPromotionOpen] = useState(false);

  const { data: yearsResponse, isLoading: isLoadingYears } = useAcademicYears();
  const years = yearsResponse?.data || [];
  const { data: grades = [] } = useGrades({ isActive: true });

  const activeYear = useMemo(() => {
    return years.find((y) => y.status === "ACTIVE") || years[0] || null;
  }, [years]);

  useEffect(() => {
    if (activeYear?.id && !filters.academicYearId) {
      setFilters((prev) => ({
        ...prev,
        academicYearId: activeYear.id,
      }));
    }
  }, [activeYear, filters.academicYearId]);

  const { data: sections = [] } = useSections({
    academicYearId: filters.academicYearId,
    gradeId: filters.gradeId,
  });

  const {
    data: rosterResponse,
    isLoading: isLoadingRoster,
    error: rosterError,
  } = useStudentRoster(filters);

  const roster = rosterResponse?.items || [];
  const pagination = rosterResponse?.pagination;

  const selectedStudents = useMemo(() => {
    return roster.filter((s) => selectedStudentIds.includes(s.studentId));
  }, [roster, selectedStudentIds]);

  const handleToggleSelect = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (ids: readonly string[]) => {
    setSelectedStudentIds([...ids]);
  };

  const handleClearSelection = () => {
    setSelectedStudentIds([]);
  };

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      search: val || undefined,
      page: 1,
    }));
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "academicYear",
      label: "Year",
      icon: Calendar,
      selectedValue: filters.academicYearId || "",
      options: [
        ...years.map((y) => ({
          label: y.name,
          value: y.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          academicYearId: val,
          sectionId: undefined,
          page: 1,
        }));
        setSelectedStudentIds([]);
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
          sectionId: undefined,
          page: 1,
        }));
        setSelectedStudentIds([]);
      },
    },
    {
      id: "section",
      label: "Section",
      icon: Users,
      selectedValue: filters.sectionId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...sections.map((s) => ({
          label: s.name,
          value: s.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          sectionId: val === "ALL" ? undefined : val,
          page: 1,
        }));
        setSelectedStudentIds([]);
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
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search by student name or code..."
          filters={filterGroups}
          actionButton={
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={() => setIsBulkTransferOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-background border border-border hover:bg-muted text-foreground transition-colors cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-1 sm:flex-initial"
              >
                <ArrowRightLeft size={14} />
                <span>Bulk Transfer ({selectedStudentIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPromotionOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs whitespace-nowrap flex-1 sm:flex-initial"
              >
                <ArrowUpRight size={14} />
                <span>Run Promotion</span>
              </button>
            </div>
          }
        />
      </div>

      {rosterError ? (
        <ErrorAlert message={getErrorMessage(rosterError, "Failed to load student roster.")} />
      ) : isLoadingRoster ? (
        <div className="min-h-[300px] flex items-center justify-center p-8">
          <LoadingSpinner size={28} />
        </div>
      ) : (
        <StudentAssignmentsTable
          items={roster}
          selectedStudentIds={selectedStudentIds}
          pagination={pagination}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onTransferSingle={(student) => setSingleTransferStudent(student)}
          onShowHistory={(student) => setHistoryStudent(student)}
          onWithdraw={(student) => setWithdrawStudent(student)}
        />
      )}

      {/* Modals */}
      <SingleTransferModal
        isOpen={Boolean(singleTransferStudent)}
        onClose={() => setSingleTransferStudent(null)}
        student={singleTransferStudent}
        academicYearId={filters.academicYearId || ""}
      />

      <BulkTransferModal
        isOpen={isBulkTransferOpen}
        onClose={() => {
          setIsBulkTransferOpen(false);
          setSelectedStudentIds([]);
        }}
        selectedStudents={selectedStudents}
        academicYearId={filters.academicYearId || ""}
        onTransferSuccess={handleClearSelection}
      />

      <PromotionModal
        isOpen={isPromotionOpen}
        onClose={() => setIsPromotionOpen(false)}
        currentAcademicYearId={filters.academicYearId || ""}
        academicYears={years}
        availableGrades={grades.map((g) => g.level)}
        onPromotionSuccess={handleClearSelection}
      />

      <StudentEnrollmentHistoryModal
        isOpen={Boolean(historyStudent)}
        onClose={() => setHistoryStudent(null)}
        student={historyStudent}
      />

      <WithdrawStudentModal
        isOpen={Boolean(withdrawStudent)}
        onClose={() => setWithdrawStudent(null)}
        student={withdrawStudent}
        academicYearId={filters.academicYearId || ""}
      />
    </div>
  );
}
