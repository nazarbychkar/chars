import { Suspense } from "react";
import CatalogServer from "@/components/catalog/CatalogServer";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BreadcrumbsSchema from "@/components/shared/BreadcrumbsSchema";
import { CatalogSkeleton } from "@/components/shared/Skeleton";
import {
  OG_LOCALE,
  getSiteUrl,
  getOgImages,
  getOgImageUrl,
  pageAlternates,
  parseLangParam,
  seoCopy,
} from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    category?: string;
    season?: string;
    subcategory?: string;
  }>;
}

export const revalidate = 300;

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const query = await searchParams;
  const copy = seoCopy[lang];
  const baseUrl = getSiteUrl();

  const filter = query.category || query.season || query.subcategory || "";
  const title = filter ? copy.catalogFilteredTitle(filter) : copy.catalogTitle;
  const description = filter
    ? copy.catalogFilteredDescription(filter)
    : copy.catalogDescription;
  const keywords = filter
    ? `CHARS, ${filter}, ${copy.catalogKeywords}`
    : copy.catalogKeywords;

  const search = new URLSearchParams(
    Object.fromEntries(
      Object.entries(query).filter(([, value]) => Boolean(value))
    ) as Record<string, string>
  ).toString();
  const path = search ? `/catalog?${search}` : "/catalog";

  return {
    title,
    description,
    keywords,
    alternates: pageAlternates(lang, path.split("?")[0]),
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/${lang}${path}`,
      siteName: "CHARS",
      locale: OG_LOCALE[lang],
      images: getOgImages(copy.ogImageAlt, baseUrl),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getOgImageUrl(baseUrl)],
    },
  };
}

export default async function Page({ params, searchParams }: PageProps) {
  const lang = parseLangParam((await params).lang);
  const query = await searchParams;
  const copy = seoCopy[lang];
  const baseUrl = getSiteUrl();

  const breadcrumbItems = [
    { label: copy.breadcrumbHome, href: `/${lang}` },
    { label: copy.breadcrumbCatalog, href: `/${lang}/catalog` },
  ];

  return (
    <>
      <div className="site-shell site-px pt-5">
        <Breadcrumbs />
        <BreadcrumbsSchema items={breadcrumbItems} baseUrl={baseUrl} />
      </div>
      <Suspense fallback={<CatalogSkeleton count={8} />}>
        <CatalogServer
          category={query.category || null}
          season={query.season || null}
          subcategory={query.subcategory || null}
        />
      </Suspense>
    </>
  );
}
