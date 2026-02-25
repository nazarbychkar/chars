"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
  getLocaleFromPath,
} from "./config";
import { getMessages } from "./messages";

type I18nContextValue = {
  locale: Locale;
  messages: ReturnType<typeof getMessages>;
  switchLocale: (nextLocale: Locale) => void;
  withLocalePath: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Use real browser URL (with /uk, /de, /en) because Next rewrites
  // strip the locale prefix from the internal pathname.
  const browserPath =
    typeof window !== "undefined" ? window.location.pathname : pathname || "/";

  const locale = getLocaleFromPath(browserPath || "/");

  const value = useMemo<I18nContextValue>(() => {
    const messages = getMessages(locale);

    const switchLocale = (nextLocale: Locale) => {
      if (nextLocale === locale) return;

      const currentPath =
        typeof window !== "undefined"
          ? window.location.pathname
          : pathname || "/";

      const segments = currentPath.split("/");
      const hasLocalePrefix = SUPPORTED_LOCALES.includes(
        (segments[1] || "") as Locale
      );

      let newPath: string;

      if (hasLocalePrefix) {
        segments[1] = nextLocale;
        newPath = segments.join("/") || "/";
      } else {
        newPath =
          nextLocale === DEFAULT_LOCALE
            ? `/${nextLocale}${pathname === "/" ? "" : pathname}`
            : `/${nextLocale}${pathname === "/" ? "" : pathname}`;
      }

      // Full reload to ensure all server-rendered content (metadata, hero, etc.)
      // is refreshed in the new language.
      if (typeof window !== "undefined") {
        window.location.href = newPath;
      } else {
        router.push(newPath);
      }
    };

    const withLocalePath = (path: string) => {
      if (path.startsWith("http") || path.startsWith("#")) {
        return path;
      }

      const cleanPath = path.startsWith("/") ? path : `/${path}`;

      return `/${locale}${cleanPath === "/" ? "" : cleanPath}`;
    };

    return {
      locale,
      messages,
      switchLocale,
      withLocalePath,
    };
  }, [locale, pathname, router]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

