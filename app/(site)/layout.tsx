import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CHARS — Український Бренд Чоловічого Одягу | Стиль Без Компромісів",
  description:
    "CHARS — український бренд чоловічого одягу, заснований у 2023 році. Ми створюємо стильний одяг для різних чоловіків без компромісів. Класика, кежуал та спорт.",
  keywords:
    "CHARS, український бренд одягу, чоловічий одяг, стильний одяг, смарт-кежуал, кежуал-класик, українська мода, одяг для чоловіків, київ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={inter.className}>
      <body>
        <AppProvider>
          <BasketProvider>
            <Header />
            <main className="mt-20">{children}</main>
            <Footer />
          </BasketProvider>
        </AppProvider>
      </body>
    </html>
  );
}
