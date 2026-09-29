import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  sqlGetTopSaleProducts,
  sqlUpdateTopSalePriorities,
} from "@/lib/sql";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const products = await sqlGetTopSaleProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET /api/admin/top-sale]", error);
    return NextResponse.json(
      { error: "Failed to fetch top sale products" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const parsed = items
      .map((row: { id?: unknown; top_sale_priority?: unknown }) => ({
        id: Number(row.id),
        top_sale_priority: Number(row.top_sale_priority ?? 0),
      }))
      .filter((row) => Number.isInteger(row.id) && row.id > 0);

    await sqlUpdateTopSalePriorities(parsed);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[PUT /api/admin/top-sale]", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
