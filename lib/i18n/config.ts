export const SUPPORTED_LOCALES = ["uk", "de", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "uk";

export function isSupportedLocale(locale: string | null | undefined): locale is Locale {
  return !!locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/");
  const maybeLocale = segments[1] || "";

  if (isSupportedLocale(maybeLocale)) {
    return maybeLocale;
  }

  return DEFAULT_LOCALE;
}

