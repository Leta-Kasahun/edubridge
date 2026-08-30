"use client";

import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { getErrorMessage } from "@/shared/utils";
import {
  ACADEMIC_YEAR_STATUS_OPTIONS,
  DEFAULT_ACADEMIC_YEARS_PAGE_LIMIT,
} from "@/shared/constants";
import {
  AcademicYearFilters,
  AcademicYearItem,
  AcademicYearStatus,
} from "../types/academic-year.types";
import { useAcademicYears } from "../hooks/useAcademicYears";
import { AcademicYearsTable } from "./AcademicYearsTable";
import { AcademicYearFormModal } from "./AcademicYearFormModal";
import { AcademicYearDetailModal } from "./AcademicYearDetailModal";

export function AcademicYearsView() {
  const [filters, setFilters] = useState<AcademicYearFilters>({
    page: 1,
    limit: DEFAULT_ACADEMIC_YEARS_PAGE_LIMIT,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYearItem | null>(null);

  const { data, isLoading, error } = useAcademicYears(filters);

  const items = data?.data || [];

  const handleOpenAdd = () => {
    setSelectedYear(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (year: AcademicYearItem) => {
    setSelectedYear(year);
    setIsFormModalOpen(true);
  };

  const handleOpenDetail = (year: AcademicYearItem) => {
    setSelectedYear(year);
    setIsDetailModalOpen(true);
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
      id: "status",
      label: "Status",
      icon: Filter,
      selectedValue: filters.status || "ALL",
      options: ACADEMIC_YEAR_STATUS_OPTIONS,
      onSelect: (val) => {
        setFilters((prev) => ({
          ...prev,
          status: val === "ALL" ? undefined : (val as AcademicYearStatus),
          page: 1,
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
        <ErrorAlert
          message={getErrorMessage(
            error,
            "Failed to load academic years."
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
        <TableToolbar
          searchValue={filters.search || ""}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search academic years by name or code..."
          filters={filterGroups}
          actionButton={
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Plus size={14} />
              <span>Add Academic Year</span>
            </button>
          }
        />
      </div>

      <AcademicYearsTable
        items={items}
        onEdit={handleOpenEdit}
        onViewDetails={handleOpenDetail}
      />

      <AcademicYearFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        yearToEdit={selectedYear}
      />

      <AcademicYearDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        year={selectedYear}
        onEdit={handleOpenEdit}
      />
    </div>
  );
}
