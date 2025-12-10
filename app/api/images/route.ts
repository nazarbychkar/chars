import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 300; // seconds
export const dynamic = "force-dynamic";

// Note: Body size limit is controlled by Next.js configuration
// The default limit is 10MB. To increase it, you need to:
// 1. Set environment variable: NEXT_MAX_BODY_SIZE=100mb
// 2. Or configure it in next.config.ts (though this may not work in all Next.js 15 versions)
// 3. IMPORTANT: Restart the server after changing configuration

// Convert uploaded image to WebP
async function convertToWebP(
  inputPath: string,
  outputDir: string
): Promise<string> {
  const newName = `${crypto.randomUUID()}.webp`;
  const outputPath = path.join(outputDir, newName);

  await sharp(inputPath)
    .rotate() // auto-orient
    .webp({ quality: 80 })
    .toFile(outputPath);

  await unlink(inputPath).catch(() => {}); // cleanup original
  return newName;
}

// Determine file type
function getFileType(mimeType: string, filename: string): "photo" | "video" {
  console.log(`[getFileType] Analyzing file: ${filename}, MIME: ${mimeType}`);
  
  // Check if MIME type indicates video
  if (mimeType.startsWith("video/")) {
    console.log(`[getFileType] Detected video by MIME type`);
    return "video";
  }
  
  // Check file extension
  const ext = filename.split(".").pop()?.toLowerCase();
  console.log(`[getFileType] File extension: ${ext}`);
  
  const videoExtensions = [
    "mp4",
    "webm",
    "ogg",
    "mov",
    "avi",
    "mkv",
    "flv",
    "wmv",
  ];
  
  if (ext && videoExtensions.includes(ext)) {
    console.log(`[getFileType] Detected video by extension: ${ext}`);
    return "video";
  }
  
  console.log(`[getFileType] Treating as photo`);
  return "photo";
}

export async function POST(req: NextRequest) {
  try {
    // Check Content-Length header to warn about large requests
    const contentLength = req.headers.get("content-length");
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      if (sizeInMB > 10) {
        console.warn(`[POST /api/images] Large request detected: ${sizeInMB.toFixed(2)}MB`);
      }
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch (error) {
      console.error("[POST /api/images] FormData parsing error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if it's a size limit error
      if (errorMessage.includes("boundary") || errorMessage.includes("10MB")) {
        return NextResponse.json(
          { 
            error: "Розмір файлів перевищує ліміт. Будь ласка, завантажте файли окремо або зменшіть їх розмір. Максимальний розмір одного файлу: 15MB. Для завантаження великих файлів потрібно перезапустити сервер з налаштуванням збільшеного ліміту." 
          },
          { status: 413 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Помилка обробки файлів. Можливо, файли занадто великі. Максимальний розмір одного файлу: 15MB." 
        },
        { status: 413 }
      );
    }

    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "product-images");
    await mkdir(uploadDir, { recursive: true });

    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
    const savedMedia: { type: "photo" | "video"; url: string }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Max file size is 15MB" },
          { status: 413 }
        );
      }

      const ext = file.name.split(".").pop();
      const uniqueName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      console.log(`📤 Uploading file: ${file.name}, MIME: ${file.type}, EXT: ${ext}, Size: ${file.size} bytes`);

      // Save file
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      const fileType = getFileType(file.type, file.name);
      let finalFileName = uniqueName;

      console.log(`🔍 File type determined: ${fileType} for ${file.name}`);

      if (fileType === "photo") {
        try {
          console.log(`🖼️ Converting ${uniqueName} → WebP`);
          finalFileName = await convertToWebP(filePath, uploadDir);
          console.log(`✅ Image saved as ${finalFileName}`);
        } catch (error) {
          console.error(`❌ Failed to convert image, keeping original:`, error);
          // Keep original file if conversion fails
        }
      } else {
        console.log(`🎬 Keeping video ${uniqueName} without conversion, type: ${fileType}`);
        // You could optionally rename to .mp4/.mov/.webm if needed
      }

      savedMedia.push({ type: fileType, url: finalFileName });
      console.log(`✅ Saved media item: type=${fileType}, url=${finalFileName}`);
    }

    console.log("📦 Saved media:", savedMedia);
    return NextResponse.json({ media: savedMedia }, { status: 201 });
  } catch (error) {
    console.error("[POST /upload]", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
