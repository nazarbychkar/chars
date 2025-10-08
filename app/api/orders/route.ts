import { NextRequest, NextResponse } from "next/server";
import { sqlGetAllOrders, sqlPostOrder } from "@/lib/sql";
import crypto from "crypto";

// ==========================
// GET /api/orders
// ==========================
export async function GET() {
  try {
    const orders = await sqlGetAllOrders();
    return NextResponse.json(orders);
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
  try {
    const body = await req.json();

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
    } = body;

    // ✅ Basic validation
    if (
      !customer_name ||
      !phone_number ||
      !delivery_method ||
      !city ||
      !post_office ||
      !items?.length
    ) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    const fullAmount = items.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );

    const amountToPay = payment_type === "prepay" ? 300 : fullAmount;
    const amountInKopecks = Math.round(amountToPay * 100);

    const basketOrder = items.map((item: any) => ({
      name: item.name,
      qty: item.quantity,
      sum: Math.round(item.price * item.quantity * 100),
      total: Math.round(item.price * item.quantity * 100),
      unit: "шт.",
      code: `${item.product_id}-${item.size}`,
    }));

    const reference = crypto.randomUUID();

    // ✅ Створення інвойсу Monobank
    const monoRes = await fetch(
      "https://api.monobank.ua/api/merchant/invoice/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Token": process.env.NEXT_PUBLIC_MONO_TOKEN!,
        },
        body: JSON.stringify({
          amount: amountInKopecks,
          ccy: 980,
          merchantPaymInfo: {
            reference,
            destination: "Оплата замовлення",
            comment: comment || "Оплата замовлення",
            basketOrder,
          },
          redirectUrl: `http://localhost:3000/final`,
          webHookUrl: `http://localhost:3000/api/mono-webhook`,
          validity: 3600,
          paymentType: "debit",
        }),
      }
    );

    const invoiceData = await monoRes.json();

    if (!monoRes.ok) {
      console.error("Monobank error:", invoiceData);
      return NextResponse.json(
        { error: "Не вдалося створити рахунок" },
        { status: 500 }
      );
    }

    const { invoiceId, pageUrl } = invoiceData;

    // ✅ Зберігання замовлення у БД
    const result = await sqlPostOrder({
      customer_name,
      phone_number,
      email,
      delivery_method,
      city,
      post_office,
      comment,
      payment_type,
      invoice_id: invoiceId,
      payment_status: "pending", // default
      items,
    });

    // ✅ Telegram повідомлення (опційно — можна перенести у webhook після оплати)
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    const orderMessage = `
🛒 <b>Нове замовлення (оплачено)</b>

👤 <b>Ім’я:</b> ${customer_name}
📱 <b>Тел:</b> ${phone_number}
📧 <b>Email:</b> ${email || "—"}
🚚 <b>Доставка:</b> ${delivery_method}
🏙️ <b>Місто:</b> ${city}
🏤 <b>Відділення:</b> ${post_office}
💰 <b>Оплата:</b> ${
      payment_type === "prepay" ? "Передплата (300 грн)" : "Повна оплата"
    }
🧾 <b>Сума:</b> ${amountToPay} грн

📦 <b>Товари:</b>
${items
  .map(
    (item: any, i: number) =>
      `${i + 1}. ${item.product_name} | ${item.size} | x${item.quantity} | ${
        item.price
      } грн`
  )
  .join("\n")}
    `;

    console.log(items)

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: orderMessage,
        parse_mode: "HTML",
      }),
    });

    return NextResponse.json({ invoiceUrl: pageUrl, invoiceId: invoiceId });
  } catch (error) {
    console.error("[POST /orders]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
