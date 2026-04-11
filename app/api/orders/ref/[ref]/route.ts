import { NextRequest, NextResponse } from "next/server";
import { sqlGetOrderRefLookup } from "@/lib/sql";

type RouteParams = {
  params: Promise<{
    ref: string;
  }>;
};

/** Повертає invoiceId і статус для polling після редіректу Monobank (?ref=) */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { ref } = await params;

    if (!ref) {
      return NextResponse.json({ error: "ref is required" }, { status: 400 });
    }

    const row = await sqlGetOrderRefLookup(ref);

    if (!row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      invoiceId: row.invoice_id,
      payment_status: row.payment_status,
      locale: row.locale ?? null,
    });
  } catch (error) {
    console.error("[GET /orders/ref] Error:", error);
    return NextResponse.json(
      { error: "Failed to resolve order" },
      { status: 500 }
    );
  }
}
