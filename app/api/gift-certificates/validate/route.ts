import { NextRequest, NextResponse } from "next/server";
import { normalizeGiftCertificateCode } from "@/lib/giftCertificateCode";
import { getGiftCertificateErrorMessage } from "@/lib/giftCertificateErrors";
import { sqlCalculateGiftCertificateDiscount } from "@/lib/sql";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, order_total, currency, locale } = body;

    if (!code || order_total == null) {
      return NextResponse.json({ valid: false, error: "invalid_request" }, { status: 400 });
    }

    const normalizedCode = normalizeGiftCertificateCode(String(code));
    const orderCurrency = currency === "EUR" ? "EUR" : "UAH";
    const orderTotal = Number(order_total);

    try {
      const { discount, certificate } = await sqlCalculateGiftCertificateDiscount(
        normalizedCode,
        orderTotal,
        orderCurrency
      );

      return NextResponse.json({
        valid: true,
        code: certificate.code,
        discount,
        remaining_after: Math.max(0, Number(certificate.remaining_balance) - discount),
        currency: certificate.currency,
      });
    } catch (error) {
      const errCode =
        error instanceof Error ? error.message : "CERT_NOT_FOUND";
      return NextResponse.json({
        valid: false,
        error: getGiftCertificateErrorMessage(errCode, locale ?? null),
      });
    }
  } catch (error) {
    console.error("[POST /api/gift-certificates/validate]", error);
    return NextResponse.json(
      { valid: false, error: "validation_failed" },
      { status: 500 }
    );
  }
}
