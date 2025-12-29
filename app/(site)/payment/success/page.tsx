"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import Link from "next/link";

interface OrderItem {
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  color?: string | null;
}

interface Order {
  id: number;
  customer_name: string;
  phone_number: string;
  email?: string | null;
  delivery_method: string;
  city: string;
  post_office: string;
  comment?: string | null;
  payment_type: string;
  payment_status: string;
  items: OrderItem[];
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useAppContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceId = searchParams.get("invoiceId");

  useEffect(() => {
    if (!invoiceId) {
      router.push("/final");
      return;
    }

    // Clear invoiceId from localStorage on success page
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentInvoiceId");
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/invoice/${invoiceId}`);
        if (!response.ok) {
          console.error("[PaymentSuccess] Error fetching order:", await response.json());
          router.push("/final");
          return;
        }
        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error("[PaymentSuccess] Error:", error);
        router.push("/final");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [invoiceId, router]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
          <p className="font-['Inter']">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div
      className={`min-h-screen py-12 px-4 ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 text-white mb-6">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-['Inter'] mb-4">
            Оплата успішна! ✅
          </h1>
          <p className="text-lg md:text-xl opacity-70 font-['Inter']">
            Ваше замовлення прийнято до обробки
          </p>
        </div>

        {/* Order Details */}
        <div
          className={`border rounded-lg p-6 mb-8 ${
            isDark
              ? "border-gray-700 bg-gray-900"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h2 className="text-xl font-semibold font-['Inter'] mb-4">
            Деталі замовлення
          </h2>
          <div className="space-y-3 font-['Inter']">
            <div>
              <span className="opacity-70">Номер замовлення:</span>{" "}
              <span className="font-semibold">#{order.id}</span>
            </div>
            <div>
              <span className="opacity-70">Ім&apos;я:</span>{" "}
              <span className="font-semibold">{order.customer_name}</span>
            </div>
            <div>
              <span className="opacity-70">Телефон:</span>{" "}
              <span className="font-semibold">{order.phone_number}</span>
            </div>
            {order.email && (
              <div>
                <span className="opacity-70">Email:</span>{" "}
                <span className="font-semibold">{order.email}</span>
              </div>
            )}
            <div>
              <span className="opacity-70">Доставка:</span>{" "}
              <span className="font-semibold">{order.delivery_method}</span>
            </div>
            <div>
              <span className="opacity-70">Місто:</span>{" "}
              <span className="font-semibold">{order.city}</span>
            </div>
            <div>
              <span className="opacity-70">Відділення:</span>{" "}
              <span className="font-semibold">{order.post_office}</span>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-semibold font-['Inter'] mb-3">
                Товари:
              </h3>
              <ul className="space-y-2">
                {order.items.map((item: OrderItem, index: number) => (
                  <li key={index} className="font-['Inter']">
                    {item.product_name}
                    {item.color && ` (${item.color})`} — Розмір: {item.size} ×
                    {item.quantity} — {item.price}₴
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <p className="text-base md:text-lg opacity-70 font-['Inter'] mb-6">
            Ми надішлемо вам SMS з номером відправлення після комплектування
            замовлення.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalog"
              className={`px-6 py-3 rounded border font-['Inter'] transition-all duration-200 ${
                isDark
                  ? "border-gray-600 hover:border-white hover:bg-gray-900"
                  : "border-gray-300 hover:border-black hover:bg-gray-100"
              }`}
            >
              Продовжити покупки
            </Link>
            <Link
              href="/"
              className={`px-6 py-3 rounded font-['Inter'] transition-all duration-200 ${
                isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              На головну
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
          <p className="font-['Inter']">Завантаження...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
