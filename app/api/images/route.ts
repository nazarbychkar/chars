import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

// Ensure Node.js runtime and allow longer processing for large uploads
export const runtime = "nodejs";
export const maxDuration = 300; // seconds

// Helper function to determine file type
function getFileType(mimeType: string, filename: string): "photo" | "video" {
  // Check MIME type first
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  
  // Fallback: check file extension if MIME type is generic or unknown
  const ext = filename.split(".").pop()?.toLowerCase();
  const videoExtensions = ["mp4", "webm", "ogg", "mov", "avi", "mkv", "flv", "wmv"];
  
  if (ext && videoExtensions.includes(ext)) {
    return "video";
  }
  
  return "photo";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const savedMedia: { type: "photo" | "video"; url: string }[] = [];

    for (const file of files) {
      // Optional size guard (example: 500 MB per file)
      const size = (file).size as number | undefined;
      if (typeof size === "number" && size > 500 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large" }, { status: 413 });
      }
      const ext = file.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      // Convert file to buffer for now (can optimize later with proper streaming)
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const fileType = getFileType(file.type, file.name);
      console.log(`📁 File uploaded: ${file.name}, MIME: ${file.type}, Detected type: ${fileType}, URL: ${uniqueName}`);
      
      savedMedia.push({ type: fileType, url: uniqueName });
    }

    console.log("📦 Saved media:", savedMedia);
    return NextResponse.json({ media: savedMedia }, { status: 201 });
  } catch (error) {
    console.error("[POST /upload]", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
