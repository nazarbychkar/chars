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
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-4/5 sm:max-w-md ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        } shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
      >
        <nav className="flex flex-col px-4 py-6 space-y-4 text-xl sm:text-2xl md:text-3xl">
          {/* Header with close */}
          <div className="flex justify-between items-center mb-2">
            <Link
              href="/catalog"
              className="hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              Усі
            </Link>
            <button
              className="text-2xl sm:text-3xl cursor-pointer hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Links */}
          {[
            "Сезон ->",
            "Жилетки",
            "Головні убори",
            "Пальта",
            "Лімітований одяг",
            "Спортивний одяг",
            "Футболки",
            "Майки",
            "Штани",
            "Сорочки",
            "Джинси",
          ].map((text, idx) => (
            <Link
              href={`/catalog?category=${encodeURIComponent(text)}`}
              key={idx}
              className="hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              {text}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
