import { getFirstProductImage } from "@/lib/getFirstProductImage";
import { sendGiftCertificateEmail } from "@/lib/giftCertificateEmail";
import {
  sendOrderConfirmationEmail,
  type OrderForEmail,
  type OrderItemForEmail,
} from "@/lib/orderConfirmationEmail";
import { getCertificateTier } from "@/lib/certificates";
import {
  sqlCreateGiftCertificateForOrder,
  sqlGetGiftCertificateByPurchaseOrderId,
  sqlGetOrderByInvoiceId,
  sqlGetProduct,
  sqlMarkOrderEmailSent,
  sqlRedeemGiftCertificateForOrder,
  type OrderRowForNotification,
} from "@/lib/sql";

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_PUBLIC_URL ||
    process.env.PUBLIC_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://charsua.com"
  );
}

function mapOrderForEmail(order: OrderRowForNotification): OrderForEmail {
  const items = Array.isArray(order.items) ? order.items : [];
  return {
    customer_name: order.customer_name,
    email: order.email,
    phone_number: order.phone_number,
    delivery_method: order.delivery_method,
    city: order.city,
    post_office: order.post_office,
    payment_type: order.payment_type,
    comment: order.comment,
    invoice_id: order.invoice_id,
    created_at: new Date(order.created_at),
    currency: order.currency === "EUR" ? "EUR" : "UAH",
    certificate_discount: Number(order.certificate_discount || 0),
    gift_certificate_code: order.gift_certificate_code,
    items: items.map(
      (item: {
        product_id?: number | null;
        product_name?: string | null;
        size?: string;
        quantity?: number;
        price?: number | string;
        color?: string | null;
      }): OrderItemForEmail => ({
        product_id:
          item.product_id != null ? Number(item.product_id) : null,
        product_name: item.product_name ?? null,
        size: String(item.size ?? ""),
        quantity: Number(item.quantity ?? 0),
        price: Number(item.price ?? 0),
        color: item.color ?? null,
      })
    ),
  };
}

async function buildProductImageUrls(
  items: OrderItemForEmail[]
): Promise<Map<number, string>> {
  const baseUrl = getBaseUrl();
  const map = new Map<number, string>();

  for (const item of items) {
    if (!item.product_id || item.product_id <= 0 || map.has(item.product_id)) {
      continue;
    }
    try {
      const products = await sqlGetProduct(item.product_id);
      const media = products[0]?.media as
        | { url: string; type: string }[]
        | undefined;
      const imagePath = getFirstProductImage(media);
      if (imagePath) {
        map.set(item.product_id, `${baseUrl}/api/images/${imagePath}`);
      }
    } catch (error) {
      console.warn(
        `[postPayment] Failed to load image for product ${item.product_id}:`,
        error
      );
    }
  }

  return map;
}

async function handleCertificatePurchase(order: OrderRowForNotification) {
  const existing = await sqlGetGiftCertificateByPurchaseOrderId(order.id);
  if (existing) {
    console.log(
      "[postPayment] Gift certificate already exists for order",
      order.id
    );
    return;
  }

  const item = Array.isArray(order.items) ? order.items[0] : null;
  const tierUah = Number(item?.size ?? 0);
  const tier = getCertificateTier(tierUah);
  if (!tier) {
    console.error("[postPayment] Unknown certificate tier:", tierUah);
    return;
  }

  const cert = await sqlCreateGiftCertificateForOrder({
    purchaseOrderId: order.id,
    tierUah: tier.uah,
    tierEur: tier.eur,
    currency: order.currency === "EUR" ? "EUR" : "UAH",
    initialBalance:
      order.currency === "EUR"
        ? Number(item?.price ?? tier.eur)
        : Number(item?.price ?? tier.uah),
    recipientName: order.customer_name,
    recipientEmail: order.email ?? "",
    locale: order.locale,
  });

  const emailResult = await sendGiftCertificateEmail({
    code: cert.code,
    tierUah: tier.uah,
    tierEur: tier.eur,
    currency: cert.currency,
    initialBalance: Number(cert.initial_balance),
    recipientName: order.customer_name,
    recipientEmail: order.email ?? "",
    locale: order.locale,
    expiresAt: new Date(cert.expires_at),
  });

  if (!emailResult.success) {
    console.error("[postPayment] Certificate email failed:", emailResult.error);
  }
}

async function handleProductOrder(order: OrderRowForNotification) {
  const orderForEmail = mapOrderForEmail(order);
  const productImageUrls = await buildProductImageUrls(orderForEmail.items);
  const emailResult = await sendOrderConfirmationEmail(
    orderForEmail,
    productImageUrls
  );

  if (!emailResult.success) {
    console.error("[postPayment] Order email failed:", emailResult.error);
  }
}

export async function processPaidOrderNotifications(
  invoiceId: string
): Promise<void> {
  const order = await sqlGetOrderByInvoiceId(invoiceId);
  if (!order) {
    console.warn("[postPayment] Order not found for invoice:", invoiceId);
    return;
  }

  if (order.email_sent_at) {
    console.log("[postPayment] Emails already sent for order", order.id);
    return;
  }

  if (order.delivery_method === "certificate") {
    await handleCertificatePurchase(order);
  } else {
    if (
      order.gift_certificate_code &&
      Number(order.certificate_discount || 0) > 0
    ) {
      await sqlRedeemGiftCertificateForOrder({
        code: order.gift_certificate_code,
        orderId: order.id,
        amount: Number(order.certificate_discount),
      });
    }
    await handleProductOrder(order);
  }

  await sqlMarkOrderEmailSent(order.id);
}
