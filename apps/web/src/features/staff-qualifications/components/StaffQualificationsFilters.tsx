"use client";

import { Award, FileText } from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import {
  QualificationLevel,
  QUALIFICATION_LEVEL_LABELS,
  StaffDirectoryFilters,
} from "../types/staff-qualifications.types";

interface StaffQualificationsFiltersProps {
  readonly filters: StaffDirectoryFilters;
  readonly onFiltersChange: (newFilters: StaffDirectoryFilters) => void;
}

export function StaffQualificationsFilters({
  filters,
  onFiltersChange,
}: StaffQualificationsFiltersProps) {
  const handleSearchChange = (val: string) => {
    onFiltersChange({
      ...filters,
      search: val || undefined,
      page: 1,
    });
  };

  const filterGroups: FilterGroup[] = [
    {
      id: "level",
      label: "Degree",
      icon: Award,
      selectedValue: filters.level || "ALL",
      options: [
        { label: "All Levels", value: "ALL" },
        ...(
          Object.keys(
            QUALIFICATION_LEVEL_LABELS
          ) as QualificationLevel[]
        ).map((lvl) => ({
          label: QUALIFICATION_LEVEL_LABELS[lvl],
          value: lvl,
        })),
      ],
      onSelect: (val) => {
        onFiltersChange({
          ...filters,
          level: val === "ALL" ? undefined : (val as QualificationLevel),
          page: 1,
        });
      },
    },
    {
      id: "docs",
      label: "Certificates",
      icon: FileText,
      selectedValue:
        filters.hasCertificate === true
          ? "HAS_DOC"
          : filters.hasCertificate === false
          ? "NO_DOC"
          : "ALL",
      options: [
        { label: "All Records", value: "ALL" },
        { label: "With Certificate", value: "HAS_DOC" },
        { label: "No Certificate", value: "NO_DOC" },
      ],
      onSelect: (val) => {
        onFiltersChange({
          ...filters,
          hasCertificate:
            val === "HAS_DOC" ? true : val === "NO_DOC" ? false : undefined,
          page: 1,
        });
      },
    },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-3.5 sm:p-4 shadow-xs">
      <TableToolbar
        searchValue={filters.search || ""}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search teacher by name, code, field of study, school..."
        filters={filterGroups}
      />
    </div>
  );
}
