"use client";

import { useState, useMemo } from "react";
import { LoadingSpinner, ErrorAlert, SearchQueryProvider } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  StaffDirectoryFilters,
  StaffDirectoryItem,
} from "../types/staff-qualifications.types";
import { useStaffQualificationsDirectory } from "../hooks/useStaffQualifications";
import { StaffQualificationsFilters } from "./StaffQualificationsFilters";
import { StaffQualificationsTable } from "./StaffQualificationsTable";
import { StaffQualificationsDetailModal } from "./StaffQualificationsDetailModal";

export function StaffQualificationsView() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<StaffDirectoryFilters>({
    page: 1,
    limit: 50,
  });

  const [selectedTeacher, setSelectedTeacher] =
    useState<StaffDirectoryItem | null>(null);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch.trim() || undefined,
    }),
    [filters, debouncedSearch]
  );

  const { data, isLoading, error } =
    useStaffQualificationsDirectory(queryFilters);

  const items = data?.data || [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <StaffQualificationsFilters
        filters={filters}
        onFiltersChange={(newFilters) => setFilters(newFilters)}
        search={search}
        onSearchChange={setSearch}
      />

      {isLoading ? (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-card border border-border">
          <LoadingSpinner size={32} />
        </div>
      ) : error ? (
        <div className="p-6 max-w-7xl mx-auto">
          <ErrorAlert
            message={getErrorMessage(
              error,
              "Failed to load qualified teachers."
            )}
          />
        </div>
      ) : (
        <SearchQueryProvider query={search}>
          <StaffQualificationsTable
            items={items}
            onViewDetails={(teacher) => setSelectedTeacher(teacher)}
          />
        </SearchQueryProvider>
      )}

      <StaffQualificationsDetailModal
        isOpen={Boolean(selectedTeacher)}
        onClose={() => setSelectedTeacher(null)}
        teacher={selectedTeacher}
      />
    </div>
  );
}
