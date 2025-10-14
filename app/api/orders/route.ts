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
      (total: number, item: { price: number; quantity: number }) =>
        total + item.price * item.quantity,
      0
    );

    const amountToPay = payment_type === "prepay" ? 300 : fullAmount;
    const amountInKopecks = Math.round(amountToPay * 100);

    const basketOrder = items.map(
      (item: {
        name: string;
        quantity: number;
        price: number;
        product_id: number;
        size: number;
      }) => ({
        name: item.name,
        qty: item.quantity,
        sum: Math.round(item.price * item.quantity * 100),
        total: Math.round(item.price * item.quantity * 100),
        unit: "шт.",
        code: `${item.product_id}-${item.size}`,
      })
    );

    const reference = crypto.randomUUID();

    // ✅ Створення інвойсу Monobank

    // NOTE: Monobank webhooks must be able to reach your server from the public internet.
    // If you use "localhost" in webHookUrl, Monobank cannot call it unless you tunnel (e.g. with ngrok).
    // Use your public domain or a tunnel URL for webHookUrl and redirectUrl.

    // For local development, set up a tunnel (e.g. ngrok) and use its URL here:
    // const PUBLIC_URL = process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
    // Example: "https://abc123.ngrok.app"

    const PUBLIC_URL =
      process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

    // const monoResGET = await fetch(
    //   PUBLIC_URL,
    //   {
    //     method: "GET",
    //     headers: {
    //       "Content-Type": "application/json",
    //       "X-Token": process.env.NEXT_PUBLIC_MONO_TOKEN!,
    //     },
        
    //   }
    // );

    // console.log("monoResGET", monoResGET);

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
          redirectUrl: `${PUBLIC_URL}/final`,
          webHookUrl: `${PUBLIC_URL}/api/mono-webhook`,
          validity: 3600,
          paymentType: "debit",
        }),
      }
    );
    // console.log(`${PUBLIC_URL}/api/monowebhook`);
    // console.log("monoRes", monoRes);

    const invoiceData = await monoRes.json();
    console.log("invoiceData api orders", invoiceData);
    if (!monoRes.ok) {
      console.error("Monobank error:", invoiceData);
      return NextResponse.json(
        { error: "Не вдалося створити рахунок" },
        { status: 500 }
      );
    }

    const { invoiceId, pageUrl } = invoiceData;

    // ✅ Зберігання замовлення у БД (статус "pending" - ще не оплачено)
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
      items,
    });

    // ✅ НЕ відправляємо в Telegram поки не оплачено
    // Telegram повідомлення буде відправлено в webhook після успішної оплати

    return NextResponse.json({ invoiceUrl: pageUrl, invoiceId: invoiceId });
  } catch (error) {
    console.error("[POST /orders]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
