"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { getProductImageSrc } from "@/lib/getFirstProductImage";
import { useProducts } from "@/lib/useProducts";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useBasket } from "@/lib/BasketProvider";
import { buildProductSlug } from "@/lib/slug";

interface SearchSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDark: boolean;
}

export default function SearchSidebar({
  isOpen,
  setIsOpen,
  isDark,
}: SearchSidebarProps) {
  const [query, setQuery] = useState("");
  const { products: allProducts, loading } = useProducts();
  const { locale, messages, withLocalePath } = useI18n();

  const { currency } = useBasket();
  const isEuro =
    (currency ?? (locale === "en" || locale === "de" ? "EUR" : "UAH")) === "EUR";

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allProducts.filter((product) => {
      // Search across all localized names + descriptions
      const fields = [
        product.name,
        product.name_en,
        product.name_de,
        product.description,
        product.description_en,
        product.description_de,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return fields.includes(q);
    });
  }, [allProducts, query]);

  return (
    <div className="relative z-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-4/5 sm:max-w-md ${
          isDark ? "bg-stone-900" : "bg-stone-100"
        } shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto`}
      >
        <div className="flex flex-col p-4 sm:p-6 space-y-6 text-base sm:text-lg">
          {/* Header */}
          <div className="flex justify-between items-center text-xl sm:text-2xl font-semibold">
            <span>{messages.header.searchOpenAria}</span>
            <button
              className="hover:text-[#8C7461] text-2xl"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          {/* Search Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className={`p-3 border text-lg rounded w-full focus:outline-none ${
              isDark
                ? "bg-stone-800 text-white border-stone-700 placeholder-stone-400"
                : "bg-white text-black border-stone-300 placeholder-stone-500"
            }`}
          />

          {/* Search Results */}
          <div className="mt-4">
            {loading && (
              <p className="text-neutral-500">{messages.common.loading}</p>
            )}

            {!loading && query && filteredProducts.length === 0 && (
              <p className="text-neutral-500">
                {messages.common.noResults}
              </p>
            )}

            {!loading && query && filteredProducts.length > 0 && (
              <ul className="flex flex-col gap-4">
                {filteredProducts.map((product) => {
                  const displayName =
                    locale === "en"
                      ? product.name_en || product.name
                      : locale === "de"
                      ? product.name_de || product.name
                      : product.name;
                  const basePrice =
                    isEuro && product.price_eur != null
                      ? product.price_eur
                      : product.price;
                  const currencySymbol = isEuro ? "€" : "₴";

                  return (
                    <li key={product.id}>
                      <Link
                        href={withLocalePath(
                          `/product/${buildProductSlug(product.name, product.id)}`
                        )}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 p-2 rounded hover:bg-opacity-80 transition ${
                          isDark ? "hover:bg-stone-800" : "hover:bg-stone-200"
                        }`}
                      >
                        <Image
                          src={getProductImageSrc(
                            product.first_media,
                            "https://placehold.co/64x64"
                          )}
                          alt={displayName}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{displayName}</span>
                          <span className="text-sm text-gray-500">
                            {basePrice} {currencySymbol}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {!query && !loading && (
              <p className="text-neutral-500">
                Type a query to search products.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
