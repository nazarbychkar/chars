"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function AboutUs() {
  const { messages } = useI18n();

  return (
    <section
      id="about"
      className="scroll-mt-20 max-w-[1920px] mx-auto w-full px-4 py-12 lg:h-[625px] relative overflow-hidden flex flex-col items-center gap-8 lg:gap-15 justify-center"
    >
      {/* Title */}
      <div className="text-[#8C7461] text-center text-2xl lg:text-5xl font-medium lg:font-normal lg:font-['Inter'] uppercase">
        {messages.home.aboutTitle}
      </div>

      {/* Text Block */}
      <div className="max-w-[90%] lg:w-[1743px] text-center text-sm lg:text-3xl font-normal lg:font-['Inter'] leading-snug lg:leading-13 whitespace-pre-line">
        {messages.home.aboutText}
      </div>
    </section>
  );
}
