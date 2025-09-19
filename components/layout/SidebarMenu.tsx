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
        className={`fixed top-0 left-0 h-full w-64 ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        }  shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="p-6 space-y-4 text-2xl font-medium">
          <Link href="#home" className="block hover:text-[#8C7461]">
            Усі
          </Link>
          <Link href="#about" className="block hover:text-[#8C7461]">
            Сезон -&gt;
          </Link>
          <Link href="#services" className="block hover:text-[#8C7461]">
            Жилетки
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Головні убори
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Пальта
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Лімітований одяг
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Спортивний одяг
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Футболки
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Майки
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Штани
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Сорочки
          </Link>
          <Link href="#contact" className="block hover:text-[#8C7461]">
            Джинси
          </Link>
        </nav>
      </div>
    </div>
  );
}
