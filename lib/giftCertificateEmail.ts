import { sendEmail } from "@/lib/email";
import { SITE_STORE_NAME } from "@/lib/siteBrand";
import { siteContact } from "@/lib/siteContact";
import { formatCertificateAmount } from "@/lib/certificates";
import {
  certificateGraphite as g,
  CERTIFICATE_SCRIPT_FONT,
  CERTIFICATE_SANS_FONT,
} from "@/lib/certificateStyle";
import { certificateBowTieEmailHtml } from "@/lib/certificateButterflyIcon";

const BG = "#f8f6f1";
const BODY_TEXT = "#1e1e1e";
const BODY_MUTED = "#78716c";

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
      title: "Подарунковий сертифікат",
      amountPrefix: "На суму",
      greeting: (name: string) => `Вітаємо, ${name}!`,
      intro:
        "Дякуємо за покупку. Ваш сертифікат CHARS активовано — збережіть код на картці нижче.",
      codeLabel: "Код сертифікату",
      howToTitle: "Як використати",
      steps: [
        "Оберіть товари на charsua.com та перейдіть до оформлення.",
        "У полі «Подарунковий сертифікат» введіть код і натисніть «Застосувати».",
        "Сума сертифіката автоматично зарахується до замовлення.",
      ],
      validLabel: "Дійсний 12 місяців",
      validUntil: "Дійсний до",
      tagline: "Стиль — це найкращий подарунок",
      showroom: "CHARS KYIV",
    },
    de: {
      subject: (code: string) =>
        `Ihr Geschenkgutschein ${code} — ${SITE_STORE_NAME}`,
      title: "Geschenkgutschein",
      amountPrefix: "Für den Betrag",
      greeting: (name: string) => `Hallo ${name}!`,
      intro:
        "Vielen Dank für Ihren Kauf. Ihr CHARS-Gutschein ist aktiv — bewahren Sie den Code auf der Karte unten auf.",
      codeLabel: "Gutscheincode",
      howToTitle: "So einlösen",
      steps: [
        "Wählen Sie Produkte auf charsua.com und gehen Sie zur Kasse.",
        "Geben Sie den Code unter «Geschenkgutschein» ein und klicken Sie «Anwenden».",
        "Der Gutscheinbetrag wird automatisch verrechnet.",
      ],
      validLabel: "12 Monate gültig",
      validUntil: "Gültig bis",
      tagline: "Stil ist das schönste Geschenk",
      showroom: "CHARS KYIV",
    },
    en: {
      subject: (code: string) =>
        `Your gift certificate ${code} — ${SITE_STORE_NAME}`,
      title: "Gift Certificate",
      amountPrefix: "For the amount",
      greeting: (name: string) => `Hello ${name}!`,
      intro:
        "Thank you for your purchase. Your CHARS certificate is active — save the code on the card below.",
      codeLabel: "Certificate code",
      howToTitle: "How to redeem",
      steps: [
        "Choose items at charsua.com and proceed to checkout.",
        "Enter the code in the «Gift certificate» field and click «Apply».",
        "The certificate amount will be applied to your order automatically.",
      ],
      validLabel: "Valid for 12 months",
      validUntil: "Valid until",
      tagline: "Style is the finest gift",
      showroom: "CHARS KYIV",
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

function buildCertificateCardHtml(
  data: GiftCertificateEmailData,
  baseUrl: string,
  locale: Locale
): string {
  const t = copy(locale);
  const logoUrl = `${baseUrl}/images/dark-theme/chars-logo-header-dark.png`;
  const displayAmount =
    data.currency === "EUR" ? data.tierEur : data.tierUah;
  const formattedAmount = formatCertificateAmount(displayAmount, data.currency);

  return `
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;border-collapse:collapse;background:${g.background};">
  <tr>
    <td align="center" style="padding:40px 32px 32px;">
      <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(SITE_STORE_NAME)}" width="180" height="52" style="display:block;max-width:180px;height:auto;border:0;margin:0 auto;" />
    </td>
  </tr>
  <tr>
    <td align="center" style="padding:8px 36px 52px;font-family:${CERTIFICATE_SCRIPT_FONT};font-style:italic;">
      <p style="margin:0 0 32px;font-size:42px;line-height:1.3;color:${g.script};">
        ${escapeHtml(t.title)}
      </p>
      <p style="margin:0 0 36px;font-size:38px;line-height:1.4;color:${g.script};">
        ${escapeHtml(t.amountPrefix)}
        <span style="border-bottom:1px solid #8a8680;padding-bottom:2px;color:${g.scriptSoft};">
          ${escapeHtml(formattedAmount)}
        </span>
      </p>
      <p style="margin:0;font-size:36px;line-height:1.4;color:${g.script};max-width:360px;">
        ${escapeHtml(t.tagline)}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 32px 36px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td valign="bottom" style="font-family:${CERTIFICATE_SANS_FONT};font-size:11px;font-style:normal;font-weight:400;letter-spacing:0.12em;text-transform:uppercase;color:${g.footer};line-height:1.55;">
            <span style="display:block;">${escapeHtml(t.validLabel)}</span>
            <span style="display:block;margin-top:8px;text-transform:none;letter-spacing:0.04em;">
              ${escapeHtml(t.codeLabel)}: ${escapeHtml(data.code)}
            </span>
            <span style="display:block;margin-top:8px;text-transform:none;letter-spacing:0.04em;">
              ${escapeHtml(siteContact.showroomAddress)}
            </span>
          </td>
          <td align="right" valign="bottom" style="font-family:${CERTIFICATE_SANS_FONT};font-size:11px;font-style:normal;font-weight:400;letter-spacing:0.06em;text-transform:none;color:${g.footer};">
            ${certificateBowTieEmailHtml(baseUrl, 30)}
            <span style="display:block;text-align:right;">charsua.com</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

export function buildGiftCertificateEmailHtml(
  data: GiftCertificateEmailData,
  baseUrl: string
): string {
  const locale = resolveLocale(data.locale);
  const t = copy(locale);
  const certificateCard = buildCertificateCardHtml(data, baseUrl, locale);

  return `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Marck+Script&amp;display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:${BG};font-family:Inter,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
          <tr>
            <td style="padding:0 8px 24px;">
              <h1 style="margin:0 0 12px;font-size:22px;font-weight:500;color:${BODY_TEXT};">${escapeHtml(t.greeting(data.recipientName))}</h1>
              <p style="margin:0;font-size:15px;line-height:1.6;color:${BODY_MUTED};">${escapeHtml(t.intro)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 28px;">
              ${certificateCard}
            </td>
          </tr>
          <tr>
            <td style="padding:0 8px 28px;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">${escapeHtml(t.howToTitle)}</p>
              <ol style="margin:0;padding-left:20px;color:${BODY_MUTED};font-size:14px;line-height:1.7;">
                ${t.steps.map((step) => `<li style="margin-bottom:6px;">${escapeHtml(step)}</li>`).join("")}
              </ol>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;border-top:1px solid #e5ddd2;">
              <p style="margin:0 0 8px;font-size:13px;color:${BODY_TEXT};font-weight:600;">${escapeHtml(SITE_STORE_NAME)}</p>
              <p style="margin:0 0 12px;font-size:12px;color:${BODY_MUTED};">${escapeHtml(siteContact.showroomAddress)}</p>
              <a href="${escapeHtml(siteContact.instagramUrl)}" style="color:#71717a;font-size:13px;text-decoration:none;margin-right:12px;">Instagram</a>
              <a href="${escapeHtml(baseUrl)}" style="color:#71717a;font-size:13px;text-decoration:none;">charsua.com</a>
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

  return sendEmail({
    to: data.recipientEmail.trim(),
    subject: t.subject(data.code),
    html,
    text: `${t.greeting(data.recipientName)} ${t.intro} ${t.codeLabel}: ${data.code}. ${formatCertificateAmount(displayAmount, data.currency)}.`,
  });
}
