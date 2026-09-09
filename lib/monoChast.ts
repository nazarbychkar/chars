import crypto from "crypto";

export type ChastOrderState = "IN_PROCESS" | "SUCCESS" | "FAIL";
export type ChastOrderSubState =
  | "ACTIVE"
  | "DONE"
  | "RETURNED"
  | "WAITING_FOR_CLIENT"
  | "WAITING_FOR_STORE_CONFIRM"
  | "CLIENT_NOT_FOUND"
  | "EXCEEDED_SUM_LIMIT"
  | "PAY_PARTS_ARE_NOT_ACCEPTABLE"
  | "EXISTS_OTHER_OPEN_ORDER"
  | "NOT_ENOUGH_MONEY_FOR_INIT_DEBIT"
  | "CLIENT_PUSH_TIMEOUT"
  | "FRAUD_REJECTED"
  | "REJECTED_BY_CLIENT"
  | "REJECTED_BY_STORE"
  | "RESTRICTED_BY_RISKS"
  | "FAIL";

export type ChastProduct = {
  name: string;
  count: number;
  sum: number;
};

export type ChastCreateOrderRequest = {
  storeOrderId: string;
  clientPhone: string;
  totalSum: number;
  products: ChastProduct[];
  resultCallback: string;
};

export type ChastCreateOrderResult = {
  orderId: string;
};

export type ChastOrderStateResult = {
  orderId: string;
  state: ChastOrderState;
  orderSubState: ChastOrderSubState;
  message?: string | null;
};

function getChastStoreId(): string | undefined {
  return process.env.MONO_CHAST_STORE_ID;
}

function getChastSecret(): string | undefined {
  return process.env.MONO_CHAST_SECRET;
}

export function getChastApiUrl(): string {
  return (
    process.env.MONO_CHAST_API_URL?.replace(/\/$/, "") ||
    "https://u2.monobank.com.ua"
  );
}

export function getChastPartsCounts(): number[] {
  const raw = process.env.MONO_CHAST_PARTS || "3,6,10";
  const parts = raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 1);
  return parts.length > 0 ? parts : [3, 6, 10];
}

export function isChastConfigured(): boolean {
  return Boolean(getChastStoreId() && getChastSecret());
}

export function calculateChastSignature(
  requestBody: string,
  secret: string
): string {
  return crypto
    .createHmac("sha256", secret)
    .update(requestBody, "utf8")
    .digest("base64");
}

