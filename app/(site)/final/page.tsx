import FinalCard from "@/components/final-card/FinalCard";
import type { Metadata } from "next";

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
    return <FinalCard />
}