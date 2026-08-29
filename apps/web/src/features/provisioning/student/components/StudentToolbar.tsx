"use client";

import { useMemo } from "react";
import { Upload, UserPlus, Calendar, ShieldCheck, Users } from "lucide-react";
import { TableToolbar, FilterGroup } from "@/shared/components/TableToolbar";
import { ACCOUNT_STATUS_FILTER_OPTIONS } from "@/shared/utils";
import { AcademicStructureAcademicYear } from "../types/student-provisioning.types";

export interface StudentToolbarProps {
  readonly search: string;
  readonly onSearchChange: (value: string) => void;
  readonly accountStatus: string;
  readonly onAccountStatusChange: (status: string) => void;
  readonly gender: string;
  readonly onGenderChange: (gender: string) => void;
  readonly academicYears: readonly AcademicStructureAcademicYear[];
  readonly selectedAcademicYearId?: string;
  readonly onSelectAcademicYear: (id: string) => void;
  readonly onOpenAddStudent: () => void;
  readonly onOpenImportCsv: () => void;
}

const GENDER_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Female", value: "FEMALE" },
  { label: "Male", value: "MALE" },
] as const;

export function StudentToolbar({
  search,
  onSearchChange,
  accountStatus,
  onAccountStatusChange,
  gender,
  onGenderChange,
  academicYears,
  selectedAcademicYearId,
  onSelectAcademicYear,
  onOpenAddStudent,
  onOpenImportCsv,
}: StudentToolbarProps) {
  const currentYear =
    academicYears.find((y) => y.id === selectedAcademicYearId) ||
    academicYears.find((y) => y.isCurrent) ||
    academicYears[0];

  const filters: readonly FilterGroup[] = useMemo(() => {
    const list: FilterGroup[] = [];

    if (academicYears.length > 0) {
      list.push({
        id: "academicYear",
        label: "Academic year",
        options: academicYears.map((y) => ({
          label: y.name.replace(/Academic Year/i, "").trim() || y.name,
          value: y.id,
        })),
        selectedValue: selectedAcademicYearId || currentYear?.id || "",
        onSelect: onSelectAcademicYear,
        icon: Calendar,
      });
    }

    list.push({
      id: "accountStatus",
      label: "Account status",
      options: ACCOUNT_STATUS_FILTER_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      selectedValue: accountStatus,
      onSelect: onAccountStatusChange,
      icon: ShieldCheck,
    });

    list.push({
      id: "gender",
      label: "Gender",
      options: GENDER_OPTIONS.map((opt) => ({
        label: opt.label,
        value: opt.value,
      })),
      selectedValue: gender,
      onSelect: onGenderChange,
      icon: Users,
    });

    return list;
  }, [
    academicYears,
    selectedAcademicYearId,
    currentYear?.id,
    onSelectAcademicYear,
    accountStatus,
    onAccountStatusChange,
    gender,
    onGenderChange,
  ]);

  return (
    <TableToolbar
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by code or name..."
      filters={filters}
      actionButton={
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onOpenImportCsv}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs flex-1 sm:flex-initial"
          >
            <Upload size={14} className="text-foreground" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddStudent}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs flex-1 sm:flex-initial"
          >
            <UserPlus size={14} />
            <span>Add student</span>
          </button>
        </div>
      }
    />
  );
}
