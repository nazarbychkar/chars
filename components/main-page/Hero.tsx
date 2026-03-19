"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import { useAppContext } from "@/lib/GeneralProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function Hero() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const { messages } = useI18n();

  return (
    <section>
      <div className="max-w-[1920px] mx-auto w-full h-screen sm:h-[720px] md:h-[900px] lg:h-[1080px] relative overflow-hidden">
        <img
          src="/images/hero-photo.jpg"
          alt="CHARS hero background"
          className="absolute inset-0 h-full w-full object-cover object-center md:inset-auto md:bottom-auto md:left-0 md:right-0 md:top-[calc(-100%_*_15_/_85)] md:h-[calc(100%_/_0.55)] md:w-full"
          style={{ zIndex: 1 }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
          style={{ zIndex: 2 }}
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[58%] w-full max-w-6xl -translate-x-1/2 -translate-y-1/2 px-6 text-center text-white md:top-[47%] lg:top-[45%]"
          style={{ zIndex: 3 }}
        >
          <h1 className="mx-auto max-w-5xl text-5xl font-semibold uppercase leading-[0.95] tracking-[0.04em] sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block font-sans text-xs font-semibold uppercase tracking-[0.4em] text-white/85 sm:text-sm md:text-base">
              chars
            </span>
            <span className="mt-3 block font-sans [text-wrap:balance] sm:mt-4">
              Freedom looks better on you
            </span>
          </h1>
          <p className="mt-5 text-base font-medium uppercase tracking-[0.18em] text-white/90 sm:text-lg md:mt-6 md:text-xl">
            New Collection
          </p>
        </div>

        <div
          className="absolute bottom-14 left-1/2 z-10 -translate-x-1/2 sm:bottom-16 md:bottom-auto md:top-[63%] lg:top-[61%]"
          style={{ zIndex: 4 }}
        >
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="cursor-pointer inline-flex h-12 w-52 items-center justify-center border border-white/90 bg-transparent px-4 text-white transition-colors duration-300 hover:bg-white/10 sm:h-14 sm:w-56 md:h-16 md:w-64"
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
