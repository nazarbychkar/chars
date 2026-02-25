import { NextResponse } from "next/server";
import { sqlGetAllCategories, sqlGetAllSubcategories, sql } from "@/lib/sql";

type SimpleProduct = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  name_en?: string | null;
  name_de?: string | null;
  description_en?: string | null;
  description_de?: string | null;
  fabric_composition?: string | null;
  fabric_composition_en?: string | null;
  fabric_composition_de?: string | null;
  lining_description?: string | null;
  lining_description_en?: string | null;
  lining_description_de?: string | null;
};

type SimpleCategory = {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
};

type SimpleSubcategory = {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
};

async function translateWithGoogleFree(
  text: string,
  targetLang: "en" | "de",
  sourceLang: "uk" | "en" | "de" = "uk"
): Promise<string> {
  if (!text || !text.trim()) return "";

  const langMap: Record<string, string> = {
    uk: "uk",
    en: "en",
    de: "de",
  };

  const source = langMap[sourceLang] ?? "uk";
  const target = langMap[targetLang] ?? "en";

  if (source === target) return text;

  try {
    const params = new URLSearchParams({
      client: "gtx",
      sl: source,
      tl: target,
      dt: "t",
      q: text,
    });

    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`
    );
    if (!res.ok) return text;

    const data = await res.json();
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translated = (data[0] as unknown[])
        .map((item) => (Array.isArray(item) ? item[0] : ""))
        .join("");
      return (translated || "").trim();
    }
  } catch (e) {
    console.warn("Backfill translation error (google):", e);
  }

  return text;
}

async function translateWithMyMemory(
  text: string,
  targetLang: "en" | "de",
  sourceLang: "uk" | "en" | "de" = "uk"
): Promise<string> {
  if (!text || !text.trim()) return "";

  const langMap: Record<string, string> = {
    uk: "uk-UA",
    en: "en-US",
    de: "de-DE",
  };

  const source = langMap[sourceLang] ?? "uk-UA";
  const target = langMap[targetLang] ?? "en-US";

  if (source === target) return text;

  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `${source}|${target}`,
    });
    const res = await fetch(
      `https://api.mymemory.translated.net/get?${params.toString()}`
    );
    if (!res.ok) return text;

    const data = await res.json();
    if (data?.responseStatus === 200) {
      const translated = data?.responseData?.translatedText;
      if (
        translated &&
        typeof translated === "string" &&
        translated.toLowerCase() !== text.toLowerCase()
      ) {
        return translated.trim();
      }
    }
  } catch (e) {
    console.warn("Backfill translation error (mymemory):", e);
  }

  return text;
}

async function translateNameOrText(
  text: string
): Promise<{ en: string; de: string }> {
  if (!text || !text.trim()) return { en: "", de: "" };

  const base = text.trim();
  const src = "uk" as const;

  let en = await translateWithGoogleFree(base, "en", src);
  let de = await translateWithGoogleFree(base, "de", src);

  if (!en || en === base) {
    en = await translateWithMyMemory(base, "en", src);
  }
  if (!de || de === base) {
    de = await translateWithMyMemory(base, "de", src);
  }

  return {
    en: en || base,
    de: de || base,
  };
}

