// orders/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sqlGetOrder, sqlPutOrder, sqlDeleteOrder } from "@/lib/sql"; // adjust path as needed

// ==========================
// GET /api/orders/[id]
// ==========================
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const order = await sqlGetOrder(id);

    if (!order || Object.keys(order).length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[GET /orders/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// ==========================
// PUT /api/orders/[id]
// ==========================
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();

    if (!body.status) {
      return NextResponse.json(
        { error: "Missing status field" },
        { status: 400 }
      );
    }

    await sqlPutOrder(id, { status: body.status });

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("[PUT /orders/:id]", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = Number(context.params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    await sqlDeleteOrder(id);

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("[DELETE /orders/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}
