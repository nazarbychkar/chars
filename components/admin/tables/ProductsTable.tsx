"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";
import Image from "next/image";
import Pagination from "./Pagination";
import { getProductImageSrc } from "@/lib/getFirstProductImage";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

const CACHE_KEY = "products_cache";
const CACHE_EXPIRY_KEY = "products_cache_expiry";
const CACHE_DURATION = 5 * 60 * 1000; // 5 хвилин

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  price_eur?: number | null;
  created_at: Date;
  sizes: { size: string }[];
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string;
  category_name?: string;
  color: string;
  first_media?: { url: string; type: string } | null;
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Local search inside admin products table
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.category_name || "").toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    });
  }, [products, searchQuery]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / productsPerPage),
    [filteredProducts.length]
  );

  const paginatedProducts = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
      ),
    [filteredProducts, currentPage, productsPerPage]
  );

  // Reset to first page if products list or search results change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [filteredProducts.length, currentPage, totalPages]);

  // Функція для очищення кешу
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    setLoading(true);
    window.location.reload();
  };

  async function handleDelete(productId: number) {
    if (!confirm("Ви впевнені, що хочете видалити цей продукт?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");

      // Оновлюємо стан
      const updatedProducts = products.filter((p) => p.id !== productId);
      setProducts(updatedProducts);

      // Оновлюємо кеш
      localStorage.setItem(CACHE_KEY, JSON.stringify(updatedProducts));
      localStorage.setItem(
        CACHE_EXPIRY_KEY,
        (Date.now() + CACHE_DURATION).toString()
      );
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Перевірка кешу
        const cachedData = localStorage.getItem(CACHE_KEY);
        const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
        const now = Date.now();

        if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
          // Використовуємо кешовані дані
          console.log("Використання кешованих даних продуктів");
          setProducts(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Якщо кеш застарів або відсутній, завантажуємо з сервера
        console.log("Завантаження продуктів з сервера");
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();

        setProducts(data);
        console.log(data[0].name);

        console.log(data[0].media);

        // Зберігаємо в кеш
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(
          CACHE_EXPIRY_KEY,
          (now + CACHE_DURATION).toString()
        );
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Header + local search */}
      <div className="px-4 py-4 border-b border-gray-100 dark:border-white/[0.05] flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          Продукти
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Пошук за назвою, ID або категорією"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/40 sm:w-72"
          />
          <div className="flex gap-2">
            <button
              onClick={clearCache}
              className="inline-flex items-center justify-center rounded-md bg-gray-500 px-3 py-2 text-xs font-medium text-white hover:bg-gray-700 transition"
              title="Очистити кеш та перезавантажити дані"
            >
              🔄 Оновити
            </button>
            <Link
              href="/admin/products/add"
              className="inline-flex items-center justify-center rounded-md bg-green-500 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition"
            >
              + Додати продукт
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop / tablet table */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Фото
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Назва
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Опис
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Ціна (₴ / €)
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Розміри
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Категорія
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Сезон
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Колір
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Топ продаж?
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Лімітована серія?
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Створено
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Дії
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    {searchQuery
                      ? "За вашим запитом товарів не знайдено."
                      : "Продуктів не знайдено."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4">
                      {product.first_media ? (
                        <div className="relative w-12 h-12">
                          <Image
                            src={getProductImageSrc(product.first_media)}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover rounded"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {product.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-[360px]">
                      {(product.description || "").length > 20
                        ? `${product.description.slice(0, 20)}…`
                        : product.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex flex-col">
                        <span>{product.price} ₴</span>
                        {product.price_eur != null && (
                          <span className="text-xs text-gray-500">
                            {product.price_eur} €
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.sizes && product.sizes.length > 0
                        ? product.sizes
                            .map((s) => SIZE_MAP[s.size] || s.size)
                            .join(", ")
                        : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.category_name || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {Array.isArray(product.season)
                        ? product.season.length > 0
                          ? product.season.join(", ")
                          : "—"
                        : product.season || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.color || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.top_sale ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.limited_edition ? "✅" : "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-block rounded-md bg-blue-400 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                      >
                        Редагувати
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="inline-block rounded-md bg-red-400 px-3 py-1 text-white text-sm hover:bg-red-600 transition"
                      >
                        Видалити
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!loading && filteredProducts.length > productsPerPage && (
            <div className="flex justify-end px-5 py-4 border-t border-gray-100 dark:border-white/[0.05]">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden px-4 pb-4 pt-2 space-y-3">
        {loading ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Завантаження...
          </p>
        ) : filteredProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {searchQuery
              ? "За вашим запитом товарів не знайдено."
              : "Продуктів не знайдено."}
          </p>
        ) : (
          paginatedProducts.map((product) => (
            <div
              key={product.id}
              className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex-shrink-0">
                {product.first_media ? (
                  <Image
                    src={getProductImageSrc(product.first_media)}
                    alt={product.name}
                    width={72}
                    height={96}
                    className="h-24 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-16 items-center justify-center rounded bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">
                    Немає
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="text-xs text-gray-400">ID: {product.id}</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2">
                      {product.name}
                    </div>
                    {product.category_name && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Категорія: {product.category_name}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {product.price} ₴
                    </div>
                    {product.price_eur != null && (
                      <div className="text-xs text-gray-500">
                        {product.price_eur} €
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 text-[11px] text-gray-600 dark:text-gray-400">
                  {product.sizes && product.sizes.length > 0 && (
                    <span>
                      Розміри:{" "}
                      {product.sizes
                        .map((s) => SIZE_MAP[s.size] || s.size)
                        .join(", ")}
                    </span>
                  )}
                  {product.season && (
                    <span>
                      Сезон:{" "}
                      {Array.isArray(product.season)
                        ? product.season.join(", ")
                        : product.season}
                    </span>
                  )}
                  {product.color && <span>Колір: {product.color}</span>}
                  {product.top_sale && (
                    <span className="text-green-600">Топ продаж</span>
                  )}
                  {product.limited_edition && (
                    <span className="text-orange-600">Лімітована серія</span>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="text-[11px] text-gray-400">
                    {new Date(product.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="rounded-md bg-blue-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-blue-600"
                    >
                      Редагувати
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-md bg-red-500 px-2 py-1 text-[11px] font-medium text-white hover:bg-red-600"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && filteredProducts.length > productsPerPage && (
          <div className="mt-3 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
