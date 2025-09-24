// app/api/products/route.ts

import { NextResponse } from "next/server";
import { sqlGetAllProducts, sqlPostProduct } from "@/lib/sql";

// =========================
// GET /api/products
// =========================
export async function GET() {
  try {
    const products = await sqlGetAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /products]", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// =========================
// POST /api/products
// =========================
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ✅ Basic validation (can be replaced with zod)
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const product = await sqlPostProduct({
      name: body.name,
      description: body.description,
      price: body.price,
      sizes: body.sizes, // expected: [{ size: "M", stock: 5 }]
      media: body.media, // expected: [{ type: "image", url: "..." }]
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[POST /products]", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
