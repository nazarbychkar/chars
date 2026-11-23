import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { normalizePromoCode } from "@/lib/promoCodes";
import {
  sqlCreatePromoCode,
  sqlGetAllPromoCodes,
} from "@/lib/sql";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const rows = await sqlGetAllPromoCodes();
    return NextResponse.json(rows);
  } catch (error) {
    console.error("[GET /api/admin/promo-codes]", error);
    return NextResponse.json(
      { error: "Failed to fetch promo codes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const code = normalizePromoCode(String(body.code || ""));
    const name = String(body.name || "").trim();
    const discountPercent = Number(body.discount_percent);
    const maxUses =
      body.max_uses === null ||
      body.max_uses === undefined ||
      body.max_uses === ""
        ? null
        : Number(body.max_uses);
    const note =
      typeof body.note === "string" && body.note.trim()
        ? body.note.trim()
        : null;
    const isActive = body.is_active !== false;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Код і назва обовʼязкові" },
        { status: 400 }
      );
    }
    if (
      !Number.isInteger(discountPercent) ||
      discountPercent < 1 ||
      discountPercent > 100
    ) {
      return NextResponse.json(
        { error: "Знижка має бути від 1 до 100%" },
        { status: 400 }
      );
    }
    if (
      maxUses !== null &&
      (!Number.isInteger(maxUses) || maxUses < 1)
    ) {
      return NextResponse.json(
        { error: "Макс. використань — ціле число ≥ 1 або порожньо" },
        { status: 400 }
      );
    }

    const created = await sqlCreatePromoCode({
      code,
      name,
      discount_percent: discountPercent,
      is_active: isActive,
      max_uses: maxUses,
      note,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("duplicate key") || message.includes("unique")) {
      return NextResponse.json(
        { error: "Такий промокод уже існує" },
        { status: 409 }
      );
    }
    console.error("[POST /api/admin/promo-codes]", error);
    return NextResponse.json(
      { error: "Не вдалося створити промокод" },
      { status: 500 }
    );
  }
}
