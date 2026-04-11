"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Link from "next/link";
import { trackFbqPurchase } from "@/lib/fbq";

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
  currency?: string | null;
  items: OrderItem[];
}

type Outcome =
  | "idle"
  | "loading"
  | "polling"
  | "success"
  | "failed"
  | "timeout"
  | "error";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useAppContext();
  const { messages, withLocalePath } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [outcome, setOutcome] = useState<Outcome>("idle");
  const [invoiceId, setInvoiceId] = useState<string | null | undefined>(
    undefined
  );
  const purchaseSentRef = useRef(false);
  const pollCountRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromQuery = searchParams.get("invoiceId");
    if (fromQuery) {
      localStorage.setItem("currentInvoiceId", fromQuery);
      setInvoiceId(fromQuery);
    } else {
      setInvoiceId(localStorage.getItem("currentInvoiceId"));
    }
  }, [searchParams]);

  useEffect(() => {
    if (invoiceId === undefined) return;

    if (!invoiceId) {
      router.push(withLocalePath("/final"));
      return;
    }

    setOutcome("loading");
    pollCountRef.current = 0;

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stopPolling = () => {
      if (intervalId != null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const poll = async () => {
      if (cancelled) return;
      try {
        const response = await fetch(
          `/api/orders/status/${encodeURIComponent(invoiceId)}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            setOutcome("error");
            localStorage.removeItem("currentInvoiceId");
            stopPolling();
            router.push(withLocalePath("/final"));
            return;
          }
          const err = await response.json().catch(() => ({}));
          console.error("[PaymentSuccess] Status error:", err);
          setOutcome("error");
          localStorage.removeItem("currentInvoiceId");
          stopPolling();
          router.push(withLocalePath("/final"));
          return;
        }

        const data = (await response.json()) as {
          payment_status?: string;
        };

        if (cancelled) return;

        if (data.payment_status === "paid") {
          const orderRes = await fetch(
            `/api/orders/invoice/${encodeURIComponent(invoiceId)}`
          );
          if (!orderRes.ok) {
            console.error("[PaymentSuccess] Order fetch failed");
            setOutcome("error");
            localStorage.removeItem("currentInvoiceId");
            stopPolling();
            router.push(withLocalePath("/final"));
            return;
          }
          const fullOrder = (await orderRes.json()) as Order;
          if (fullOrder.payment_status !== "paid") {
            setOutcome("timeout");
            localStorage.removeItem("currentInvoiceId");
            stopPolling();
            return;
          }
          setOrder(fullOrder);
          setOutcome("success");
          localStorage.removeItem("currentInvoiceId");
          stopPolling();
          return;
        }

        if (data.payment_status === "canceled") {
          setOutcome("failed");
          localStorage.removeItem("currentInvoiceId");
          stopPolling();
          return;
        }

        if (data.payment_status === "pending") {
          pollCountRef.current += 1;
          setOutcome("polling");
          if (pollCountRef.current >= MAX_POLLS) {
            setOutcome("timeout");
            localStorage.removeItem("currentInvoiceId");
            stopPolling();
          }
        }
      } catch (e) {
        console.error("[PaymentSuccess] Poll error:", e);
        if (!cancelled) {
          setOutcome("error");
          localStorage.removeItem("currentInvoiceId");
          stopPolling();
          router.push(withLocalePath("/final"));
        }
      }
    };

    void poll();
    intervalId = setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [invoiceId, router, withLocalePath]);

  useEffect(() => {
    if (outcome !== "success" || !order || purchaseSentRef.current) return;
    if (typeof window === "undefined") return;

    purchaseSentRef.current = true;

    const totalValue =
      order.items?.reduce(
        (sum: number, item: OrderItem) =>
          sum + Number(item.price) * item.quantity,
        0
      ) ?? 0;
    const currency =
      order.currency === "EUR" || order.currency === "UAH"
        ? order.currency
        : "UAH";

    trackFbqPurchase(order);

    if (window.clarity) {
      window.clarity("event", "purchase", {
        orderId: order.id,
        value: totalValue,
        currency,
        items: order.items.length,
      });
    }
  }, [order, outcome]);

  const loading =
    outcome === "idle" ||
    outcome === "loading" ||
    outcome === "polling";

  if (loading || outcome === "error") {
    if (outcome === "error") return null;
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div className="text-center px-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4" />
          <h1 className="text-xl md:text-2xl font-['Inter'] mb-2">
            {messages.checkout.paymentStatusTitle}
          </h1>
          <p className="text-base opacity-70 font-['Inter']">
            {messages.checkout.paymentStatusDescription}
          </p>
        </div>
      </div>
    );
  }

  if (outcome === "failed" || outcome === "timeout") {
    const title =
      outcome === "failed"
        ? messages.checkout.paymentFailedTitle
        : messages.checkout.paymentStatusTimeoutTitle;
    const description =
      outcome === "failed"
        ? messages.checkout.paymentFailedDescription
        : messages.checkout.paymentStatusTimeoutDescription;

    return (
      <div
        className={`min-h-screen flex items-center justify-center py-12 px-4 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 mb-6">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-['Inter'] mb-4">
            {title}
          </h1>
          <p className="text-base md:text-lg opacity-80 font-['Inter'] mb-8">
            {description}
          </p>
          <Link
            href={withLocalePath("/final")}
            className={`inline-block px-6 py-3 rounded font-['Inter'] transition-all duration-200 ${
              isDark
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {messages.checkout.backToCheckout}
          </Link>
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

          {order.items && order.items.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-lg font-semibold font-['Inter'] mb-3">
                Товари:
              </h3>
              <ul className="space-y-2">
                {order.items.map((item: OrderItem, index: number) => (
                  <li key={index} className="font-['Inter']">
                    {item.product_name}
                    {item.color &&
                      ` (${messages.catalog.colorNames[item.color] || item.color})`}{" "}
                    — Розмір: {item.size} ×
                    {item.quantity} — {item.price}₴
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="text-center space-y-4">
          <p className="text-base md:text-lg opacity-70 font-['Inter'] mb-6">
            Ми надішлемо вам SMS з номером відправлення після комплектування
            замовлення.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={withLocalePath("/catalog")}
              className={`px-6 py-3 rounded border font-['Inter'] transition-all duration-200 ${
                isDark
                  ? "border-gray-600 hover:border-white hover:bg-gray-900"
                  : "border-gray-300 hover:border-black hover:bg-gray-100"
              }`}
            >
              Продовжити покупки
            </Link>
            <Link
              href={withLocalePath("/")}
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4" />
            <p className="text-base md:text-lg opacity-70">Завантаження...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
