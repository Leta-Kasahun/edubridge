export function getCurrentEthiopianYear(date: Date = new Date()): number {
  const gYear = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (month > 8 || (month === 8 && day >= 11)) {
    return gYear - 7;
  }
  return gYear - 8;
}

export function gregorianToEthiopianYear(dateInput: Date | string | null | undefined): number | null {
  if (!dateInput) return null;
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return null;
  return getCurrentEthiopianYear(date);
}

export function formatEthiopianAcademicYearName(ethiopianYear: number): string {
  return `${ethiopianYear} E.C.`;
}
