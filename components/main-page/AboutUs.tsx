"use client";

import { useAppContext } from "@/lib/GeneralProvider";
import BrandMark from "@/components/shared/BrandMark";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function AboutUs() {
  const { messages } = useI18n();
  const { isDark } = useAppContext();

  return (
    <section
      id="about"
      className="scroll-mt-20 site-shell site-px py-12 lg:min-h-[625px] relative overflow-hidden flex flex-col items-center gap-6 lg:gap-10 justify-center"
    >
      <BrandMark size={64} className="h-14 lg:h-16 w-auto opacity-90" />
      <div
        className={`font-display text-center text-3xl lg:text-5xl font-medium tracking-[0.04em] ${
          isDark ? "text-white" : "text-[#072a6b]"
        }`}
      >
        {messages.home.aboutTitle}
      </div>

      <div className="max-w-[90%] lg:w-[1100px] text-center text-sm lg:text-2xl font-normal leading-relaxed whitespace-pre-line opacity-90">
        {messages.home.aboutText}
      </div>
    </section>
  );
}
