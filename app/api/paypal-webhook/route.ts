import { NextRequest, NextResponse } from "next/server";
import {
  sqlUpdatePaymentStatus,
  sqlGetOrderByInvoiceId,
  sqlGetGiftCertificateByPurchaseOrderId,
} from "@/lib/sql";
import { processPaidOrderNotifications } from "@/lib/postPayment";
import {
  sendOrderTelegramNotification,
  sendCertificatePurchaseTelegram,
} from "@/lib/orderTelegram";

export async function GET() {
  return new NextResponse(null, { status: 200 });
}

async function notifyPaidOrder(
  invoiceId: string,
  amountMinorUnits?: number
) {
  const order = await sqlGetOrderByInvoiceId(invoiceId);
  if (!order) return;

  // PayPal amounts are already in the order currency; no separate ccy code.
  if (order.delivery_method === "certificate") {
    await processPaidOrderNotifications(invoiceId);
    const cert = await sqlGetGiftCertificateByPurchaseOrderId(order.id);
    if (cert) {
      await sendCertificatePurchaseTelegram(
        order,
        invoiceId,
        cert,
        amountMinorUnits
      );
      console.log("✅ Certificate Telegram notification sent:", cert.code);
    }
  } else {
    await sendOrderTelegramNotification(order, invoiceId, amountMinorUnits);
    await processPaidOrderNotifications(invoiceId);
    console.log("✅ Telegram notification sent for PayPal order:", order.id);
  }
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

    const successEvents = [
      "CHECKOUT.ORDER.APPROVED",
      "PAYMENT.CAPTURE.COMPLETED",
    ];

    if (!successEvents.includes(eventType)) {
      console.log("❌ PayPal event is not a success event, type:", eventType);
      return NextResponse.json({ success: true });
    }

    await sqlUpdatePaymentStatus(paypalOrderId, "paid");
    await notifyPaidOrder(
      paypalOrderId,
      typeof resource?.amount?.value === "string"
        ? Math.round(Number(resource.amount.value) * 100)
        : undefined
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PAYPAL WEBHOOK ERROR]", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
