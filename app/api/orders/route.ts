import { NextRequest, NextResponse } from "next/server";
import { sqlGetAllOrders, sqlPostOrder, sql } from "@/lib/sql";
import crypto from "crypto";

type IncomingOrderItem = {
  product_id?: number | string;
  productId?: number | string;
  price: number | string;
  quantity: number | string;
  product_name?: string;
  name?: string;
  size: string | number;
  color?: string | null;
};

type NormalizedOrderItem = {
  product_id: number;
  product_name: string;
  size: string;
  quantity: number;
  price: number;
  color: string | null;
};

// ==========================
// GET /api/orders
// ==========================
export async function GET() {
  try {
    const orders = await sqlGetAllOrders();

    // Also return pre-calculated totals per order based on order_items
    const ids = orders.map((o: { id: number }) => o.id);
    if (!ids.length) {
      return NextResponse.json([]);
    }

    const totals = await sql`
      SELECT
        order_id,
        SUM(price * quantity) AS total_amount
      FROM order_items
      WHERE order_id = ANY(${ids}::int[])
      GROUP BY order_id;
    `;

    const totalsMap = new Map<number, number>();
    for (const row of totals as { order_id: number; total_amount: string | number }[]) {
      const raw = typeof row.total_amount === "string"
        ? Number(row.total_amount)
        : row.total_amount;
      totalsMap.set(row.order_id, Number(raw || 0));
    }

    const withTotals = orders.map(
      (o: { id: number } & Record<string, unknown>) => ({
      ...o,
      total_amount: totalsMap.get(o.id) ?? 0,
      })
    );

    return NextResponse.json(withTotals);
  } catch (error) {
    console.error("[GET /orders]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ==========================
// POST /api/orders
// ==========================
export async function POST(req: NextRequest) {
  // Will be filled from request body and reused in error handler
  let requestLocale: string | null = null;

  try {
    console.log("=".repeat(50));
    console.log("[POST /api/orders] Starting order creation...");
    
    const body = await req.json();
    console.log("[POST /api/orders] Received body:", JSON.stringify(body, null, 2));

    const {
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type, // "full" або "prepay"
      items,
      currency,
      locale,
    } = body;

    requestLocale = typeof locale === "string" ? locale : null;

    console.log("[POST /api/orders] Extracted data:", {
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      payment_type,
      itemsCount: items?.length,
    });

    // ✅ Basic validation
    if (
      !customer_name ||
      !phone_number ||
      !delivery_method ||
      !city ||
      !post_office ||
      !items?.length
    ) {
      console.error("[POST /api/orders] Validation failed:", {
        hasCustomerName: !!customer_name,
        hasPhoneNumber: !!phone_number,
        hasDeliveryMethod: !!delivery_method,
        hasCity: !!city,
        hasPostOffice: !!post_office,
        hasItems: !!items?.length,
      });
      return NextResponse.json(
        { error: "Будь ласка, заповніть усі необхідні поля, щоб ми змогли швидко обробити ваше замовлення ✨" },
        { status: 400 }
      );
    }
    console.log("[POST /api/orders] Validation passed");

        const normalizedItems: NormalizedOrderItem[] = (items || []).map(
          (item: IncomingOrderItem) => {
        const productIdRaw = item.product_id ?? item.productId;
        const productId = Number(productIdRaw);
        if (!Number.isFinite(productId)) {
          throw new Error(
            `Нам не вдалося розпізнати один з товарів у вашому замовленні. Будь ласка, спробуйте оформити замовлення ще раз.`
          );
        }

        const price =
          typeof item.price === "string" ? Number(item.price) : item.price;
        if (!Number.isFinite(price)) {
          throw new Error(
            `Виникла помилка при обробці ціни товару. Будь ласка, оновіть сторінку та спробуйте ще раз.`
          );
        }

        const quantity =
          typeof item.quantity === "string"
            ? Number(item.quantity)
            : item.quantity;
        if (!Number.isFinite(quantity)) {
          throw new Error(
            `Нам не вдалося визначити кількість товару. Будь ласка, перевірте ваше замовлення та спробуйте ще раз.`
          );
        }

        return {
          product_id: productId,
          product_name:
            item.product_name ||
            item.name ||
            `Товар #${productId}`,
          size: String(item.size),
          quantity,
          price,
          color: item.color ?? null,
        };
      }
    );

    const fullAmount = normalizedItems.reduce(
      (total: number, item) => total + item.price * item.quantity,
      0
    );

    // Вибрана валюта на сайті
    const isEuroSelected = currency === "EUR";
    // В дев-режимі Monobank працює тільки в гривні
    const IS_DEV =
      process.env.DEV === "True" ||
      process.env.DEV === "true" ||
      process.env.DEV === "1";
    const isEuroForMono = !IS_DEV && isEuroSelected;
    const amountToPay = payment_type === "prepay" ? 300 : fullAmount;
    const amountInMinorUnits = Math.round(amountToPay * 100);
    
    console.log("[POST /api/orders] Amount calculation:", {
      fullAmount,
      amountToPay,
      amountInMinorUnits,
      payment_type,
      currency,
      isEuroSelected,
      isEuroForMono,
      DEV: process.env.DEV,
    });

    const basketOrder = normalizedItems.map((item) => ({
      name: item.color ? `${item.product_name} (${item.color})` : item.product_name,
      qty: item.quantity,
      sum: Math.round(item.price * item.quantity * 100),
      total: Math.round(item.price * item.quantity * 100),
      unit: "шт.",
      code: item.color
        ? `${item.product_id}-${item.size}-${item.color}`
        : `${item.product_id}-${item.size}`,
    }));

    const reference = crypto.randomUUID();
    console.log("[POST /api/orders] Generated reference:", reference);

    // ✅ Створення інвойсу Monobank

    // NOTE: Monobank webhooks must be able to reach your server from the public internet.
    // If you use "localhost" in webHookUrl, Monobank cannot call it unless you tunnel (e.g. with ngrok).
    // Use your public domain or a tunnel URL for webHookUrl and redirectUrl.

    // For local development, set up a tunnel (e.g. ngrok) and use its URL here:
    // const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
    // Example: "https://abc123.ngrok.app"

    // Use NEXT_PUBLIC_PUBLIC_URL (recommended) or PUBLIC_URL for compatibility
    // Recommended: Set NEXT_PUBLIC_PUBLIC_URL in your .env file
    const PUBLIC_URL =
      process.env.NEXT_PUBLIC_PUBLIC_URL || 
      process.env.PUBLIC_URL || 
      "https://charsua.com";
    
    console.log("[POST /api/orders] PUBLIC_URL:", PUBLIC_URL);
    console.log("[POST /api/orders] MONO_TOKEN exists:", !!process.env.NEXT_PUBLIC_MONO_TOKEN);

    // Determine locale-specific path prefix for redirect
    const orderLocale = typeof locale === "string" ? locale : null;
    const localePath =
      orderLocale === "uk" || orderLocale === "de" || orderLocale === "en"
        ? `/${orderLocale}`
        : "";

    const invoicePayload = {
      amount: amountInMinorUnits,
      // Якщо DEV=True, завжди гривня (980)
      ccy: isEuroForMono ? 978 : 980,
      merchantPaymInfo: {
        reference,
        destination: "Оплата замовлення",
        comment: comment || "Оплата замовлення",
        basketOrder,
      },
      // Redirect back to locale-specific payment status page
      redirectUrl: `${PUBLIC_URL}${localePath}/payment/status`, // Payment status page will check localStorage for invoiceId
      webHookUrl: `${PUBLIC_URL}/api/mono-webhook`,
      validity: 3600,
      paymentType: "debit",
    };
    
    console.log("[POST /api/orders] Creating invoice with payload:", JSON.stringify(invoicePayload, null, 2));

    const monoRes = await fetch(
      "https://api.monobank.ua/api/merchant/invoice/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": process.env.NEXT_PUBLIC_MONO_TOKEN!,
        },
        body: JSON.stringify(invoicePayload),
      }
    );
    
    console.log("[POST /api/orders] Monobank response status:", monoRes.status);
    console.log("[POST /api/orders] Monobank response ok:", monoRes.ok);

    const invoiceData = await monoRes.json();
    console.log("[POST /api/orders] Invoice data response:", JSON.stringify(invoiceData, null, 2));
    
    if (!monoRes.ok) {
      console.error("[POST /api/orders] Monobank error:", invoiceData);
      return NextResponse.json(
        { error: "На жаль, наразі ми не можемо створити рахунок для оплати. Будь ласка, спробуйте через кілька хвилин або зв'яжіться з нашою службою підтримки.", details: invoiceData },
        { status: 500 }
      );
    }

    const { invoiceId, pageUrl } = invoiceData;
    
    console.log("[POST /api/orders] Extracted from invoice data:", {
      invoiceId,
      pageUrl,
    });

    // ✅ Зберігання замовлення у БД (статус "pending" - ще не оплачено)
    console.log("[POST /api/orders] Saving order to database...");
    await sqlPostOrder({
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type,
      invoice_id: invoiceId,
      payment_status: "pending", // замовлення створено, але ще не оплачено
      // У БД зберігаємо саме вибрану валюту на сайті
      currency: isEuroSelected ? "EUR" : "UAH",
      locale: typeof locale === "string" ? locale : null,
      items: normalizedItems.map(
        ({ product_id, size, quantity, price, color }) => ({
          product_id,
          size,
          quantity,
          price,
          color,
        })
      ),
    });
    console.log("[POST /api/orders] Order saved to database successfully");

    // ✅ НЕ відправляємо в Telegram поки не оплачено
    // Telegram повідомлення буде відправлено в webhook після успішної оплати
    
    console.log("[POST /api/orders] Returning response with:", {
      invoiceUrl: pageUrl,
      invoiceId: invoiceId,
    });

    console.log("[POST /api/orders] Successfully completed order creation");
    console.log("=".repeat(50));
    
    return NextResponse.json({ invoiceUrl: pageUrl, invoiceId: invoiceId });
  } catch (error) {
    console.error("[POST /api/orders] ERROR occurred:", error);
    console.error("[POST /api/orders] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.log("=".repeat(50));
    
    const errorMessage = error instanceof Error 
      ? error.message.includes("[POST /api/orders]")
        ? error.message.replace("[POST /api/orders] ", "")
        : error.message
      : "На жаль, сталася неочікувана помилка";
    
    // Перевіряємо тип помилки та надаємо дружнє повідомлення, локалізоване за requestLocale
    const buildFriendlyMessage = (
      locale: string | null,
      type: "generic" | "noStock"
    ): string => {
      const lang = locale === "de" || locale === "en" ? locale : "uk";

      if (type === "noStock") {
        if (lang === "de") {
          return "Leider ist einer der Artikel in Ihrer Bestellung nicht mehr auf Lager. Bitte überprüfen Sie Ihren Warenkorb und aktualisieren Sie die Bestellung. Wenn Sie Fragen haben, schreiben Sie uns – wir finden gerne eine Alternative! ✨";
        }
        if (lang === "en") {
          return "Unfortunately, one of the items in your order is no longer in stock. Please check your cart and update the order. If you still have questions, write to us — we will help you find an alternative! ✨";
        }
        // uk
        return "На жаль, одного з товарів у вашому замовленні більше немає в наявності. Будь ласка, перевірте кошик та оновіть замовлення. Якщо питання залишаються, напишіть нам — підберемо альтернативу! ✨";
      }

      // generic
      if (lang === "de") {
        return "Es tut uns leid, aber bei der Verarbeitung Ihrer Bestellung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns – wir helfen Ihnen gerne! 💪";
      }
      if (lang === "en") {
        return "We’re sorry, but something went wrong while processing your order. Please try again or contact us — we’ll be happy to help! 💪";
      }
      // uk
      return "Нам шкода, але щось пішло не так під час обробки вашого замовлення. Будь ласка, спробуйте ще раз або зв'яжіться з нами — ми обов'язково допоможемо! 💪";
    };

    const friendlyMessage = errorMessage.includes("Недостатньо товару")
      ? buildFriendlyMessage(requestLocale, "noStock")
      : buildFriendlyMessage(requestLocale, "generic");
    
    return NextResponse.json(
      { error: friendlyMessage, details: errorMessage },
      { status: 500 }
    );
  }
}
