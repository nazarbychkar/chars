/**
 * HTML лист підтвердження замовлення CHARS.
 * Відправка через Resend після успішної оплати.
 */

import { sendEmail } from "@/lib/email";
import { PAYMENT_TYPE_LABELS_LONG } from "@/lib/paymentTypeLabels";
import { SITE_STORE_NAME, SITE_TAGLINE } from "@/lib/siteBrand";
import { siteContact } from "@/lib/siteContact";

const ACCENT = "#072a6b";
const TEXT = "#072a6b";
const MUTED = "rgba(7,42,107,0.72)";
const BG = "#eef7ff";

const DELIVERY_LABELS: Record<string, string> = {
  nova_poshta_branch: "Нова пошта (відділення)",
  nova_poshta_courier: "Нова пошта (кур'єр)",
  nova_poshta_locker: "Нова пошта (поштомат)",
  showroom_pickup: "Самовивіз з шоуруму",
  international_shipping: "Міжнародна доставка",
};

export type OrderItemForEmail = {
  product_id: number | null;
  product_name: string | null;
  size: string;
  quantity: number;
  price: number;
  color?: string | null;
};

export type OrderForEmail = {
  customer_name: string;
  email: string | null;
  phone_number: string;
  delivery_method: string;
  city: string;
  post_office: string;
  payment_type: string;
  comment?: string | null;
  invoice_id: string;
  created_at: Date;
  currency: "UAH" | "EUR";
  certificate_discount?: number;
  gift_certificate_code?: string | null;
  items: OrderItemForEmail[];
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(amount: number, currency: "UAH" | "EUR"): string {
  const symbol = currency === "EUR" ? "€" : "₴";
  return `${amount.toFixed(currency === "EUR" ? 2 : 0)} ${symbol}`;
}

export function buildOrderConfirmationHtml(
  order: OrderForEmail,
  baseUrl: string,
  productImageUrls: Map<number, string>
): string {
  const markUrl = `${baseUrl}/images/chars-mark-dark.png`;
  const logoUrl = `${baseUrl}/images/light-theme/chars-logo-header-light.png`;
  const currency = order.currency;
  const subtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const discount = Number(order.certificate_discount || 0);
  const total = Math.max(0, subtotal - discount);
  const paymentLabel =
    PAYMENT_TYPE_LABELS_LONG[order.payment_type] || order.payment_type;
  const deliveryLabel =
    DELIVERY_LABELS[order.delivery_method] || order.delivery_method;
  const dateStr = new Date(order.created_at).toLocaleString("uk-UA");

  const rows = order.items
    .map((item) => {
      const imgUrl =
        item.product_id != null
          ? productImageUrls.get(item.product_id) || ""
          : "";
      const name = item.product_name || "Товар";
      const variantParts = [item.size, item.color]
        .filter((v): v is string => typeof v === "string" && v.length > 0)
        .map(escapeHtml);
      const variantText = variantParts.length
        ? ` · ${variantParts.join(", ")}`
        : "";
      const itemTotal = Number(item.price) * item.quantity;
      const imgCell = imgUrl
        ? `<img src="${escapeHtml(imgUrl)}" alt="" width="72" height="96" style="object-fit:cover;border-radius:2px;display:block;" />`
        : '<span style="color:#999;font-size:12px;">—</span>';
      return `
        <tr>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;">${imgCell}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT};">${escapeHtml(name)}${variantText}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:Manrope,Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT};text-align:center;">${item.quantity}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${TEXT};text-align:right;">${escapeHtml(formatMoney(Number(item.price), currency))}</td>
          <td style="padding:12px 14px;border-bottom:1px solid #eee;vertical-align:middle;font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${TEXT};font-weight:600;text-align:right;">${escapeHtml(formatMoney(itemTotal, currency))}</td>
        </tr>`;
    })
    .join("");

  const discountRow =
    discount > 0
      ? `<p style="margin:8px 0 0;font-size:15px;color:${ACCENT};text-align:right;">Сертифікат ${escapeHtml(order.gift_certificate_code || "")}: −${escapeHtml(formatMoney(discount, currency))}</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Дякуємо за замовлення — ${escapeHtml(SITE_STORE_NAME)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:Manrope,Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:4px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#ffffff;padding:28px 32px;text-align:center;border-bottom:1px solid #ede8df;">
              <a href="${escapeHtml(baseUrl)}" target="_blank" rel="noopener">
                <img src="${escapeHtml(markUrl)}" alt="${escapeHtml(SITE_STORE_NAME)}" width="32" height="80" style="display:block;margin:0 auto 12px;max-height:64px;width:auto;border:0;" />
                <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(SITE_STORE_NAME)}" width="168" height="48" style="display:inline-block;max-height:48px;width:auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 20px;">
              <h1 style="margin:0 0 12px;font-size:26px;font-weight:500;color:${TEXT};letter-spacing:-0.02em;line-height:1.3;">
                Дякуємо за замовлення!
              </h1>
              <p style="margin:0;font-size:15px;color:${MUTED};line-height:1.55;">
                Вітаємо, ${escapeHtml(order.customer_name)}! Ваше замовлення <strong style="color:${ACCENT};">#${escapeHtml(order.invoice_id.slice(0, 8))}</strong> оплачено. Нижче — деталі для підтвердження.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BG};border-radius:4px;padding:20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${ACCENT};font-weight:600;">Доставка</p>
                    <p style="margin:0 0 16px;font-size:15px;color:${TEXT};line-height:1.45;">${escapeHtml(deliveryLabel)}<br />${escapeHtml(order.city)}, ${escapeHtml(order.post_office)}</p>
                    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${ACCENT};font-weight:600;">Оплата</p>
                    <p style="margin:0 0 4px;font-size:15px;color:${TEXT};">${escapeHtml(paymentLabel)}</p>
                    <p style="margin:0;font-size:13px;color:${MUTED};">Дата: ${escapeHtml(dateStr)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${ACCENT};">Товари у замовленні</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:4px;overflow:hidden;">
                <thead>
                  <tr style="background:${ACCENT};">
                    <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Фото</th>
                    <th style="padding:11px 14px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Товар</th>
                    <th style="padding:11px 14px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">К-сть</th>
                    <th style="padding:11px 14px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Ціна</th>
                    <th style="padding:11px 14px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#fff;">Сума</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
              ${discountRow}
              <p style="margin:16px 0 0;font-size:18px;font-weight:600;color:${TEXT};text-align:right;">Разом: ${escapeHtml(formatMoney(total, currency))}</p>
            </td>
          </tr>
          ${
            order.comment && order.comment.trim()
              ? `<tr><td style="padding:0 32px 24px;"><p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:${ACCENT};font-weight:600;">Коментар</p><p style="margin:0;font-size:14px;color:${TEXT};line-height:1.5;">${escapeHtml(order.comment.trim())}</p></td></tr>`
              : ""
          }
          <tr>
            <td style="padding:28px 32px;background:${BG};border-top:1px solid #ede8df;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:${TEXT};">${escapeHtml(SITE_STORE_NAME)}</p>
              <p style="margin:0 0 12px;font-size:12px;color:${MUTED};line-height:1.5;">${escapeHtml(SITE_TAGLINE)}<br />${escapeHtml(siteContact.showroomAddress)}</p>
              <a href="${escapeHtml(siteContact.instagramUrl)}" target="_blank" rel="noopener" style="display:inline-block;margin-right:14px;color:${ACCENT};font-size:14px;font-weight:500;text-decoration:none;">Instagram</a>
              <a href="${escapeHtml(baseUrl)}" style="color:${ACCENT};font-size:14px;font-weight:500;text-decoration:none;">charsua.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmationEmail(
  order: OrderForEmail,
  productImageUrls: Map<number, string>
): Promise<{ success: boolean; error?: string }> {
  if (!order.email || !order.email.trim()) {
    return { success: true };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    siteContact.siteUrl;

  const html = buildOrderConfirmationHtml(order, baseUrl, productImageUrls);
  const subtotal = order.items.reduce(
    (s, i) => s + Number(i.price) * i.quantity,
    0
  );
  const total = Math.max(0, subtotal - Number(order.certificate_discount || 0));

  return sendEmail({
    to: order.email.trim(),
    subject: `Дякуємо за замовлення — ${SITE_STORE_NAME}`,
    html,
    text: `Дякуємо за замовлення в ${SITE_STORE_NAME}! Номер: ${order.invoice_id}. Разом: ${formatMoney(total, order.currency)}. Ми зв'яжемося з вами щодо доставки.`,
  });
}
