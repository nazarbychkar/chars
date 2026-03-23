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

    console.log("[PUT /products/:id] Received body:", JSON.stringify(body, null, 2));
    console.log("[PUT /products/:id] Body name:", body.name);
    console.log("[PUT /products/:id] Body price:", body.price, typeof body.price);

    // Validate required fields
    if (!body.name || body.name.trim() === "") {
      console.error("[PUT /products/:id] Missing or empty name");
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const priceNum = typeof body.price === 'number' 
      ? body.price 
      : typeof body.price === 'string' 
        ? parseFloat(body.price) 
        : null;

    if (priceNum === null || isNaN(priceNum) || priceNum < 0) {
      console.error("[PUT /products/:id] Invalid price:", body.price);
      return NextResponse.json(
        { error: "Missing or invalid price. Price must be a valid number >= 0" },
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
    const fabricComposition =
      typeof body.fabric_composition === "string"
        ? body.fabric_composition
        : null;
    const fabricCompositionEn =
      typeof body.fabric_composition_en === "string"
        ? body.fabric_composition_en
        : null;
    const fabricCompositionDe =
      typeof body.fabric_composition_de === "string"
        ? body.fabric_composition_de
        : null;
    const priceEur =
      body.price_eur !== undefined && body.price_eur !== null
        ? Number(body.price_eur)
        : null;
    const discountPercentage = body.discount_percentage
      ? Number(body.discount_percentage)
      : null;
    const priority = body.priority ? Number(body.priority) : 0;
    const hasLining = body.has_lining === true;
    const liningDescription = body.lining_description || ""; // Add this line to handle it
    const availabilityStatus =
      typeof body.availability_status === "string"
        ? body.availability_status
        : "available";
    const recommendedProductIds = Array.isArray(body.recommended_product_ids)
      ? body.recommended_product_ids
          .map((item: unknown) => Number(item))
          .filter((item: number) => Number.isInteger(item) && item > 0)
      : [];

    await sqlPutProduct(id, {
      name: body.name.trim(),
      description: body.description || null,
      price: priceNum,
      price_eur: priceEur,
      name_en: body.name_en || null,
      name_de: body.name_de || null,
      description_en: body.description_en || null,
      description_de: body.description_de || null,
      old_price: oldPrice,
      discount_percentage: discountPercentage,
      priority,
      top_sale: topSale,
      limited_edition: limitedEdition,
      season,
      availability_status: availabilityStatus,
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
      fabric_composition: fabricComposition || undefined,
      fabric_composition_en: fabricCompositionEn,
      fabric_composition_de: fabricCompositionDe,
      media: Array.isArray(body.media) ? body.media : [],
      colors: Array.isArray(body.colors)
        ? body.colors.map((c: { label: string; hex?: string | null }) => ({
            label: c.label,
            hex: c.hex || null,
          }))
        : [],
      has_lining: hasLining,
      lining_description: liningDescription,
      recommended_product_ids: recommendedProductIds,
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
