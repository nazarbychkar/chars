"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function PurchaseInPartsContent() {
  const { messages, withLocalePath } = useI18n();
  const t = messages.purchaseInParts;

  return (
    <div className="site-shell site-px min-h-screen py-16 md:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 md:mb-16">
          <Link
            href={withLocalePath("/")}
            className="mb-8 inline-block text-lg opacity-60 transition-opacity duration-300 hover:opacity-100"
          >
            ← {messages.common.backToHome}
          </Link>
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            {t.title}
          </h1>
          <p className="text-lg opacity-70 md:text-xl">{t.subtitle}</p>
          <div className="mt-6 h-1 w-20 bg-black dark:bg-white" />
        </div>

        <div className="space-y-10 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold md:text-3xl">{t.providerTitle}</h2>
            <p className="opacity-80">{t.providerBody}</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold md:text-3xl">{t.productTitle}</h2>
            <ul className="list-disc space-y-2 pl-5 opacity-80">
              {t.productItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-3 rounded-sm border border-black/10 p-5 dark:border-white/15 md:p-6">
            <h2 className="text-xl font-semibold md:text-2xl">{t.highlightTitle}</h2>
            <p className="text-lg font-medium">{t.highlightBody}</p>
            <p className="text-sm opacity-70 md:text-base">{t.legalRate}</p>
            <p className="text-xs opacity-60 md:text-sm">{t.legalBank}</p>
          </section>

          <p className="text-sm opacity-60">
            {t.moreInfo}{" "}
            <a
              href="https://chast.monobank.ua"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:opacity-100"
            >
              chast.monobank.ua
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
