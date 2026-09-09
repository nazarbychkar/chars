const DEFAULT_INSTALLMENT_PARTS = [3, 6, 10];

export function parseInstallmentParts(raw?: string | null): number[] {
  if (!raw) return DEFAULT_INSTALLMENT_PARTS;

  const parts = raw
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value >= 1);

  return parts.length > 0 ? parts : DEFAULT_INSTALLMENT_PARTS;
}

export function getAvailableInstallmentParts(): number[] {
  const raw =
    process.env.MONO_CHAST_PARTS ||
    process.env.NEXT_PUBLIC_MONO_CHAST_PARTS ||
    null;
  return parseInstallmentParts(raw);
}

export function isValidInstallmentPartsCount(count: number): boolean {
  return getAvailableInstallmentParts().includes(count);
}
