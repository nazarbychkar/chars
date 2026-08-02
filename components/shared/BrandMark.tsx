"use client";

import Image from "next/image";
import { useAppContext } from "@/lib/GeneralProvider";

type BrandMarkProps = {
  /** Visual height in px (used for Next Image sizing). */
  size?: number;
  className?: string;
  /** Force a variant; default follows theme */
  variant?: "dark" | "light" | "auto";
  priority?: boolean;
};

/**
 * CHARS crest mark.
 * dark = blue mark for light backgrounds
 * light = white mark for dark backgrounds
 */
export default function BrandMark({
  size = 56,
  className = "",
  variant = "auto",
  priority = false,
}: BrandMarkProps) {
  const { isDark } = useAppContext();
  const useLight =
    variant === "light" || (variant === "auto" && isDark);

  const src = useLight
    ? "/images/chars-mark-light.png"
    : "/images/chars-mark-dark.png";

  const width = Math.round(size * 0.4);

  return (
    <Image
      src={src}
      alt="CHARS"
      width={width}
      height={size}
      className={`object-contain ${className}`}
      priority={priority}
    />
  );
}