export async function POST() {
  try {
    const products = (await sql`
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
      FROM products;
    `) as SimpleProduct[];
    const categories = (await sqlGetAllCategories()) as SimpleCategory[];
    const subcategories =
      (await sqlGetAllSubcategories()) as SimpleSubcategory[];

    const rate = 50; // курс 50 грн за 1 євро

    const productUpdates: {
      id: number;
      price_eur: number;
      name_en: string;
      name_de: string;
    }[] = [];
    const categoryUpdates: { id: number; name_en: string; name_de: string }[] =
      [];
    const subcategoryUpdates: {
      id: number;
      name_en: string;
      name_de: string;
    }[] = [];

    // 1) Продукти: назви, описи, склад тканини, підкладка, ціна в EUR (не перезаписуємо існуючі переклади)
    for (const product of products) {
      const baseName = product.name || "";
      const baseDescription = product.description || "";
      const baseFabric = product.fabric_composition || "";
      const baseLining = product.lining_description || "";

      const existingNameEn = (product.name_en || "").trim();
      const existingNameDe = (product.name_de || "").trim();
      const existingDescEn = (product.description_en || "").trim();
      const existingDescDe = (product.description_de || "").trim();
      const existingFabricEn = (product.fabric_composition_en || "").trim();
      const existingFabricDe = (product.fabric_composition_de || "").trim();
      const existingLiningEn = (product.lining_description_en || "").trim();
      const existingLiningDe = (product.lining_description_de || "").trim();

      let nameTr: { en: string; de: string } | null = null;
      let descTr: { en: string; de: string } | null = null;
      let fabricTr: { en: string; de: string } | null = null;
      let liningTr: { en: string; de: string } | null = null;

      if (baseName.trim() && (!existingNameEn || !existingNameDe)) {
        nameTr = await translateNameOrText(baseName);
      }

      if (
        baseDescription.trim() &&
        (!existingDescEn || !existingDescDe)
      ) {
        descTr = await translateNameOrText(baseDescription);
      }

      if (baseFabric.trim() && (!existingFabricEn || !existingFabricDe)) {
        fabricTr = await translateNameOrText(baseFabric);
      }

      if (baseLining.trim() && (!existingLiningEn || !existingLiningDe)) {
        liningTr = await translateNameOrText(baseLining);
      }

      const finalNameEn =
        existingNameEn || nameTr?.en || (baseName.trim() ? baseName : "");
      const finalNameDe =
        existingNameDe || nameTr?.de || (baseName.trim() ? baseName : "");

      const finalDescEn =
        existingDescEn || descTr?.en || product.description_en || null;
      const finalDescDe =
        existingDescDe || descTr?.de || product.description_de || null;

      const finalFabricEn =
        existingFabricEn ||
        fabricTr?.en ||
        product.fabric_composition_en ||
        null;
      const finalFabricDe =
        existingFabricDe ||
        fabricTr?.de ||
        product.fabric_composition_de ||
        null;

      const finalLiningEn =
        existingLiningEn ||
        liningTr?.en ||
        product.lining_description_en ||
        null;
      const finalLiningDe =
        existingLiningDe ||
        liningTr?.de ||
        product.lining_description_de ||
        null;

      const priceNumber = Number(product.price) || 0;
      const priceEur =
        priceNumber > 0 ? Number((priceNumber / rate).toFixed(2)) : 0;

      await sql`
        UPDATE products
        SET
          name_en = ${finalNameEn},
          name_de = ${finalNameDe},
          description_en = ${finalDescEn},
          description_de = ${finalDescDe},
          fabric_composition_en = ${finalFabricEn},
          fabric_composition_de = ${finalFabricDe},
          lining_description_en = ${finalLiningEn},
          lining_description_de = ${finalLiningDe},
          price_eur = ${priceEur}
        WHERE id = ${product.id};
      `;

      productUpdates.push({
        id: product.id,
        price_eur: priceEur,
        name_en: finalNameEn,
        name_de: finalNameDe,
      });
    }

    // 2) Категорії: автолокалізація назв (лише якщо порожні EN/DE)
    for (const category of categories) {
      const baseName = category.name || "";
      if (!baseName.trim()) continue;

      const hasEn = !!category.name_en && category.name_en.trim().length > 0;
      const hasDe = !!category.name_de && category.name_de.trim().length > 0;
      if (hasEn && hasDe) continue;

      const tr = await translateNameOrText(baseName);

      const nameEn = hasEn ? category.name_en!.trim() : tr.en;
      const nameDe = hasDe ? category.name_de!.trim() : tr.de;

      await sql`
        UPDATE categories
        SET
          name_en = ${nameEn},
          name_de = ${nameDe}
        WHERE id = ${category.id};
      `;

      categoryUpdates.push({
        id: category.id,
        name_en: nameEn,
        name_de: nameDe,
      });
    }

    // 3) Підкатегорії: автолокалізація назв (лише якщо порожні EN/DE)
    for (const sub of subcategories) {
      const baseName = sub.name || "";
      if (!baseName.trim()) continue;

      const hasEn = !!sub.name_en && sub.name_en.trim().length > 0;
      const hasDe = !!sub.name_de && sub.name_de.trim().length > 0;
      if (hasEn && hasDe) continue;

      const tr = await translateNameOrText(baseName);

      const nameEn = hasEn ? sub.name_en!.trim() : tr.en;
      const nameDe = hasDe ? sub.name_de!.trim() : tr.de;

      await sql`
        UPDATE subcategories
        SET
          name_en = ${nameEn},
          name_de = ${nameDe}
        WHERE id = ${sub.id};
      `;

      subcategoryUpdates.push({
        id: sub.id,
        name_en: nameEn,
        name_de: nameDe,
      });
    }

    return NextResponse.json({
      success: true,
      products: {
        count: productUpdates.length,
        updated: productUpdates,
      },
      categories: {
        count: categoryUpdates.length,
        updated: categoryUpdates,
      },
      subcategories: {
        count: subcategoryUpdates.length,
        updated: subcategoryUpdates,
      },
    });
  } catch (error) {
    console.error("[POST /api/products/backfill-localization] error:", error);
    return NextResponse.json(
      { success: false, error: "Backfill failed", details: String(error) },
      { status: 500 }
    );
  }
}

