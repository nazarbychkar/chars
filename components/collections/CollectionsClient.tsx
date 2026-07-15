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
      className={`max-w-[1920px] w-full mx-auto px-4 md:px-10 pb-16 pt-6 md:pt-10 ${
        isDark ? "text-white" : "text-black"
      }`}
    >
      <div className="max-w-2xl mx-auto mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-['Inter'] font-normal tracking-tight mb-4">
          {messages.collections.title}
        </h1>
        <p className="text-base md:text-lg opacity-75 font-['Inter'] leading-relaxed">
          {messages.collections.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
        {SEASON_CARDS.map((season) => {
          const label = seasonLabel(season.value, messages);
          const href = withLocalePath(
            `/catalog?season=${encodeURIComponent(season.value)}`
          );

          return (
            <Link
              key={season.value}
              href={href}
              className="group relative aspect-[4/5] sm:aspect-[5/4] md:aspect-[16/10] overflow-hidden"
            >
              <Image
                src={season.image}
                alt={label}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 900px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                priority={season.value === "Літо"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10 transition-opacity duration-500 group-hover:from-black/75" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8">
                <h2 className="text-white text-2xl md:text-4xl font-['Inter'] tracking-wide mb-2">
                  {label}
                </h2>
                <span className="text-white/85 text-sm md:text-base font-['Inter'] tracking-[0.12em] uppercase inline-flex items-center gap-2">
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
    </section>
  );
}
