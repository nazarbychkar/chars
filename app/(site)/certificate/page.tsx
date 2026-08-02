import type { Metadata } from "next";
import CertificateClient from "@/components/certificate/CertificateClient";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import BreadcrumbsSchema from "@/components/shared/BreadcrumbsSchema";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://charsua.com";

export const metadata: Metadata = {
  title: "Подарунковий сертифікат | CHARS — Український Бренд Чоловічого Одягу",
  description:
    "Подарунковий сертифікат CHARS — ідеальний подарунок для поціновувачів стилю. Оберіть номінал від 2 000 до 20 000 грн та оплатіть онлайн.",
  alternates: {
    canonical: `${baseUrl}/certificate`,
    languages: {
      uk: `${baseUrl}/uk/certificate`,
      de: `${baseUrl}/de/certificate`,
      en: `${baseUrl}/en/certificate`,
    },
  },
};

export default function CertificatePage() {
  const breadcrumbItems = [
    { label: "Головна", href: "/" },
    { label: "Сертифікат", href: "/certificate" },
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
