"use client";

import { useEffect, useState } from "react";
import { translateTextAllLangs } from "@/lib/adminProductTranslate";
import type { Locale } from "@/lib/i18n/config";

const translationCache = new Map<string, string>();

function cacheKey(locale: Locale, source: string) {
  return `${locale}:${source}`;
}

function pickStored(
  locale: Locale,
  sourceUk: string,
  storedEn?: string | null,
  storedDe?: string | null
): string | null {
  const stored = locale === "en" ? storedEn : storedDe;
  if (!stored?.trim()) return null;
  if (stored.trim() === sourceUk.trim()) return null;
  return stored.trim();
}

function shouldAutoTranslate(
  locale: Locale,
  sourceUk?: string | null,
  storedEn?: string | null,
  storedDe?: string | null
): boolean {
  if (!sourceUk?.trim() || locale === "uk") return false;
  return !pickStored(locale, sourceUk.trim(), storedEn, storedDe);
}

/**
 * Shows DB localization when present; otherwise translates UA source on the client (cached).
 */
export function useAutoLocalizedText(
  locale: Locale,
  sourceUk?: string | null,
  storedEn?: string | null,
  storedDe?: string | null
): string {
  const uk = (sourceUk || "").trim();

  const staticText =
    locale === "uk"
      ? uk
      : pickStored(locale, uk, storedEn, storedDe) ?? uk;

  const [text, setText] = useState(staticText);

  useEffect(() => {
    if (!uk) {
      setText("");
      return;
    }

    if (locale === "uk") {
      setText(uk);
      return;
    }

    const fromDb = pickStored(locale, uk, storedEn, storedDe);
    if (fromDb) {
      setText(fromDb);
      return;
    }

    if (!shouldAutoTranslate(locale, uk, storedEn, storedDe)) {
      setText(uk);
      return;
    }

    const key = cacheKey(locale, uk);
    const cached = translationCache.get(key);
    if (cached) {
      setText(cached);
      return;
    }

    let cancelled = false;
    translateTextAllLangs(uk, "uk").then((result) => {
      if (cancelled) return;
      const translated = locale === "en" ? result.en : result.de;
      translationCache.set(key, translated);
      setText(translated);
    });

    return () => {
      cancelled = true;
    };
  }, [locale, uk, storedEn, storedDe]);

  return text;
}

export function useColorDisplayName(
  ukLabel: string | undefined | null,
  locale: Locale,
  colorNames: Record<string, string>
): string {
  const dict = ukLabel ? colorNames[ukLabel] : null;
  return useAutoLocalizedText(locale, ukLabel, dict, dict);
}
