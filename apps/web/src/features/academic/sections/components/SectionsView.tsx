"use client";

import { useState, useMemo } from "react";
import { Plus, Calendar, GraduationCap, Layers } from "lucide-react";
import { LoadingSpinner, ErrorAlert, SearchQueryProvider, TableSkeleton } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage } from "@/shared/utils";
import { useSections } from "../hooks/useSections";
import { useAcademicYears } from "@/features/academic/academic-years";
import { useGrades } from "@/features/academic/grades";
import { SectionsTable } from "./SectionsTable";
import { SectionFormModal } from "./SectionFormModal";
import { BulkSectionFormModal } from "./BulkSectionFormModal";
import { SectionDetailModal } from "./SectionDetailModal";
import { SectionRecord, SectionFilterParams } from "../types/section.types";
import { useAuthStore } from "@/stores/auth.store";
import { useDebounce } from "@/shared/hooks/useDebounce";

export function SectionsView() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = Boolean(
    user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SCHOOL_ADMIN") &&
      !user?.roles?.includes("SYSTEM_ADMIN")
  );

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<SectionFilterParams>({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SectionRecord | null>(null);
  const [sectionToEdit, setSectionToEdit] = useState<SectionRecord | null>(null);

  const { data: academicYearsResponse } = useAcademicYears();
  const academicYears = academicYearsResponse?.data || [];

  const { data: grades = [] } = useGrades({ isActive: true });

  const activeYear = useMemo(
    () => academicYears.find((y) => y.status === "ACTIVE"),
    [academicYears]
  );

  const effectiveAcademicYearId = filters.academicYearId || (isTeacher ? "" : activeYear?.id || "");

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch.trim() || undefined,
      academicYearId: effectiveAcademicYearId || undefined,
    }),
    [filters, debouncedSearch, effectiveAcademicYearId]
  );

  const {
    data: rawSections = [],
    isLoading,
    error,
  } = useSections(queryFilters);

  const sections = rawSections;

  const visibleGrades = useMemo(() => {
    if (!isTeacher) return grades;
    const gradeIdSet = new Set(rawSections.map((s) => s.gradeId));
    const gradeLevelSet = new Set(rawSections.map((s) => s.gradeLevel));
    return grades.filter((g) => gradeIdSet.has(g.id) || gradeLevelSet.has(g.level));
  }, [grades, isTeacher, rawSections]);

  const handleOpenAdd = () => {
    setSectionToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (section: SectionRecord) => {
    setSectionToEdit(section);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (section: SectionRecord) => {
    setSelectedSection(section);
    setIsDetailModalOpen(true);
  };

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
        ...academicYears.map((y) => ({
          label: y.name.replace(/Academic Year/i, "").trim() || y.name,
          value: y.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          academicYearId: val === "ALL" ? "" : val,
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
        ...visibleGrades.map((g) => ({
          label: `Grade ${g.level}`,
          value: g.id,
        })),
      ],
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          gradeId: val === "ALL" ? undefined : val,
        }));
      },
    },
  ];



  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-none border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search sections..."
          filters={filterGroups}
          actionButton={
            isTeacher ? undefined : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-none text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                >
                  <Layers size={14} />
                  <span>Bulk Generate</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-none text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                >
                  <Plus size={14} />
                  <span>Section</span>
                </button>
              </div>
            )
          }
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} columns={6} hasToolbar={false} />
      ) : error ? (
        <div className="p-6 max-w-7xl mx-auto">
          <ErrorAlert message={getErrorMessage(error, "Failed to load sections.")} />
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <SectionsTable
            items={sections}
            onViewDetails={handleOpenDetail}
            onEdit={handleOpenEdit}
            isReadOnly={isTeacher}
          />
        </SearchQueryProvider>
      )}

      {!isTeacher && (
        <>
          <SectionFormModal
            isOpen={isFormModalOpen}
            onClose={() => {
              setIsFormModalOpen(false);
              setSectionToEdit(null);
            }}
            initialSection={sectionToEdit}
            defaultAcademicYearId={effectiveAcademicYearId}
            defaultGradeId={filters.gradeId}
          />

          <BulkSectionFormModal
            isOpen={isBulkModalOpen}
            onClose={() => setIsBulkModalOpen(false)}
            defaultAcademicYearId={effectiveAcademicYearId}
            defaultGradeId={filters.gradeId}
          />
        </>
      )}

      <SectionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSection(null);
        }}
        sectionId={selectedSection?.id || ""}
      />
    </div>
  );
}
