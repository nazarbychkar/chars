import type { Metadata } from "next";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "./config";

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_BASE_URL || "https://charsua.com").replace(
    /\/$/,
    ""
  );
}

export const HTML_LANG: Record<Locale, string> = {
  uk: "uk",
  de: "de",
  en: "en",
};

export const OG_LOCALE: Record<Locale, string> = {
  uk: "uk_UA",
  de: "de_DE",
  en: "en_US",
};

export function generateLocaleStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }));
}

export function parseLangParam(lang: string | undefined): Locale {
  return isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
}

export function pageAlternates(
  lang: Locale,
  path = "/"
): NonNullable<Metadata["alternates"]> {
  const base = getSiteUrl();
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return {
    canonical: `${base}/${lang}${clean}`,
    languages: {
      uk: `${base}/uk${clean}`,
      de: `${base}/de${clean}`,
      en: `${base}/en${clean}`,
      "x-default": `${base}/uk${clean}`,
    },
  };
}

export const seoCopy: Record<
  Locale,
  {
    siteTitle: string;
    homeTitle: string;
    homeDescription: string;
    homeKeywords: string;
    catalogTitle: string;
    catalogDescription: string;
    catalogKeywords: string;
    catalogFilteredTitle: (name: string) => string;
    catalogFilteredDescription: (name: string) => string;
    collectionsTitle: string;
    collectionsDescription: string;
    certificateTitle: string;
    certificateDescription: string;
    privacyTitle: string;
    privacyDescription: string;
    termsTitle: string;
    termsDescription: string;
    checkoutTitle: string;
    checkoutDescription: string;
    productNotFound: string;
    productFallbackDescription: (name: string) => string;
    ogImageAlt: string;
    breadcrumbHome: string;
    breadcrumbCatalog: string;
    breadcrumbCertificate: string;
    breadcrumbProduct: string;
  }
