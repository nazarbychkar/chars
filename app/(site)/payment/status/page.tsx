"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useAppContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [status, setStatus] = useState<"loading" | "checking" | "error">("loading");
  
  // Get invoiceId from query params or localStorage
  const invoiceIdFromQuery = searchParams.get("invoiceId");
  const [invoiceId, setInvoiceId] = useState<string | null>(
    invoiceIdFromQuery || (typeof window !== "undefined" ? localStorage.getItem("currentInvoiceId") : null)
  );

  useEffect(() => {
    // If invoiceId from query params, update localStorage
    if (invoiceIdFromQuery) {
      localStorage.setItem("currentInvoiceId", invoiceIdFromQuery);
      setInvoiceId(invoiceIdFromQuery);
    }

    if (!invoiceId) {
      setStatus("error");
      setTimeout(() => {
        router.push("/final");
      }, 3000);
      return;
    }

    // Add a small delay to ensure we're only checking status AFTER user has attempted payment
    // This prevents premature redirects if user somehow lands on this page before payment attempt
    const checkPaymentStatus = async () => {
      try {
        setStatus("checking");
        const response = await fetch(`/api/orders/status/${invoiceId}`);
        const data = await response.json();

        if (!response.ok) {
          console.error("[PaymentStatus] Error checking status:", data);
          // If order not found or error, redirect to final page
          setTimeout(() => {
            router.push("/final");
          }, 2000);
          return;
        }

        // Only redirect to final page with success parameter if payment is actually paid
        // This page should only be reached AFTER payment attempt (via redirectUrl from Monobank)
        if (data.payment_status === "paid") {
          // Clear invoiceId from localStorage on success
          localStorage.removeItem("currentInvoiceId");
          // Redirect to final page with payment success parameter
          router.push(`/final?payment=success&invoiceId=${invoiceId}`);
          return;
        }

        // If payment status is "pending", stay on status page and continue polling
        // This is the expected state when user returns from Monobank payment page
        if (data.payment_status === "pending") {
          // Continue polling - don't redirect yet
          return;
        }

        // If payment not yet completed or other status, redirect back to final page
        setTimeout(() => {
          router.push("/final");
        }, 2000);
      } catch (error) {
        console.error("[PaymentStatus] Error:", error);
        setStatus("error");
        setTimeout(() => {
          router.push("/final");
        }, 2000);
      }
    };

    // Small delay before first check to ensure this page is only reached after payment attempt
    const initialDelay = setTimeout(() => {
      checkPaymentStatus();
    }, 500);

    // Set up polling to check status every 2 seconds (max 30 seconds)
    let pollCount = 0;
    const maxPolls = 15;
    const pollInterval = setInterval(() => {
      pollCount++;
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        router.push("/final");
        return;
      }
      checkPaymentStatus();
    }, 2000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(pollInterval);
    };
  }, [invoiceId, invoiceIdFromQuery, router]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="text-center p-8">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current"></div>
        </div>
        <h1 className="text-2xl md:text-3xl font-['Inter'] mb-4">
          Перевірка статусу оплати...
        </h1>
        <p className="text-base md:text-lg opacity-70 font-['Inter']">
          Будь ласка, зачекайте
        </p>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
          <p className="text-base md:text-lg opacity-70">Завантаження...</p>
        </div>
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  );
}
