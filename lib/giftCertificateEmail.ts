import { sendEmail } from "@/lib/email";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { siteContact } from "@/lib/siteContact";
import { formatCertificateAmount } from "@/lib/certificates";
import { readCertificatePdfAttachment } from "@/lib/certificateFiles";

const BG = "#eef7ff";
const BODY_TEXT = "#072a6b";
const BODY_MUTED = "rgba(7, 42, 107, 0.65)";
const ACCENT = "#072a6b";

type Locale = "uk" | "de" | "en";

export type GiftCertificateEmailData = {
  code: string;
  tierUah: number;
  tierEur: number;
  currency: "UAH" | "EUR";
  initialBalance: number;
  recipientName: string;
  recipientEmail: string;
  locale?: string | null;
  expiresAt: Date;
};

function resolveLocale(locale?: string | null): Locale {
  if (locale === "de" || locale === "en") return locale;
  return "uk";
}

function copy(locale: Locale) {
  const copies = {
    uk: {
      subject: (code: string) =>
        `Ваш подарунковий сертифікат ${code} — ${SITE_STORE_NAME}`,
      greeting: (name: string) => `Вітаємо, ${name}!`,
      intro:
        "Дякуємо за покупку. Ваш подарунковий сертифікат CHARS — у вкладенні PDF.",
      codeLabel: "Код сертифікату",
      amountLabel: "Номінал",
      howToTitle: "Як використати",
      steps: [
        "Оберіть товари на charsua.com та перейдіть до оформлення.",
        "У полі «Подарунковий сертифікат» введіть код і натисніть «Застосувати».",
        "Сума сертифіката автоматично зарахується до замовлення.",
      ],
      validLabel: "Дійсний 12 місяців",
      validUntil: "Дійсний до",
    },
    de: {
      subject: (code: string) =>
        `Ihr Geschenkgutschein ${code} — ${SITE_STORE_NAME}`,
      greeting: (name: string) => `Hallo ${name}!`,
      intro:
        "Vielen Dank für Ihren Kauf. Ihr CHARS-Geschenkgutschein finden Sie im PDF-Anhang.",
      codeLabel: "Gutscheincode",
      amountLabel: "Betrag",
      howToTitle: "So einlösen",
      steps: [
        "Wählen Sie Produkte auf charsua.com und gehen Sie zur Kasse.",
        "Geben Sie den Code unter «Geschenkgutschein» ein und klicken Sie «Anwenden».",
        "Der Gutscheinbetrag wird automatisch verrechnet.",
      ],
      validLabel: "12 Monate gültig",
      validUntil: "Gültig bis",
    },
    en: {
      subject: (code: string) =>
        `Your gift certificate ${code} — ${SITE_STORE_NAME}`,
      greeting: (name: string) => `Hello ${name}!`,
      intro:
        "Thank you for your purchase. Your CHARS gift certificate is attached as a PDF.",
      codeLabel: "Certificate code",
      amountLabel: "Amount",
      howToTitle: "How to redeem",
      steps: [
        "Choose items at charsua.com and proceed to checkout.",
        "Enter the code in the «Gift certificate» field and click «Apply».",
        "The certificate amount will be applied to your order automatically.",
      ],
      validLabel: "Valid for 12 months",
      validUntil: "Valid until",
    },
  } as const;
  return copies[locale];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildGiftCertificateEmailHtml(
  data: GiftCertificateEmailData,
  baseUrl: string
): string {
  const locale = resolveLocale(data.locale);
  const t = copy(locale);
  const markUrl = `${baseUrl.replace(/\/$/, "")}/images/chars-mark-dark.png`;
  const logoUrl = `${baseUrl.replace(/\/$/, "")}/images/light-theme/chars-logo-header-light.png`;
  const displayAmount =
    data.currency === "EUR" ? data.tierEur : data.tierUah;
  const formattedAmount = formatCertificateAmount(displayAmount, data.currency);
  const expiresStr = data.expiresAt.toLocaleDateString(
    locale === "uk" ? "uk-UA" : locale === "de" ? "de-DE" : "en-GB"
  );

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Manrope,Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};">
    <tr>
      <td align="center" style="padding:40px 20px 48px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">
          <tr>
            <td align="center" style="padding:0 0 32px;">
              <img src="${escapeHtml(markUrl)}" alt="${escapeHtml(SITE_STORE_NAME)}" width="36" height="88" style="display:block;margin:0 auto 16px;max-height:72px;width:auto;border:0;" />
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(SITE_STORE_NAME)}" width="160" height="46" style="display:block;max-width:160px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:0 4px 20px;">
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:500;line-height:1.3;color:${BODY_TEXT};">${escapeHtml(t.greeting(data.recipientName))}</h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:${BODY_MUTED};">${escapeHtml(t.intro)}</p>
              <p style="margin:0 0 8px;font-size:13px;color:${ACCENT};letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(t.codeLabel)}</p>
              <p style="margin:0 0 20px;font-size:20px;font-weight:500;letter-spacing:0.08em;color:${BODY_TEXT};font-family:ui-monospace,Menlo,monospace;">${escapeHtml(data.code)}</p>
              <p style="margin:0 0 6px;font-size:13px;color:${ACCENT};letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(t.amountLabel)}</p>
              <p style="margin:0 0 20px;font-size:17px;color:${BODY_TEXT};">${escapeHtml(formattedAmount)}</p>
              <p style="margin:0;font-size:14px;line-height:1.5;color:${BODY_MUTED};">${escapeHtml(t.validLabel)} · ${escapeHtml(t.validUntil)} ${escapeHtml(expiresStr)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 4px 0;border-top:1px solid #e5ddd2;">
              <p style="margin:0 0 12px;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">${escapeHtml(t.howToTitle)}</p>
              <ol style="margin:0;padding-left:20px;color:${BODY_MUTED};font-size:14px;line-height:1.7;">
                ${t.steps.map((step) => `<li style="margin-bottom:8px;">${escapeHtml(step)}</li>`).join("")}
              </ol>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 4px 0;">
              <p style="margin:0 0 6px;font-size:13px;color:${BODY_TEXT};font-weight:600;">${escapeHtml(SITE_STORE_NAME)}</p>
              <p style="margin:0 0 14px;font-size:12px;line-height:1.5;color:${BODY_MUTED};">${escapeHtml(siteContact.showroomAddress)}</p>
              <a href="${escapeHtml(siteContact.instagramUrl)}" style="color:${ACCENT};font-size:13px;text-decoration:none;margin-right:14px;">Instagram</a>
              <a href="${escapeHtml(baseUrl)}" style="color:${ACCENT};font-size:13px;text-decoration:none;">charsua.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendGiftCertificateEmail(
  data: GiftCertificateEmailData
): Promise<{ success: boolean; error?: string }> {
  if (!data.recipientEmail?.trim()) {
    return { success: true };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    siteContact.siteUrl;

  const locale = resolveLocale(data.locale);
  const t = copy(locale);
  const html = buildGiftCertificateEmailHtml(data, baseUrl);
  const displayAmount =
    data.currency === "EUR" ? data.tierEur : data.tierUah;
  const expiresStr = data.expiresAt.toLocaleDateString(
    locale === "uk" ? "uk-UA" : locale === "de" ? "de-DE" : "en-GB"
  );

  const pdfAttachment = readCertificatePdfAttachment(data.tierUah);
  if (!pdfAttachment) {
    console.warn(
      `[giftCertificateEmail] PDF not found for tier ${data.tierUah} UAH`
    );
  }

  return sendEmail({
    to: data.recipientEmail.trim(),
    subject: t.subject(data.code),
    html,
    text: [
      t.greeting(data.recipientName),
      t.intro,
      `${t.codeLabel}: ${data.code}`,
      `${t.amountLabel}: ${formatCertificateAmount(displayAmount, data.currency)}`,
      `${t.validUntil} ${expiresStr}`,
      "",
      t.howToTitle,
      ...t.steps.map((s, i) => `${i + 1}. ${s}`),
    ].join("\n"),
    attachments: pdfAttachment ? [pdfAttachment] : undefined,
  });
}
