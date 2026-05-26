import { NextRequest, NextResponse } from "next/server";
import { sqlGetOrderByPaymentReference } from "@/lib/sql";
import { processPaidOrderNotifications } from "@/lib/postPayment";

export async function GET(req: NextRequest) {
  try {
    const ref = req.nextUrl.searchParams.get("ref")?.trim();
    if (!ref) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const order = await sqlGetOrderByPaymentReference(ref);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_status === "paid") {
      try {
        await processPaidOrderNotifications(order.invoice_id);
      } catch (notifyError) {
        console.error(
          "[GET /api/orders/by-payment-ref] Post-payment notifications failed:",
          notifyError
        );
      }
    }

    return NextResponse.json({
      invoiceId: order.invoice_id,
      payment_status: order.payment_status,
      order_id: order.id,
      locale: order.locale ?? null,
      delivery_method: order.delivery_method,
    });
  } catch (error) {
    console.error("[GET /api/orders/by-payment-ref] Error:", error);
    return NextResponse.json(
      { error: "Failed to resolve payment reference" },
      { status: 500 }
    );
  }
}
