"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useBasket } from "@/lib/BasketProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
import SidebarBasket from "./SidebarBasket";
import SidebarSearch from "./SidebarSearch";
import SidebarMenu from "./SidebarMenu";
import { buildCategorySlug, buildSubcategorySlug } from "@/lib/slug";

interface Category {
  id: number;
  name: string;
  priority: number;
  name_en?: string | null;
  name_de?: string | null;
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isFbTestMode, setIsFbTestMode] = useState(false);

  useEffect(() => {
    setIsFbTestMode(
      new URLSearchParams(window.location.search).has("test_event_code")
    );
  }, []);

  // Treat localized home routes as "home"
  const isHomePage =
    pathname === "/" ||
    pathname === `/${locale}` ||
    pathname === `/${locale}/`;

  // Track scroll position only for adding subtle shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [hoveredCategoryId, setHoveredCategoryId] = useState<number | null>(
    null
  );
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [infoMenuOpen, setInfoMenuOpen] = useState(false);
  const infoTimeout = useRef<NodeJS.Timeout | null>(null);

  const [pinnedCatalog, setPinnedCatalog] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);

  const getCategoryLabel = (category: Category) => {
    if (locale === "en") return category.name_en || category.name;
    if (locale === "de") return category.name_de || category.name;
    return category.name;
  };
  const getSubcategoryLabel = (sub: Subcategory) => {
    const name_en: string | null | undefined = sub.name_en;
    const name_de: string | null | undefined = sub.name_de;
    if (locale === "en") return name_en || sub.name;
    if (locale === "de") return name_de || sub.name;
    return sub.name;
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        pinnedCatalog &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setPinnedCatalog(false);
        setCatalogOpen(false);
        setHoveredCategoryId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pinnedCatalog]);

  useEffect(() => {
    return () => {
      if (infoTimeout.current) clearTimeout(infoTimeout.current);
    };
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        // Ensure data is always an array
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]); // Set empty array on error
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchSubcategories(categoryId: number) {
      try {
        const res = await fetch(
          `/api/subcategories?parent_category_id=${categoryId}`
        );
        const data = await res.json();
        setSubcategories(data);
      } catch (err) {
        console.error("Failed to load subcategories", err);
        setSubcategories([]);
      }
    }

    if (hoveredCategoryId !== null) {
      fetchSubcategories(hoveredCategoryId);
    }
  }, [hoveredCategoryId]);

  const customSeasonCategory = {
    id: -1, // Use a negative ID or something unique to avoid conflicts
    name: messages.header.seasonCategory,
    subcategories: [
      { id: -101, name: messages.header.seasonSpring },
      { id: -102, name: messages.header.seasonSummer },
      { id: -103, name: messages.header.seasonAutumn },
      { id: -104, name: messages.header.seasonWinter },
    ],
  };

  return (
    <>
      <header
        className={`max-w-[1920px] mx-auto fixed top-0 left-1/2 transform -translate-x-1/2 w-full z-50 transition-all duration-300 ${
          isDark
            ? "bg-[#1e1e1e] text-white"
            : "bg-stone-100 text-black"
        } ${isScrolled ? "shadow-md" : ""}`}
        onMouseLeave={() => {
          if (!pinnedCatalog) {
            hoverTimeout.current = setTimeout(() => {
              setCatalogOpen(false);
              setHoveredCategoryId(null);
            }, 200); // Small delay
          }
        }}
      >
        {/* === WRAPPER: everything inside shares same bg and styles === */}
        <div className="w-full transition-all duration-300">
          {/* Top nav */}
          <div className="hidden lg:flex justify-between items-center h-20 px-10">
            <Link href={locale === "uk" ? "/uk" : `/${locale}`}>
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

            <div className="flex items-center gap-8 text-xl font-normal font-['Inter']">
              {/* Product Categories shown directly in top nav */}
              {Array.isArray(categories) && categories.map((category) => (
                <div
                  key={category.id}
                  className="relative group"
                  onMouseEnter={() => {
                    if (hoverTimeout.current)
                      clearTimeout(hoverTimeout.current);
                    setHoveredCategoryId(category.id);
                    setCatalogOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (!pinnedCatalog) {
                      hoverTimeout.current = setTimeout(() => {
                        setHoveredCategoryId(null);
                      }, 200);
                    }
                  }}
                >
                  <button
                    onClick={() => {
                      const target = `/${locale}/catalog?category=${encodeURIComponent(
                        buildCategorySlug(category.name)
                      )}`;
                      window.location.href = target;
                    }}
                    className="cursor-pointer whitespace-nowrap hover:text-[#8C7461] text-sm font-normal font-['Inter'] focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:ring-offset-2 rounded px-2"
                    aria-label={messages.header.goToCategoryAria(
                      getCategoryLabel(category)
                    )}
                    aria-expanded={catalogOpen && hoveredCategoryId === category.id}
                    aria-haspopup="true"
                  >
                    {getCategoryLabel(category)}
                  </button>

                  {/* Subcategories dropdown */}
                  {hoveredCategoryId === category.id &&
                    subcategories.length > 0 && (
                      <div
                        className={`absolute top-full left-0 mt-2 shadow-md rounded px-4 py-2 flex flex-col min-w-[200px] z-50 ${
                          "bg-white"
                        }`}
                      >
                        {subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/catalog?subcategory=${encodeURIComponent(
                              buildSubcategorySlug(subcat.name)
                            )}`}
                            className="hover:text-[#8C7461] text-base py-1 font-normal font-['Inter'] text-black"
                          >
                            {getSubcategoryLabel(subcat)}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))}

              {/* Also include the "Сезон" category */}
              <div
                className="relative group"
                onMouseEnter={() => {
                  if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
                  setHoveredCategoryId(customSeasonCategory.id);
                  setCatalogOpen(true);
                }}
                onMouseLeave={() => {
                  if (!pinnedCatalog) {
                    hoverTimeout.current = setTimeout(() => {
                      setHoveredCategoryId(null);
                    }, 200);
                  }
                }}
              >
                <button
                  className="cursor-pointer whitespace-nowrap hover:text-[#8C7461] text-base font-normal font-['Inter']"
                  disabled
                >
                  {customSeasonCategory.name}
                </button>
                {hoveredCategoryId === customSeasonCategory.id && (
                  <div
                    className={`absolute top-full left-0 mt-2 shadow-md rounded px-4 py-2 flex flex-col min-w-[200px] z-50 ${
                      "bg-white"
                    }`}
                  >
                    {customSeasonCategory.subcategories.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/catalog?season=${encodeURIComponent(
                          subcat.name
                        )}`}
                        className="hover:text-[#8C7461] text-base py-1 font-normal font-['Inter'] text-black"
                      >
                        {subcat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {/* Information dropdown */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (infoTimeout.current) clearTimeout(infoTimeout.current);
                  setInfoMenuOpen(true);
                }}
                onMouseLeave={() => {
                  infoTimeout.current = setTimeout(() => {
                    setInfoMenuOpen(false);
                  }, 200); // delay in ms
                }}
              >
                <span className="cursor-default whitespace-nowrap hover:text-[#8C7461] text-base font-normal font-['Inter']">
                  {messages.header.info}
                </span>

                <div
                  className={`absolute top-full left-0 mt-2 shadow-md rounded px-4 py-2 flex flex-col min-w-[200px] z-50 transition-opacity duration-200 bg-white ${
                    infoMenuOpen
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <Link
                    href={`/${locale}/#about`}
                    className="hover:text-[#8C7461] text-base py-1 font-normal font-['Inter'] text-black"
                  >
                    {messages.header.about}
                  </Link>
                  <Link
                    href={`/${locale}/#payment-and-delivery`}
                    className="hover:text-[#8C7461] text-base py-1 font-normal font-['Inter'] text-black"
                  >
                    {messages.header.paymentAndDelivery}
                  </Link>
                  <Link
                    href={`/${locale}/#reviews`}
                    className="hover:text-[#8C7461] text-base py-1 font-normal font-['Inter'] text-black"
                  >
                    {messages.header.reviews}
                  </Link>
                  <Link
                    href={`/${locale}/#contacts`}
                    className="hover:text-[#8C7461] text-base py-1 font-normal font-['Inter'] text-black"
                  >
                    {messages.header.contacts}
                  </Link>
                </div>
              </div>
              {/* Currency + Language switchers (desktop) */}
              <div className="flex items-center gap-3">
                {/* Currency switcher (desktop) – dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCurrencyMenuOpen((prev) => !prev)}
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:ring-offset-2 rounded-full px-3 py-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm border border-stone-300 gap-1"
                    aria-label="Змінити валюту"
                    aria-expanded={isCurrencyMenuOpen}
                  >
                    <span className="font-medium whitespace-nowrap">
                      {effectiveCurrency === "EUR" ? "€ EUR" : "₴ UAH"}
                    </span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                    >
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
                    <div className="absolute right-0 mt-2 bg-white border border-stone-200 shadow-xl rounded-xl py-2 px-2 flex flex-col text-sm z-50 backdrop-blur-sm min-w-[140px]">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrency("UAH");
                          setIsCurrencyMenuOpen(false);
                        }}
                        className={`px-3 py-1.5 text-left rounded-full border text-xs tracking-wide transition-colors ${
                          effectiveCurrency === "UAH"
                            ? "bg-[#8C7461] text-white border-[#8C7461]"
                            : "bg-white border-stone-200 text-stone-800 hover:bg-stone-50"
                        }`}
                        aria-pressed={effectiveCurrency === "UAH"}
                      >
                        ₴ UAH
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCurrency("EUR");
                          setIsCurrencyMenuOpen(false);
                        }}
                        className={`mt-1 px-3 py-1.5 text-left rounded-full border text-xs tracking-wide transition-colors ${
                          effectiveCurrency === "EUR"
                            ? "bg-[#8C7461] text-white border-[#8C7461]"
                            : "bg-white border-stone-200 text-stone-800 hover:bg-stone-50"
                        }`}
                        aria-pressed={effectiveCurrency === "EUR"}
                      >
                        € EUR
                      </button>
                    </div>
                  )}
                </div>
                {/* Language switcher (desktop) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLangMenuOpen((prev) => !prev)}
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:ring-offset-2 rounded-full p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-lg border border-stone-300"
                    aria-label={messages.header.langSwitcherAria}
                    aria-expanded={isLangMenuOpen}
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="w-6 h-6"
                    >
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
                    <div className="absolute right-0 mt-2 bg-white border border-stone-200 shadow-xl rounded-xl py-2 px-2 flex flex-col text-sm z-50 backdrop-blur-sm min-w-[140px]">
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
                              ? "bg-[#8C7461] text-white border-[#8C7461]"
                              : "bg-white border-stone-200 text-stone-800 hover:bg-stone-50"
                          }`}
                          aria-current={locale === lng ? "page" : undefined}
                        >
                          {lng.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-3">
              <button
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:ring-offset-2 rounded p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={toggleTheme}
                aria-label={
                  isDark
                    ? messages.header.themeToggleAriaLight
                    : messages.header.themeToggleAriaDark
                }
                aria-pressed={isDark}
              >
                <Image
                  height="32"
                  width="32"
                  alt=""
                  aria-hidden="true"
                  src={
                    isDark
                      ? "/images/dark-theme/theme-switch.svg"
                      : "/images/light-theme/theme-switch.svg"
                  }
                />
              </button>
              {/* [Тимчасово] Пошук вимкнено — pointer-events-none, щоб не заважати тестуванню подій FB. */}
              <span
                className="pointer-events-none opacity-50 inline-flex items-center justify-center p-1 min-w-[44px] min-h-[44px]"
                aria-hidden="true"
              >
                <Image
                  height="32"
                  width="32"
                  alt=""
                  src={
                    isDark
                      ? "/images/dark-theme/search.svg"
                      : "/images/light-theme/search.svg"
                  }
                />
              </span>
              <button
                className="cursor-pointer relative focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:ring-offset-2 rounded p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => setIsBasketOpen(!isBasketOpen)}
                aria-label={messages.header.basketOpenAria(totalItems)}
                aria-expanded={isBasketOpen}
              >
                <Image
                  height="32"
                  width="32"
                  alt=""
                  aria-hidden="true"
                  src={
                    isDark
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

        {/* Mobile Header */}
        <div
          className={`lg:hidden w-full h-16 relative overflow-hidden px-4 flex items-center justify-between transition-all duration-300 ${
            isDark ? "bg-[#1e1e1e] text-white" : "bg-stone-100 text-black"
          }`}
        >
          <div className="flex gap-1 items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="relative w-12 h-12 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Відкрити меню"
              aria-expanded={isSidebarOpen}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="w-7 h-7"
              >
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
              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:ring-offset-2 rounded p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={toggleTheme}
              aria-label={
                isDark
                  ? messages.header.themeToggleAriaLight
                  : messages.header.themeToggleAriaDark
              }
              aria-pressed={isDark}
            >
              <Image
                height="32"
                width="32"
                alt=""
                aria-hidden="true"
                src={
                  isDark
                    ? "/images/dark-theme/theme-switch.svg"
                    : "/images/light-theme/theme-switch.svg"
                }
              />
            </button>
          </div>

          <Link href={locale === "uk" ? "/uk" : `/${locale}`}>
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

          <div className="flex gap-2 items-center">
            {/* [Тимчасово] Пошук вимкнено — не клікається, щоб не заважати тестуванню подій FB. */}
            <span
              className="pointer-events-none opacity-50 inline-flex items-center justify-center p-1 min-w-[44px] min-h-[44px]"
              aria-hidden="true"
            >
              <Image
                height="32"
                width="32"
                alt=""
                src={
                  isDark
                    ? "/images/dark-theme/search.svg"
                    : "/images/light-theme/search.svg"
                }
              />
            </span>
            <button
              onClick={() => setIsBasketOpen(!isBasketOpen)}
              className="relative focus:outline-none focus:ring-2 focus:ring-[#8C7461] focus:ring-offset-2 rounded p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={messages.header.basketOpenAria(totalItems)}
              aria-expanded={isBasketOpen}
            >
              <Image
                height="32"
                width="32"
                alt=""
                aria-hidden="true"
                src={
                  isDark
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
      <SidebarSearch
        isDark={isDark}
        isOpen={isSearchOpen}
        setIsOpen={setIsSearchOpen}
      />
    </>
  );
}
