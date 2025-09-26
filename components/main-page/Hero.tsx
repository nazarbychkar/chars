"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import { useAppContext } from "@/lib/GeneralProvider";

export default function Hero() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();

  return (
    <section>
      <div className="max-w-[1920px] mx-auto w-full h-[600px] sm:h-[720px] md:h-[900px] lg:h-[1080px] bg-[url('/images/hero-bg.png')] bg-cover bg-center">
        <div className="flex flex-col justify-evenly p-10 md:p-35 gap-55 md:gap-70">
          <div className=" mx-auto relative lg:w-[1046px] h-52">
            <div className="absolute inset-0 bg-black/40 rounded-full blur-[88.5px] z-0" />

            <div className="relative z-10 flex items-center justify-center h-full text-white text-3xl md:text-7xl font-medium font-['Montserrat'] uppercase text-center">
              Тиша у формі тканини <br /> CHARS
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="cursor-pointer mx-auto w-40 sm:w-52 md:w-60 lg:w-72 h-12 sm:h-14 md:h-16 lg:h-16 p-2 bg-white inline-flex justify-center items-center gap-2 hover:opacity-50 transition-opacity duration-300"
          >
            <div className="text-center justify-center text-stone-900 text-base sm:text-lg md:text-xl lg:text-2xl font-normal font-['Inter'] capitalize leading-none tracking-tight">
              Каталог
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
