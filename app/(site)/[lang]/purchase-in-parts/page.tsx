import type { Metadata } from "next";
import PurchaseInPartsContent from "./PurchaseInPartsContent";
import { pageAlternates, parseLangParam, seoCopy } from "@/lib/i18n/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  return {
    title: copy.purchaseInPartsTitle,
    description: copy.purchaseInPartsDescription,
    alternates: pageAlternates(lang, "/purchase-in-parts"),
    robots: { index: true, follow: true },
  };
}

export default function PurchaseInPartsPage() {
  return <PurchaseInPartsContent />;
}
