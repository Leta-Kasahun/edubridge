import { gregorianToEthiopianYear } from "./ethiopian-calendar.util";

export function formatAcademicDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatAcademicDateRange(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string {
  if (!startDate && !endDate) return "—";
  const start = formatAcademicDate(startDate);
  const end = formatAcademicDate(endDate);
  const startEthYear = gregorianToEthiopianYear(startDate);
  const endEthYear = gregorianToEthiopianYear(endDate);

  if (startEthYear && endEthYear) {
    const ethSpan = startEthYear === endEthYear ? `${startEthYear} E.C.` : `${startEthYear}–${endEthYear} E.C.`;
    return `${ethSpan} (${start} – ${end})`;
  }

  return `${start} – ${end}`;
}

export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

export function formatAcademicYearStatus(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "UPCOMING":
      return "Upcoming";
    case "COMPLETED":
      return "Completed";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}
