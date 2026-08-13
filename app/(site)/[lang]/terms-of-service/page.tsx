import type { Metadata } from "next";
import TermsOfServiceContent from "./TermsOfServiceContent";
import { pageAlternates, parseLangParam, seoCopy } from "@/lib/i18n/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  return {
    title: copy.termsTitle,
    description: copy.termsDescription,
    alternates: pageAlternates(lang, "/terms-of-service"),
    robots: { index: true, follow: true },
  };
}

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
