import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import SiteHtmlShell from "@/components/SiteHtmlShell";
import { isSupportedLocale } from "@/lib/i18n/config";
import {
  generateLocaleStaticParams,
  getSiteUrl,
  pageAlternates,
  parseLangParam,
  seoCopy,
  OG_LOCALE,
} from "@/lib/i18n/seo";
import "../critical.css";
import "../globals.css";
import "../mobile-optimizations.css";
import "../animations.css";

export const generateStaticParams = generateLocaleStaticParams;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  const lang = parseLangParam(raw);
  const copy = seoCopy[lang];
  const baseUrl = getSiteUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: copy.siteTitle,
      template: "%s | CHARS",
    },
    description: copy.homeDescription,
    keywords: copy.homeKeywords,
    authors: [{ name: "CHARS" }],
    creator: "CHARS",
    publisher: "CHARS",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/images/CHARS-06.png", sizes: "512x512", type: "image/png" },
      ],
      shortcut: "/favicon-32x32.png",
      apple: "/apple-touch-icon.png",
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[lang],
      alternateLocale: Object.values(OG_LOCALE).filter((v) => v !== OG_LOCALE[lang]),
      url: `${baseUrl}/${lang}`,
      siteName: "CHARS",
      title: copy.siteTitle,
      description: copy.homeDescription,
      images: [
        {
          url: `${baseUrl}/images/IMG_5887.JPG`,
          width: 1200,
          height: 630,
          alt: copy.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.siteTitle,
      description: copy.homeDescription,
      images: [`${baseUrl}/images/IMG_5887.JPG`],
    },
    alternates: pageAlternates(lang),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isSupportedLocale(lang)) notFound();

  return <SiteHtmlShell lang={lang}>{children}</SiteHtmlShell>;
}
