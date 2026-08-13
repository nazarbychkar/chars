import type { Metadata } from "next";
import PrivacyPolicyContent from "./PrivacyPolicyContent";
import { pageAlternates, parseLangParam, seoCopy } from "@/lib/i18n/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  return {
    title: copy.privacyTitle,
    description: copy.privacyDescription,
    alternates: pageAlternates(lang, "/privacy-policy"),
    robots: { index: true, follow: true },
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
