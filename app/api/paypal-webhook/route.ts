import { NextRequest, NextResponse } from "next/server";
import { sqlUpdatePaymentStatus, sqlGetOrderByInvoiceId } from "@/lib/sql";

export async function GET() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const eventType = body?.event_type as string | undefined;
    const resource = body?.resource ?? {};

    let paypalOrderId: string | undefined;

    if (resource?.supplementary_data?.related_ids?.order_id) {
      paypalOrderId = resource.supplementary_data.related_ids.order_id;
    } else if (typeof resource?.id === "string") {
      paypalOrderId = resource.id;
    }

    console.log("🔔 PayPal webhook received:", {
      eventType,
      paypalOrderId,
    });

    if (!eventType || !paypalOrderId) {
      return NextResponse.json({ error: "Invalid PayPal payload" }, { status: 400 });
    }

    // Обробляємо успішні платежі
    const successEvents = [
      "CHECKOUT.ORDER.APPROVED",
      "PAYMENT.CAPTURE.COMPLETED",
    ];

    if (!successEvents.includes(eventType)) {
      console.log("❌ PayPal event is not a success event, type:", eventType);
      return NextResponse.json({ success: true });
    }

    // Оновлюємо статус замовлення на "paid"
    await sqlUpdatePaymentStatus(paypalOrderId, "paid");

    // Отримуємо замовлення для Telegram
    const order = await sqlGetOrderByInvoiceId(paypalOrderId);

    if (order) {
      const BOT_TOKEN = process.env.BOT_TOKEN;
      const CHAT_ID = process.env.CHAT_ID;

      const PUBLIC_URL =
        process.env.NEXT_PUBLIC_PUBLIC_URL ||
        process.env.PUBLIC_URL ||
        "https://charsua.com";

      const adminOrderUrl = `${PUBLIC_URL}/admin/orders/${order.id}/edit`;

      const currencySymbol = order.currency === "EUR" ? "€" : "₴";
      const localeLabel =
        order.locale === "en"
          ? "EN"
          : order.locale === "de"
          ? "DE"
          : order.locale === "uk"
          ? "UK"
          : order.locale || "—";

      const amount =
        typeof resource?.amount?.value === "string"
          ? Number(resource.amount.value)
          : order.total_amount || 0;

      const orderMessage = `
🛒 <b>Нове замовлення (ОПЛАЧЕНО ✅ через PayPal)</b>

👤 <b>Ім'я:</b> ${order.customer_name}
📱 <b>Тел:</b> ${order.phone_number}
📧 <b>Email:</b> ${order.email || "—"}
🚚 <b>Доставка:</b> ${order.delivery_method}
🏙️ <b>Місто:</b> ${order.city}
🏤 <b>Відділення:</b> ${order.post_office}
📝 <b>Коментар:</b> ${order.comment || "—"}
🌐 <b>Мова сайту:</b> ${localeLabel}
💰 <b>Оплата:</b> Повна оплата через PayPal
🧾 <b>Сума:</b> ${amount.toFixed(2)} ${currencySymbol}
💳 <b>Статус:</b> ОПЛАЧЕНО ✅

📦 <b>Товари:</b>
${order.items
  .map(
    (
      item: {
        product_name: string;
        color?: string | null;
        size: string;
        quantity: number;
        price: number;
      },
      i: number
    ) =>
      `${i + 1}. ${item.product_name}${
        item.color ? ` (${item.color})` : ""
      } | ${item.size} | x${item.quantity} | ${item.price} ${currencySymbol}`
  )
  .join("\n")}

🆔 <b>ID замовлення:</b> ${order.id}
💳 <b>ID PayPal-ордеру:</b> ${paypalOrderId}

🔗 <a href="${adminOrderUrl}">Переглянути замовлення в адмін панелі</a>
      `;

      if (BOT_TOKEN && CHAT_ID) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: orderMessage,
            parse_mode: "HTML",
          }),
        });

        console.log("✅ Telegram notification sent for PayPal order:", order.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PAYPAL WEBHOOK ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

