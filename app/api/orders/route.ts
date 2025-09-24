// orders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { sqlGetAllOrders, sqlPostOrder } from "@/lib/sql";

// ==========================
// GET /api/orders
// ==========================
export async function GET() {
  try {
    const orders = await sqlGetAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[GET /orders]", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// ==========================
// POST /api/orders
// ==========================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ✅ Basic validation
    if (
      !body.customer_name ||
      !body.phone_number ||
      !body.delivery_method ||
      !body.city ||
      !body.post_office
    ) {
      return NextResponse.json(
        { error: "Missing required order fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Order must include at least one item" },
        { status: 400 }
      );
    }

    const result = await sqlPostOrder({
      customer_name: body.customer_name,
      phone_number: body.phone_number,
      email: body.email || null,
      delivery_method: body.delivery_method,
      city: body.city,
      post_office: body.post_office,
      items: body.items, // Array of { product_id, size, quantity, price }
    });

    return NextResponse.json({ orderId: result.orderId }, { status: 201 });
  } catch (error) {
    console.error("[POST /orders]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
