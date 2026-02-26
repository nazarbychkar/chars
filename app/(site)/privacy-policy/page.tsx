import type { Metadata } from "next";
import PrivacyPolicyContent from "./PrivacyPolicyContent";

const baseUrl = process.env.PUBLIC_URL || "https://charsua.com/";

export const metadata: Metadata = {
  title: "Політика конфіденційності | CHARS",
  description:
    "Політика конфіденційності персональних даних CHARS. Дізнайтеся, як ми збираємо, використовуємо та захищаємо ваші персональні дані.",
  keywords: "CHARS, політика конфіденційності, захист даних, персональні дані, GDPR",
  alternates: {
    canonical: `${baseUrl}/privacy-policy`,
    languages: {
      uk: `${baseUrl}/uk/privacy-policy`,
      de: `${baseUrl}/de/privacy-policy`,
      en: `${baseUrl}/en/privacy-policy`,
    },
  },
  openGraph: {
    title: "Політика конфіденційності | CHARS",
    description: "Політика конфіденційності персональних даних CHARS",
    type: "website",
    url: `${baseUrl}/privacy-policy`,
    siteName: "CHARS",
    locale: "uk_UA",
    alternateLocale: ["de_DE", "en_US"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}

