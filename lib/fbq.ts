/** Сторінка подяки після оформлення — без стандартного PageView у пікселі (залишаються InitiateCheckout / Purchase). */
export function isCheckoutThankYouPath(pathname: string): boolean {
  const p = (pathname || "/").replace(/\/$/, "") || "/";
  return p === "/final" || p.endsWith("/final");
}

export type FbqTrackOptions = {
  /** Дедуплікація з Conversions API: той самий рядок, що й `event_id` на сервері */
  eventID?: string;
};

type FbqPurchaseItem = {
  product_name: string;
  quantity: number;
  price: number | string;
};

type FbqPurchaseOrder = {
  id: number;
  currency?: string | null;
  items: FbqPurchaseItem[];
};

/**
 * Безпечний виклик Meta Pixel fbq().
 * Якщо fbq ще не завантажений — чекає до 5 секунд (polling кожні 100ms).
 * Четвертий аргумент fbq — `{ eventID }` для дедуплікації (не плутати з `order_id` у params).
 */
export function trackFbq(
  eventName: string,
  params?: Record<string, unknown>,
  options?: FbqTrackOptions
): void {
  if (typeof window === "undefined") return;

  const fire = () => {
    if (typeof window.fbq === "function") {
      const id = options?.eventID;
      if (id != null && id !== "") {
        window.fbq("track", eventName, params, { eventID: id });
      } else {
        window.fbq("track", eventName, params);
      }
      return true;
    }
    return false;
  };

  if (fire()) return;

  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    if (fire() || attempts >= 50) {
      clearInterval(interval);
    }
  }, 100);
}

/** Purchase: сума з позицій замовлення, валюта з БД, eventID = id замовлення для дедуплікації */
export function trackFbqPurchase(order: FbqPurchaseOrder): void {
  const totalValue =
    order.items?.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    ) ?? 0;
  const currency =
    order.currency === "EUR" || order.currency === "UAH"
      ? order.currency
      : "UAH";
  const eventId = String(order.id);

  trackFbq(
    "Purchase",
    {
      value: Math.round(totalValue * 100) / 100,
      currency,
      content_ids: order.items.map((item) => item.product_name),
      contents: order.items.map((item) => ({
        id: item.product_name,
        quantity: item.quantity,
        item_price: Number(item.price),
      })),
      content_type: "product",
      order_id: eventId,
    },
    { eventID: eventId }
  );
}
