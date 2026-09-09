"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppContext } from "@/lib/GeneralProvider";
import { useI18n } from "@/lib/i18n/I18nProvider";

type PaymentStatusPayload = {
  payment_status: string;
  delivery_method?: string;
  locale?: string | null;
};

function localePrefixFromData(
  locale: string | null | undefined,
  typeCertificate: boolean
): string {
  if (locale === "uk") return "/uk";
  if (locale === "de") return "/de";
  if (locale === "en") return "/en";
  if (typeCertificate) return "/uk";
  return "/uk";
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isDark } = useAppContext();
  const { messages, withLocalePath } = useI18n();
  const [status, setStatus] = useState<"loading" | "checking" | "error">(
    "loading"
  );

  const invoiceIdFromQuery =
    searchParams.get("invoiceId") || searchParams.get("invoice_id");
  const paymentRefFromQuery = searchParams.get("ref");
  const isCertificateReturn = searchParams.get("type") === "certificate";
  const isInstallmentsReturn = searchParams.get("type") === "installments";

  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [resolveDone, setResolveDone] = useState(false);

  const redirectForOrder = useCallback(
    (data: PaymentStatusPayload, activeInvoiceId: string) => {
      const prefix = localePrefixFromData(
        data.locale,
        isCertificateReturn || data.delivery_method === "certificate"
      );
      const isCertificate =
        data.delivery_method === "certificate" || isCertificateReturn;

      if (data.payment_status === "paid") {
        localStorage.removeItem("currentInvoiceId");
        localStorage.removeItem("currentPaymentRef");

        if (isCertificate) {
          router.replace(
            `${prefix}/payment/success?invoiceId=${encodeURIComponent(activeInvoiceId)}`
          );
          return;
        }

        router.replace(
          `${prefix}/final?payment=success&invoiceId=${encodeURIComponent(activeInvoiceId)}`
        );
        return;
      }

      if (data.payment_status === "pending") {
        return;
      }

      if (isCertificate) {
        router.replace(withLocalePath("/certificate"));
        return;
      }

      router.replace(`${prefix}/final`);
    },
    [router, isCertificateReturn, withLocalePath]
  );

  useEffect(() => {
    let cancelled = false;

    const resolveInvoiceId = async (): Promise<string | null> => {
      if (invoiceIdFromQuery) {
        return invoiceIdFromQuery;
      }

      if (paymentRefFromQuery) {
        try {
          const response = await fetch(
            `/api/orders/by-payment-ref?ref=${encodeURIComponent(paymentRefFromQuery)}`
          );
          if (response.ok) {
            const data = await response.json();
            if (typeof data.invoiceId === "string") {
              localStorage.setItem("currentInvoiceId", data.invoiceId);
              return data.invoiceId;
            }
          }
        } catch (error) {
          console.error("[PaymentStatus] Failed to resolve payment ref:", error);
        }
      }

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("currentInvoiceId");
        if (stored) return stored;
      }

      return null;
    };

    (async () => {
      const resolved = await resolveInvoiceId();
      if (cancelled) return;

      setInvoiceId(resolved);
      setResolveDone(true);

      if (!resolved) {
        setStatus("error");
        setTimeout(() => {
          router.replace(
            isCertificateReturn
              ? withLocalePath("/certificate")
              : withLocalePath("/final")
          );
        }, 2500);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    invoiceIdFromQuery,
    paymentRefFromQuery,
    router,
    isCertificateReturn,
    withLocalePath,
  ]);

  useEffect(() => {
    if (!resolveDone || !invoiceId) return;

    const checkPaymentStatus = async () => {
      try {
        setStatus("checking");
        const response = await fetch(`/api/orders/status/${invoiceId}`);
        const data = await response.json();

        if (!response.ok) {
          console.error("[PaymentStatus] Error checking status:", data);
          setStatus("error");
          setTimeout(() => {
            router.replace(
              isCertificateReturn
                ? withLocalePath("/certificate")
                : withLocalePath("/final")
            );
          }, 2000);
          return;
        }

        redirectForOrder(data, invoiceId);
      } catch (error) {
        console.error("[PaymentStatus] Error:", error);
        setStatus("error");
        setTimeout(() => {
          router.replace(
            isCertificateReturn
              ? withLocalePath("/certificate")
              : withLocalePath("/final")
          );
        }, 2000);
      }
    };

    const initialDelay = setTimeout(() => {
      checkPaymentStatus();
    }, 400);

    let pollCount = 0;
    const maxPolls = 30;
    const pollInterval = setInterval(async () => {
      pollCount++;
      if (pollCount >= maxPolls) {
        clearInterval(pollInterval);
        try {
          const response = await fetch(`/api/orders/status/${invoiceId}`);
          const data = await response.json();
          if (response.ok && data.payment_status === "paid") {
            redirectForOrder(data, invoiceId);
            return;
          }
        } catch {
          /* fall through */
        }
        router.replace(
          isCertificateReturn
            ? withLocalePath("/certificate")
            : withLocalePath("/final")
        );
        return;
      }
      checkPaymentStatus();
    }, 2000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(pollInterval);
    };
  }, [
    resolveDone,
    invoiceId,
    router,
    redirectForOrder,
    isCertificateReturn,
    withLocalePath,
  ]);

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
        <h1 className="text-2xl md:text-3xl mb-4">
          {messages.checkout.paymentStatusTitle}
        </h1>
        <p className="text-base md:text-lg opacity-70">
          {isInstallmentsReturn
            ? messages.checkout.paymentStatusInstallmentsDescription
            : messages.checkout.paymentStatusDescription}
        </p>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-current mb-4"></div>
            <p className="text-base md:text-lg opacity-70">Завантаження...</p>
          </div>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
