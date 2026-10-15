export type SiteCurrency = "UAH" | "EUR" | "USD";

export const SITE_CURRENCIES: SiteCurrency[] = ["UAH", "EUR", "USD"];

export function isSiteCurrency(value: unknown): value is SiteCurrency {
  return value === "UAH" || value === "EUR" || value === "USD";
}

export function currencySymbol(currency: SiteCurrency | string | null | undefined): string {
  if (currency === "EUR") return "€";
  if (currency === "USD") return "$";
  return "₴";
}

/** ISO 4217 numeric codes for Monobank invoice `ccy` */
export function monoCurrencyCode(currency: SiteCurrency): 980 | 978 | 840 {
  if (currency === "EUR") return 978;
  if (currency === "USD") return 840;
  return 980;
}

export function defaultCurrencyForLocale(
  locale: string | null | undefined
): SiteCurrency {
  return locale === "en" || locale === "de" ? "EUR" : "UAH";
}

export function resolveEffectiveCurrency(
  selected: SiteCurrency | null | undefined,
  locale: string | null | undefined
): SiteCurrency {
  if (selected && isSiteCurrency(selected)) return selected;
  return defaultCurrencyForLocale(locale);
}

/** Price for display/checkout in the selected currency */
export function resolveItemPrice(
  currency: SiteCurrency,
  priceUah: number,
  priceEur?: number | null,
  priceUsd?: number | null
): number {
  if (currency === "EUR" && priceEur != null) return Number(priceEur);
  if (currency === "USD" && priceUsd != null) return Number(priceUsd);
  // Soft fallback: USD without price_usd → EUR price if present
  if (currency === "USD" && priceEur != null) return Number(priceEur);
  return Number(priceUah);
}

export function formatMoneyAmount(
  amount: number,
  currency: SiteCurrency,
  opts?: { decimals?: number }
): string {
  const symbol = currencySymbol(currency);
  const decimals =
    opts?.decimals ?? (currency === "UAH" ? 0 : 2);
  const formatted =
    currency === "UAH"
      ? amount.toLocaleString("uk-UA")
      : amount.toFixed(decimals);
  return `${formatted} ${symbol}`;
}
