"use client";

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