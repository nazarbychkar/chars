import FinalCard from "@/components/final-card/FinalCard";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getMessages } from "@/lib/i18n/messages";
import { pageAlternates, parseLangParam, seoCopy } from "@/lib/i18n/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  return {
    title: copy.checkoutTitle,
    description: copy.checkoutDescription,
    robots: { index: false, follow: false },
    alternates: pageAlternates(lang, "/final"),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = parseLangParam((await params).lang);
  const loading = getMessages(lang).common.loading;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4" />
            <p className="text-base md:text-lg opacity-70">{loading}</p>
          </div>
        </div>
      }
    >
      <FinalCard />
    </Suspense>
  );
}
