import { sqlGetAllProducts, sqlGetAllCategories, sqlGetProductsByCategory } from "@/lib/sql";
import { NextResponse } from "next/server";
import { buildCategorySlug } from "@/lib/slug";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryParam = url.searchParams.get("category");

  try {
    let products;
    if (categoryParam) {
      // 1) Try direct match by canonical name
      products = await sqlGetProductsByCategory(categoryParam);

      // 2) If nothing found, try interpret param as slug (latin)
      if (!products || products.length === 0) {
        const categories = await sqlGetAllCategories();
        const matched = categories.find(
          (c: { name: string }) => buildCategorySlug(c.name) === categoryParam
        );

        if (matched) {
          products = await sqlGetProductsByCategory(matched.name);
        }
      }
    } else {
      products = await sqlGetAllProducts();
    }

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 5 minutes
export const revalidate = 300;
