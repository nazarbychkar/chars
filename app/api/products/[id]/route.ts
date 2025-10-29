// app/api/products/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sqlGetProduct, sqlPutProduct, sqlDeleteProduct } from "@/lib/sql";

// =========================
// GET /api/products/[id]
// =========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await sqlGetProduct(id);

    if (!product || product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product[0]);
  } catch (error) {
    console.error("[GET /products/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// =========================
// PUT /api/products/[id]
// =========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const topSale = body.top_sale === true;
    const limitedEdition = body.limited_edition === true;
    const season = Array.isArray(body.season)
      ? body.season
      : typeof body.season === "string"
      ? [body.season]
      : [];
    const categoryId = body.category_id ? Number(body.category_id) : null;
    const subcategoryId = body.subcategory_id
      ? Number(body.subcategory_id)
      : null;
    const color = typeof body.color === "string" ? body.color : null;
    const oldPrice = body.old_price ? Number(body.old_price) : null;
    const discountPercentage = body.discount_percentage
      ? Number(body.discount_percentage)
      : null;
    const priority = body.priority ? Number(body.priority) : 0;
    const hasLining = body.has_lining === true;
    const liningDescription = body.lining_description || ""; // Add this line to handle it

    await sqlPutProduct(id, {
      name: body.name,
      description: body.description,
      price: body.price,
      old_price: oldPrice,
      discount_percentage: discountPercentage,
      priority,
      top_sale: topSale,
      limited_edition: limitedEdition,
      season,
      color,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      sizes: Array.isArray(body.sizes)
        ? body.sizes.map(
            (s: string | { size: string; stock?: number }) =>
              typeof s === "string"
                ? { size: s, stock: 0 }
                : { size: s.size, stock: Number(s.stock ?? 0) }
          )
        : [],
      media: Array.isArray(body.media) ? body.media : [],
      colors: Array.isArray(body.colors)
        ? body.colors.map((c: { label: string; hex?: string | null }) => ({
            label: c.label,
            hex: c.hex || null,
          }))
        : [],
      has_lining: hasLining,
      fabric_composition: body.fabric_composition,
      lining_description: liningDescription, // Pass the lining_description here
    });

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("[PUT /products/:id]", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// =========================
// DELETE /api/products/[id]
// =========================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number((await params).id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    await sqlDeleteProduct(id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /products/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