export function verifyChastSignature(
  requestBody: string,
  signature: string | null
): boolean {
  const secret = getChastSecret();
  if (!secret || !signature) return false;
  const expected = calculateChastSignature(requestBody, secret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

export function normalizePhoneForChast(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (digits.startsWith("380") && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `+38${digits}`;
  }
  if (digits.length === 9) {
    return `+380${digits}`;
  }
  if (/^\+380\d{9}$/.test(trimmed)) {
    return trimmed;
  }

  throw new Error("CHAST_INVALID_PHONE");
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

async function chastRequest<T>(
  path: string,
  payload: Record<string, unknown>
): Promise<T> {
  const storeId = getChastStoreId();
  const secret = getChastSecret();

  if (!storeId || !secret) {
    throw new Error("CHAST_CONFIG_MISSING");
  }

  const body = JSON.stringify(payload);
  const signature = calculateChastSignature(body, secret);
  const response = await fetch(`${getChastApiUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "store-id": storeId,
      signature,
    },
    body,
  });

  const text = await response.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text) as Record<string, unknown>;
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      typeof data.message === "string" ? data.message : `HTTP_${response.status}`;
    throw new Error(`CHAST_REQUEST_FAILED:${message}`);
  }

  return data as T;
}

function extractOrderId(data: Record<string, unknown>): string | undefined {
  const orderId = data.order_id ?? data.orderId;
  return typeof orderId === "string" && orderId.length > 0 ? orderId : undefined;
}

export async function createChastOrder(
  request: ChastCreateOrderRequest
): Promise<ChastCreateOrderResult> {
  const totalSum = roundMoney(request.totalSum);
  if (totalSum < 2) {
    throw new Error("CHAST_MIN_AMOUNT");
  }

  const clientPhone = normalizePhoneForChast(request.clientPhone);
  const today = new Date().toISOString().slice(0, 10);
  const products = request.products.map((product) => ({
    name: product.name.slice(0, 500),
    count: product.count,
    sum: roundMoney(product.sum),
  }));

  const payload = {
    store_order_id: request.storeOrderId,
    client_phone: clientPhone,
    total_sum: totalSum,
    invoice: {
      date: today,
      number: request.storeOrderId,
      source: "INTERNET",
    },
    available_programs: [
      {
        type: "payment_installments",
        available_parts_count: getChastPartsCounts(),
      },
    ],
    products,
    result_callback: request.resultCallback,
  };

  const data = await chastRequest<Record<string, unknown>>(
    "/api/order/create",
    payload
  );

  const orderId = extractOrderId(data);
  if (!orderId) {
    throw new Error("CHAST_ORDER_INCOMPLETE");
  }

  return { orderId };
}

export async function getChastOrderState(
  orderId: string
): Promise<ChastOrderStateResult> {
  const data = await chastRequest<Record<string, unknown>>("/api/order/state", {
    order_id: orderId,
  });

  const state = data.state;
  const orderSubState = data.order_sub_state ?? data.orderSubState;
  const resolvedOrderId = extractOrderId(data) ?? orderId;

  if (
    state !== "IN_PROCESS" &&
    state !== "SUCCESS" &&
    state !== "FAIL"
  ) {
    throw new Error("CHAST_STATE_INCOMPLETE");
  }

  if (typeof orderSubState !== "string" || !orderSubState) {
    throw new Error("CHAST_STATE_INCOMPLETE");
  }

  return {
    orderId: resolvedOrderId,
    state,
    orderSubState: orderSubState as ChastOrderSubState,
    message: typeof data.message === "string" ? data.message : null,
  };
}

export async function confirmChastOrder(
  orderId: string
): Promise<ChastOrderStateResult> {
  const data = await chastRequest<Record<string, unknown>>(
    "/api/order/confirm",
    { order_id: orderId }
  );

  const state = data.state;
  const orderSubState = data.order_sub_state ?? data.orderSubState;
  const resolvedOrderId = extractOrderId(data) ?? orderId;

  if (
    state !== "IN_PROCESS" &&
    state !== "SUCCESS" &&
    state !== "FAIL"
  ) {
    throw new Error("CHAST_STATE_INCOMPLETE");
  }

  if (typeof orderSubState !== "string" || !orderSubState) {
    throw new Error("CHAST_STATE_INCOMPLETE");
  }

  return {
    orderId: resolvedOrderId,
    state,
    orderSubState: orderSubState as ChastOrderSubState,
    message: typeof data.message === "string" ? data.message : null,
  };
}

export async function rejectChastOrder(
  orderId: string
): Promise<ChastOrderStateResult> {
  const data = await chastRequest<Record<string, unknown>>(
    "/api/order/reject",
    { order_id: orderId }
  );

  const state = data.state;
  const orderSubState = data.order_sub_state ?? data.orderSubState;
  const resolvedOrderId = extractOrderId(data) ?? orderId;

  if (
    state !== "IN_PROCESS" &&
    state !== "SUCCESS" &&
    state !== "FAIL"
  ) {
    throw new Error("CHAST_STATE_INCOMPLETE");
  }

  if (typeof orderSubState !== "string" || !orderSubState) {
    throw new Error("CHAST_STATE_INCOMPLETE");
  }

  return {
    orderId: resolvedOrderId,
    state,
    orderSubState: orderSubState as ChastOrderSubState,
    message: typeof data.message === "string" ? data.message : null,
  };
}

export function buildChastFriendlyError(
  error: unknown,
  locale: string | null
): string {
  const lang = locale === "de" || locale === "en" ? locale : "uk";
  const message = error instanceof Error ? error.message : "";

  if (message === "CHAST_CONFIG_MISSING") {
    if (lang === "de") {
      return "Ratenzahlung ist derzeit nicht verfügbar. Bitte wählen Sie eine andere Zahlungsmethode.";
    }
    if (lang === "en") {
      return "Installments are currently unavailable. Please choose another payment method.";
    }
    return "Оплата частинами наразі недоступна. Оберіть інший спосіб оплати.";
  }

  if (message === "CHAST_INVALID_PHONE") {
    if (lang === "de") {
      return "Bitte geben Sie eine gültige ukrainische Telefonnummer im Format +380XXXXXXXXX ein.";
    }
    if (lang === "en") {
      return "Please enter a valid Ukrainian phone number in +380XXXXXXXXX format.";
    }
    return "Вкажіть коректний український номер телефону у форматі +380XXXXXXXXX.";
  }

  if (message === "CHAST_MIN_AMOUNT") {
    if (lang === "de") {
      return "Der Mindestbetrag für Ratenzahlung beträgt 2 UAH.";
    }
    if (lang === "en") {
      return "The minimum amount for installments is 2 UAH.";
    }
    return "Мінімальна сума для покупки частинами — 2 грн.";
  }

  if (lang === "de") {
    return "Leider konnte die Ratenzahlung nicht erstellt werden. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsmethode.";
  }
  if (lang === "en") {
    return "Sorry, we could not create the installment request. Please try again or choose another payment method.";
  }
  return "На жаль, не вдалося створити заявку на покупку частинами. Спробуйте ще раз або оберіть інший спосіб оплати.";
}
