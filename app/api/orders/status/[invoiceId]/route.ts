import { NextRequest, NextResponse } from "next/server";
import { sqlGetOrderByInvoiceId } from "@/lib/sql";
import { processPaidOrderNotifications } from "@/lib/postPayment";
import { syncChastOrderStatus } from "@/lib/chastOrderProcessing";

type RouteParams = {
  params: Promise<{
    invoiceId: string;
  }>;
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { invoiceId } = await params;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const initialOrder = await sqlGetOrderByInvoiceId(invoiceId);

    if (!initialOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let order = initialOrder;

    if (
      order.payment_type === "installments" &&
      order.payment_status === "pending"
    ) {
      try {
        await syncChastOrderStatus(invoiceId);
        const refreshedOrder = await sqlGetOrderByInvoiceId(invoiceId);
        if (!refreshedOrder) {
          return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }
        order = refreshedOrder;
      } catch (syncError) {
        console.error(
          "[GET /api/orders/status] Chast sync failed:",
          syncError
        );
      }
    }

    if (order.payment_status === "paid" && !order.email_sent_at) {
      try {
        await processPaidOrderNotifications(invoiceId);
      } catch (notifyError) {
        console.error(
          "[GET /api/orders/status] Post-payment notifications failed:",
          notifyError
        );
      }
    }

    return NextResponse.json({
      invoiceId,
      payment_status: order.payment_status,
      payment_type: order.payment_type,
      order_id: order.id,
      locale: order.locale ?? null,
      delivery_method: order.delivery_method,
    });
  } catch (error) {
    console.error("[GET /api/orders/status] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
