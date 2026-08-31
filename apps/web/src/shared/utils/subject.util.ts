export function formatGradeLevelsSummary(gradeLevels: readonly number[]): string {
  if (!gradeLevels || gradeLevels.length === 0) {
    return "Not assigned";
  }

  const sorted = [...gradeLevels].sort((a, b) => a - b);
  if (sorted.length === 6 && sorted[0] === 7 && sorted[5] === 12) {
    return "Grades 7–12 (All)";
  }

  if (sorted.length === 2 && sorted[0] === 7 && sorted[1] === 8) {
    return "Grades 7–8 (Middle)";
  }

  if (sorted.length === 4 && sorted[0] === 9 && sorted[3] === 12) {
    return "Grades 9–12 (High School)";
  }

  return sorted.map((g) => `Grade ${g}`).join(", ");
}
