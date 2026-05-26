export const CERTIFICATE_PRODUCT_ID = 0;

export type CertificateTier = {
  id: number;
  uah: number;
  eur: number;
};

export const CERTIFICATE_TIERS: CertificateTier[] = [
  { id: 2000, uah: 2000, eur: 50 },
  { id: 5000, uah: 5000, eur: 125 },
  { id: 10000, uah: 10000, eur: 250 },
  { id: 15000, uah: 15000, eur: 375 },
  { id: 20000, uah: 20000, eur: 500 },
];

export function getCertificateTier(id: number): CertificateTier | undefined {
  return CERTIFICATE_TIERS.find((tier) => tier.id === id);
}

export function formatCertificateAmount(
  amount: number,
  currency: "UAH" | "EUR"
): string {
  if (currency === "EUR") {
    return `€${amount}`;
  }
  return `${amount.toLocaleString("uk-UA")} ₴`;
}
