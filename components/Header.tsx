"use client";

import Image from "next/image";
import MenuDrawer from "@/components/MenuDrawer";
import Search from "@/components/Search";
import ShoppingBasket from "@/components/ShoppingBasket";
import { useTheme } from "@/lib/ThemeProvider";
import Link from "next/link";

export default function Header() {
  const { isDark, setIsDark } = useTheme();

  const toggleTheme = () => setIsDark((prev) => !prev);
  return (
    <header className="flex justify-between w-full h-20 relative  overflow-hidden">
      <Link href="/#">
        <Image
          className="m-3 mx-10"
          height="57"
          width="200"
          alt="logo"
          src={
            isDark
              ? "/images/dark-theme/chars-logo-header-dark.png"
              : "/images/light-theme/chars-logo-header-light.png"
          }
        />
      </Link>

      <div className="w-4xl inline-flex justify-start items-center gap-20">
        <div className="w-20 h-8 relative">
          <Link
            className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter']"
            href="/#about"
          >
            Про нас
          </Link>
        </div>
        <div className="w-20 h-8 relative">
          <button
            className="cursor-pointer left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter']"
            onClick={MenuDrawer}
          >
            Каталог
          </button>
        </div>
        <div className="w-48 h-8 relative">
          <Link
            className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter']"
            href="/#payment-and-delivery"
          >
            Оплата і доставка
          </Link>
        </div>
        <div className="w-20 h-8 relative">
          <Link
            className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter']"
            href="/#reviews"
          >
            Відгуки
          </Link>
        </div>
        <div className="w-24 h-8 relative">
          <Link
            className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter']"
            href="/#contacts"
          >
            Контакти
          </Link>
        </div>
      </div>

      <div className="inline-flex justify-start gap-5 m-5">
        <button className="cursor-pointer" onClick={toggleTheme}>
          <Image
            height="32"
            width="32"
            alt="theme switch"
            src={
              isDark
                ? "/images/dark-theme/theme-switch-dark.png"
                : "/images/light-theme/theme-switch-light.png"
            }
          />
        </button>
        <Search />
        <ShoppingBasket />
      </div>
    </header>
  );
}
