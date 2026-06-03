import fs from "node:fs";
import path from "node:path";
import { getCertificateFileBaseName } from "@/lib/certificateFileNames";

const CERTIFICATES_DIR = path.join(process.cwd(), "public", "sertificates");

export { getCertificateFileBaseName } from "@/lib/certificateFileNames";

export function getCertificatePdfPath(tierUah: number): string | null {
  const base = getCertificateFileBaseName(tierUah);
  if (!base) return null;
  const filePath = path.join(CERTIFICATES_DIR, `${base}.pdf`);
  return fs.existsSync(filePath) ? filePath : null;
}

export function readCertificatePdfAttachment(tierUah: number): {
  filename: string;
  content: Buffer;
} | null {
  const filePath = getCertificatePdfPath(tierUah);
  if (!filePath) return null;
  const base = getCertificateFileBaseName(tierUah)!;
  return {
    filename: `CHARS-gift-certificate-${base}.pdf`,
    content: fs.readFileSync(filePath),
  };
}
