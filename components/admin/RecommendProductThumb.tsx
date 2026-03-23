"use client";

import Image from "next/image";

const VIDEO_EXT = /\.(webm|mp4|ogg|mov|avi|mkv|flv|wmv)$/i;

function isVideoMedia(url: string, type?: string | null): boolean {
  if (type === "video") return true;
  return VIDEO_EXT.test(url);
}

type RecommendProductThumbProps = {
  url?: string | null;
  type?: string | null;
  alt: string;
  /** Tailwind size classes, e.g. "h-10 w-10" or "h-12 w-12" */
  boxClassName?: string;
};

/**
 * Admin recommendation picker thumb: Next/Image cannot optimize video (e.g. .webm).
 */
export function RecommendProductThumb({
  url,
  type,
  alt,
  boxClassName = "h-10 w-10",
}: RecommendProductThumbProps) {
  if (!url) {
    return (
      <div
        className={`relative ${boxClassName} flex-shrink-0 overflow-hidden rounded bg-gray-100`}
      >
        <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
          no img
        </div>
      </div>
    );
  }

  const src = `/api/images/${url}`;

  if (isVideoMedia(url, type)) {
    return (
      <div
        className={`relative ${boxClassName} flex-shrink-0 overflow-hidden rounded bg-gray-100`}
      >
        <video
          src={src}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
          aria-label={alt}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${boxClassName} flex-shrink-0 overflow-hidden rounded bg-gray-100`}
    >
      <Image src={src} alt={alt} fill className="object-cover" sizes="48px" />
    </div>
  );
}
