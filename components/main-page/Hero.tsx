"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import { useAppContext } from "@/lib/Provider";

export default function Hero() {
  const { isDark, isSiderbarOpen, setIsSiderbarOpen } = useAppContext();

  return (
    <section>
      <div className="w-[1920px] h-[1080px] bg-[url('/images/hero-bg.png')] bg-cover bg-center">
        <div className="flex flex-col justify-evenly p-35 gap-70">
          <div className=" mx-auto relative w-[1046px] h-52">
            <div className="absolute inset-0 bg-black/40 rounded-full blur-[88.5px] z-0" />

            <div className="relative z-10 flex items-center justify-center h-full text-white text-7xl font-medium font-['Montserrat'] uppercase text-center">
              Тиша у формі тканини <br /> CHARS
            </div>
          </div>

          <button
            onClick={() => setIsSiderbarOpen(!isSiderbarOpen)}
            className="cursor-pointer mx-auto w-72 h-16 p-2 bg-white inline-flex justify-center items-center gap-2 hover:opacity-50 transition-opacity duration-300"
          >
            <div className="text-center justify-center text-stone-900 text-2xl font-normal font-['Inter'] capitalize leading-none tracking-tight">
              Каталог
            </div>
          </button>
        </div>
      </div>

      <SidebarMenu
        isDark={isDark}
        isOpen={isSiderbarOpen}
        setIsOpen={setIsSiderbarOpen}
      />
    </section>
  );
}
