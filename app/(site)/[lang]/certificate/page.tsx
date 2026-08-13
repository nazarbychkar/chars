import type { Metadata } from "next";
import CertificateClient from "@/components/certificate/CertificateClient";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BreadcrumbsSchema from "@/components/shared/BreadcrumbsSchema";
import {
  getSiteUrl,
  pageAlternates,
  parseLangParam,
  seoCopy,
} from "@/lib/i18n/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  return {
    title: copy.certificateTitle,
    description: copy.certificateDescription,
    alternates: pageAlternates(lang, "/certificate"),
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = parseLangParam((await params).lang);
  const copy = seoCopy[lang];
  const baseUrl = getSiteUrl();
  const breadcrumbItems = [
    { label: copy.breadcrumbHome, href: `/${lang}` },
    { label: copy.breadcrumbCertificate, href: `/${lang}/certificate` },
  ];

  return (
    <main>
      <div className="site-shell site-px pt-2">
        <Breadcrumbs items={breadcrumbItems} className="mb-3" />
        <BreadcrumbsSchema items={breadcrumbItems} baseUrl={baseUrl} />
      </div>
      <CertificateClient />
    </main>
  );
}
