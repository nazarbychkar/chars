"use client";

import Link from "next/link";

interface SidebarMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDark: boolean;
}

export default function SidebarMenu({
  isOpen,
  setIsOpen,
  isDark,
}: SidebarMenuProps) {
  return (
    <div className="relative z-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-128 ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        }  shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col p-6 m-5 space-y-4 text-3xl gap-3">
          <div className="flex justify-between">
            <Link href="#home" className=" hover:text-[#8C7461]">
              Усі
            </Link>
            <button className="cursor-pointer hover:text-[#8C7461]" onClick={() => setIsOpen(false)}>x</button>
          </div>

          <Link href="#about" className=" hover:text-[#8C7461]">
            Сезон -&gt;
          </Link>
          <Link href="#services" className=" hover:text-[#8C7461]">
            Жилетки
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Головні убори
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Пальта
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Лімітований одяг
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Спортивний одяг
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Футболки
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Майки
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Штани
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Сорочки
          </Link>
          <Link href="#contact" className=" hover:text-[#8C7461]">
            Джинси
          </Link>
        </nav>
      </div>
    </div>
  );
}
