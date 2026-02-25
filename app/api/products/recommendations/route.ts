import { NextRequest, NextResponse } from "next/server";
import { sqlGetProduct, sqlGetAllProducts, sql } from "@/lib/sql";

type RecommendationRule = {
  type: "category" | "subcategory";
  category_id?: number | null;
  subcategory_id?: number | null;
  priority: number;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productIdParam = searchParams.get("product_id");
    const productId = Number(productIdParam);

    if (!productIdParam || isNaN(productId)) {
      return NextResponse.json(
        { error: "Missing or invalid product_id" },
        { status: 400 }
      );
    }

    const products = await sqlGetProduct(productId);
    const product = products[0];

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const categoryId = product.category_id as number | null;

    let recommendations: RecommendationRule[] = [];

    if (categoryId) {
      const rows = await sql`
        SELECT recommended_look_config
        FROM categories
        WHERE id = ${categoryId};
      `;
      const row = rows[0] as { recommended_look_config?: string } | undefined;
      if (row?.recommended_look_config) {
        try {
          const parsed = JSON.parse(row.recommended_look_config);
          if (Array.isArray(parsed)) {
            recommendations = parsed
              .map((item) => {
                // New format with type
                if (
                  (item.type === "category" || item.type === "subcategory") &&
                  typeof item.priority === "number"
                ) {
                  return {
                    type: item.type as "category" | "subcategory",
                    category_id:
                      item.type === "category" &&
                      typeof item.category_id === "number"
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

                // Backwards compatibility: { target_category_id, priority }
                if (typeof item.target_category_id === "number") {
                  return {
                    type: "category",
                    category_id: item.target_category_id,
                    subcategory_id: null,
                    priority:
                      typeof item.priority === "number" ? item.priority : 0,
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
          }
        } catch {
          // Ignore JSON parse errors, fallback below
        }
    }
    }

    type ProductWithCategories = {
      id: number;
      category_id?: number | null;
      subcategory_id?: number | null;
    };

    const allProducts = (await sqlGetAllProducts()) as ProductWithCategories[];
    const otherProducts = allProducts.filter((p) => p.id !== productId);

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

        // If same priority bucket, keep original order (created_at DESC in sqlGetAllProducts)
        return 0;
      });
    } else {
      // No config: just randomize
      recommended = [...otherProducts].sort(() => 0.5 - Math.random());
    }

    // Limit to 8 items for safety; client can further slice
    const limited = recommended.slice(0, 8);

    return NextResponse.json({ products: limited });
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

