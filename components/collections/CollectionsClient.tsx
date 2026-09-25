"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAppContext } from "@/lib/GeneralProvider";
import SeasonList from "@/components/collections/SeasonList";

export default function CollectionsClient() {
  const { messages } = useI18n();
  const { isDark } = useAppContext();

  return (
    <section
      className={`site-shell site-px pb-16 pt-6 md:pt-10 ${
        isDark ? "text-white" : "text-[#072a6b]"
      }`}
    >
      <div className="max-w-2xl mx-auto mb-10 md:mb-14">
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-[0.02em] mb-4">
          {messages.collections.title}
        </h1>
        <p className="text-base md:text-lg opacity-75 leading-relaxed">
          {messages.collections.subtitle}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <SeasonList variant="page" />
      </div>
    </section>
  );
}
