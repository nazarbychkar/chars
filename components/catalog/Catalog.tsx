"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation"; // Next.js 13+ client hook for reading query params
import SidebarFilter from "../layout/SidebarFilter";
import { useAppContext } from "@/lib/GeneralProvider";
import SidebarMenu from "../layout/SidebarMenu";
import Link from "next/link";
import Image from "next/image";
import { getProductImageSrc, getFirstMedia } from "@/lib/getFirstProductImage";
import { cachedFetch, CACHE_KEYS } from "@/lib/cache";
import AutoPlayVideo from "@/components/shared/AutoPlayVideo";

interface Product {
  id: number;
  name: string;
  price: number;
  first_media?: { url: string; type: string } | null;
  sizes?: { size: string; stock: string }[];
  color?: string;
}

export default function Catalog() {
  const { isDark, isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const searchParams = useSearchParams();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes?.some((s) => selectedSizes.includes(s.size));

      const matchesColor =
        selectedColors.length === 0 || (product.color && selectedColors.includes(product.color));

      const matchesMinPrice = minPrice === null || product.price >= minPrice;
      const matchesMaxPrice = maxPrice === null || product.price <= maxPrice;

      return matchesSize && matchesMinPrice && matchesMaxPrice && matchesColor;
    });
  }, [products, selectedSizes, minPrice, maxPrice, selectedColors]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) =>
      sortOrder === "asc" ? a.price - b.price : b.price - a.price
    );
  }, [filteredProducts, sortOrder]);

  // Read filters from URL params
  const category = searchParams.get("category");
  const season = searchParams.get("season");
  const subcategory = searchParams.get("subcategory");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        let url = "/api/products";
        let cacheKey = CACHE_KEYS.PRODUCTS;

        if (subcategory) {
          url = `/api/products/subcategory?subcategory=${encodeURIComponent(
            subcategory
          )}`;
          cacheKey = CACHE_KEYS.PRODUCTS_SUBCATEGORY(subcategory);
        } else if (category) {
          url = `/api/products/category?category=${encodeURIComponent(
            category
          )}`;
          cacheKey = CACHE_KEYS.PRODUCTS_CATEGORY(category);
        } else if (season) {
          url = `/api/products/season?season=${encodeURIComponent(season)}`;
          cacheKey = CACHE_KEYS.PRODUCTS_SEASON(season);
        }

        const data = await cachedFetch<Product[]>(url, cacheKey);
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    }
    // Fetch colors
    async function fetchColors() {
      try {
        const data = await cachedFetch<{ color: string }[]>(
          "/api/colors",
          CACHE_KEYS.COLORS
        );
        const colorNames = data.map((item) => item.color);
        setColors(colorNames);
      } catch (err: unknown) {
        console.error("Error fetching colors:", err);
        setError("Failed to fetch colors");
      }
    }

    fetchProducts();
    fetchColors();
  }, [category, season, subcategory]); // refetch if URL params change

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <section className="max-w-[1824px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 mt-10 mb-20">
        {/* Top Controls */}
        <div className="flex justify-between items-center text-xl sm:text-2xl md:text-3xl mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="cursor-pointer text-2xl sm:text-3xl"
            >
              {"<"}
            </button>
            <span>
              {subcategory
                ? `Підкатегорія ${subcategory}${
                    category ? ` (Категорія ${category})` : ""
                  }`
                : category
                ? `Категорія ${category}`
                : season
                ? `Сезон ${season}`
                : "Усі товари"}
            </span>
          </div>

          <button
            className="cursor-pointer text-base sm:text-lg"
            onClick={() => setIsFilterOpen(true)}
          >
            Фільтри
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map((product) => {
            // Debug logging
            if (product.first_media) {
              console.log(`[Catalog] Product ${product.id} - first_media:`, product.first_media);
            }
            
            return (
            <Link
              href={`/product/${product.id}`}
              key={product.id}
              className="flex flex-col gap-4 group"
            >
              {/* Image or Video */}
              <div className="relative w-full aspect-[2/3] bg-gray-200 group-hover:filter group-hover:brightness-90 transition duration-300 overflow-hidden">
                {product.first_media?.type === "video" ? (
                  <AutoPlayVideo
                    src={`/api/images/${product.first_media.url}`}
                    className="object-cover transition-all duration-300 group-hover:brightness-90 w-full h-full"
                  />
                ) : (
                  <Image
                    src={getProductImageSrc(product.first_media)}
                    alt={product.name}
                    className="object-cover transition-all duration-300 group-hover:brightness-90"
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                )}
              </div>

              {/* Product Title + Price */}
              <span className="text-base sm:text-lg">
                {product.name}
                <br /> {product.price}₴
              </span>
            </Link>
          );
          })}
        </div>
      </section>

      <SidebarFilter
        isDark={isDark}
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        openAccordion={openAccordion}
        setOpenAccordion={setOpenAccordion}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        colors={colors}
      />

      {/* Menu Sidebar */}
      <SidebarMenu
        isDark={isDark}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </>
  );
}
