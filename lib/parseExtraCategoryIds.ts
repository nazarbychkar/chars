export function parseExtraCategoryIds(
  raw: unknown,
  primaryCategoryId: number | null
): number[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<number>();
  const result: number[] = [];
  for (const item of raw) {
    const id = Number(item);
    if (!Number.isInteger(id) || id <= 0) continue;
    if (primaryCategoryId !== null && id === primaryCategoryId) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}
