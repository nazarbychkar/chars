/**
 * Color variants share the same first two words of the product name.
 * Example: "Сорочка базова чорна" ↔ "Сорочка базова біла"
 * "Сорочка оверсайз …" is a different line.
 *
 * Optional: identical description (UA) also links variants.
 */
export type ColorVariantGroupMode = "exact" | "first_two_words";

/** Same description in admin = one color line (optional secondary rule). */
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

/** First two words of the name, or null if fewer than 2. */
export function getFirstTwoNameTokens(name: string): string | null {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) return null;
  return words.slice(0, 2).join(" ");
}

export function getColorVariantGroupKey(name: string): {
  mode: ColorVariantGroupMode;
  key: string;
} {
  const words = name.trim().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) {
    return { mode: "exact", key: words.join(" ") };
  }
  return { mode: "first_two_words", key: words.slice(0, 2).join(" ") };
}