> = {
  uk: {
    siteTitle: "CHARS — Український Бренд Чоловічого Одягу | Стиль Без Компромісів",
    homeTitle: "Головна | CHARS — Український Бренд Чоловічого Одягу",
    homeDescription:
      "CHARS — український бренд чоловічого одягу, заснований у 2023 році. Ми створюємо стильний одяг для різних чоловіків без компромісів. Класика, кежуал та спорт. Замовляйте онлайн з доставкою по Україні.",
    homeKeywords:
      "CHARS, український бренд одягу, чоловічий одяг, стильний одяг, смарт-кежуал, кежуал-класик, українська мода, одяг для чоловіків, київ, купити одяг онлайн, доставка по Україні",
    catalogTitle: "Каталог товарів | CHARS — Український Бренд Чоловічого Одягу",
    catalogDescription:
      "Каталог чоловічого одягу CHARS. Стильний одяг для різних чоловіків без компромісів. Класика, кежуал та спорт. Замовляйте онлайн з доставкою по Україні.",
    catalogKeywords:
      "CHARS, каталог, чоловічий одяг, український бренд, купити одяг, доставка по Україні",
    catalogFilteredTitle: (name) => `Каталог ${name} | CHARS`,
    catalogFilteredDescription: (name) =>
      `Каталог ${name} від CHARS. Висока якість, стильний дизайн. Замовляйте онлайн з доставкою по Україні.`,
    collectionsTitle: "Колекції | CHARS",
    collectionsDescription:
      "Оберіть сезонну колекцію CHARS: Літо, Осінь, Зима, Весна. Чоловічий одяг для кожного сезону.",
    certificateTitle: "Подарунковий сертифікат | CHARS",
    certificateDescription:
      "Подарунковий сертифікат CHARS — ідеальний подарунок для поціновувачів стилю. Оберіть номінал та оплатіть онлайн.",
    privacyTitle: "Політика конфіденційності | CHARS",
    privacyDescription:
      "Політика конфіденційності персональних даних CHARS. Дізнайтеся, як ми збираємо, використовуємо та захищаємо ваші персональні дані.",
    termsTitle: "Договір публічної оферти | CHARS",
    termsDescription:
      "Договір публічної оферти CHARS. Умови використання сайту та покупки товарів.",
    checkoutTitle: "Оформлення замовлення | CHARS",
    checkoutDescription: "Оформлення замовлення в CHARS. Доставка по всій Україні.",
    productNotFound: "Товар не знайдено | CHARS",
    productFallbackDescription: (name) =>
      `${name} від CHARS — український бренд чоловічого одягу. Замовляйте онлайн з доставкою по Україні.`,
    ogImageAlt: "CHARS",
    breadcrumbHome: "Головна",
    breadcrumbCatalog: "Каталог",
    breadcrumbCertificate: "Сертифікат",
    breadcrumbProduct: "Товар",
  },
  de: {
    siteTitle: "CHARS — Ukrainische Herrenmodemarke | Stil ohne Kompromisse",
    homeTitle: "Startseite | CHARS — Ukrainische Herrenmodemarke",
    homeDescription:
      "CHARS ist eine ukrainische Herrenmodemarke, gegründet 2023. Stilvolle Kleidung ohne Kompromisse — Klassik, Casual und Sport. Online bestellen mit Lieferung.",
    homeKeywords:
      "CHARS, ukrainische Modemarke, Herrenmode, stilvolle Kleidung, Smart Casual, ukrainische Mode, online kaufen",
    catalogTitle: "Katalog | CHARS — Ukrainische Herrenmodemarke",
    catalogDescription:
      "Herrenmode-Katalog von CHARS. Klassik, Casual und Sport. Online bestellen.",
    catalogKeywords: "CHARS, Katalog, Herrenmode, ukrainische Marke, online kaufen",
    catalogFilteredTitle: (name) => `Katalog ${name} | CHARS`,
    catalogFilteredDescription: (name) =>
      `Katalog ${name} von CHARS. Hohe Qualität, stilvolles Design. Online bestellen.`,
    collectionsTitle: "Kollektionen | CHARS",
    collectionsDescription:
      "Wählen Sie die saisonale CHARS-Kollektion: Sommer, Herbst, Winter, Frühling.",
    certificateTitle: "Geschenkgutschein | CHARS",
    certificateDescription:
      "Der CHARS-Geschenkgutschein — ein stilvolles Geschenk. Nennwert wählen und online bezahlen.",
    privacyTitle: "Datenschutzrichtlinie | CHARS",
    privacyDescription:
      "Datenschutzrichtlinie von CHARS. Erfahren Sie, wie wir personenbezogene Daten erheben, nutzen und schützen.",
    termsTitle: "Öffentliches Angebot | CHARS",
    termsDescription:
      "Öffentliches Angebot von CHARS. Nutzungsbedingungen und Kaufregeln.",
    checkoutTitle: "Bestellung | CHARS",
    checkoutDescription: "Bestellung bei CHARS abschließen.",
    productNotFound: "Artikel nicht gefunden | CHARS",
    productFallbackDescription: (name) =>
      `${name} von CHARS — ukrainische Herrenmodemarke. Online bestellen.`,
    ogImageAlt: "CHARS",
    breadcrumbHome: "Startseite",
    breadcrumbCatalog: "Katalog",
    breadcrumbCertificate: "Gutschein",
    breadcrumbProduct: "Artikel",
  },
  en: {
    siteTitle: "CHARS — Ukrainian Menswear Brand | Style Without Compromise",
    homeTitle: "Home | CHARS — Ukrainian Menswear Brand",
    homeDescription:
      "CHARS is a Ukrainian menswear brand founded in 2023. Stylish clothing without compromise — classic, casual and sport. Order online with delivery.",
    homeKeywords:
      "CHARS, Ukrainian fashion brand, menswear, stylish clothing, smart casual, Ukrainian fashion, buy online",
    catalogTitle: "Catalog | CHARS — Ukrainian Menswear Brand",
    catalogDescription:
      "CHARS menswear catalog. Classic, casual and sport. Order online.",
    catalogKeywords: "CHARS, catalog, menswear, Ukrainian brand, buy clothes online",
    catalogFilteredTitle: (name) => `Catalog ${name} | CHARS`,
    catalogFilteredDescription: (name) =>
      `${name} from CHARS. Quality fabrics, considered design. Order online.`,
    collectionsTitle: "Collections | CHARS",
    collectionsDescription:
      "Choose a CHARS seasonal collection: Summer, Autumn, Winter, Spring.",
    certificateTitle: "Gift Certificate | CHARS",
    certificateDescription:
      "The CHARS gift certificate — a refined present. Choose an amount and pay online.",
    privacyTitle: "Privacy Policy | CHARS",
    privacyDescription:
      "CHARS privacy policy. How we collect, use and protect your personal data.",
    termsTitle: "Public Offer | CHARS",
    termsDescription: "CHARS public offer. Terms of use and purchase.",
    checkoutTitle: "Checkout | CHARS",
    checkoutDescription: "Complete your CHARS order.",
    productNotFound: "Product not found | CHARS",
    productFallbackDescription: (name) =>
      `${name} by CHARS — Ukrainian menswear. Order online.`,
    ogImageAlt: "CHARS",
    breadcrumbHome: "Home",
    breadcrumbCatalog: "Catalog",
    breadcrumbCertificate: "Certificate",
    breadcrumbProduct: "Product",
  },
};
