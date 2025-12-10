import dynamic from "next/dynamic";
import Hero from "@/components/main-page/Hero";
import TopSaleServer from "@/components/main-page/TopSaleServer";
import { Suspense } from "react";
import type { Metadata } from "next";

// Lazy load components that are below the fold
const AboutUs = dynamic(() => import("@/components/main-page/AboutUs"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const LimitedEdition = dynamic(() => import("@/components/main-page/LimitedEdition"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const FAQ = dynamic(() => import("@/components/main-page/FAQ"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const SocialMedia = dynamic(() => import("@/components/main-page/SocialMedia"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const WhyChooseUs = dynamic(() => import("@/components/main-page/WhyChooseUs"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const Reviews = dynamic(() => import("@/components/main-page/Reviews"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});

export const revalidate = 300; // ISR every 5 minutes

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chars.ua';

export const metadata: Metadata = {
  title: "Головна | CHARS — Український Бренд Чоловічого Одягу",
  description:
    "CHARS — український бренд чоловічого одягу, заснований у 2023 році. Ми створюємо стильний одяг для різних чоловіків без компромісів. Класика, кежуал та спорт. Замовляйте онлайн з доставкою по Україні.",
  keywords:
    "CHARS, український бренд одягу, чоловічий одяг, стильний одяг, смарт-кежуал, кежуал-класик, українська мода, одяг для чоловіків, київ, купити одяг онлайн, доставка по Україні",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "CHARS — Український Бренд Чоловічого Одягу",
    description:
      "Стильний чоловічий одяг без компромісів. Класика, кежуал та спорт. Замовляйте онлайн з доставкою по Україні.",
    type: "website",
    url: baseUrl,
    siteName: "CHARS",
    locale: "uk_UA",
    images: [
      {
        url: `${baseUrl}/images/light-theme/chars-logo-header-light.png`,
        width: 1200,
        height: 630,
        alt: "CHARS — Український Бренд Чоловічого Одягу",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CHARS — Український Бренд Чоловічого Одягу",
    description: "Стильний чоловічий одяг без компромісів. Класика, кежуал та спорт.",
    images: [`${baseUrl}/images/light-theme/chars-logo-header-light.png`],
  },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження топових товарів...</div>}>
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
