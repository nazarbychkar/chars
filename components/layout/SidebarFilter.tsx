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
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        } shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl sm:text-2xl uppercase font-semibold">
              Фільтрувати / Сортувати
            </div>
            <button
              className="text-2xl sm:text-3xl hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Accordion Items */}
          {[
            { title: "Сортувати за", items: ["Item 1", "Item 2", "Item 3"] },
            { title: "Розмір", items: ["Item 4", "Item 5", "Item 6"] },
            { title: "Колір", items: ["Item 7", "Item 8", "Item 9"] },
            { title: "Вартість", items: ["Item 10", "Item 11", "Item 12"] },
          ].map((section, index) => {
            const sectionIndex = index + 1;
            const isOpenAccordion = openAccordion === sectionIndex;

            return (
              <div
                key={sectionIndex}
                className="w-full border-b px-2 sm:px-4 py-3 hover:bg-gray-200 transition"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleAccordion(sectionIndex)}
                >
                  <span className="text-xl sm:text-2xl uppercase">
                    {section.title}
                  </span>
                  <span className="font-semibold text-xl sm:text-2xl">
                    {isOpenAccordion ? "−" : "+"}
                  </span>
                </div>

                {isOpenAccordion && (
                  <div className="pl-4 mt-2 space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        href={`#item${sectionIndex}-${itemIndex}`}
                        className="block hover:text-[#8C7461] text-base sm:text-lg"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
