"use client";

import Image from "next/image";
import MenuDrawer from "@/components/MenuDrawer";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Search from "@/components/Search";
import ShoppingBasket from "@/components/ShoppingBasket";

export default function Header() {
  return (
    <header className="flex justify-between w-full h-20 relative bg-stone-900 overflow-hidden">
      <a href="/#">
        <Image
          className="m-3 mx-10"
          height="57"
          width="200"
          alt="logo"
          src="/chars-logo-header.png"
        />
      </a>

      <div className="w-4xl inline-flex justify-start items-center gap-20">
        <div className="w-20 h-8 relative">
          <a
            className="left-0 top-[3px] absolute justify-center text-white text-xl font-normal font-['Inter']"
            href="/#about"
          >
            Про нас
          </a>
        </div>
        <div className="w-20 h-8 relative">
          <button
            className="cursor-pointer left-0 top-[3px] absolute justify-center text-white text-xl font-normal font-['Inter']"
            onClick={MenuDrawer}
          >
            Каталог
          </button>
        </div>
        <div className="w-48 h-8 relative">
          <a
            className="left-0 top-[3px] absolute justify-center text-white text-xl font-normal font-['Inter']"
            href="/#payment-and-delivery"
          >
            Оплата і доставка
          </a>
        </div>
        <div className="w-20 h-8 relative">
          <a
            className="left-0 top-[3px] absolute justify-center text-white text-xl font-normal font-['Inter']"
            href="/#reviews"
          >
            Відгуки
          </a>
        </div>
        <div className="w-24 h-8 relative">
          <a
            className="left-0 top-[3px] absolute justify-center text-white text-xl font-normal font-['Inter']"
            href="/#contacts"
          >
            Контакти
          </a>
        </div>
      </div>

      <div className="inline-flex justify-start gap-5 m-5">
        <ThemeSwitcher />
        <Search />
        <ShoppingBasket />
      </div>
    </header>
  );
}
