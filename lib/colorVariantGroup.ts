/**
 * Groups product color variants by naming pattern:
 * - 2 words: "ДЖЕМПЕР ПІСОЧНИЙ" → same line as "ДЖЕМПЕР ЧОРНИЙ" (first word)
 * - 3+ words: last word is color → "ШОВКОВА СОРОЧКА БІЛА" shares base with "... ЧОРНА"
 */
export type ColorVariantGroupMode = "exact" | "first_word" | "drop_last";

/** Same description in admin = one color line (пальто, сукні тощо). */
export function normalizeDescriptionForVariantGroup(
  description?: string | null
): string | null {
  if (!description) return null;
  const normalized = description.trim().replace(/\s+/g, " ");
  if (normalized.length < 12) return null;
  return normalized;
}

export type RelatedColorRow = {
  id: number;
  name: string;
  first_color: { label: string; hex?: string | null } | null;
};

export function mergeRelatedColorRows(
  ...lists: RelatedColorRow[][]
): RelatedColorRow[] {
  const byId = new Map<number, RelatedColorRow>();
  for (const list of lists) {
    for (const row of list) {
      if (!byId.has(row.id)) {
        byId.set(row.id, row);
      }
    }
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

export function getFirstNameToken(name: string): string | null {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
  return words.length >= 2 ? words[0] : null;
}

export function getColorVariantGroupKey(name: string): {
  mode: ColorVariantGroupMode;
  key: string;
} {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length <= 1) {
    return { mode: "exact", key: words.join(" ") };
  }
  if (words.length === 2) {
    return { mode: "first_word", key: words[0] };
  }
  return { mode: "drop_last", key: words.slice(0, -1).join(" ") };
}
