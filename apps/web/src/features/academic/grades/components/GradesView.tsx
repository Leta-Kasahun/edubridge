"use client";

import { useState, useMemo } from "react";
import { Plus, Filter, Layers } from "lucide-react";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage } from "@/shared/utils";
import {
  GRADE_STATUS_OPTIONS,
  GRADE_CATEGORY_FILTER_OPTIONS,
} from "@/shared/constants";
import { GradeFilters, GradeItem } from "../types/grade.types";
import { useGrades } from "../hooks/useGrades";
import { GradesTable } from "./GradesTable";
import { GradeFormModal } from "./GradeFormModal";
import { GradeDetailModal } from "./GradeDetailModal";
import { useAuthStore } from "@/stores/auth.store";

export function GradesView() {
  const user = useAuthStore((s) => s.user);
  const isTeacher = Boolean(
    user?.roles?.includes("TEACHER") &&
      !user?.roles?.includes("SCHOOL_ADMIN") &&
      !user?.roles?.includes("SYSTEM_ADMIN")
  );

  const [filters, setFilters] = useState<GradeFilters>({});
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeItem | null>(null);

  const { data: rawGrades = [], isLoading, error } = useGrades(filters);

  const grades = rawGrades;

  const existingLevels = useMemo(
    () => grades.map((g) => g.level),
    [grades]
  );

  const handleOpenAdd = () => {
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (grade: GradeItem) => {
    setSelectedGrade(grade);
    setIsDetailModalOpen(true);
  };

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({
      ...prev,
      search: val || undefined,
    }));
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      icon: Layers,
      selectedValue: filters.category || "ALL",
      options: GRADE_CATEGORY_FILTER_OPTIONS,
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          category:
            val === "ELEMENTARY" || val === "HIGH_SCHOOL"
              ? val
              : undefined,
        }));
      },
    },
    {
      id: "status",
      label: "Status",
      icon: Filter,
      selectedValue:
        filters.isActive === true
          ? "ACTIVE"
          : filters.isActive === false
          ? "INACTIVE"
          : "ALL",
      options: GRADE_STATUS_OPTIONS,
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          isActive: val === "ACTIVE" ? true : val === "INACTIVE" ? false : undefined,
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
        <ErrorAlert message={getErrorMessage(error, "Failed to load grade levels.")} />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search grade levels..."
          filters={filterGroups}
          actionButton={
            isTeacher ? undefined : (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
              >
                <Plus size={14} />
                <span>Grade</span>
              </button>
            )
          }
        />
      </div>

      <GradesTable
        items={grades}
        onViewDetails={handleOpenDetail}
        isReadOnly={isTeacher}
      />

      {!isTeacher && (
        <GradeFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          existingLevels={existingLevels}
        />
      )}

      <GradeDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        grade={selectedGrade}
      />
    </div>
  );
}
