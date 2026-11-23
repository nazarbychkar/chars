export type PromoCodeRow = {
  id: number;
  code: string;
  name: string;
  discount_percent: number;
  is_active: boolean;
  usage_count: number;
  max_uses: number | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export function normalizePromoCode(raw: string): string {
  return String(raw || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

export function getPromoCodeErrorMessage(
  code: string,
  locale?: string | null
): string {
  const lang = locale === "de" || locale === "en" ? locale : "uk";
  const messages: Record<string, Record<string, string>> = {
    uk: {
      PROMO_NOT_FOUND: "Промокод не знайдено",
      PROMO_INACTIVE: "Цей промокод деактивовано",
      PROMO_LIMIT: "Ліміт використань промокоду вичерпано",
      PROMO_INVALID: "Некоректний промокод",
      PROMO_WITH_PREPAY: "Промокод недоступний з передоплатою",
      PROMO_WITH_INSTALLMENTS:
        "Промокод недоступний з оплатою частинами",
    },
    en: {
      PROMO_NOT_FOUND: "Promo code not found",
      PROMO_INACTIVE: "This promo code is deactivated",
      PROMO_LIMIT: "Promo code usage limit reached",
      PROMO_INVALID: "Invalid promo code",
      PROMO_WITH_PREPAY: "Promo codes are not available with prepayment",
      PROMO_WITH_INSTALLMENTS:
        "Promo codes are not available with installments",
    },
    de: {
      PROMO_NOT_FOUND: "Promo-Code nicht gefunden",
      PROMO_INACTIVE: "Dieser Promo-Code ist deaktiviert",
      PROMO_LIMIT: "Nutzungslimit des Promo-Codes erreicht",
      PROMO_INVALID: "Ungültiger Promo-Code",
      PROMO_WITH_PREPAY: "Promo-Codes sind bei Anzahlung nicht verfügbar",
      PROMO_WITH_INSTALLMENTS:
        "Promo-Codes sind bei Ratenzahlung nicht verfügbar",
    },
  };
  return messages[lang][code] || messages[lang].PROMO_INVALID;
}

export function calcPromoDiscount(
  orderTotal: number,
  discountPercent: number
): number {
  if (!Number.isFinite(orderTotal) || orderTotal <= 0) return 0;
  if (!Number.isFinite(discountPercent) || discountPercent <= 0) return 0;
  const pct = Math.min(100, Math.max(0, discountPercent));
  return Math.round(orderTotal * (pct / 100) * 100) / 100;
}
