"use client";

import Image from "next/image";
import SidebarMenu from "@/components/layout/SidebarMenu";
import Search from "@/components/shared/Search";
import ShoppingBasket from "@/components/shared/ShoppingBasket";
import { useAppContext } from "@/lib/GeneralProvider";
import Link from "next/link";
import SidebarBasket from "./SidebarBasket";

export default function Header() {
  const {
    isDark,
    setIsDark,
    isSidebarOpen,
    setIsSidebarOpen,
    isBasketOpen,
    setIsBasketOpen,
  } = useAppContext();
  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <>
      <header
        className={`max-w-[1920px] mx-auto flex justify-between h-20 overflow-hidden z-50 fixed top-0 left-1/2 transform -translate-x-1/2 w-full shadow-md ${
          isDark ? "bg-[#1e1e1e]" : "bg-stone-100"
        }`}
      >
        <Link href="/">
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
              className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter'] hover:text-[#8C7461]"
              href="/#about"
            >
              Про нас
            </Link>
          </div>
          <div className="w-20 h-8 relative">
            <button
              className="cursor-pointer left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter'] hover:text-[#8C7461]"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              Каталог
            </button>
          </div>
          <div className="w-48 h-8 relative">
            <Link
              className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter'] hover:text-[#8C7461]"
              href="/#payment-and-delivery"
            >
              Оплата і доставка
            </Link>
          </div>
          <div className="w-20 h-8 relative">
            <Link
              className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter'] hover:text-[#8C7461]"
              href="/#reviews"
            >
              Відгуки
            </Link>
          </div>
          <div className="w-24 h-8 relative">
            <Link
              className="left-0 top-[3px] absolute justify-center text-xl font-normal font-['Inter'] hover:text-[#8C7461]"
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
          <button
            className="cursor-pointer"
            onClick={() => setIsBasketOpen(!isBasketOpen)}
          >
            <Image
              height="32"
              width="32"
              alt="shopping basket"
              src={
                isDark
                  ? "/images/dark-theme/shopping-basket-dark.png"
                  : "/images/light-theme/shopping-basket-light.png"
              }
            />
          </button>
        </div>
      </header>
      <SidebarMenu
        isDark={isDark}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <SidebarBasket
        isDark={isDark}
        isOpen={isBasketOpen}
        setIsOpen={setIsBasketOpen}
      />
    </>
  );
}
