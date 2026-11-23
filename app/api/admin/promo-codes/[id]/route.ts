import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { normalizePromoCode } from "@/lib/promoCodes";
import { sqlDeletePromoCode, sqlUpdatePromoCode } from "@/lib/sql";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const patch: {
      code?: string;
      name?: string;
      discount_percent?: number;
      is_active?: boolean;
      max_uses?: number | null;
      note?: string | null;
    } = {};

    if (body.code !== undefined) {
      const code = normalizePromoCode(String(body.code));
      if (!code) {
        return NextResponse.json({ error: "Код порожній" }, { status: 400 });
      }
      patch.code = code;
    }
    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ error: "Назва порожня" }, { status: 400 });
      }
      patch.name = name;
    }
    if (body.discount_percent !== undefined) {
      const discountPercent = Number(body.discount_percent);
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
      patch.discount_percent = discountPercent;
    }
    if (body.is_active !== undefined) {
      patch.is_active = Boolean(body.is_active);
    }
    if (body.max_uses !== undefined) {
      if (body.max_uses === null || body.max_uses === "") {
        patch.max_uses = null;
      } else {
        const maxUses = Number(body.max_uses);
        if (!Number.isInteger(maxUses) || maxUses < 1) {
          return NextResponse.json(
            { error: "Макс. використань — ціле число ≥ 1 або порожньо" },
            { status: 400 }
          );
        }
        patch.max_uses = maxUses;
      }
    }
    if (body.note !== undefined) {
      patch.note =
        typeof body.note === "string" && body.note.trim()
          ? body.note.trim()
          : null;
    }

    const updated = await sqlUpdatePromoCode(id, patch);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("duplicate key") || message.includes("unique")) {
      return NextResponse.json(
        { error: "Такий промокод уже існує" },
        { status: 409 }
      );
    }
    console.error("[PUT /api/admin/promo-codes/:id]", error);
    return NextResponse.json(
      { error: "Не вдалося оновити" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await sqlDeletePromoCode(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/admin/promo-codes/:id]", error);
    return NextResponse.json(
      { error: "Не вдалося видалити" },
      { status: 500 }
    );
  }
}
