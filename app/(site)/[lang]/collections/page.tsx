import type { Metadata } from "next";
import CollectionsClient from "@/components/collections/CollectionsClient";
import { pageAlternates, parseLangParam, seoCopy } from "@/lib/i18n/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  return {
    title: copy.collectionsTitle,
    description: copy.collectionsDescription,
    alternates: pageAlternates(lang, "/collections"),
  };
}

export default function CollectionsPage() {
  return <CollectionsClient />;
}
