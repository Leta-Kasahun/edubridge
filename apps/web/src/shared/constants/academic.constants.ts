import { FilterOption } from "@/shared/components/TableToolbar";

export const ACADEMIC_YEAR_STATUS_OPTIONS: readonly FilterOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Upcoming", value: "UPCOMING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Archived", value: "ARCHIVED" },
] as const;

export const DEFAULT_ACADEMIC_YEARS_PAGE_LIMIT = 50;
