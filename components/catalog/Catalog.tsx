"use client";

import { JSX, useState } from "react";
import SidebarFilter from "../layout/SidebarFilter";
import { useAppContext } from "@/lib/GeneralProvider";
import SidebarMenu from "../layout/SidebarMenu";
import Image from "next/image";
import Link from "next/link";

export default function Catalog() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  return (
    <>
      <section className="m-15 mt-30">
        <div className="flex justify-between text-3xl">
          <div className="flex justify-start">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer"
            >
              {"<"}
            </button>
            <span>Категорія Усі</span>
          </div>

          <button
            className="cursor-pointer"
            onClick={() => setIsFilterOpen(true)}
          >
            Фільтри
          </button>
        </div>

        <div className="flex flex-col"></div>
        {Array.from({ length: 3 }, (_, i) => (
          <div className="flex justify-between my-10" key={i}>
            {Array.from({ length: 4 }, (_, q) => (
              <Link href="/product" key={q} className="flex flex-col gap-5 group">
                {/* <Image
                  className="w-96 h-[613px] left-0 top-0 absolute"
                  width={384}
                  height={613}
                  src="https://placehold.co/432x613"
                  alt="photo of a product"
                ></Image> */}

                <div className="w-103 h-[613px] bg-gray-200 group-hover:filter group-hover:brightness-90 transition brightness duration-300" />

                <span className="text-xl">
                  Шовкова Сорочка Без рукавів<br /> 1780.00₴
                </span>
              </Link>
            ))}
          </div>
        ))}
      </section>

      <SidebarFilter
        isDark={isDark}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        openAccordion={openAccordion}
        setOpenAccordion={setOpenAccordion}
      />

      <SidebarMenu
        isDark={isDark}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </>
  );
}
