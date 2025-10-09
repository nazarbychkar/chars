"use client";

import Image from "next/image";
import Link from "next/link";
import SidebarMenu from "@/components/layout/SidebarMenu";
import Search from "@/components/shared/Search";
import ShoppingBasket from "@/components/shared/ShoppingBasket";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";

export default function Header() {
  const {
    isDark,
    setIsDark,
    isSidebarOpen,
    setIsSidebarOpen,
    isBasketOpen,
    setIsBasketOpen,
    isSearchOpen,
    setIsSearchOpen,
  } = useAppContext();

  const { items } = useBasket();
  
  // Calculate total quantity of items in basket
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <>
      {/* Header container */}
      <header
        className={`max-w-[1920px] mx-auto fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50 shadow-md ${
          isDark ? "bg-[#1e1e1e]" : "bg-stone-100"
        }`}
      >
        {/* Desktop Header */}
        <div className="hidden lg:flex justify-between items-center h-20 px-10">
          {/* Logo */}
          <Link href="/">
            <Image
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

          {/* Navigation Links */}
          <div className="flex items-center gap-10 text-xl font-['Inter']">
            <Link href="/#about" className="hover:text-[#8C7461]">
              Про нас
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:text-[#8C7461]"
            >
              Каталог
            </button>
            <Link
              href="/#payment-and-delivery"
              className="hover:text-[#8C7461]"
            >
              Оплата і доставка
            </Link>
            <Link href="/#reviews" className="hover:text-[#8C7461]">
              Відгуки
            </Link>
            <Link href="/#contacts" className="hover:text-[#8C7461]">
              Контакти
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-5">
            <button className="cursor-pointer" onClick={toggleTheme}>
              <Image
                height="32"
                width="32"
                alt="theme switch"
                src={
                  isDark
                    ? "/images/dark-theme/theme-switch.svg"
                    : "/images/light-theme/theme-switch.svg"
                }
              />
            </button>
            <button onClick={() => setIsSearchOpen(true)}>
              <Image
                className="cursor-pointer"
                height="32"
                width="32"
                alt="search icon"
                src={
                  isDark
                    ? "/images/dark-theme/search.svg"
                    : "/images/light-theme/search.svg"
                }
              />
            </button>
            <button
              className="cursor-pointer relative"
              onClick={() => setIsBasketOpen(!isBasketOpen)}
            >
              <Image
                height="32"
                width="32"
                alt="shopping basket"
                src={
                  isDark
                    ? "/images/dark-theme/basket.svg"
                    : "/images/light-theme/basket.svg"
                }
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden w-full h-16 relative overflow-hidden px-4 flex items-center justify-between">
          {/* Hamburger Icon */}
          <div className="flex gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="relative w-12 h-12 text-3xl"
            >
              ☰
            </button>
            <button className="cursor-pointer" onClick={toggleTheme}>
              <Image
                height="32"
                width="32"
                alt="theme switch"
                src={
                  isDark
                    ? "/images/dark-theme/theme-switch.svg"
                    : "/images/light-theme/theme-switch.svg"
                }
              />
            </button>
          </div>

          {/* Mobile Logo */}
          <Link href="/">
            <Image
              height="28"
              width="100"
              alt="logo"
              src={
                isDark
                  ? "/images/dark-theme/chars-logo-header-dark.png"
                  : "/images/light-theme/chars-logo-header-light.png"
              }
            />
          </Link>
          {/* Right Icons */}
          <div className="flex gap-4">
            <button onClick={() => setIsSearchOpen(true)}>
              <Image
                height="32"
                width="32"
                alt="search icon"
                src={
                  isDark
                    ? "/images/dark-theme/search.svg"
                    : "/images/light-theme/search.svg"
                }
              />
            </button>

            <button 
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative"
            >
              <Image
                height="32"
                width="32"
                alt="shopping basket"
                src={
                  isDark
                    ? "/images/dark-theme/basket.svg"
                    : "/images/light-theme/basket.svg"
                }
              />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebars */}
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

      <SidebarSearch
        isDark={isDark}
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
      />
    </>
  );
}
