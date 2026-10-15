export const CERTIFICATE_PRODUCT_ID = 0;

export type CertificateTier = {
  id: number;
  uah: number;
  eur: number;
  usd: number;
};

export const CERTIFICATE_TIERS: CertificateTier[] = [
  { id: 2000, uah: 2000, eur: 50, usd: 55 },
  { id: 5000, uah: 5000, eur: 125, usd: 135 },
  { id: 10000, uah: 10000, eur: 250, usd: 270 },
  { id: 15000, uah: 15000, eur: 375, usd: 405 },
  { id: 20000, uah: 20000, eur: 500, usd: 540 },
];

export function getCertificateTier(id: number): CertificateTier | undefined {
  return CERTIFICATE_TIERS.find((tier) => tier.id === id);
}

export function formatCertificateAmount(
  amount: number,
  currency: "UAH" | "EUR" | "USD"
): string {
  if (currency === "EUR") {
    return `€${amount}`;
  }
  if (currency === "USD") {
    return `$${amount}`;
  }
  return `${amount.toLocaleString("uk-UA")} ₴`;
}
