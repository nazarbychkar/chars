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

interface Order {
  id: number;
  customer_name: string;
  phone_number: string;
  email: string;
  delivery_method: string;
  city: string;
  post_office: string;
  status: string;
  created_at: Date;
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleDelete(orderId: number) {
    if (!confirm("Ви впевнені, що хочете видалити це замовлення?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  }

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header with title and add button */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              Замовлення
            </h2>
            <Link
              href="/admin/orders/add"
              className="inline-block rounded-md bg-green-400 px-4 py-2 text-white text-sm hover:bg-green-600 transition"
            >
              + Додати замовлення
            </Link>
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
                    colSpan={9}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Завантаження...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-6 text-gray-500 dark:text-gray-400"
                  >
                    Замовлень не знайдено.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
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
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.status}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 space-x-2">
                      <Link
                        href={`/admin/orders/${order.id}/edit`}
                        className="inline-block rounded-md bg-blue-400 px-3 py-1 text-white text-sm hover:bg-blue-600 transition"
                      >
                        Редагувати
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
        </div>
      </div>
    </div>
  );
}
