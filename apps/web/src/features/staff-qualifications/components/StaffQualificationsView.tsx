"use client";

import { useState } from "react";
import { LoadingSpinner, ErrorAlert } from "@/shared/components";
import { getErrorMessage } from "@/shared/utils";
import {
  StaffDirectoryFilters,
  StaffDirectoryItem,
} from "../types/staff-qualifications.types";
import { useStaffQualificationsDirectory } from "../hooks/useStaffQualifications";
import { StaffQualificationsFilters } from "./StaffQualificationsFilters";
import { StaffQualificationsTable } from "./StaffQualificationsTable";
import { StaffQualificationsDetailModal } from "./StaffQualificationsDetailModal";

export function StaffQualificationsView() {
  const [filters, setFilters] = useState<StaffDirectoryFilters>({
    page: 1,
    limit: 50,
  });

  const [selectedTeacher, setSelectedTeacher] =
    useState<StaffDirectoryItem | null>(null);

  const { data, isLoading, error } =
    useStaffQualificationsDirectory(filters);

  const items = data?.data || [];

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
            "Failed to load qualified teachers."
          )}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-10">
      <StaffQualificationsFilters
        filters={filters}
        onFiltersChange={(newFilters) => setFilters(newFilters)}
      />

      <StaffQualificationsTable
        items={items}
        onViewDetails={(teacher) => setSelectedTeacher(teacher)}
      />

      <StaffQualificationsDetailModal
        isOpen={Boolean(selectedTeacher)}
        onClose={() => setSelectedTeacher(null)}
        teacher={selectedTeacher}
      />
    </div>
  );
}
