import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

// Define the type for the params - note that params is a Promise
interface RouteParams {
  params: Promise<{
    filename: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Await the params since it's a Promise in App Router
    const { filename } = await context.params;
    const filePath = path.join(process.cwd(), "product-images", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    // Set content type based on file extension
    let contentType = "image/jpeg";
    
    // Image formats
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    
    // Video formats
    else if (ext === ".mp4") contentType = "video/mp4";
    else if (ext === ".webm") contentType = "video/webm";
    else if (ext === ".ogg") contentType = "video/ogg";
    else if (ext === ".mov") contentType = "video/quicktime";
    else if (ext === ".avi") contentType = "video/x-msvideo";
    else if (ext === ".mkv") contentType = "video/x-matroska";
    else if (ext === ".flv") contentType = "video/x-flv";
    else if (ext === ".wmv") contentType = "video/x-ms-wmv";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    };

    // Add Accept-Ranges header for video files to support seeking
    if (contentType.startsWith("video/")) {
      headers["Accept-Ranges"] = "bytes";
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers,
    });
  } catch (error) {
    console.error("Error serving file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}