import { NextRequest, NextResponse } from "next/server";
import {
  getPromoCodeErrorMessage,
  normalizePromoCode,
} from "@/lib/promoCodes";
import { sqlCalculatePromoDiscount } from "@/lib/sql";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, order_total, locale } = body;

    if (!code || order_total == null) {
      return NextResponse.json(
        { valid: false, error: getPromoCodeErrorMessage("PROMO_INVALID", locale) },
        { status: 400 }
      );
    }

    const normalized = normalizePromoCode(String(code));
    const orderTotal = Number(order_total);

    try {
      const { discount, promo } = await sqlCalculatePromoDiscount(
        normalized,
        orderTotal
      );

      return NextResponse.json({
        valid: true,
        code: promo.code,
        name: promo.name,
        discount_percent: promo.discount_percent,
        discount,
      });
    } catch (error) {
      const errCode =
        error instanceof Error ? error.message : "PROMO_NOT_FOUND";
      return NextResponse.json({
        valid: false,
        error: getPromoCodeErrorMessage(errCode, locale ?? null),
      });
    }
  } catch (error) {
    console.error("[POST /api/promo-codes/validate]", error);
    return NextResponse.json(
      { valid: false, error: "validation_failed" },
      { status: 500 }
    );
  }
}
