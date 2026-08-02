import { NextRequest, NextResponse } from "next/server";
import { sqlUpdatePaymentStatus, sqlGetOrderByInvoiceId, sqlGetGiftCertificateByPurchaseOrderId } from "@/lib/sql";
import { processPaidOrderNotifications } from "@/lib/postPayment";
import { sendOrderTelegramNotification, sendCertificatePurchaseTelegram } from "@/lib/orderTelegram";

export async function GET() {
  return new NextResponse(null, { status: 200 });
}

async function notifyPaidOrder(
  invoiceId: string,
  amountMinorUnits?: number,
  amountCcy?: number
) {
  const order = await sqlGetOrderByInvoiceId(invoiceId);
  if (!order) return;

  if (order.delivery_method === "certificate") {
    await processPaidOrderNotifications(invoiceId);
    const cert = await sqlGetGiftCertificateByPurchaseOrderId(order.id);
    if (cert) {
      await sendCertificatePurchaseTelegram(
        order,
        invoiceId,
        cert,
        amountMinorUnits,
        amountCcy
      );
      console.log("✅ Certificate Telegram notification sent:", cert.code);
    }
  } else {
    await sendOrderTelegramNotification(
      order,
      invoiceId,
      amountMinorUnits,
      amountCcy
    );
    await processPaidOrderNotifications(invoiceId);
    console.log("✅ Telegram notification sent for order:", order.id);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { invoiceId, status, amount, ccy } = data;
    console.log("🔔 Webhook received:", { invoiceId, status, amount, ccy });

    if (!invoiceId || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (status !== "success") {
      console.log("❌ Payment not successful, status:", status);
      return NextResponse.json({ success: true });
    }

    await sqlUpdatePaymentStatus(invoiceId, "paid");
    await notifyPaidOrder(
      invoiceId,
      typeof amount === "number" ? amount : undefined,
      typeof ccy === "number" ? ccy : undefined
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MONO WEBHOOK ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
