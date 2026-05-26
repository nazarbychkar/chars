function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** CHARS bow-tie brand mark (CHARS-06.png) for certificate emails */
export function certificateBowTieEmailHtml(
  baseUrl: string,
  size = 32
): string {
  const src = `${baseUrl.replace(/\/$/, "")}/images/CHARS-06.png`;
  return `<img src="${escapeHtml(src)}" alt="" width="${size}" height="${size}" style="display:block;margin:0 auto 8px;max-width:${size}px;height:auto;border:0;" />`;
}
