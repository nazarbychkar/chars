// app/api/products/route.ts

import { NextResponse } from "next/server";
import { sqlGetAllProducts, sqlPostProduct } from "@/lib/sql";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

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
    const topSale = formData.get("top_sale") === "true";
    const limitedEdition = formData.get("limited_edition") === "true";
    const color = formData.get("color")?.toString();
    const season = formData.get("season") as string;
    const categoryId = formData.get("category_id")
      ? Number(formData.get("category_id"))
      : null;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Missing required fields: name, price" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "product-images");
    await mkdir(uploadDir, { recursive: true });

    const savedImageUrls: string[] = [];

    for (const image of images) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const ext = image.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      savedImageUrls.push(`/product-images/${uniqueName}`);
    }

    const parsedSizes = JSON.parse(sizesRaw); // ["S", "M", "L"]

    const product = await sqlPostProduct({
      name,
      description,
      price,
      top_sale: topSale,
      limited_edition: limitedEdition,
      season,
      color,
      category_id: categoryId,
      sizes: parsedSizes.map((size: string) => ({
        size,
        stock: 5,
      })),
      media: savedImageUrls.map((url) => ({
        type: "photo",
        url,
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
