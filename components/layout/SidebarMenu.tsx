"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/config";
import { useBasket } from "@/lib/BasketProvider";
import { buildCategorySlug, buildSubcategorySlug } from "@/lib/slug";

interface SidebarMenuProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDark: boolean;
}

interface Category {
  id: number;
  name: string;
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

export default function SidebarMenu({
  isOpen,
  setIsOpen,
  isDark,
}: SidebarMenuProps) {
  const { locale, messages, switchLocale, withLocalePath } = useI18n();
  const { currency, setCurrency } = useBasket();
  const effectiveCurrency =
    currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // "menu" = main menu with categories, "season" = season sidebar
  const [view, setView] = useState<"menu" | "season">("menu");
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

  const getCategoryLabel = (cat: Category) => {
    if (locale === "en") return cat.name_en || cat.name;
    if (locale === "de") return cat.name_de || cat.name;
    return cat.name;
  };

  const getSubcategoryLabel = (sub: Subcategory) => {
    if (locale === "en") return sub.name_en || sub.name;
    if (locale === "de") return sub.name_de || sub.name;
    return sub.name;
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();

        // Fetch subcategories for each category
        const categoriesWithSubcats = await Promise.all(
          data.map(async (cat) => {
            try {
              const subRes = await fetch(
                `/api/subcategories?parent_category_id=${cat.id}`
              );
              const subData: Subcategory[] = await subRes.json();
              return { ...cat, subcategories: subData };
            } catch {
              return { ...cat, subcategories: [] };
            }
          })
        );

        setCategories(categoriesWithSubcats);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Internal season values (UA) stay як були для фільтрації,
  // а підпис (label) локалізуємо через i18n.
  const season_data = [
    {
      value: "Осінь",
      label: messages.header.seasonAutumn,
      image: "/images/autumn2.jpg",
    },
    {
      value: "Зима",
      label: messages.header.seasonWinter,
      image: "/images/winter2.jpg",
    },
    {
      value: "Весна",
      label: messages.header.seasonSpring,
      image: "/images/spring2.jpg",
    },
    {
      value: "Літо",
      label: messages.header.seasonSummer,
      image: "/images/summer2.jpg",
    },
  ];

  if (!isOpen) {
    // If sidebar closed, reset view to main menu for next open
    if (view !== "menu") setView("menu");
  }

  return (
    <div className="relative z-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => {
            setIsOpen(false);
            setView("menu"); // reset on close
          }}
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
        {view === "menu" && (
          <nav className="flex flex-col px-4 py-6 space-y-2 text-xl sm:text-2xl md:text-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2>{messages.header.menuLabel}</h2>
              <button
                className="text-2xl sm:text-3xl cursor-pointer hover:text-[#8C7461]"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            {loading && <p>{messages.common.loading}</p>}
            {error && <p className="text-red-500">Error: {error}</p>}

            {!loading &&
              !error &&
              categories.map((cat) => (
                <div key={cat.id} className="flex flex-col">
                  <div className="flex justify-between items-center">
                    <Link
                      href={withLocalePath(
                        `/catalog?category=${encodeURIComponent(
                          buildCategorySlug(cat.name)
                        )}`
                      )}
                      className="hover:text-[#8C7461]"
                      onClick={() => setIsOpen(false)}
                    >
                      {getCategoryLabel(cat)}
                    </Link>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <button
                        className="ml-2 text-xl sm:text-2xl font-bold"
                        onClick={() =>
                          setOpenCategoryId(
                            openCategoryId === cat.id ? null : cat.id
                          )
                        }
                      >
                        {openCategoryId === cat.id ? "−" : "+"}
                      </button>
                    )}
                  </div>

                  {/* Subcategories dropdown */}
                  {openCategoryId === cat.id && cat.subcategories && (
                    <div className="flex flex-col pl-6 mt-1 space-y-1">
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub.id}
                          href={withLocalePath(
                            `/catalog?subcategory=${encodeURIComponent(
                              buildSubcategorySlug(sub.name)
                            )}`
                          )}
                          className="hover:text-[#8C7461]"
                          onClick={() => setIsOpen(false)}
                        >
                          {getSubcategoryLabel(sub)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            {/* Currency & language selector in burger menu */}
            <div className="mt-6 pt-4 border-t border-stone-300 dark:border-stone-700 space-y-4 text-base sm:text-lg">
              <div className="flex items-center justify-between">
                <span className="opacity-80">
                  {messages.header.currencyLabel}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrency("UAH")}
                    className={`px-3 py-1.5 rounded-full border text-xs tracking-wide ${
                      effectiveCurrency === "UAH"
                        ? "bg-[#8C7461] text-white border-[#8C7461]"
                        : "bg-white border-stone-300 text-stone-900"
                    }`}
                    aria-pressed={effectiveCurrency === "UAH"}
                  >
                    ₴ UAH
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("EUR")}
                    className={`px-3 py-1.5 rounded-full border text-xs tracking-wide ${
                      effectiveCurrency === "EUR"
                        ? "bg-[#8C7461] text-white border-[#8C7461]"
                        : "bg-white border-stone-300 text-stone-900"
                    }`}
                    aria-pressed={effectiveCurrency === "EUR"}
                  >
                    € EUR
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="opacity-80">
                  {messages.header.languageLabel}
                </span>
                <div className="flex items-center gap-2">
                  {["uk", "de", "en"].map((lng) => (
                    <button
                      key={lng}
                      type="button"
                      onClick={() => switchLocale(lng as Locale)}
                      className={`px-3 py-1.5 rounded-full border text-xs tracking-wide ${
                        locale === lng
                          ? "bg-[#8C7461] text-white border-[#8C7461]"
                          : "bg-white border-stone-300 text-stone-900"
                      }`}
                      aria-current={locale === lng ? "page" : undefined}
                    >
                      {lng.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              className="text-start cursor-pointer hover:text-[#8C7461]"
              onClick={() => setView("season")}
            >
              {messages.header.seasonCategory} -{">"}
            </button>
          </nav>
        )}

        {view === "season" && (
          <div>
            <div className="flex justify-between items-center p-4 text-xl sm:text-2xl md:text-3xl">
              <h2 className="font-bold">{messages.header.seasonCategory}</h2>
              <button
                className="text-2xl sm:text-3xl cursor-pointer hover:text-[#8C7461]"
                onClick={() => setView("menu")}
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 px-4 pb-6 gap-3">
              {season_data.map((item, i) => (
                <Link
                  key={i}
                  href={withLocalePath(
                    `/catalog?season=${encodeURIComponent(item.value)}`
                  )}
                  onClick={() => setIsOpen(false)}
                  className="h-[120px] rounded overflow-hidden relative text-white text-xl sm:text-2xl font-bold text-center flex items-center justify-center"
                  style={{
                    backgroundImage: `url(${item.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Dark overlay on image */}
                  <div className="absolute inset-0 bg-black/30" />
                  <span className="relative z-10">{item.label}</span>{" "}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
