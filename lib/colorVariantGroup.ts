/**
 * Groups product color variants by naming pattern:
 * - 2 words: "ДЖЕМПЕР ПІСОЧНИЙ" → same line as "ДЖЕМПЕР ЧОРНИЙ" (first word)
 * - 3+ words: last word is color → "ШОВКОВА СОРОЧКА БІЛА" shares base with "... ЧОРНА"
 */
export type ColorVariantGroupMode = "exact" | "first_word" | "drop_last";

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
