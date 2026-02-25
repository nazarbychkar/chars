import { NextRequest, NextResponse } from "next/server";
import { sqlGetOrderByInvoiceId } from "@/lib/sql";

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

    const order = await sqlGetOrderByInvoiceId(invoiceId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Return payment status + locale so frontend can redirect to correct language
    return NextResponse.json({
      invoiceId,
      payment_status: order.payment_status,
      order_id: order.id,
      locale: order.locale ?? null,
    });
  } catch (error) {
    console.error("[GET /api/orders/status] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
