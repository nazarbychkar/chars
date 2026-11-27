import { parseExtraCategoryIds } from "@/lib/parseExtraCategoryIds";
import {
  ensureCategoryDiscountColumn,
  ensureSubcategoryDiscountColumn,
  sql,
} from "@/lib/sql";

export type ProductDiscountFields = {
  discount_percentage?: number | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  extra_category_ids?: unknown;
};

export function normalizeDiscountPercent(
  value: unknown
): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.min(100, Math.max(1, Math.round(n)));
}

export function computeEffectiveDiscount(
  productDiscount: number | null | undefined,
  categoryId: number | null | undefined,
  extraCategoryIds: unknown,
  categoryDiscountById: Map<number, number>,
  subcategoryId?: number | null,
  subcategoryDiscountById?: Map<number, number>
): number | null {
  const candidates = [Number(productDiscount) || 0];
  if (categoryId != null) {
    candidates.push(categoryDiscountById.get(Number(categoryId)) || 0);
  }
  if (subcategoryId != null && subcategoryDiscountById) {
    candidates.push(subcategoryDiscountById.get(Number(subcategoryId)) || 0);
  }
  for (const id of parseExtraCategoryIds(
    extraCategoryIds,
    categoryId != null ? Number(categoryId) : null
  )) {
    candidates.push(categoryDiscountById.get(id) || 0);
  }
  const max = Math.max(...candidates);
  return max > 0 ? max : null;
}

let categoryDiscountMapCache: {
  at: number;
  map: Map<number, number>;
} | null = null;

let subcategoryDiscountMapCache: {
  at: number;
  map: Map<number, number>;
} | null = null;

export async function getCategoryDiscountMap(
  options?: { bypassCache?: boolean }
): Promise<Map<number, number>> {
  const now = Date.now();
  if (
    !options?.bypassCache &&
    categoryDiscountMapCache &&
    now - categoryDiscountMapCache.at < 60_000
  ) {
    return categoryDiscountMapCache.map;
  }

  await ensureCategoryDiscountColumn();
  const rows = await sql`
    SELECT id, discount_percentage
    FROM categories
    WHERE discount_percentage IS NOT NULL
      AND discount_percentage > 0
  `;

  const map = new Map<number, number>();
  for (const row of rows as { id: number; discount_percentage: number }[]) {
    const pct = Number(row.discount_percentage);
    if (pct > 0) map.set(Number(row.id), pct);
  }

  categoryDiscountMapCache = { at: now, map };
  return map;
}

export async function getSubcategoryDiscountMap(
  options?: { bypassCache?: boolean }
): Promise<Map<number, number>> {
  const now = Date.now();
  if (
    !options?.bypassCache &&
    subcategoryDiscountMapCache &&
    now - subcategoryDiscountMapCache.at < 60_000
  ) {
    return subcategoryDiscountMapCache.map;
  }

  await ensureSubcategoryDiscountColumn();
  const rows = await sql`
    SELECT id, discount_percentage
    FROM subcategories
    WHERE discount_percentage IS NOT NULL
      AND discount_percentage > 0
  `;

  const map = new Map<number, number>();
  for (const row of rows as { id: number; discount_percentage: number }[]) {
    const pct = Number(row.discount_percentage);
    if (pct > 0) map.set(Number(row.id), pct);
  }

  subcategoryDiscountMapCache = { at: now, map };
  return map;
}

export async function applyCategoryDiscountToProduct<
  T extends ProductDiscountFields,
>(product: T): Promise<T> {
  const [catMap, subMap] = await Promise.all([
    getCategoryDiscountMap(),
    getSubcategoryDiscountMap(),
  ]);
  const effective = computeEffectiveDiscount(
    product.discount_percentage,
    product.category_id,
    product.extra_category_ids,
    catMap,
    product.subcategory_id,
    subMap
  );
  return { ...product, discount_percentage: effective };
}

export function formatCategoryDiscountBadge(
  discountPercentage: number | null | undefined
): string | null {
  const pct = Number(discountPercentage);
  if (!Number.isFinite(pct) || pct <= 0) return null;
  return `−${Math.round(pct)}%`;
}
