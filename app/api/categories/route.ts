import { NextRequest, NextResponse } from "next/server";
import { normalizeDiscountPercent } from "@/lib/categoryDiscount";
import { sqlGetAllCategories, sqlPostCategory } from "@/lib/sql";

// ========================
// GET /api/categories
// ========================
export async function GET() {
  try {
    const categories = await sqlGetAllCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// ========================
// POST /api/categories
// ========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      priority,
      name_en,
      name_de,
      recommended_look_config,
      discount_percentage,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const newCategory = await sqlPostCategory(
      name,
      priority ?? 0,
      name_en || null,
      name_de || null,
      typeof recommended_look_config === "string"
        ? recommended_look_config
        : null,
      normalizeDiscountPercent(discount_percentage)
    );
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
