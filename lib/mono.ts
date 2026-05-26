type MonoBasketItem = {
  name: string;
  qty: number;
  sum: number;
  total: number;
  unit: string;
  code: string;
};

export type MonoInvoiceRequest = {
  amountInMinorUnits: number;
  currencyCode: 980 | 978;
  reference: string;
  destination: string;
  comment: string;
  basketOrder: MonoBasketItem[];
  localePath: string;
  /** Appended to return URLs so payment/status can resolve the order without localStorage */
  returnType?: "certificate" | "order";
};

export type MonoInvoiceResult = {
  invoiceId: string;
  pageUrl: string;
};

export function getMonoToken(): string | undefined {
  return process.env.MONO_TOKEN || process.env.NEXT_PUBLIC_MONO_TOKEN;
}

export function getPublicUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    "https://charsua.com"
  );
}

export function isDevMode(): boolean {
  return (
    process.env.DEV === "True" ||
    process.env.DEV === "true" ||
    process.env.DEV === "1"
  );
}

export async function createMonobankInvoice(
  request: MonoInvoiceRequest
): Promise<MonoInvoiceResult> {
  const token = getMonoToken();

  if (!token) {
    throw new Error("MONO_TOKEN_MISSING");
  }

  const publicUrl = getPublicUrl().replace(/\/$/, "");
  const returnQuery = new URLSearchParams({
    ref: request.reference,
  });
  if (request.returnType === "certificate") {
    returnQuery.set("type", "certificate");
  }
  const returnSuffix = `/payment/status?${returnQuery.toString()}`;

  const invoicePayload = {
    amount: request.amountInMinorUnits,
    ccy: request.currencyCode,
    merchantPaymInfo: {
      reference: request.reference,
      destination: request.destination,
      comment: request.comment,
      basketOrder: request.basketOrder,
    },
    redirectUrl: `${publicUrl}${request.localePath}${returnSuffix}`,
    successUrl: `${publicUrl}${request.localePath}${returnSuffix}&payment=success`,
    failUrl: `${publicUrl}${request.localePath}${returnSuffix}&payment=failed`,
    webHookUrl: `${publicUrl}/api/mono-webhook`,
    validity: 3600,
    paymentType: "debit",
  };

  const monoRes = await fetch(
    "https://api.monobank.ua/api/merchant/invoice/create",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Token": token,
      },
      body: JSON.stringify(invoicePayload),
    }
  );

  const invoiceData = await monoRes.json();

  if (!monoRes.ok) {
    const errCode =
      typeof invoiceData?.errCode === "string" ? invoiceData.errCode : "UNKNOWN";
    throw new Error(`MONO_INVOICE_FAILED:${errCode}`);
  }

  const { invoiceId, pageUrl } = invoiceData as {
    invoiceId?: string;
    pageUrl?: string;
  };

  if (!invoiceId || !pageUrl) {
    throw new Error("MONO_INVOICE_INCOMPLETE");
  }

  return { invoiceId, pageUrl };
}

export function buildMonoFriendlyError(
  error: unknown,
  locale: string | null
): string {
  const lang = locale === "de" || locale === "en" ? locale : "uk";
  const message = error instanceof Error ? error.message : "";

  if (message === "MONO_TOKEN_MISSING") {
    if (lang === "de") {
      return "Zahlung ist derzeit nicht verfügbar: Monobank-Token fehlt in der Serverkonfiguration.";
    }
    if (lang === "en") {
      return "Payment is currently unavailable: Monobank token is missing in server configuration.";
    }
    return "Оплата наразі недоступна: відсутній токен Monobank у конфігурації сервера.";
  }

  if (message.startsWith("MONO_INVOICE_FAILED:FORBIDDEN")) {
    if (lang === "de") {
      return "Monobank hat die Zahlung abgelehnt. Bitte prüfen Sie MONO_TOKEN in .env oder testen Sie auf der Live-Domain.";
    }
    if (lang === "en") {
      return "Monobank rejected the payment request. Check MONO_TOKEN in .env or test on the live domain.";
    }
    return "Monobank відхилив запит на оплату. Перевірте MONO_TOKEN у .env або тестуйте на live-домені.";
  }

  if (lang === "de") {
    return "Leider konnte keine Rechnung erstellt werden. Bitte versuchen Sie es erneut.";
  }
  if (lang === "en") {
    return "Sorry, we could not create the invoice. Please try again.";
  }
  return "На жаль, не вдалося створити рахунок. Спробуйте ще раз або зв'яжіться з нами.";
}
