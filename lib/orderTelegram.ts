import type { GiftCertificateRow, OrderRowForNotification } from "@/lib/sql";

export async function sendCertificatePurchaseTelegram(
  order: OrderRowForNotification,
  invoiceId: string,
  cert: GiftCertificateRow,
  amountMinorUnits?: number
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
  const currencySymbol = cert.currency === "EUR" ? "€" : "₴";
  const localeLabel =
    order.locale === "en"
      ? "EN"
      : order.locale === "de"
        ? "DE"
        : order.locale === "uk"
          ? "UK"
          : order.locale || "—";

  const paidAmount =
    amountMinorUnits != null
      ? amountMinorUnits / 100
      : Number(cert.initial_balance);

  const items = Array.isArray(order.items) ? order.items : [];

  const orderMessage = `
🎁 <b>Новий подарунковий сертифікат (ОПЛАЧЕНО ✅)</b>

🎫 <b>Код:</b> <code>${cert.code}</code>
💰 <b>Номінал:</b> ${Number(cert.initial_balance).toFixed(2)} ${currencySymbol}

👤 <b>Ім'я:</b> ${order.customer_name}
📱 <b>Тел:</b> ${order.phone_number}
📧 <b>Email:</b> ${order.email || "—"}
📝 <b>Коментар:</b> ${order.comment || "—"}
🌐 <b>Мова сайту:</b> ${localeLabel}
🧾 <b>Сплачено:</b> ${paidAmount.toFixed(2)} ${currencySymbol}
💳 <b>Статус:</b> ОПЛАЧЕНО ✅ · Не використаний

📦 <b>Номінал:</b>
${items
  .map(
    (item, i) =>
      `${i + 1}. ${item.product_name || "Сертифікат"} | ${item.size} UAH | ${item.price} ${currencySymbol}`
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
  amountMinorUnits?: number
) {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;
  if (!BOT_TOKEN || !CHAT_ID) return;

  const PUBLIC_URL =
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    "https://charsua.com";

  const adminOrderUrl = `${PUBLIC_URL}/admin/orders/${order.id}/edit`;
  const currencySymbol = order.currency === "EUR" ? "€" : "₴";
  const localeLabel =
    order.locale === "en"
      ? "EN"
      : order.locale === "de"
        ? "DE"
        : order.locale === "uk"
          ? "UK"
          : order.locale || "—";

  const isCertificate = order.delivery_method === "certificate";
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price ?? 0) * Number(item.quantity ?? 0),
    0
  );
  const discount = Number(order.certificate_discount || 0);
  const paidAmount =
    amountMinorUnits != null
      ? amountMinorUnits / 100
      : Math.max(0, subtotal - discount);

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
${isCertificate ? "" : `🚚 <b>Доставка:</b> ${order.delivery_method}
🏙️ <b>Місто:</b> ${order.city}
🏤 <b>Відділення:</b> ${order.post_office}
`}${discount > 0 ? `🎫 <b>Сертифікат:</b> ${order.gift_certificate_code} (−${discount.toFixed(2)} ${currencySymbol})\n` : ""}📝 <b>Коментар:</b> ${order.comment || "—"}
🌐 <b>Мова сайту:</b> ${localeLabel}
💰 <b>Оплата:</b> ${paymentLabel}
🧾 <b>Сума:</b> ${paidAmount.toFixed(2)} ${currencySymbol}
💳 <b>Статус:</b> ОПЛАЧЕНО ✅

📦 <b>Товари:</b>
${items
  .map(
    (item, i) =>
      `${i + 1}. ${item.product_name || "Товар"}${item.color ? ` (${item.color})` : ""} | ${item.size} | x${item.quantity} | ${item.price} ${currencySymbol}`
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
