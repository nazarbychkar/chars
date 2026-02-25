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
import Pagination from "./Pagination";

const ORDERS_CACHE_KEY = "orders_cache";
const ORDERS_CACHE_EXPIRY_KEY = "orders_cache_expiry";
const CACHE_DURATION = 3 * 60 * 1000; // 3 хвилини

interface Order {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string;
  delivery_method: string;
  city: string;
  post_office: string;
  payment_type: string;
  status: string;
  created_at: Date;
  currency?: "UAH" | "EUR";
  locale?: string | null;
  total_amount?: number;
}

const options = [
  { value: "pending", label: "Очікується" },
  { value: "delivering", label: "Доставляємо" },
  { value: "complete", label: "Завершено" },
];

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Compute total sum for all loaded orders (in their stored currency)
  const totalSum = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + (order.total_amount ?? 0),
      0
    );
  }, [orders]);

  const totalPages = useMemo(() => 
    Math.ceil(orders.length / ordersPerPage), 
    [orders.length]
  );

  const paginatedOrders = useMemo(() => 
    orders.slice(
      (currentPage - 1) * ordersPerPage,
      currentPage * ordersPerPage
    ),
    [orders, currentPage, ordersPerPage]
  );

  // Reset to first page if orders are changed (e.g., after deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [orders, currentPage, totalPages]);

  // Функція для очищення кешу
  const clearCache = () => {
    localStorage.removeItem(ORDERS_CACHE_KEY);
    localStorage.removeItem(ORDERS_CACHE_EXPIRY_KEY);
    setLoading(true);
    window.location.reload();
  };

  async function handleDelete(orderId: number) {
    if (!confirm("Ви впевнені, що хочете видалити це замовлення?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      
      // Оновлюємо стан
      const updatedOrders = orders.filter((o) => o.id !== orderId);
      setOrders(updatedOrders);
      
      // Оновлюємо кеш
      localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(updatedOrders));
      localStorage.setItem(ORDERS_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  }

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Перевірка кешу
        const cachedData = localStorage.getItem(ORDERS_CACHE_KEY);
        const cacheExpiry = localStorage.getItem(ORDERS_CACHE_EXPIRY_KEY);
        const now = Date.now();

        if (cachedData && cacheExpiry && now < parseInt(cacheExpiry)) {
          // Використовуємо кешовані дані
          console.log("Використання кешованих даних замовлень");
          setOrders(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Якщо кеш застарів або відсутній, завантажуємо з сервера
        console.log("Завантаження замовлень з сервера");
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        
        setOrders(data);
        
        // Зберігаємо в кеш
        localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(ORDERS_CACHE_EXPIRY_KEY, (now + CACHE_DURATION).toString());
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  // Handle status change
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Оновлюємо стан
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      
      // Оновлюємо кеш
      localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(updatedOrders));
      localStorage.setItem(ORDERS_CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header with title and add button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                Замовлення
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Загальна сума оплачних замовлень:{" "}
                <span className="font-semibold">
                  {totalSum.toFixed(2)} UAH/EUR
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCache}
                className="inline-block rounded-md bg-gray-400 px-4 py-2 text-white text-sm hover:bg-gray-600 transition"
                title="Очистити кеш та перезавантажити дані"
              >
                🔄 Оновити
              </button>
              <Link
                href="/admin/orders/add"
                className="inline-block rounded-md bg-green-400 px-4 py-2 text-white text-sm hover:bg-green-600 transition"
              >
                + Додати замовлення
              </Link>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Ім&#39;я клієнта
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Номер телефону
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Е-пошта
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Спосіб доставки
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Місто
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Відділення
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Мова / Валюта
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Оплата
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300"
                >
                  Статус
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
                    colSpan={10}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Замовлень не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  >
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {order.customer_name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.phone_number}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.delivery_method}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.city}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.post_office}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex flex-col gap-0.5">
                        <span>{order.locale ? order.locale.toUpperCase() : "—"}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {order.currency === "EUR" ? "€ EUR" : "₴ UAH"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.payment_type === "full"
                        ? "Повна"
                        : order.payment_type === "prepay"
                        ? "Передоплата"
                        : "-"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="border px-2 py-1 rounded text-sm bg-white"
                      >
                        {options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <Link
                        href={`/admin/orders/${order.id}/edit`}
                        className="inline-block rounded-md bg-blue-400 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                      >
                        Детальний огляд
                      </Link>
                      <button
                        onClick={() => handleDelete(order.id)}
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
          {!loading && orders.length > ordersPerPage && (
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
    </div>
  );
}
