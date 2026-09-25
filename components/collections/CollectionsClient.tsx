"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useAppContext } from "@/lib/GeneralProvider";
import { SEASON_CARDS, type SeasonValue } from "@/lib/seasons";

function seasonLabel(
  value: SeasonValue,
  messages: ReturnType<typeof useI18n>["messages"]
): string {
  switch (value) {
    case "Літо":
      return messages.header.seasonSummer;
    case "Осінь":
      return messages.header.seasonAutumn;
    case "Зима":
      return messages.header.seasonWinter;
    case "Весна":
      return messages.header.seasonSpring;
  }
}

export default function CollectionsClient() {
  const { messages, withLocalePath } = useI18n();
  const { isDark } = useAppContext();

  return (
    <section
      className={`site-shell site-px pb-16 pt-6 md:pt-10 ${
        isDark ? "text-white" : "text-[#072a6b]"
      }`}
    >
      <div className="max-w-2xl mx-auto mb-8 md:mb-12 text-center">
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-[0.02em] mb-4">
          {messages.collections.title}
        </h1>
        <p className="text-base md:text-lg opacity-75 leading-relaxed">
          {messages.collections.subtitle}
        </p>
      </div>

      <div className="mx-auto w-full max-w-3xl md:max-w-4xl">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
        {SEASON_CARDS.map((season) => {
          const label = seasonLabel(season.value, messages);
          const href = withLocalePath(
            `/catalog?season=${encodeURIComponent(season.value)}`
          );

          return (
            <Link
              key={season.value}
              href={href}
              className="group relative aspect-[3/4] sm:aspect-[5/6] md:aspect-[4/5] overflow-hidden rounded-sm"
            >
              <Image
                src={season.image}
                alt={label}
                fill
                sizes="(max-width: 768px) 45vw, 320px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                priority={season.value === "Літо"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10 transition-opacity duration-500 group-hover:from-black/75" />
              <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 md:p-5">
                <h2 className="font-display text-white text-lg sm:text-xl md:text-2xl font-medium tracking-[0.02em] mb-1">
                  {label}
                </h2>
                <span className="text-white/85 text-[10px] sm:text-xs md:text-sm tracking-[0.12em] uppercase inline-flex items-center gap-1.5">
                  {messages.collections.viewCollection}
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
            </Link>
          );
        })}
        </div>
      </div>
    </section>
  );
}
