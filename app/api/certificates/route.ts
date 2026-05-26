import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sqlPostCertificateOrder } from "@/lib/sql";
import {
  CERTIFICATE_PRODUCT_ID,
  getCertificateTier,
} from "@/lib/certificates";
import {
  buildMonoFriendlyError,
  createMonobankInvoice,
  isDevMode,
} from "@/lib/mono";

export async function POST(req: NextRequest) {
  let requestLocale: string | null = null;

  try {
    const body = await req.json();
    const {
      customer_name,
      phone_number,
      email,
      amount_uah,
      currency,
      locale,
    } = body;

    requestLocale = typeof locale === "string" ? locale : null;

    if (!customer_name?.trim() || !phone_number?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: "fill_required_fields" },
        { status: 400 }
      );
    }

    const tier = getCertificateTier(Number(amount_uah));
    if (!tier) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }

    const isEuroSelected = currency === "EUR";
    const isEuroForMono = !isDevMode() && isEuroSelected;
    const price = isEuroSelected ? tier.eur : tier.uah;
    const amountInMinorUnits = Math.round(price * 100);

    const certificateLabel = `CHARS Gift Certificate — ${tier.uah.toLocaleString("uk-UA")} ₴`;

    const reference = crypto.randomUUID();
    const orderLocale = typeof locale === "string" ? locale : null;
    const localePath =
      orderLocale === "uk" || orderLocale === "de" || orderLocale === "en"
        ? `/${orderLocale}`
        : "";

    const { invoiceId, pageUrl } = await createMonobankInvoice({
      amountInMinorUnits,
      currencyCode: isEuroForMono ? 978 : 980,
      reference,
      destination: certificateLabel,
      comment: `Подарунковий сертифікат CHARS — ${tier.uah} ₴`,
      basketOrder: [
        {
          name: certificateLabel,
          qty: 1,
          sum: amountInMinorUnits,
          total: amountInMinorUnits,
          unit: "шт.",
          code: `certificate-${tier.id}`,
        },
      ],
      localePath,
      returnType: "certificate",
    });

    await sqlPostCertificateOrder({
      customer_name: customer_name.trim(),
      phone_number: phone_number.trim(),
      email: email.trim(),
      payment_type: "full",
      invoice_id: invoiceId,
      payment_reference: reference,
      payment_status: "pending",
      currency: isEuroSelected ? "EUR" : "UAH",
      locale: orderLocale,
      tier_uah: tier.uah,
      items: [
        {
          product_id: CERTIFICATE_PRODUCT_ID,
          size: String(tier.id),
          quantity: 1,
          price,
          color: null,
        },
      ],
    });

    return NextResponse.json({
      invoiceUrl: pageUrl,
      invoiceId,
      paymentRef: reference,
    });
  } catch (error) {
    console.error("[POST /api/certificates]", error);

    return NextResponse.json(
      { error: buildMonoFriendlyError(error, requestLocale) },
      { status: 500 }
    );
  }
}
