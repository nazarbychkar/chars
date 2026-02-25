function normalizeAndTransliterate(name: string): string {
  const raw = String(name || "")
    .trim()
    .toLowerCase()
    // replace spaces and underscores with dashes
    .replace(/[\s_]+/g, "-")
    // remove leading/trailing dashes
    .replace(/^-+|-+$/g, "");

  // Simple transliteration for Ukrainian/Cyrillic -> Latin
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ie",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ю: "iu",
    я: "ia",
    "’": "",
    "'": "",
  };

  const transliterated = raw
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");

  // Keep only latin letters, numbers and dashes
  const base = transliterated.replace(/[^a-z0-9-]+/g, "");
  return base;
}

export function buildProductSlug(name: string, id: number | string): string {
  const base = normalizeAndTransliterate(name);
  const safeBase = base || "product";
  return `${safeBase}-${id}`;
}

export function buildCategorySlug(name: string): string {
  const base = normalizeAndTransliterate(name);
  return base || "category";
}

export function buildSubcategorySlug(name: string): string {
  const base = normalizeAndTransliterate(name);
  return base || "subcategory";
}

export function extractProductIdFromParam(
  param: string | string[] | undefined
): number | null {
  if (!param) return null;
  const value = Array.isArray(param) ? param[0] : param;
  const parts = value.split("-");
  const idPart = parts[parts.length - 1];
  const id = Number(idPart);
  return Number.isFinite(id) ? id : null;
}

