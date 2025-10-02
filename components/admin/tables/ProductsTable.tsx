"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Link from "next/link";

const SIZE_MAP: Record<string, string> = {
  "1": "XL",
  "2": "L",
  "3": "M",
  "4": "S",
  "5": "XS",
};

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  created_at: Date;
  sizes: { size: string }[];
  top_sale?: boolean;
  limited_edition?: boolean;
  season?: string;
  category_name?: string;
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleDelete(productId: number) {
    if (!confirm("Ви впевнені, що хочете видалити цей продукт?")) return;
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
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
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Продукти
            </h2>
            <Link
              href="/admin/products/add"
              className="inline-block rounded-md bg-green-400 px-4 py-2 text-white text-sm hover:bg-green-600 transition"
            >
              + Додати продукт
            </Link>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
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
                  Ціна
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
                    colSpan={6}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Продуктів не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {product.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.price} ₴
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
                      {product.season || "—"}
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
        </div>
      </div>
    </div>
  );
}
