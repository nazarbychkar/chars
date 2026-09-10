import dynamic from "next/dynamic";
import Hero from "@/components/main-page/Hero";
import TopSaleServer from "@/components/main-page/TopSaleServer";
import { Suspense } from "react";
import type { Metadata } from "next";
import {
  OG_LOCALE,
  getSiteUrl,
  getOgImages,
  getOgImageUrl,
  pageAlternates,
  parseLangParam,
  seoCopy,
} from "@/lib/i18n/seo";
import { getMessages } from "@/lib/i18n/messages";

export const revalidate = 300;

const AboutUs = dynamic(() => import("@/components/main-page/AboutUs"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});
const LimitedEdition = dynamic(
  () => import("@/components/main-page/LimitedEdition"),
  {
    loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
  }
);
const FAQ = dynamic(() => import("@/components/main-page/FAQ"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});
const SocialMedia = dynamic(() => import("@/components/main-page/SocialMedia"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});
const WhyChooseUs = dynamic(() => import("@/components/main-page/WhyChooseUs"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});
const Reviews = dynamic(() => import("@/components/main-page/Reviews"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />,
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  const baseUrl = getSiteUrl();

  return {
    title: copy.homeTitle,
    description: copy.homeDescription,
    keywords: copy.homeKeywords,
    alternates: pageAlternates(lang),
    openGraph: {
      title: copy.siteTitle,
      description: copy.homeDescription,
      type: "website",
      url: `${baseUrl}/${lang}`,
      siteName: "CHARS",
      locale: OG_LOCALE[lang],
      images: getOgImages(copy.ogImageAlt, baseUrl),
    },
    twitter: {
      card: "summary_large_image",
      title: copy.siteTitle,
      description: copy.homeDescription,
      images: [getOgImageUrl(baseUrl)],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = parseLangParam((await params).lang);
  const loading = getMessages(lang).common.loading;

  return (
    <>
      <Hero />
      <Suspense
        fallback={<div className="text-center py-20 text-lg">{loading}</div>}
      >
        <TopSaleServer />
      </Suspense>
      <AboutUs />
      <WhyChooseUs />
      <SocialMedia />
      <LimitedEdition />
      <FAQ />
      <Reviews />
    </>
  );
}
