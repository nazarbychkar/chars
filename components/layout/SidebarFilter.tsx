"use client";

import { useState } from "react";
import Link from "next/link";

interface SidebarFilterProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openAccordion: number | null;
  setOpenAccordion: React.Dispatch<React.SetStateAction<number | null>>;
  isDark: boolean;
}

export default function SidebarFilter({
  isOpen,
  setIsOpen,
  openAccordion,
  setOpenAccordion,
  isDark,
}: SidebarFilterProps) {
  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  return (
    <div className="relative z-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-147 ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        } shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          <div className="flex justify-between m-7">
            <div className="justify-center text-black text-2xl font-normal font-['Inter'] uppercase leading-normal">
              Фільтрувати-Сортувати За
            </div>

            <button
              className="cursor-pointer justify-center text-black text-2xl font-normal font-['Inter'] uppercase leading-normal"
              onClick={() => setIsOpen(false)}
            >
              x
            </button>
          </div>

          {/* Accordion Section 1 */}
          <div
            className="w-full hover:bg-gray-200 border-b px-7 p-3"
            onClick={() => toggleAccordion(1)}
          >
            <div className="flex justify-between">
              <span className="text-2xl font-normal font-['Inter'] uppercase leading-normal py-2 px-4 mb-3">
                Сортувати за
              </span>
              <span className="font-semibold py-2 px-4">+</span>
            </div>

            {openAccordion === 1 && (
              <div className="pl-6 space-y-2">
                <Link href="#item1" className="block hover:text-[#8C7461]">
                  Item 1
                </Link>
                <Link href="#item2" className="block hover:text-[#8C7461]">
                  Item 2
                </Link>
                <Link href="#item3" className="block hover:text-[#8C7461]">
                  Item 3
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Section 2 */}
          <div className="w-full hover:bg-gray-200 border-b px-7 p-3">
            <div
              className="flex justify-between m-3"
              onClick={() => toggleAccordion(2)}
            >
              <span className="text-2xl font-normal font-['Inter'] uppercase leading-normal py-2 px-4">
                Розмір
              </span>
              <span className="font-semibold py-2 px-4">+</span>
            </div>
            {openAccordion === 2 && (
              <div className="pl-6 space-y-2">
                <Link href="#item4" className="block hover:text-[#8C7461]">
                  Item 4
                </Link>
                <Link href="#item5" className="block hover:text-[#8C7461]">
                  Item 5
                </Link>
                <Link href="#item6" className="block hover:text-[#8C7461]">
                  Item 6
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Section 3 */}
          <div className="w-full hover:bg-gray-200 border-b px-7 p-3">
            <div
              className="flex justify-between m-3"
              onClick={() => toggleAccordion(3)}
            >
              <span className="text-2xl font-normal font-['Inter'] uppercase leading-normal py-2 px-4">Колір</span>
              <span className="font-semibold py-2 px-4">+</span>
            </div>
            {openAccordion === 3 && (
              <div className="pl-6 space-y-2 flex flex-col justify-start">
                <Link href="#item7" className="block hover:text-[#8C7461]">
                  Item 7
                </Link>
                <Link href="#item8" className="block hover:text-[#8C7461]">
                  Item 8
                </Link>
                <Link href="#item9" className="block hover:text-[#8C7461]">
                  Item 9
                </Link>
              </div>
            )}
          </div>

          {/* Accordion Section 4 */}
          <div className="w-full hover:bg-gray-200 border-b px-7 p-3">
            <div
              className="flex justify-between m-3"
              onClick={() => toggleAccordion(4)}
            >
              <span className="text-2xl font-normal font-['Inter'] uppercase leading-normal py-2 px-4">
                Вартість
              </span>
              <span className="font-semibold py-2 px-4">+</span>
            </div>
            {openAccordion === 4 && (
              <div className="pl-6 space-y-2">
                <Link href="#item10" className="block hover:text-[#8C7461]">
                  Item 7
                </Link>
                <Link href="#item11" className="block hover:text-[#8C7461]">
                  Item 8
                </Link>
                <Link href="#item12" className="block hover:text-[#8C7461]">
                  Item 9
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

<div className="w-[588px] h-[1006px] relative bg-white overflow-hidden">
  <div
    data-property-1="Default"
    className="w-10 h-10 left-[502px] top-[33px] absolute"
  >
    <div className="w-10 h-10 left-0 top-0 absolute overflow-hidden">
      <div className="w-10 h-10 left-0 top-0 absolute" />
      <div className="w-8 h-8 left-[5.76px] top-[5.76px] absolute bg-stone-900" />
    </div>
  </div>
  <div className="left-[48px] top-[889px] absolute inline-flex justify-start items-center gap-2">
    <div
      data-property-1="Default"
      className="w-52 h-16 p-2.5 outline outline-1 outline-offset-[-1px] outline-stone-900 flex justify-center items-center gap-2.5"
    >
      <div className="text-center justify-center">
        <span class="text-stone-900 text-xl font-medium font-['Inter'] capitalize leading-snug tracking-tight">
          очистити{" "}
        </span>
        <span class="text-stone-900 text-xl font-medium font-['Inter'] lowercase leading-snug tracking-tight">
          ВСЕ
        </span>
      </div>
    </div>
    <div
      data-property-1="Default"
      className="w-64 h-16 p-2.5 bg-stone-900 flex justify-center items-center gap-2.5"
    >
      <div className="text-center justify-center">
        <span class="text-white text-xl font-medium font-['Inter'] uppercase leading-snug tracking-tight">
          п
        </span>
        <span class="text-white text-xl font-medium font-['Inter'] lowercase leading-snug tracking-tight">
          ЕРЕГЛЯНУТИ (50)
        </span>
      </div>
    </div>
  </div>
  <div className="left-[46px] top-[42px] absolute justify-center text-black text-2xl font-normal font-['Inter'] uppercase leading-normal">
    Фільтрувати-Сортувати За
  </div>
  <div
    data-property-1="Default"
    className="w-[588px] left-0 top-[117px] absolute inline-flex flex-col justify-start items-center gap-8"
  >
    <div
      data-property-1="Variant2"
      className="self-stretch h-14 relative border-b border-black"
    >
      <div className="left-[46px] top-0 absolute justify-center text-black text-2xl font-normal font-['Inter'] uppercase leading-normal">
        Сортувати за
      </div>
      <div className="w-5 h-0 left-[531px] top-[2px] absolute origin-top-left rotate-90 outline outline-2 outline-offset-[-1px] outline-black"></div>
      <div className="w-5 h-0 left-[542px] top-[11px] absolute origin-top-left -rotate-180 outline outline-2 outline-offset-[-1px] outline-black"></div>
    </div>
    <div
      data-property-1="Variant2"
      className="self-stretch h-14 relative border-b border-black overflow-hidden"
    >
      <div className="left-[46px] top-0 absolute justify-center text-black text-2xl font-normal font-['Inter'] uppercase leading-normal">
        розмір
      </div>
      <div className="w-5 h-0 left-[530px] top-0 absolute origin-top-left rotate-90 outline outline-2 outline-offset-[-1px] outline-black"></div>
      <div className="w-5 h-0 left-[541px] top-[9px] absolute origin-top-left -rotate-180 outline outline-2 outline-offset-[-1px] outline-black"></div>
    </div>
    <div
      data-property-1="Variant2"
      className="self-stretch h-14 relative border-b border-stone-900 overflow-hidden"
    >
      <div className="left-[46px] top-0 absolute justify-center text-stone-900 text-2xl font-normal font-['Inter'] uppercase leading-normal">
        колір
      </div>
      <div className="w-5 h-0 left-[530px] top-0 absolute origin-top-left rotate-90 outline outline-2 outline-offset-[-1px] outline-stone-900"></div>
      <div className="w-5 h-0 left-[541px] top-[9px] absolute origin-top-left -rotate-180 outline outline-2 outline-offset-[-1px] outline-stone-900"></div>
    </div>
    <div
      data-property-1="Variant2"
      className="self-stretch h-14 relative border-b border-black overflow-hidden"
    >
      <div className="w-5 h-0 left-[541px] top-[9px] absolute origin-top-left -rotate-180 outline outline-2 outline-offset-[-1px] outline-black"></div>
      <div className="w-5 h-0 left-[532px] top-[20px] absolute origin-top-left -rotate-90 outline outline-2 outline-offset-[-1px] outline-black"></div>
      <div className="left-[46px] top-0 absolute justify-center text-black text-2xl font-normal font-['Inter'] uppercase leading-normal">
        ВАРТІСТЬ
      </div>
    </div>
  </div>
</div>;
