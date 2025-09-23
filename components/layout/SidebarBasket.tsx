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
        className={`fixed top-0 left-0 h-full w-128 ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        }  shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex flex-col p-6 m-5 space-y-4 text-3xl gap-3">
          <div className="flex justify-between">
            <span>Кошик</span>
            <button
              className="cursor-pointer hover:text-[#8C7461]"
              onClick={() => setIsOpen(false)}
            >
              x
            </button>
          </div>
          <div className="flex flex-col">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="self-stretch h-48 relative">
                <div className="left-[143px] top-0 absolute justify-center text-stone-900 text-base font-normal font-['Inter'] leading-normal">
                  LIMITED Виварені спортивні худі
                </div>
                <img
                  className="w-28 h-40 left-0 top-0 absolute"
                  src="https://placehold.co/114x160"
                />
                <div className="left-[143px] top-[28px] absolute justify-center text-zinc-600 text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                  3,380.00 ₴
                </div>
                <div className="left-[143px] top-[58px] absolute justify-center text-stone-900 text-base font-normal font-['Helvetica'] leading-relaxed tracking-wide">
                  S
                </div>
                <div className="w-7 h-7 left-[248px] top-[93px] absolute overflow-hidden">
                  <div className="w-7 h-7 left-0 top-0 absolute" />
                  <div className="w-5 h-6 left-[4.08px] top-[2.33px] absolute bg-red-600" />
                  <div className="w-px h-2 left-[11.08px] top-[12.25px] absolute bg-red-600" />
                  <div className="w-px h-2 left-[15.75px] top-[12.25px] absolute bg-red-600" />
                </div>
                <div
                  data-property-1="Default"
                  className="w-20 h-9 left-[143px] top-[90px] absolute"
                >
                  <div className="left-[64px] top-[7px] absolute justify-center text-zinc-500 text-base font-normal font-['Inter'] leading-normal">
                    +
                  </div>
                  <div className="left-[39px] top-[7px] absolute justify-center text-stone-900 text-base font-normal font-['Inter'] leading-normal">
                    1
                  </div>
                  <div className="left-[12px] top-[7px] absolute justify-center text-zinc-500 text-base font-normal font-['Inter'] leading-normal">
                    -
                  </div>
                  <div className="w-20 h-9 left-0 top-0 absolute border border-neutral-400/60" />
                </div>
              </div>
            ))}

            <Link
              href="/final"
              className={`text-center cursor-pointer p-3 w-full ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              } `}
            >
              Оформити замовлення
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
