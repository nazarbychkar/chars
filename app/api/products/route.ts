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
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;
    const sizesRaw = formData.get("sizes") as string;
    const images = formData.getAll("images") as File[];

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const parsedSizes = JSON.parse(sizesRaw); // ["S", "M", "L"]
    const product = await sqlPostProduct({
      name,
      description,
      price,
      sizes: parsedSizes.map((size: string) => ({
        size,
        stock: 5,
      })),
      media: images.map((file) => ({
        type: "photo",
        url: "/images/hero-bg.png",  // TODO: change to real url
      })),
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
