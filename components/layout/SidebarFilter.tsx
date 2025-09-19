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
        className={`fixed top-0 right-0 h-full w-128 ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        } shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 space-y-4">
          {/* Accordion Section 1 */}
          <div>
            <button
              className="w-full text-left font-semibold py-2 px-4 hover:bg-gray-200"
              onClick={() => toggleAccordion(1)}
            >
              Category 1
            </button>
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
          <div>
            <button
              className="w-full text-left font-semibold py-2 px-4 hover:bg-gray-200"
              onClick={() => toggleAccordion(2)}
            >
              Category 2
            </button>
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
          <div>
            <button
              className="w-full text-left font-semibold py-2 px-4 hover:bg-gray-200"
              onClick={() => toggleAccordion(3)}
            >
              Category 3
            </button>
            {openAccordion === 3 && (
              <div className="pl-6 space-y-2">
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
        </div>
      </div>
    </div>
  );
}
