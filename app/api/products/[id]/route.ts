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
    console.log(product);

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

    // Parse new fields from body, with defaults if needed
    const topSale = body.top_sale === true;
    const limitedEdition = body.limited_edition === true;
    const season = typeof body.season === "string" ? body.season : null;
    const categoryId = body.category_id ? Number(body.category_id) : null;

    await sqlPutProduct(id, {
      name: body.name,
      description: body.description,
      price: body.price,
      top_sale: topSale,
      limited_edition: limitedEdition,
      season,
      category_id: categoryId,
      sizes: Array.isArray(body.sizes)
        ? body.sizes.map((size: string) => ({
            size,
            stock: 5,
          }))
        : [],
      media: Array.isArray(body.media) ? body.media : [],
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
