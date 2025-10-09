import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const savedImageUrls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      savedImageUrls.push(uniqueName);
    }

    return NextResponse.json({ urls: savedImageUrls }, { status: 201 });
  } catch (error) {
    console.error("[POST /upload]", error);
    return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
  }
}
