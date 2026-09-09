import { NextRequest, NextResponse } from "next/server";
import {
  verifyChastSignature,
  type ChastOrderState,
  type ChastOrderSubState,
} from "@/lib/monoChast";
import { applyChastStateToOrder } from "@/lib/chastOrderProcessing";

export async function GET() {
  return new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("signature");

    if (!verifyChastSignature(rawBody, signature)) {
      console.error("[MONO CHAST CALLBACK] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(rawBody) as {
      order_id?: string;
      state?: ChastOrderState;
      order_sub_state?: ChastOrderSubState;
    };

    const orderId = data.order_id;
    const state = data.state;
    const subState = data.order_sub_state;

    console.log("[MONO CHAST CALLBACK] Received:", {
      orderId,
      state,
      subState,
    });

    if (!orderId || !state || !subState) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await applyChastStateToOrder(orderId, state, subState);
    console.log("[MONO CHAST CALLBACK] Applied result:", result);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("[MONO CHAST CALLBACK ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
