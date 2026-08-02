import type { GiftCertificateRow, OrderRowForNotification } from "@/lib/sql";

const DELIVERY_LABELS: Record<string, string> = {
  nova_poshta_branch: "Нова пошта (відділення)",
  nova_poshta_courier: "Нова пошта (кур'єр)",
  nova_poshta_locker: "Нова пошта (поштомат)",
  showroom_pickup: "Самовивіз з шоуруму",
  international_shipping: "Міжнародна доставка",
  certificate: "Подарунковий сертифікат",
};

function currencySymbol(currency: string | null | undefined): string {
  return currency === "EUR" ? "€" : "₴";
}

function formatMoney(amount: number, currency: string | null | undefined): string {
  const decimals = currency === "EUR" ? 2 : 2;
  return `${Number(amount).toFixed(decimals)} ${currencySymbol(currency)}`;
}

function localeLabel(locale: string | null | undefined): string {
  if (locale === "en") return "EN";
  if (locale === "de") return "DE";
  if (locale === "uk") return "UK";
  return locale || "—";
}

function deliveryLabel(method: string | null | undefined): string {
  if (!method) return "—";
  return DELIVERY_LABELS[method] || method;
}

/** Paid amount in the order's currency (items), not Mono webhook amount. */
function paidAmountFromOrder(order: OrderRowForNotification): number {
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0),
    0
  );
  const discount = Number(order.certificate_discount || 0);

  if (order.payment_type === "prepay") return 300;
  if (order.payment_type === "certificate") return 0;
  return Math.max(0, subtotal - discount);
}

/**
 * Mono webhook `amount` is in the invoice currency's minor units.
 * If ccy mismatches the order currency (e.g. UAH settlement on an EUR order),
 * ignoring it avoids showing e.g. 3149.60 € next to a 62 € line item.
 */
function paidAmountForDisplay(
  order: OrderRowForNotification,
  amountMinorUnits?: number,
  amountCcy?: number
): number {
  const fromOrder = paidAmountFromOrder(order);
  if (amountMinorUnits == null) return fromOrder;

  const expectedCcy = order.currency === "EUR" ? 978 : 980;
  if (amountCcy != null && amountCcy !== expectedCcy) {
    return fromOrder;
  }

  const fromWebhook = amountMinorUnits / 100;

  // No ccy from webhook: if EUR order but amount looks like UAH (~fx rate), trust order.
  if (
    amountCcy == null &&
    order.currency === "EUR" &&
    fromOrder > 0 &&
    fromWebhook / fromOrder > 10
  ) {
    return fromOrder;
  }

  return fromWebhook;
}

export async function sendCertificatePurchaseTelegram(
  order: OrderRowForNotification,
  invoiceId: string,
  cert: GiftCertificateRow,
  amountMinorUnits?: number,
  amountCcy?: number
) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) return;

  const PUBLIC_URL =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    "https://charsua.com";

  const adminOrderUrl = `${PUBLIC_URL}/admin/orders/${order.id}/edit`;
  const adminCertsUrl = `${PUBLIC_URL}/admin/certificates`;
  const symbolCurrency = cert.currency;
  const expectedCcy = cert.currency === "EUR" ? 978 : 980;
  const paidAmount =
    amountMinorUnits != null &&
    (amountCcy == null || amountCcy === expectedCcy)
      ? amountMinorUnits / 100
      : Number(cert.initial_balance);

  const items = Array.isArray(order.items) ? order.items : [];

  const orderMessage = `
🎁 <b>Новий подарунковий сертифікат (ОПЛАЧЕНО ✅)</b>

🎫 <b>Код:</b> <code>${cert.code}</code>
💰 <b>Номінал:</b> ${formatMoney(Number(cert.initial_balance), symbolCurrency)}

👤 <b>Ім'я:</b> ${order.customer_name}
📱 <b>Тел:</b> ${order.phone_number}
📧 <b>Email:</b> ${order.email || "—"}
📝 <b>Коментар:</b> ${order.comment || "—"}
🌐 <b>Мова сайту:</b> ${localeLabel(order.locale)}
🧾 <b>Сплачено:</b> ${formatMoney(paidAmount, symbolCurrency)}
💳 <b>Статус:</b> ОПЛАЧЕНО ✅ · Не використаний

📦 <b>Номінал:</b>
${items
  .map(
    (item, i) =>
      `${i + 1}. ${item.product_name || "Сертифікат"} | ${item.size} UAH | ${formatMoney(Number(item.price), symbolCurrency)}`
  )
  .join("\n")}

🆔 <b>ID замовлення:</b> ${order.id}
💳 <b>ID інвойсу:</b> ${invoiceId}

🔗 <a href="${adminOrderUrl}">Замовлення в адмін панелі</a>
🔗 <a href="${adminCertsUrl}">Усі сертифікати</a>
  `;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: orderMessage,
      parse_mode: "HTML",
    }),
  });
}

export async function sendOrderTelegramNotification(
  order: OrderRowForNotification,
  invoiceId: string,
  amountMinorUnits?: number,
  amountCcy?: number
) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) return;

  const PUBLIC_URL =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    "https://charsua.com";

  const adminOrderUrl = `${PUBLIC_URL}/admin/orders/${order.id}/edit`;
  const currency = order.currency === "EUR" ? "EUR" : "UAH";

  const isCertificate = order.delivery_method === "certificate";
  const items = Array.isArray(order.items) ? order.items : [];
  const discount = Number(order.certificate_discount || 0);
  const paidAmount = paidAmountForDisplay(order, amountMinorUnits, amountCcy);

  const paymentLabel =
    order.payment_type === "prepay"
      ? "Передоплата (300)"
      : order.payment_type === "paypal_full"
        ? "PayPal"
        : order.payment_type === "certificate"
          ? "Подарунковий сертифікат"
          : "Повна оплата";

  const orderMessage = `
${isCertificate ? "🎁" : "🛒"} <b>${isCertificate ? "Новий подарунковий сертифікат (ОПЛАЧЕНО ✅)" : "Нове замовлення (ОПЛАЧЕНО ✅)"}</b>

👤 <b>Ім'я:</b> ${order.customer_name}
📱 <b>Тел:</b> ${order.phone_number}
📧 <b>Email:</b> ${order.email || "—"}
${isCertificate ? "" : `🚚 <b>Доставка:</b> ${deliveryLabel(order.delivery_method)}
🏙️ <b>Місто:</b> ${order.city}
🏤 <b>Відділення:</b> ${order.post_office}
`}${discount > 0 ? `🎫 <b>Сертифікат:</b> ${order.gift_certificate_code} (−${formatMoney(discount, currency)})\n` : ""}📝 <b>Коментар:</b> ${order.comment || "—"}
🌐 <b>Мова сайту:</b> ${localeLabel(order.locale)}
💰 <b>Оплата:</b> ${paymentLabel}
🧾 <b>Сума:</b> ${formatMoney(paidAmount, currency)}
💳 <b>Статус:</b> ОПЛАЧЕНО ✅

📦 <b>Товари:</b>
${items
  .map(
    (item, i) =>
      `${i + 1}. ${item.product_name || "Товар"}${item.color ? ` (${item.color})` : ""} | ${item.size} | x${item.quantity} | ${formatMoney(Number(item.price), currency)}`
  )
  .join("\n")}

🆔 <b>ID замовлення:</b> ${order.id}
💳 <b>ID інвойсу:</b> ${invoiceId}

🔗 <a href="${adminOrderUrl}">Переглянути замовлення в адмін панелі</a>
  `;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: orderMessage,
      parse_mode: "HTML",
    }),
  });
}
