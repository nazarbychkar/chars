import type { Metadata } from "next";
import TermsOfServiceContent from "./TermsOfServiceContent";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://chars.ua";

export const metadata: Metadata = {
  title: "Договір публічної оферти | CHARS",
  description:
    "Договір публічної оферти CHARS. Умови використання сайту та покупки товарів. Ознайомтесь з правилами замовлення та доставки.",
  keywords: "CHARS, договір оферти, умови використання, правила замовлення, доставка",
  alternates: {
    canonical: `${baseUrl}/terms-of-service`,
    languages: {
      uk: `${baseUrl}/uk/terms-of-service`,
      de: `${baseUrl}/de/terms-of-service`,
      en: `${baseUrl}/en/terms-of-service`,
    },
  },
  openGraph: {
    title: "Договір публічної оферти | CHARS",
    description: "Договір публічної оферти CHARS",
    type: "website",
    url: `${baseUrl}/terms-of-service`,
    siteName: "CHARS",
    locale: "uk_UA",
    alternateLocale: ["de_DE", "en_US"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}

