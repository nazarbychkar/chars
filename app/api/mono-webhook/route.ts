// app/api/mono-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sqlUpdatePaymentStatus } from "@/lib/sql"; // 🛠️ реалізуй цю функцію

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const { invoiceId, status } = data;
    // console.log("status", status)

    if (!invoiceId || !status) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await sqlUpdatePaymentStatus(invoiceId, "paid"); // ✅ update order

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[MONO WEBHOOK ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
