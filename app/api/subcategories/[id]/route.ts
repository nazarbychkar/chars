import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { normalizeDiscountPercent } from "@/lib/categoryDiscount";
import {
  sqlGetSubcategory,
  sqlPutSubcategory,
  sqlDeleteSubcategory,
} from "@/lib/sql";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const subcategoryId = Number((await params).id);

  if (isNaN(subcategoryId)) {
    return NextResponse.json(
      { error: "Invalid subcategory ID" },
      { status: 400 }
    );
  }

  try {
    const subcategory = await sqlGetSubcategory(subcategoryId);

    if (!subcategory) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error("GET subcategory failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const subcategoryId = Number((await params).id);

  if (isNaN(subcategoryId)) {
    return NextResponse.json(
      { error: "Invalid subcategory ID" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const {
      name,
      parent_category_id,
      name_en,
      name_de,
      priority,
      discount_percentage,
    } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing name" },
        { status: 400 }
      );
    }

    const categoryId = Number(parent_category_id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Invalid parent_category_id" },
        { status: 400 }
      );
    }

    const priorityNum =
      typeof priority === "number" && !Number.isNaN(priority)
        ? Math.max(0, Math.floor(priority))
        : 0;

    const existingRows = await sqlGetSubcategory(subcategoryId);
    const existing = Array.isArray(existingRows)
      ? existingRows[0]
      : existingRows;
    if (!existing) {
      return NextResponse.json(
        { error: "Subcategory not found" },
        { status: 404 }
      );
    }

    const finalDiscount =
      discount_percentage !== undefined
        ? normalizeDiscountPercent(discount_percentage)
        : normalizeDiscountPercent(
            (existing as { discount_percentage?: number | null })
              .discount_percentage
          );

    const updatedSubcategory = await sqlPutSubcategory(
      subcategoryId,
      name,
      categoryId,
      name_en ?? null,
      name_de ?? null,
      priorityNum,
      finalDiscount
    );

    revalidateTag("products");
    return NextResponse.json(updatedSubcategory);
  } catch (error) {
    console.error("PUT subcategory failed:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const subcategoryId = Number((await params).id);

  if (isNaN(subcategoryId)) {
    return NextResponse.json(
      { error: "Invalid subcategory ID" },
      { status: 400 }
    );
  }

  try {
    await sqlDeleteSubcategory(subcategoryId);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE subcategory failed:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory" },
      { status: 500 }
    );
  }
}
