"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
import { getLocaleFromPath } from "@/lib/i18n/config";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";
import SidebarMenu from "./SidebarMenu";
import { buildCategorySlug, buildSubcategorySlug } from "@/lib/slug";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

interface Category {
  id: number;
  name: string;
  priority: number;
  name_en?: string | null;
  name_de?: string | null;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: number;
  name: string;
  name_en?: string | null;
  name_de?: string | null;
}

export default function Header() {
  const { locale, messages, switchLocale } = useI18n();
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

  const { items, currency, setCurrency } = useBasket();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const effectiveCurrency =
    currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH");
  const toggleTheme = () => setIsDark((prev) => !prev);
  const pathname = usePathname();
  const localeFromPath = getLocaleFromPath(pathname);
  const isHomePage =
    pathname === "/" ||
    pathname === `/${localeFromPath}` ||
    pathname === `/${localeFromPath}/`;
  const [isScrolled, setIsScrolled] = useState(false);
  const isTransparent = isHomePage && !isScrolled;
  const useLightAssets = isTransparent || isDark;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const catalogTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catalogRef = useRef<HTMLDivElement | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  useBodyScrollLock(catalogOpen);

  const getCategoryLabel = (category: Category) => {
    if (locale === "en") return category.name_en || category.name;
    if (locale === "de") return category.name_de || category.name;
    return category.name;
  };

  const getSubcategoryLabel = (sub: Subcategory) => {
    if (locale === "en") return sub.name_en || sub.name;
    if (locale === "de") return sub.name_de || sub.name;
    return sub.name;
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data: Category[] = await res.json();
        if (!Array.isArray(data)) {
          setCategories([]);
          return;
        }
        const withSubs = await Promise.all(
          data.map(async (cat) => {
            try {
              const subRes = await fetch(
                `/api/subcategories?parent_category_id=${cat.id}`
              );
              const subs: Subcategory[] = await subRes.json();
              return {
                ...cat,
                subcategories: Array.isArray(subs) ? subs : [],
              };
            } catch {
              return { ...cat, subcategories: [] };
            }
          })
        );
        setCategories(withSubs);
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (catalogTimeout.current) clearTimeout(catalogTimeout.current);
    };
  }, []);

  const openCatalog = () => {
    if (catalogTimeout.current) clearTimeout(catalogTimeout.current);
    setCatalogOpen(true);
  };

  const closeCatalogSoon = () => {
    if (catalogTimeout.current) clearTimeout(catalogTimeout.current);
    catalogTimeout.current = setTimeout(() => setCatalogOpen(false), 180);
  };

  const navLinkClass = isTransparent
    ? "whitespace-nowrap px-1 py-2 text-sm font-medium uppercase tracking-[0.12em] transition-colors text-white hover:text-white/75"
    : "whitespace-nowrap px-1 py-2 text-sm font-medium uppercase tracking-[0.12em] transition-colors hover:text-[#072a6b]";

  const headerSurface = isTransparent
    ? "bg-transparent text-white"
    : isDark
      ? "bg-[#1e1e1e] text-white"
      : "bg-[#eef7ff] text-[#072a6b]";

  const chipBorder = isTransparent
    ? "border-white/45"
    : "border-stone-300";

  return (
    <>
      <header
        className={`max-w-[1920px] mx-auto fixed top-0 left-1/2 -translate-x-1/2 w-full z-50 transition-all duration-300 ${headerSurface} ${
          isScrolled && !isTransparent ? "shadow-md" : ""
        }`}
      >
        <div className="w-full transition-all duration-300">
          {/* Desktop */}
          <div className="hidden lg:flex justify-between items-center h-20 site-px">
            <Link
              href={locale === "uk" ? "/uk" : `/${locale}`}
              className="shrink-0"
            >
              <Image
                height={80}
                width={162}
                alt="CHARS"
                src={
                  useLightAssets
                    ? "/images/dark-theme/chars-logo-header-dark.png"
                    : "/images/light-theme/chars-logo-header-light.png"
                }
                className="h-10 w-auto xl:h-12"
                priority
              />
            </Link>

            <nav
              className="flex items-center gap-8 xl:gap-10"
              aria-label="Main"
              ref={catalogRef}
            >
              <Link
                href={`/${locale}/collections`}
                className={navLinkClass}
              >
                {messages.header.collections}
              </Link>

              <div
                className="relative"
                onMouseEnter={openCatalog}
                onMouseLeave={closeCatalogSoon}
              >
                <button
                  type="button"
                  className={`${navLinkClass} inline-flex items-center gap-1.5 cursor-pointer`}
                  aria-expanded={catalogOpen}
                  aria-haspopup="true"
                  onClick={() => setCatalogOpen((v) => !v)}
                >
                  {messages.header.catalogMenu}
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className={`w-3.5 h-3.5 transition-transform ${
                      catalogOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Mega menu — attached without gap so hover stays active */}
                <div
                  className={`fixed left-0 right-0 top-20 z-50 transition-all duration-200 ${
                    catalogOpen
                      ? "opacity-100 pointer-events-auto translate-y-0"
                      : "opacity-0 pointer-events-none -translate-y-1"
                  }`}
                  onMouseEnter={openCatalog}
                  onMouseLeave={closeCatalogSoon}
                >
                  <div
                    className={`border-t shadow-lg ${
                      isDark
                        ? "bg-[#1e1e1e] border-stone-700"
                        : "bg-white border-stone-200"
                    }`}
                  >
                    <div className="max-w-[1920px] mx-auto site-px py-8 xl:py-10">
                      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-10">
                        {categories.map((category) => (
                          <div key={category.id} className="min-w-0">
                            <Link
                              href={`/${locale}/catalog?category=${encodeURIComponent(
                                buildCategorySlug(category.name)
                              )}`}
                              className="block text-sm font-semibold uppercase tracking-[0.14em] mb-3 hover:text-[#072a6b] transition-colors"
                              onClick={() => setCatalogOpen(false)}
                            >
                              {getCategoryLabel(category)}
                            </Link>
                            <ul className="space-y-1.5">
                              {(category.subcategories || []).map((sub) => (
                                <li key={sub.id}>
                                  <Link
                                    href={`/${locale}/catalog?subcategory=${encodeURIComponent(
                                      buildSubcategorySlug(sub.name)
                                    )}`}
                                    className={`text-[15px] font-normal leading-snug transition-colors hover:text-[#072a6b] ${
                                      isDark
                                        ? "text-stone-300"
                                        : "text-stone-600"
                                    }`}
                                    onClick={() => setCatalogOpen(false)}
                                  >
                                    {getSubcategoryLabel(sub)}
                                  </Link>
                                </li>
                              ))}
                              {(!category.subcategories ||
                                category.subcategories.length === 0) && (
                                <li>
                                  <Link
                                    href={`/${locale}/catalog?category=${encodeURIComponent(
                                      buildCategorySlug(category.name)
                                    )}`}
                                    className="text-sm text-[#072a6b]"
                                    onClick={() => setCatalogOpen(false)}
                                  >
                                    {messages.header.viewAllCategory}
                                  </Link>
                                </li>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link
                href={`/${locale}/certificate`}
                className={navLinkClass}
              >
                {messages.header.certificates}
              </Link>
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCurrencyMenuOpen((prev) => !prev)}
                  className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2 rounded-full px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm border gap-1 ${chipBorder}`}
                  aria-label="Змінити валюту"
                  aria-expanded={isCurrencyMenuOpen}
                >
                  <span className="text-base font-medium tabular-nums">
                    {effectiveCurrency === "EUR" ? "€" : "₴"}
                  </span>
                  <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4">
                    <path
                      d="M7 10l5 5 5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {isCurrencyMenuOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-stone-200 shadow-xl rounded-xl py-2 px-2 flex flex-col text-sm z-50 min-w-[140px]">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency("UAH");
                        setIsCurrencyMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 text-left rounded-full border text-xs tracking-wide transition-colors ${
                        effectiveCurrency === "UAH"
                          ? "bg-[#072a6b] text-white border-[#072a6b]"
                          : "bg-white border-stone-200 text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      UAH
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrency("EUR");
                        setIsCurrencyMenuOpen(false);
                      }}
                      className={`mt-1 px-3 py-1.5 text-left rounded-full border text-xs tracking-wide transition-colors ${
                        effectiveCurrency === "EUR"
                          ? "bg-[#072a6b] text-white border-[#072a6b]"
                          : "bg-white border-stone-200 text-stone-800 hover:bg-stone-50"
                      }`}
                    >
                      EUR
                    </button>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen((prev) => !prev)}
                  className={`cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2 rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-lg border ${chipBorder}`}
                  aria-label={messages.header.langSwitcherAria}
                  aria-expanded={isLangMenuOpen}
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6">
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M3 12h18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 3c2.5 2.2 3.5 4.9 3.5 9s-1 6.8-3.5 9c-2.5-2.2-3.5-4.9-3.5-9s1-6.8 3.5-9Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.1"
                    />
                    <path
                      d="M6 7c1.6.8 3.3 1.1 6 1.1s4.4-.3 6-1.1M6 17c1.6-.8 3.3-1.1 6-1.1s4.4.3 6 1.1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-2 bg-white border border-stone-200 shadow-xl rounded-xl py-2 px-2 flex flex-col text-sm z-50 min-w-[140px]">
                    {["uk", "de", "en"].map((lng) => (
                      <button
                        key={lng}
                        type="button"
                        onClick={() => {
                          switchLocale(lng as Locale);
                          setIsLangMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 text-left rounded-full border text-xs tracking-wide uppercase transition-colors ${
                          locale === lng
                            ? "bg-[#072a6b] text-white border-[#072a6b]"
                            : "bg-white border-stone-200 text-stone-800 hover:bg-stone-50"
                        }`}
                      >
                        {lng.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="cursor-pointer flex min-h-[38px] min-w-[38px] items-center justify-center rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2"
                onClick={toggleTheme}
                aria-label={
                  isDark
                    ? messages.header.themeToggleAriaLight
                    : messages.header.themeToggleAriaDark
                }
                aria-pressed={isDark}
              >
                <Image
                  height={26}
                  width={26}
                  alt=""
                  aria-hidden
                  src={
                    useLightAssets
                      ? "/images/dark-theme/theme-switch.svg"
                      : "/images/light-theme/theme-switch.svg"
                  }
                />
              </button>
              <button
                type="button"
                className="cursor-pointer inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setIsBasketOpen(false);
                }}
                aria-label={messages.header.searchOpenAria}
                aria-expanded={isSearchOpen}
              >
                <Image
                  height={24}
                  width={24}
                  alt=""
                  src={
                    useLightAssets
                      ? "/images/dark-theme/search.svg"
                      : "/images/light-theme/search.svg"
                  }
                />
              </button>
              <button
                className="cursor-pointer relative flex min-h-[38px] min-w-[38px] items-center justify-center rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
                aria-label={messages.header.basketOpenAria(totalItems)}
                aria-expanded={isBasketOpen}
              >
                <Image
                  height={24}
                  width={24}
                  alt=""
                  aria-hidden
                  src={
                    useLightAssets
                      ? "/images/dark-theme/basket.svg"
                      : "/images/light-theme/basket.svg"
                  }
                />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    aria-label={messages.header.basketCountAria(totalItems)}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div
            className={`lg:hidden w-full h-16 site-px flex items-center justify-between transition-all duration-300 ${
              isTransparent
                ? "bg-transparent text-white"
                : isDark
                  ? "bg-[#1e1e1e] text-white"
                  : "bg-[#eef7ff] text-[#072a6b]"
            }`}
          >
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="relative w-12 h-12 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Відкрити меню"
                aria-expanded={isSidebarOpen}
              >
                <svg aria-hidden viewBox="0 0 24 24" className="w-7 h-7">
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                className="cursor-pointer flex min-h-[38px] min-w-[38px] items-center justify-center rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2"
                onClick={toggleTheme}
                aria-label={
                  isDark
                    ? messages.header.themeToggleAriaLight
                    : messages.header.themeToggleAriaDark
                }
                aria-pressed={isDark}
              >
                <Image
                  height={24}
                  width={24}
                  alt=""
                  aria-hidden
                  src={
                    useLightAssets
                      ? "/images/dark-theme/theme-switch.svg"
                      : "/images/light-theme/theme-switch.svg"
                  }
                />
              </button>
            </div>

            <Link href={locale === "uk" ? "/uk" : `/${locale}`}>
              <Image
                height={40}
                width={81}
                alt="CHARS"
                src={
                  useLightAssets
                    ? "/images/dark-theme/chars-logo-header-dark.png"
                    : "/images/light-theme/chars-logo-header-light.png"
                }
                className="h-7 w-auto"
                priority
              />
            </Link>

            <div className="flex items-center gap-1">
              <button
                type="button"
                className="cursor-pointer inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setIsBasketOpen(false);
                }}
                aria-label={messages.header.searchOpenAria}
                aria-expanded={isSearchOpen}
              >
                <Image
                  height={24}
                  width={24}
                  alt=""
                  src={
                    useLightAssets
                      ? "/images/dark-theme/search.svg"
                      : "/images/light-theme/search.svg"
                  }
                />
              </button>
              <button
                onClick={() => setIsBasketOpen(!isBasketOpen)}
                className="relative flex min-h-[38px] min-w-[38px] items-center justify-center rounded p-0.5 focus:outline-none focus:ring-2 focus:ring-[#072a6b] focus:ring-offset-2"
                aria-label={messages.header.basketOpenAria(totalItems)}
                aria-expanded={isBasketOpen}
              >
                <Image
                  height={24}
                  width={24}
                  alt=""
                  aria-hidden
                  src={
                    useLightAssets
                      ? "/images/dark-theme/basket.svg"
                      : "/images/light-theme/basket.svg"
                  }
                />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    aria-label={messages.header.basketCountAria(totalItems)}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dim overlay when catalog open */}
      {catalogOpen && (
        <button
          type="button"
          aria-label="Close catalog"
          className="hidden lg:block fixed inset-0 top-20 z-40 bg-black/20 cursor-default"
          onClick={() => setCatalogOpen(false)}
        />
      )}

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
