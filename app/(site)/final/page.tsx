import FinalCard from "@/components/final-card/FinalCard";
import type { Metadata } from "next";
import { Suspense } from "react";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://chars.ua';

export const metadata: Metadata = {
  title: "Оформлення замовлення | CHARS",
  description: "Оформлення замовлення в CHARS. Заповніть форму для завершення покупки. Доставка по всій Україні.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${baseUrl}/final`,
  },
};

export default function Page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
                    <p className="text-base md:text-lg opacity-70">Завантаження...</p>
                </div>
            </div>
        }>
            <FinalCard />
        </Suspense>
    );
}