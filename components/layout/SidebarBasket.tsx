"use client";

import Link from "next/link";

interface SidebarBasketProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDark: boolean;
}

export default function SidebarBasket({
  isOpen,
  setIsOpen,
  isDark,
}: SidebarBasketProps) {
  return (
    <div className="relative z-50">
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-4/5 sm:max-w-md ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        } shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
      >
        <nav className="flex flex-col p-4 sm:p-6 space-y-6 text-base sm:text-lg">
          {/* Header */}
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold">
            <span>Кошик</span>
            <button
              className="hover:text-[#8C7461] text-2xl"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Basket Items */}
          <div className="flex flex-col gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="flex gap-4 border-b pb-4 last:border-none"
              >
                <img
                  src="https://placehold.co/114x160"
                  alt="product"
                  className="w-24 h-32 object-cover"
                />
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <p className="text-base font-medium">
                      LIMITED Виварені спортивні худі
                    </p>
                    <p className="text-zinc-600 mt-1">3,380.00 ₴</p>
                    <p className="text-stone-900 mt-1">Розмір: S</p>
                  </div>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-neutral-400/60 w-24 h-9 justify-between px-2">
                      <button className="text-zinc-500 text-lg">−</button>
                      <span>1</span>
                      <button className="text-zinc-500 text-lg">+</button>
                    </div>
                    <button className="text-red-600 text-xl font-bold">×</button>
                  </div>
                </div>
              </div>
            ))}

            {/* Checkout Button */}
            <Link
              href="/final"
              className={`text-center py-3 rounded-md mt-4 ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              }`}
            >
              Оформити замовлення
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
