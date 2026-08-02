"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import BrandMark from "@/components/shared/BrandMark";
import { useAppContext } from "@/lib/GeneralProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Hero() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const { messages } = useI18n();

  return (
    <section>
      <div className="relative mx-auto h-[100svh] max-h-[100svh] w-full max-w-[1920px] overflow-hidden">
        <img
          src="/images/hero-photo.jpg"
          alt="CHARS hero background"
          className="absolute inset-0 h-full w-full object-cover object-center md:inset-auto md:bottom-auto md:left-0 md:right-0 md:top-[calc(-100%_*_10_/_85)] md:h-[calc(100%_/_0.6)] md:w-full"
          style={{ zIndex: 1 }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
          style={{ zIndex: 2 }}
        />
        <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center px-6 pb-8 pt-24 text-center text-white sm:pb-10 sm:pt-28 md:pb-12 md:pt-24">
          <div className="mb-3 flex justify-center sm:mb-4">
            <BrandMark
              variant="light"
              size={56}
              className="h-9 w-auto drop-shadow-md sm:h-11 md:h-12"
              priority
            />
          </div>
          <h1 className="mx-auto max-w-5xl text-4xl font-semibold uppercase leading-[0.95] tracking-[0.04em] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
            <span className="block font-sans text-xs font-semibold uppercase tracking-[0.4em] text-white/85 sm:text-sm md:text-base">
              chars
            </span>
            <span className="mt-2 block font-sans [text-wrap:balance] sm:mt-3 md:mt-4">
              Freedom looks better on you
            </span>
          </h1>
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-white/90 sm:mt-5 sm:text-base md:mt-5 md:text-lg lg:text-xl">
            New Collection
          </p>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mt-6 inline-flex h-12 w-52 cursor-pointer items-center justify-center border border-white/90 bg-transparent px-4 text-white transition-colors duration-300 hover:bg-white/10 sm:mt-8 sm:h-14 sm:w-56 md:mt-8 md:h-14 md:w-60 lg:h-16 lg:w-64"
          >
            <div className="text-center font-sans text-base font-medium uppercase leading-none tracking-[0.08em] sm:text-lg md:text-xl">
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
