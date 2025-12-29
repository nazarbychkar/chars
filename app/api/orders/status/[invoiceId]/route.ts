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

    // Return payment status regardless of whether it's paid or not
    return NextResponse.json({
      invoiceId,
      payment_status: order.payment_status,
      order_id: order.id,
    });
  } catch (error) {
    console.error("[GET /api/orders/status] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
