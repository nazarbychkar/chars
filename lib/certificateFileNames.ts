/** Base filenames in public/sertificates (tier id = amount UAH) */
export const CERTIFICATE_FILE_BY_TIER_UAH: Record<number, string> = {
  2000: "N72000",
  5000: "N71234567",
  10000: "N710000",
  15000: "N715000",
  20000: "N720000",
};

export function getCertificateFileBaseName(tierUah: number): string | null {
  return CERTIFICATE_FILE_BY_TIER_UAH[tierUah] ?? null;
}

export function getCertificatePngPublicUrl(tierUah: number): string | null {
  const base = getCertificateFileBaseName(tierUah);
  if (!base) return null;
  return `/sertificates/${base}.png`;
}
