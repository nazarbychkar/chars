import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import {
  confirmChastShipmentForOrder,
  getChastShipmentInfoForOrder,
} from "@/lib/chastOrderProcessing";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function chastErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    ORDER_NOT_FOUND: "Замовлення не знайдено.",
    NOT_INSTALLMENTS: "Це замовлення не оформлене через покупку частинами.",
    NOT_PAID: "Замовлення ще не оплачене клієнтом.",
    MISSING_INVOICE_ID: "Відсутній ідентифікатор заявки Monobank.",
    NOT_AWAITING_CONFIRM:
      "Monobank ще не очікує підтвердження відправки для цього замовлення.",
  };
  return messages[code] ?? "Не вдалося виконати операцію з Monobank.";
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const id = Number((await params).id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const info = await getChastShipmentInfoForOrder(id);
    return NextResponse.json(info);
  } catch (error) {
    console.error("[GET /api/orders/:id/chast]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Не вдалося отримати статус Monobank.", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const id = Number((await params).id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const result = await confirmChastShipmentForOrder(id);
    const info = await getChastShipmentInfoForOrder(id);

    return NextResponse.json({
      success: true,
      result,
      info,
    });
  } catch (error) {
    console.error("[POST /api/orders/:id/chast]", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.startsWith("NOT_") || message === "ORDER_NOT_FOUND"
      ? 400
      : 500;

    return NextResponse.json(
      {
        error: chastErrorMessage(message),
        details: message,
      },
      { status }
    );
  }
}
