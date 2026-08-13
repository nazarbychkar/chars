"use client";

import Link from "next/link";
import BrandMark from "@/components/shared/BrandMark";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function NotFound() {
  const { messages, withLocalePath } = useI18n();

  return (
    <div className="site-shell site-px min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border border-black dark:border-white rounded-full" />
        <div className="absolute top-40 right-32 w-24 h-24 border border-black dark:border-white rounded-full" />
        <div className="absolute bottom-32 left-40 w-20 h-20 border border-black dark:border-white rounded-full" />
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-black dark:border-white rounded-full" />
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        <div className="mb-8 flex justify-center">
          <BrandMark size={72} className="h-16 w-auto md:h-20" />
        </div>

        <div className="mb-12 relative">
          <div className="font-display text-[200px] md:text-[300px] font-bold leading-none tracking-widest opacity-10 dark:opacity-20">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl md:text-9xl font-bold mb-4 tracking-tight">
              404
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {messages.common.notFoundTitle}
          </h1>
          <p className="text-xl md:text-2xl opacity-70 max-w-2xl mx-auto leading-relaxed">
            {messages.common.notFoundDescription}
          </p>
        </div>

        <div className="w-32 h-1 bg-black dark:bg-white mx-auto mb-12" />

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link
            href={withLocalePath("/")}
            className="group px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
          >
            <span className="relative z-10">{messages.common.backToHome}</span>
          </Link>
          <Link
            href={withLocalePath("/catalog")}
            className="group px-10 py-5 border-2 border-black dark:border-white rounded-full font-semibold text-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 relative overflow-hidden"
          >
            <span className="relative z-10">
              {messages.common.notFoundCatalog}
            </span>
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
          <p className="text-sm opacity-50">{messages.common.notFoundHint}</p>
          <Link
            href="mailto:Charsukrainianbrand@gmail.com"
            className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-300 mt-2 inline-block"
          >
            Charsukrainianbrand@gmail.com
          </Link>
        </div>
      </div>
    </div>
  );
}
