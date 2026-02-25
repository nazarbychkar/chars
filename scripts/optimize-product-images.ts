#!/usr/bin/env ts-node

/**
 * One-off script to optimize existing product media in the `product-images` folder.
 *
 * - Finds all JPG/PNG (and other raster image) files in product-images
 * - Resizes them to max width 1600px (no upscale)
 * - Converts to WebP (quality: 80)
 * - Deletes the original file
 *
 * Videos and already-optimized WebP files are left unchanged.
 *
 * Usage (from project root):
 *   npx ts-node scripts/optimize-product-images.ts
 * or (if ts-node installed globally / via npm script):
 *   ts-node scripts/optimize-product-images.ts
 */

import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const unlink = promisify(fs.unlink);

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const VIDEO_EXTENSIONS = [
  ".mp4",
  ".webm",
  ".ogg",
  ".mov",
  ".avi",
  ".mkv",
  ".flv",
  ".wmv",
];

async function optimizeImage(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const baseName = path.basename(filePath, ext);

  // Skip non-raster formats just in case
  if (!IMAGE_EXTENSIONS.includes(ext)) {
    return;
  }

  const newName = `${baseName}-${Date.now()}.webp`;
  const outputPath = path.join(dir, newName);

  console.log(`🖼  Optimizing ${path.basename(filePath)} → ${newName}`);

  await sharp(filePath)
    .rotate()
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .toFile(outputPath);

  await unlink(filePath).catch(() => {
    console.warn(`⚠️  Failed to remove original file: ${filePath}`);
  });
}

async function walkAndOptimize(rootDir: string): Promise<void> {
  const entries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      // In case someone has nested folders inside product-images
      await walkAndOptimize(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();

    // Skip already-optimized WebP and all videos
    if (ext === ".webp" || VIDEO_EXTENSIONS.includes(ext)) {
      continue;
    }

    try {
      const info = await stat(fullPath);
      if (!info.isFile()) continue;
      await optimizeImage(fullPath);
    } catch (err) {
      console.error(`❌ Failed to process ${fullPath}:`, err);
    }
  }
}

async function main() {
  const root = process.cwd();
  const imagesDir = path.join(root, "product-images");

  if (!fs.existsSync(imagesDir)) {
    console.error(`product-images directory not found at: ${imagesDir}`);
    process.exit(1);
  }

  console.log(`📂 Optimizing images in ${imagesDir} ...`);
  await walkAndOptimize(imagesDir);
  console.log("✅ Optimization complete.");
}

main().catch((err) => {
  console.error("❌ Unexpected error during optimization:", err);
  process.exit(1);
});

