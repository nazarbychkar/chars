import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

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

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const savedMedia: { type: "photo" | "video"; url: string }[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);
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
