export function getCurrentEthiopianYear(date: Date = new Date()): number {
  const gYear = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  if (month > 8 || (month === 8 && day >= 11)) {
    return gYear - 7;
  }
  return gYear - 8;
}

export interface GeneratedEthiopianAcademicYear {
  readonly year: number;
  readonly name: string;
  readonly code: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly isCurrent: boolean;
  readonly status: "ACTIVE" | "COMPLETED";
}

export function generateEthiopianAcademicYears(
  startYear = 2005,
  tenantCode = "demo"
): readonly GeneratedEthiopianAcademicYear[] {
  const currentYear = getCurrentEthiopianYear();
  const years: GeneratedEthiopianAcademicYear[] = [];

  for (let y = currentYear; y >= startYear; y--) {
    const isCurrent = y === currentYear;
    const gregorianStartYear = y + 7;
    const gregorianEndYear = y + 8;

    years.push({
      year: y,
      name: `${y} E.C`,
      code: `AY-${y}-${tenantCode.toUpperCase()}`,
      startDate: new Date(`${gregorianStartYear}-09-11`),
      endDate: new Date(`${gregorianEndYear}-06-30`),
      isCurrent,
      status: isCurrent ? "ACTIVE" : "COMPLETED",
    });
  }

  return years;
}
