export function parseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function formatIsoDate(value: string | Date | null | undefined): string {
  const date = parseDate(value);
  if (!date) return "";
  return date.toISOString().split("T")[0] ?? "";
}

export function calculateAge(dob: string | Date | null | undefined): number | null {
  const date = parseDate(dob);
  if (!date) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age >= 0 ? age : null;
}

export function isValidDob(
  dob: string | Date | null | undefined,
  minAge = 18,
  maxAge = 100
): boolean {
  const age = calculateAge(dob);
  if (age === null) return false;
  return age >= minAge && age <= maxAge;
}

export function formatDisplayDate(
  value: string | Date | null | undefined,
  locale = "en-US"
): string {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getMinMaxDobStrings(
  minAge = 18,
  maxAge = 100
): { minDate: string; maxDate: string } {
  const today = new Date();

  const maxYear = today.getFullYear() - minAge;
  const maxDateObj = new Date(maxYear, today.getMonth(), today.getDate());
  const maxDate = formatIsoDate(maxDateObj);

  const minYear = today.getFullYear() - maxAge;
  const minDateObj = new Date(minYear, today.getMonth(), today.getDate());
  const minDate = formatIsoDate(minDateObj);

  return { minDate, maxDate };
}
