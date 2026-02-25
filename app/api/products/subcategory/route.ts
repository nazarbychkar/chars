import { sqlGetAllSubcategories, sqlGetProductsBySubcategoryName } from "@/lib/sql";
import { NextResponse } from "next/server";
import { buildSubcategorySlug } from "@/lib/slug";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subcategory = url.searchParams.get("subcategory");

  try {
    if (!subcategory) {
      return NextResponse.json(
        { error: "Missing subcategory parameter" },
        { status: 400 }
      );
    }

    // Find matching subcategory either by exact name or by slug
    const allSubs = await sqlGetAllSubcategories();
    const key = subcategory.toLowerCase();
    const matched = allSubs.find((s: { name: string }) => {
      const baseName = s.name || "";
      const slug = buildSubcategorySlug(baseName);
      return (
        baseName.toLowerCase() === key ||
        slug.toLowerCase() === key
      );
    });

    if (!matched) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    // Use canonical UA name for DB lookup
    const products = await sqlGetProductsBySubcategoryName(matched.name);
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products by subcategory" },
      { status: 500 }
    );
  }
}

// Enable revalidation every 5 minutes
export const revalidate = 300;
