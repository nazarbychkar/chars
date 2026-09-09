import { NextRequest, NextResponse } from "next/server";
import {
  sqlGetProduct,
  sqlGetAllProducts,
  sqlGetProductsByIdsOrdered,
  sql,
} from "@/lib/sql";

type RecommendationRule = {
  type: "category" | "subcategory";
  category_id?: number | null;
  subcategory_id?: number | null;
  priority: number;
};

function parseIds(raw: string | null): number[] {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((v) => Number(v.trim()))
        .filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];
}

async function getCategoryRules(categoryId: number | null): Promise<RecommendationRule[]> {
  if (!categoryId) return [];
  const rows = await sql`
    SELECT recommended_look_config
    FROM categories
    WHERE id = ${categoryId};
  `;
  const row = rows[0] as { recommended_look_config?: string } | undefined;
  if (!row?.recommended_look_config) return [];

  try {
    const parsed = JSON.parse(row.recommended_look_config);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (
          (item.type === "category" || item.type === "subcategory") &&
          typeof item.priority === "number"
        ) {
          return {
            type: item.type as "category" | "subcategory",
            category_id:
              item.type === "category" && typeof item.category_id === "number"
                ? item.category_id
                : null,
            subcategory_id:
              item.type === "subcategory" &&
              typeof item.subcategory_id === "number"
                ? item.subcategory_id
                : null,
            priority: item.priority ?? 0,
          } as RecommendationRule;
        }

        if (typeof item.target_category_id === "number") {
          return {
            type: "category",
            category_id: item.target_category_id,
            subcategory_id: null,
            priority: typeof item.priority === "number" ? item.priority : 0,
          } as RecommendationRule;
        }

        return null;
      })
      .filter(
        (r): r is RecommendationRule =>
          !!r &&
          ((r.type === "category" && r.category_id != null) ||
            (r.type === "subcategory" && r.subcategory_id != null))
      );
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIds = parseIds(
      searchParams.get("product_ids") || searchParams.get("product_id")
    );

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid product_id" },
        { status: 400 }
      );
    }

    const exclude = new Set(productIds);
    const orderedExplicitIds: number[] = [];
    const seenExplicit = new Set<number>();
    let primaryProduct: Awaited<ReturnType<typeof sqlGetProduct>>[0] | null =
      null;

    for (const id of productIds) {
      const products = await sqlGetProduct(id);
      const product = products[0];
      if (!product) continue;
      if (!primaryProduct) primaryProduct = product;

      const explicit = Array.isArray(product.recommended_product_ids)
        ? (product.recommended_product_ids as unknown[])
            .map((v) => Number(v))
            .filter(
              (recId) =>
                Number.isInteger(recId) &&
                recId > 0 &&
                !exclude.has(recId) &&
                !seenExplicit.has(recId)
            )
        : [];

      for (const recId of explicit) {
        seenExplicit.add(recId);
        orderedExplicitIds.push(recId);
      }
    }

    if (orderedExplicitIds.length > 0) {
      const products = await sqlGetProductsByIdsOrdered(orderedExplicitIds);
      return NextResponse.json({ products: products.slice(0, 8) });
    }

    if (!primaryProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const categoryId = primaryProduct.category_id as number | null;
    const recommendations = await getCategoryRules(categoryId);

    type ProductWithCategories = {
      id: number;
      category_id?: number | null;
      subcategory_id?: number | null;
    };

    const allProducts = (await sqlGetAllProducts()) as ProductWithCategories[];
    const otherProducts = allProducts.filter((p) => !exclude.has(p.id));

    let recommended = otherProducts;

    if (recommendations.length > 0) {
      const categoryPriority = new Map<number, number>();
      const subcategoryPriority = new Map<number, number>();

      recommendations
        .sort((a, b) => b.priority - a.priority)
        .forEach((r, index) => {
          if (r.type === "category" && r.category_id != null) {
            categoryPriority.set(r.category_id, index);
          }
          if (r.type === "subcategory" && r.subcategory_id != null) {
            subcategoryPriority.set(r.subcategory_id, index);
          }
        });

      recommended = [...otherProducts].sort((a, b) => {
        const aCatRank =
          a.category_id != null
            ? categoryPriority.get(a.category_id as number) ??
              Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER;
        const bCatRank =
          b.category_id != null
            ? categoryPriority.get(b.category_id as number) ??
              Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER;

        const aSubRank =
          a.subcategory_id != null
            ? subcategoryPriority.get(a.subcategory_id as number) ??
              Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER;
        const bSubRank =
          b.subcategory_id != null
            ? subcategoryPriority.get(b.subcategory_id as number) ??
              Number.MAX_SAFE_INTEGER
            : Number.MAX_SAFE_INTEGER;

        const aRank = Math.min(aCatRank, aSubRank);
        const bRank = Math.min(bCatRank, bSubRank);

        if (aRank !== bRank) return aRank - bRank;
        return 0;
      });
    } else {
      recommended = [...otherProducts].sort(() => 0.5 - Math.random());
    }

    return NextResponse.json({ products: recommended.slice(0, 8) });
  } catch (error) {
    console.error(
      "[GET /api/products/recommendations] Failed to get recommendations:",
      error
    );
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
