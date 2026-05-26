export function getGiftCertificateErrorMessage(
  code: string,
  locale: string | null
): string {
  const lang = locale === "de" || locale === "en" ? locale : "uk";

  const messages: Record<string, Record<string, string>> = {
    CERT_NOT_FOUND: {
      uk: "Сертифікат з таким кодом не знайдено. Перевірте правильність введення.",
      de: "Gutschein mit diesem Code wurde nicht gefunden.",
      en: "No certificate found with this code. Please check and try again.",
    },
    CERT_USED: {
      uk: "Цей сертифікат уже використано або баланс вичерпано.",
      de: "Dieser Gutschein wurde bereits eingelöst oder ist aufgebraucht.",
      en: "This certificate has already been used or has no balance left.",
    },
    CERT_EXPIRED: {
      uk: "Термін дії сертифіката закінчився.",
      de: "Dieser Gutschein ist abgelaufen.",
      en: "This certificate has expired.",
    },
    CERT_CURRENCY_MISMATCH: {
      uk: "Сертифікат не підходить до обраної валюти замовлення.",
      de: "Der Gutschein passt nicht zur gewählten Bestellwährung.",
      en: "This certificate does not match the selected order currency.",
    },
    CERT_INVALID_AMOUNT: {
      uk: "Неможливо застосувати сертифікат до цього замовлення.",
      de: "Der Gutschein kann für diese Bestellung nicht angewendet werden.",
      en: "This certificate cannot be applied to this order.",
    },
    CERT_WITH_PREPAY: {
      uk: "Сертифікат можна застосувати лише при повній оплаті.",
      de: "Gutscheine können nur bei vollständiger Zahlung verwendet werden.",
      en: "Gift certificates can only be used with full payment.",
    },
  };

  return messages[code]?.[lang] ?? messages.CERT_NOT_FOUND[lang];
}
