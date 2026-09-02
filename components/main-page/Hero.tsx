"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import { useAppContext } from "@/lib/GeneralProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Hero() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const { messages } = useI18n();

  return (
    <section>
      <div className="relative mx-auto h-[100svh] w-full max-w-[1920px] overflow-hidden">
        <picture>
          <source
            media="(min-width: 768px)"
            type="image/webp"
            srcSet="/images/hero-desktop.webp"
          />
          <source
            media="(min-width: 768px)"
            type="image/jpeg"
            srcSet="/images/hero-desktop.jpg"
          />
          <source type="image/webp" srcSet="/images/hero-mobile.webp" />
          <img
            src="/images/hero-mobile.jpg"
            alt="CHARS hero background"
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ zIndex: 1 }}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
          style={{ zIndex: 2 }}
        />
        <div className="absolute inset-x-0 top-[52%] z-[3] flex flex-col items-center px-6 text-center text-white sm:top-[52%] md:top-[50%] lg:top-[48%]">
          <h1 className="font-display mx-auto max-w-4xl text-[2.75rem] font-normal italic leading-[1.05] tracking-[0.01em] sm:text-5xl md:text-6xl lg:text-[4.25rem] [text-wrap:balance]">
            Freedom looks better on you
          </h1>
          <p className="mt-6 font-sans text-[0.6875rem] font-medium uppercase tracking-[0.42em] text-white/85 sm:mt-6 sm:text-[0.6875rem] md:mt-7 md:text-xs md:tracking-[0.44em]">
            New Autumn Collection
          </p>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mt-8 cursor-pointer inline-flex h-12 w-52 items-center justify-center border border-white/90 bg-transparent px-4 text-white transition-colors duration-300 hover:bg-white hover:text-[#072a6b] sm:mt-8 sm:h-12 sm:w-52 md:h-14 md:w-56"
          >
            <div className="text-center font-sans text-base font-medium uppercase leading-none tracking-[0.08em] sm:text-base md:text-lg">
              {messages.home.heroCatalogButton}
            </div>
          </button>
        </div>
      </div>

      <SidebarMenu
        isDark={isDark}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </section>
  );
}
