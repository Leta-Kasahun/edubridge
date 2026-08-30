const MONTH_NAMES: readonly string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonthYear(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "";
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return "";
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${month} ${year}`;
}

export function formatExperienceDateRange(
  startDateInput: string | Date,
  endDateInput?: string | Date | null
): string {
  const startStr = formatMonthYear(startDateInput);
  if (!endDateInput) {
    return `${startStr} — Present`;
  }
  const endStr = formatMonthYear(endDateInput);
  return `${startStr} — ${endStr}`;
}

export function calculateDurationMonths(
  startDateInput: string | Date,
  endDateInput?: string | Date | null
): number {
  const start =
    typeof startDateInput === "string"
      ? new Date(startDateInput)
      : startDateInput;
  const end = endDateInput
    ? typeof endDateInput === "string"
      ? new Date(endDateInput)
      : endDateInput
    : new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end.getTime() < start.getTime()) return 0;

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const totalMonths = yearsDiff * 12 + monthsDiff;

  return Math.max(totalMonths, 0);
}

export function formatDurationHuman(months: number): string {
  if (months <= 0) return "Less than 1 mo";
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} ${years === 1 ? "yr" : "yrs"} ${remainingMonths} ${
      remainingMonths === 1 ? "mo" : "mos"
    }`;
  }
  if (years > 0) {
    return `${years} ${years === 1 ? "yr" : "yrs"}`;
  }
  return `${remainingMonths} ${remainingMonths === 1 ? "mo" : "mos"}`;
}

export function calculateExperienceDuration(
  startDateInput: string | Date,
  endDateInput?: string | Date | null
): string {
  const months = calculateDurationMonths(startDateInput, endDateInput);
  return formatDurationHuman(months);
}

export function calculateTotalExperience(
  experiences: readonly { readonly startDate: string | Date; readonly endDate?: string | Date | null }[]
): string {
  if (!experiences || experiences.length === 0) {
    return "0 yrs";
  }

  const totalMonths = experiences.reduce((acc, exp) => {
    return acc + calculateDurationMonths(exp.startDate, exp.endDate);
  }, 0);

  return formatDurationHuman(totalMonths);
}
