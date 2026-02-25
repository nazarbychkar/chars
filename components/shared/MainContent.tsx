"use client";

import { usePathname } from "next/navigation";
import { getLocaleFromPath } from "@/lib/i18n/config";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const localeFromPath = getLocaleFromPath(pathname);

  // Treat /, /uk, /de, /en (and with trailing /) as home without top margin,
  // all other routes get top margin to clear the fixed header.
  const isHomePage =
    pathname === "/" ||
    pathname === `/${localeFromPath}` ||
    pathname === `/${localeFromPath}/`;

  return (
    <main className={isHomePage ? "" : "mt-16 lg:mt-20"}>
      {children}
    </main>
  );
}

