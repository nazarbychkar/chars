import { NextResponse } from "next/server";
import { readdir, unlink } from "fs/promises";
import path from "path";
import { sql } from "@/lib/sql"; // adjust to your actual path

export async function POST() {
  try {
    const mediaDir = path.join(process.cwd(), "product-images");
    const files = await readdir(mediaDir);

    const usedMedia = await sql`SELECT url FROM product_media;`;
    const usedFiles = new Set(usedMedia.map((m) => path.basename(m.url)));

    const deletedFiles: string[] = [];

    for (const file of files) {
      if (!usedFiles.has(file)) {
        const filePath = path.join(mediaDir, file);
        try {
          await unlink(filePath);
          deletedFiles.push(file);
        } catch (err) {
          console.error(`❌ Failed to delete ${file}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      deleted: deletedFiles,
      count: deletedFiles.length,
    });
  } catch (error) {
    console.error("Cleanup failed:", error);
    return NextResponse.json(
      { success: false, error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
