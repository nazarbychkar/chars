import crypto from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Shown on the certificate preview card before purchase — not the real code format. */
export const PREVIEW_GIFT_CERTIFICATE_CODE = "S00001";

function randomBlock(length: number): string {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => CHARSET[byte % CHARSET.length]).join("");
}

export function generateGiftCertificateCode(): string {
  return `CHARS-${randomBlock(4)}-${randomBlock(4)}`;
}

export function normalizeGiftCertificateCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
