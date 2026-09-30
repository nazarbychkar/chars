export type CategoryPrioritiesMap = Record<string, number>;

export function parseCategoryPrioritiesFromDb(raw: unknown): CategoryPrioritiesMap {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: CategoryPrioritiesMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const categoryId = Number(key);
    const priority = Number(value);
    if (!Number.isInteger(categoryId) || categoryId <= 0) continue;
    if (!Number.isFinite(priority)) continue;
    out[String(categoryId)] = Math.max(0, Math.floor(priority));
  }
  return out;
}

export function buildCategoryPrioritiesForSave(
  input: CategoryPrioritiesMap,
  primaryCategoryId: number | null,
  extraCategoryIds: number[],
  legacyPriority = 0
): { category_priorities: CategoryPrioritiesMap; priority: number } {
  const category_priorities: CategoryPrioritiesMap = {};

  if (primaryCategoryId) {
    const key = String(primaryCategoryId);
    category_priorities[key] = Math.max(
      0,
      Math.floor(input[key] ?? legacyPriority ?? 0)
    );
  }

  for (const id of extraCategoryIds) {
    if (primaryCategoryId && id === primaryCategoryId) continue;
    const key = String(id);
    category_priorities[key] = Math.max(0, Math.floor(input[key] ?? 0));
  }

  const priority =
    primaryCategoryId != null
      ? category_priorities[String(primaryCategoryId)] ?? 0
      : Math.max(0, Math.floor(legacyPriority));

  return { category_priorities, priority };
}

export function categoryPrioritiesToFormState(
  map: CategoryPrioritiesMap,
  primaryCategoryId: number | null,
  extraCategoryIds: string[],
  legacyPriority: number
): Record<string, string> {
  const state: Record<string, string> = {};
  if (primaryCategoryId) {
    const key = String(primaryCategoryId);
    state[key] = String(map[key] ?? legacyPriority ?? 0);
  }
  for (const id of extraCategoryIds) {
    state[id] = String(map[id] ?? 0);
  }
  return state;
}
