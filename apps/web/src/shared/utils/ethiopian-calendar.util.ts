export const ETHIOPIAN_MONTH_NAMES = [
  "Meskerem",
  "Tikimt",
  "Hidar",
  "Tahsas",
  "Tir",
  "Yakatit",
  "Megabit",
  "Miazia",
  "Ginbot",
  "Sene",
  "Hamle",
  "Nehase",
  "Pagume",
] as const;

export type EthiopianMonthName = (typeof ETHIOPIAN_MONTH_NAMES)[number];

export interface EthiopianDateInfo {
  readonly year: number;
  readonly month: number;
  readonly monthName: EthiopianMonthName;
  readonly formatted: string;
}

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

/**
 * Returns Ethiopian month and year info for a given Gregorian date
 */
export function getEthiopianDateInfo(dateInput: Date | string | null | undefined): EthiopianDateInfo | null {
  if (!dateInput) return null;
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return null;

  const year = getCurrentEthiopianYear(date);
  const m = date.getMonth();
  const d = date.getDate();

  let month = 1;
  if (m === 8 && d >= 11) month = 1;
  else if (m === 9 && d <= 10) month = 1;
  else if (m === 9 && d >= 11) month = 2;
  else if (m === 10 && d <= 9) month = 2;
  else if (m === 10 && d >= 10) month = 3;
  else if (m === 11 && d <= 9) month = 3;
  else if (m === 11 && d >= 10) month = 4;
  else if (m === 0 && d <= 8) month = 4;
  else if (m === 0 && d >= 9) month = 5;
  else if (m === 1 && d <= 7) month = 5;
  else if (m === 1 && d >= 8) month = 6;
  else if (m === 2 && d <= 9) month = 6;
  else if (m === 2 && d >= 10) month = 7;
  else if (m === 3 && d <= 8) month = 7;
  else if (m === 3 && d >= 9) month = 8;
  else if (m === 4 && d <= 8) month = 8;
  else if (m === 4 && d >= 9) month = 9;
  else if (m === 5 && d <= 7) month = 9;
  else if (m === 5 && d >= 8) month = 10;
  else if (m === 6 && d <= 7) month = 10;
  else if (m === 6 && d >= 8) month = 11;
  else if (m === 7 && d <= 6) month = 11;
  else if (m === 7 && d >= 7) month = 12;
  else if (m === 8 && d <= 5) month = 12;
  else month = 13;

  const monthName = ETHIOPIAN_MONTH_NAMES[month - 1];

  return {
    year,
    month,
    monthName,
    formatted: `${monthName} ${year} E.C.`,
  };
}
