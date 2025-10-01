"use client";

import { JSX, useState } from "react";
import SidebarFilter from "../layout/SidebarFilter";
import { useAppContext } from "@/lib/GeneralProvider";
import SidebarMenu from "../layout/SidebarMenu";
import Link from "next/link";

export default function Catalog() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  return (
    <>
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 mt-10 mb-20">
        {/* Top Controls */}
        <div className="flex justify-between items-center text-xl sm:text-2xl md:text-3xl mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer text-2xl sm:text-3xl"
            >
              {"<"}
            </button>
            <span>Категорія Усі</span>
          </div>

          <button
            className="cursor-pointer text-base sm:text-lg"
            onClick={() => setIsFilterOpen(true)}
          >
            Фільтри
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }, (_, i) => (
            <Link href="/product" key={i} className="flex flex-col gap-4 group">
              {/* Image Placeholder */}
              <div className="w-full aspect-[2/3] bg-gray-200 group-hover:filter group-hover:brightness-90 transition duration-300" />

              {/* Product Title + Price */}
              <span className="text-base sm:text-lg">
                Шовкова Сорочка Без рукавів<br /> 1780.00₴
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Filters Sidebar */}
      <SidebarFilter
        isDark={isDark}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        openAccordion={openAccordion}
        setOpenAccordion={setOpenAccordion}
      />

      {/* Menu Sidebar */}
      <SidebarMenu
        isDark={isDark}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </>
  );
}
