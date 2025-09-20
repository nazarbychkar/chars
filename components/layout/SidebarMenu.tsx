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
            <Link
              href="/catalog"
              className=" hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              Усі
            </Link>
            <button
              className="cursor-pointer hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              x
            </button>
          </div>

          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Сезон -&gt;
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Жилетки
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Головні убори
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Пальта
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Лімітований одяг
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Спортивний одяг
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Футболки
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Майки
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Штани
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Сорочки
          </Link>
          <Link
            href="/catalog"
            className=" hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            Джинси
          </Link>
        </nav>
      </div>
    </div>
  );
}
