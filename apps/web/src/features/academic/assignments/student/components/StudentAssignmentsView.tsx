"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowRightLeft, ArrowUpRight, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoadingSpinner, ErrorAlert, SearchQueryProvider, TableSkeleton } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage, useInfiniteScrollSentinel } from "@/shared/utils";
import { useInfiniteStudentRoster } from "../hooks/useStudentAssignments";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { useSections } from "@/features/academic/sections";
import { StudentAssignmentsTable } from "./StudentAssignmentsTable";
import { SingleTransferModal } from "./SingleTransferModal";
import { BulkTransferModal } from "./BulkTransferModal";
import { PromotionModal } from "./PromotionModal";
import { StudentEnrollmentHistoryModal } from "./StudentEnrollmentHistoryModal";
import { WithdrawStudentModal } from "./WithdrawStudentModal";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { StudentRosterItem } from "../types/student-assignment.types";

export function StudentAssignmentsView() {
  const [academicYearId, setAcademicYearId] = useState<string | undefined>(undefined);
  const [gradeId, setGradeId] = useState<string | undefined>(undefined);
  const [sectionId, setSectionId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 300);
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

  const effectiveAcademicYearId = academicYearId || activeYear?.id || "";

  const { data: sections = [] } = useSections({
    academicYearId: effectiveAcademicYearId || undefined,
    gradeId,
  });

  const {
    data: rosterPages,
    isLoading: isLoadingRoster,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: rosterError,
  } = useInfiniteStudentRoster({
    academicYearId: effectiveAcademicYearId || undefined,
    gradeId,
    sectionId,
    search: debouncedSearch.trim() || undefined,
    limit: 30,
  });

  const roster: StudentRosterItem[] = useMemo(() => {
    if (!rosterPages) return [];
    return rosterPages.pages.flatMap((p) => [...p.items]);
  }, [rosterPages]);

  const isInitialLoading = isLoadingYears || !effectiveAcademicYearId || (isLoadingRoster && roster.length === 0);

  const lastPagination = rosterPages?.pages.at(-1)?.pagination;

  const gradeCountMap = useMemo(() => {
    const map = new Map<string, number>();
    roster.forEach((s) => {
      map.set(s.gradeId, (map.get(s.gradeId) ?? 0) + 1);
    });
    return map;
  }, [roster]);

  const selectedStudents = useMemo(() => {
    return roster.filter((s) => selectedStudentIds.includes(s.studentId));
  }, [roster, selectedStudentIds]);

  const sentinelRef = useInfiniteScrollSentinel(
    Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage
  );

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

  const resetPagination = () => {
    setSelectedStudentIds([]);
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "academicYear",
      label: "Academic Year",
      icon: Calendar,
      selectedValue: academicYearId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...years.map((y) => ({
          label: y.name.replace(/Academic Year/i, "").trim() || y.name,
          value: y.id,
        })),
      ],
      onSelect: (val) => {
        setAcademicYearId(val === "ALL" ? "" : val);
        setGradeId(undefined);
        setSectionId(undefined);
        resetPagination();
      },
    },
    {
      id: "section",
      label: "Section",
      icon: Users,
      selectedValue: sectionId || "ALL",
      options: [
        { label: "All", value: "ALL" },
        ...sections.map((s) => ({
          label: s.name,
          value: s.id,
        })),
      ],
      onSelect: (val) => {
        setSectionId(val === "ALL" ? undefined : val);
        resetPagination();
      },
    },
  ];

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
          onSearchChange={(val) => {
            setSearch(val);
            resetPagination();
          }}
          searchPlaceholder="Search by student name or code..."
          filters={filterGroups}
          actionButton={
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                disabled={selectedStudentIds.length === 0}
                onClick={() => setIsBulkTransferOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-background border border-border hover:bg-muted text-foreground transition-colors cursor-pointer shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap flex-1 sm:flex-initial"
              >
                <ArrowRightLeft size={14} />
                <span>Bulk Transfer ({selectedStudentIds.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPromotionOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs whitespace-nowrap flex-1 sm:flex-initial"
              >
                <ArrowUpRight size={14} />
                <span>Run Promotion</span>
              </button>
            </div>
          }
        />
      </div>

      {grades.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setGradeId(undefined);
              setSectionId(undefined);
              resetPagination();
            }}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 sm:px-4 rounded-none text-xs font-semibold transition-colors cursor-pointer shadow-xs",
              !gradeId
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground hover:bg-muted/80"
            )}
          >
            <span>All Grades</span>
            <span
              className={cn(
                "text-[11px] font-mono",
                !gradeId ? "text-primary-foreground/90 font-bold" : "text-muted-foreground"
              )}
            >
              {lastPagination?.total ?? roster.length}
            </span>
          </button>
          {grades.map((g) => {
            const isSelected = gradeId === g.id;
            const count = gradeCountMap.get(g.id) ?? 0;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGradeId(g.id);
                  setSectionId(undefined);
                  resetPagination();
                }}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 sm:px-4 rounded-none text-xs font-semibold transition-colors cursor-pointer shadow-xs",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-muted/80"
                )}
              >
                <span>Grade {g.level}</span>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    isSelected ? "text-primary-foreground/90 font-bold" : "text-muted-foreground"
                  )}
                >
                  {isSelected ? (lastPagination?.total ?? count) : count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {rosterError ? (
        <ErrorAlert message={getErrorMessage(rosterError, "Failed to load student roster.")} />
      ) : isInitialLoading ? (
        <TableSkeleton rows={8} columns={5} hasToolbar={false} />
      ) : (
        <SearchQueryProvider query={search}>
          <StudentAssignmentsTable
            items={roster}
            selectedStudentIds={selectedStudentIds}
            sentinelRef={sentinelRef}
            isFetchingMore={isFetchingNextPage}
            hasMore={Boolean(hasNextPage)}
            total={lastPagination?.total ?? 0}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onClearSelection={handleClearSelection}
            onTransferSingle={(student) => setSingleTransferStudent(student)}
            onShowHistory={(student) => setHistoryStudent(student)}
            onWithdraw={(student) => setWithdrawStudent(student)}
          />
        </SearchQueryProvider>
      )}

      <SingleTransferModal
        isOpen={Boolean(singleTransferStudent)}
        onClose={() => setSingleTransferStudent(null)}
        student={singleTransferStudent}
        academicYearId={singleTransferStudent?.academicYearId || effectiveAcademicYearId}
      />

      <BulkTransferModal
        isOpen={isBulkTransferOpen}
        onClose={() => {
          setIsBulkTransferOpen(false);
          setSelectedStudentIds([]);
        }}
        selectedStudents={selectedStudents}
        academicYearId={effectiveAcademicYearId}
        onTransferSuccess={handleClearSelection}
      />

      <PromotionModal
        isOpen={isPromotionOpen}
        onClose={() => setIsPromotionOpen(false)}
        currentAcademicYearId={effectiveAcademicYearId}
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
        academicYearId={withdrawStudent?.academicYearId || effectiveAcademicYearId}
      />
    </div>
  );
}
