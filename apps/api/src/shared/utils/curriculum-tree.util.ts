export function normalizeCurriculumCode(rawCode: string): string {
  return rawCode
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function reorderEntities<T extends { readonly id: string; readonly orderIndex: number }>(
  items: readonly T[],
  orderedIds: readonly string[]
): readonly { readonly id: string; readonly orderIndex: number }[] {
  const itemMap = new Map<string, T>(items.map((item) => [item.id, item]));
  const reordered: { readonly id: string; readonly orderIndex: number }[] = [];

  orderedIds.forEach((id, index) => {
    if (itemMap.has(id)) {
      reordered.push({
        id,
        orderIndex: index + 1,
      });
    }
  });

  return reordered;
}

export function hasDuplicateCodes(codes: readonly string[]): boolean {
  const normalized = codes.map((c) => normalizeCurriculumCode(c));
  return new Set(normalized).size !== normalized.length;
}
