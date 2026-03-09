// app/api/mono-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sqlUpdatePaymentStatus, sqlGetOrderByInvoiceId } from "@/lib/sql";

export async function GET() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { invoiceId, status, amount } = data;
    console.log("🔔 Webhook received:", { invoiceId, status });

    if (!invoiceId || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    console.log("status api webhook", status);
    // Only process successful payments
    if (status !== "success") {
      console.log("❌ Payment not successful, status:", status);
      return NextResponse.json({ success: true });
    }

    // Update order status to "paid"
    await sqlUpdatePaymentStatus(invoiceId, "paid");

    // Get order details for Telegram notification
    const order = await sqlGetOrderByInvoiceId(invoiceId);

    if (order) {
      // Send to Telegram after successful payment
      const BOT_TOKEN = process.env.BOT_TOKEN;
      const CHAT_ID = process.env.CHAT_ID;
      
      // Get base URL for admin panel link
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

      const orderMessage = `
🛒 <b>Нове замовлення (ОПЛАЧЕНО ✅)</b>

👤 <b>Ім'я:</b> ${order.customer_name}
📱 <b>Тел:</b> ${order.phone_number}
📧 <b>Email:</b> ${order.email || "—"}
🚚 <b>Доставка:</b> ${order.delivery_method}
🏙️ <b>Місто:</b> ${order.city}
🏤 <b>Відділення:</b> ${order.post_office}
📝 <b>Коментар:</b> ${order.comment || "—"}
🌐 <b>Мова сайту:</b> ${localeLabel}
💰 <b>Оплата:</b> ${
        order.payment_type === "prepay"
          ? "Передплата (300 грн)"
          : order.payment_type === "paypal_full"
          ? "Повна оплата через PayPal"
          : "Повна оплата"
      }
🧾 <b>Сума:</b> ${(amount / 100).toFixed(2)} ${currencySymbol}
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
💳 <b>ID інвойсу:</b> ${invoiceId}

🔗 <a href="${adminOrderUrl}">Переглянути замовлення в адмін панелі</a>
      `;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: orderMessage,
          parse_mode: "HTML",
        }),
      });

      console.log("✅ Telegram notification sent for order:", order.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MONO WEBHOOK ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
