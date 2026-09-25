import { sql, sqlGetAllCategories, sqlGetAllSubcategories } from "./sql";
import { translateTextAllLangs } from "./adminProductTranslate";

const CYRILLIC = /[\u0400-\u04FF]/;

export type BackfillOptions = {
  /** Re-translate even when EN/DE already exist */
  force?: boolean;
  /** Log only, no DB writes */
  dryRun?: boolean;
  /** Pause between products (ms) to ease rate limits */
  delayMs?: number;
};

export type BackfillResult = {
  products: { updated: number; skipped: number };
  categories: { updated: number; skipped: number };
  subcategories: { updated: number; skipped: number };
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function fieldNeedsTranslation(
  sourceUk: string,
  stored: string | null | undefined,
  force: boolean
): boolean {
  const uk = sourceUk.trim();
  if (!uk) return false;
  if (force) return true;
  const s = (stored || "").trim();
  if (!s) return true;
  if (s === uk) return true;
  if (CYRILLIC.test(s)) return true;
  return false;
}

async function resolveEnDe(
  sourceUk: string,
  storedEn: string | null | undefined,
  storedDe: string | null | undefined,
  force: boolean
): Promise<{ en: string | null; de: string | null }> {
  const uk = sourceUk.trim();
  if (!uk) return { en: null, de: null };

  const needsEn = fieldNeedsTranslation(uk, storedEn, force);
  const needsDe = fieldNeedsTranslation(uk, storedDe, force);

  if (!needsEn && !needsDe) {
    return {
      en: storedEn?.trim() || null,
      de: storedDe?.trim() || null,
    };
  }

  const t = await translateTextAllLangs(uk, "uk");
  return {
    en: needsEn ? t.en : storedEn?.trim() || t.en,
    de: needsDe ? t.de : storedDe?.trim() || t.de,
  };
}

export async function runBackfillLocalization(
  options: BackfillOptions = {}
): Promise<BackfillResult> {
  const force = options.force ?? false;
  const dryRun = options.dryRun ?? false;
  const delayMs = options.delayMs ?? 250;
  const rate = 50;

  const result: BackfillResult = {
    products: { updated: 0, skipped: 0 },
    categories: { updated: 0, skipped: 0 },
    subcategories: { updated: 0, skipped: 0 },
  };

  const products = await sql`
    SELECT
      id,
      name,
      name_en,
      name_de,
      description,
      description_en,
      description_de,
      price,
      fabric_composition,
      fabric_composition_en,
      fabric_composition_de,
      lining_description,
      lining_description_en,
      lining_description_de
    FROM products
    ORDER BY id;
  `;

  for (const product of products) {
    const baseName = String(product.name || "");
    const baseDescription = String(product.description || "");
    const baseFabric = String(product.fabric_composition || "");
    const baseLining = String(product.lining_description || "");

    const nameNeeds =
      fieldNeedsTranslation(baseName, product.name_en, force) ||
      fieldNeedsTranslation(baseName, product.name_de, force);
    const descNeeds =
      fieldNeedsTranslation(baseDescription, product.description_en, force) ||
      fieldNeedsTranslation(baseDescription, product.description_de, force);
    const fabricNeeds =
      fieldNeedsTranslation(baseFabric, product.fabric_composition_en, force) ||
      fieldNeedsTranslation(baseFabric, product.fabric_composition_de, force);
    const liningNeeds =
      fieldNeedsTranslation(baseLining, product.lining_description_en, force) ||
      fieldNeedsTranslation(baseLining, product.lining_description_de, force);

    if (!nameNeeds && !descNeeds && !fabricNeeds && !liningNeeds) {
      result.products.skipped += 1;
      continue;
    }

    const [nameTr, descTr, fabricTr, liningTr] = await Promise.all([
      nameNeeds
        ? resolveEnDe(baseName, product.name_en, product.name_de, force)
        : Promise.resolve({
            en: product.name_en,
            de: product.name_de,
          }),
      descNeeds
        ? resolveEnDe(
            baseDescription,
            product.description_en,
            product.description_de,
            force
          )
        : Promise.resolve({
            en: product.description_en,
            de: product.description_de,
          }),
      fabricNeeds
        ? resolveEnDe(
            baseFabric,
            product.fabric_composition_en,
            product.fabric_composition_de,
            force
          )
        : Promise.resolve({
            en: product.fabric_composition_en,
            de: product.fabric_composition_de,
          }),
      liningNeeds
        ? resolveEnDe(
            baseLining,
            product.lining_description_en,
            product.lining_description_de,
            force
          )
        : Promise.resolve({
            en: product.lining_description_en,
            de: product.lining_description_de,
          }),
    ]);

    const priceNumber = Number(product.price) || 0;
    const priceEur =
      priceNumber > 0 ? Number((priceNumber / rate).toFixed(2)) : 0;

    if (!dryRun) {
      await sql`
        UPDATE products
        SET
          name_en = ${nameTr.en},
          name_de = ${nameTr.de},
          description_en = ${descTr.en},
          description_de = ${descTr.de},
          fabric_composition_en = ${fabricTr.en},
          fabric_composition_de = ${fabricTr.de},
          lining_description_en = ${liningTr.en},
          lining_description_de = ${liningTr.de},
          price_eur = ${priceEur}
        WHERE id = ${product.id};
      `;
    }

    result.products.updated += 1;
    if (delayMs > 0) await sleep(delayMs);
  }

  const categories = await sqlGetAllCategories();
  for (const category of categories) {
    const baseName = String(category.name || "");
    if (!baseName.trim()) {
      result.categories.skipped += 1;
      continue;
    }

    const needs =
      fieldNeedsTranslation(baseName, category.name_en, force) ||
      fieldNeedsTranslation(baseName, category.name_de, force);

    if (!needs) {
      result.categories.skipped += 1;
      continue;
    }

    const tr = await resolveEnDe(
      baseName,
      category.name_en,
      category.name_de,
      force
    );

    if (!dryRun) {
      await sql`
        UPDATE categories
        SET name_en = ${tr.en}, name_de = ${tr.de}
        WHERE id = ${category.id};
      `;
    }

    result.categories.updated += 1;
    if (delayMs > 0) await sleep(delayMs);
  }

  const subcategories = await sqlGetAllSubcategories();
  for (const sub of subcategories) {
    const baseName = String(sub.name || "");
    if (!baseName.trim()) {
      result.subcategories.skipped += 1;
      continue;
    }

    const needs =
      fieldNeedsTranslation(baseName, sub.name_en, force) ||
      fieldNeedsTranslation(baseName, sub.name_de, force);

    if (!needs) {
      result.subcategories.skipped += 1;
      continue;
    }

    const tr = await resolveEnDe(baseName, sub.name_en, sub.name_de, force);

    if (!dryRun) {
      await sql`
        UPDATE subcategories
        SET name_en = ${tr.en}, name_de = ${tr.de}
        WHERE id = ${sub.id};
      `;
    }

    result.subcategories.updated += 1;
    if (delayMs > 0) await sleep(delayMs);
  }

  return result;
}
