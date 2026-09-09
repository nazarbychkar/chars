import {
  confirmChastOrder,
  getChastOrderState,
  type ChastOrderState,
  type ChastOrderStateResult,
  type ChastOrderSubState,
} from "@/lib/monoChast";
import { processPaidOrderNotifications } from "@/lib/postPayment";
import { sendOrderTelegramNotification } from "@/lib/orderTelegram";
import {
  sqlGetOrder,
  sqlGetOrderByInvoiceId,
  sqlUpdatePaymentStatus,
  type OrderRowForNotification,
} from "@/lib/sql";

export type ChastShipmentInfo = {
  applicable: boolean;
  invoiceId?: string;
  state?: ChastOrderState;
  orderSubState?: ChastOrderSubState;
  message?: string | null;
  canConfirm: boolean;
  isConfirmed: boolean;
};

export function isChastShipmentConfirmed(subState: ChastOrderSubState): boolean {
  return subState === "ACTIVE" || subState === "DONE" || subState === "RETURNED";
}

export function canConfirmChastShipment(subState: ChastOrderSubState): boolean {
  return subState === "WAITING_FOR_STORE_CONFIRM";
}

export function isChastPaidSubState(subState: ChastOrderSubState): boolean {
  return (
    subState === "WAITING_FOR_STORE_CONFIRM" ||
    subState === "ACTIVE" ||
    subState === "DONE"
  );
}

export function isChastFailedSubState(
  state: ChastOrderState,
  subState: ChastOrderSubState
): boolean {
  return state === "FAIL" || subState === "REJECTED_BY_CLIENT";
}

async function notifyPaidInstallmentOrder(
  order: OrderRowForNotification,
  invoiceId: string
) {
  const items = Array.isArray(order.items) ? order.items : [];
  const totalMinorUnits = items.reduce((sum, item) => {
    const price = Number(item.price ?? 0);
    const quantity = Number(item.quantity ?? 0);
    return sum + Math.round(price * quantity * 100);
  }, 0);

  await sendOrderTelegramNotification(order, invoiceId, totalMinorUnits, 980);
  await processPaidOrderNotifications(invoiceId);
}

export async function applyChastStateToOrder(
  invoiceId: string,
  state: ChastOrderState,
  subState: ChastOrderSubState
): Promise<"paid" | "canceled" | "pending" | "unchanged"> {
  const order = await sqlGetOrderByInvoiceId(invoiceId);
  if (!order || order.payment_type !== "installments") {
    return "unchanged";
  }

  if (order.payment_status === "paid") {
    return "unchanged";
  }

  if (isChastPaidSubState(subState)) {
    if (order.payment_status !== "pending") {
      return "unchanged";
    }

    await sqlUpdatePaymentStatus(invoiceId, "paid");
    const paidOrder = await sqlGetOrderByInvoiceId(invoiceId);
    if (paidOrder) {
      await notifyPaidInstallmentOrder(paidOrder, invoiceId);
    }
    return "paid";
  }

  if (isChastFailedSubState(state, subState)) {
    if (order.payment_status === "canceled") {
      return "unchanged";
    }

    await sqlUpdatePaymentStatus(invoiceId, "canceled");
    return "canceled";
  }

  return "pending";
}

export async function getChastShipmentInfoForOrder(
  orderId: number
): Promise<ChastShipmentInfo> {
  const order = await sqlGetOrder(orderId);
  if (!order?.payment_type || order.payment_type !== "installments") {
    return { applicable: false, canConfirm: false, isConfirmed: false };
  }

  const invoiceId =
    typeof order.invoice_id === "string" ? order.invoice_id : "";
  if (!invoiceId) {
    return { applicable: true, canConfirm: false, isConfirmed: false };
  }

  const stateResult = await getChastOrderState(invoiceId);
  return {
    applicable: true,
    invoiceId,
    state: stateResult.state,
    orderSubState: stateResult.orderSubState,
    message: stateResult.message,
    canConfirm: canConfirmChastShipment(stateResult.orderSubState),
    isConfirmed: isChastShipmentConfirmed(stateResult.orderSubState),
  };
}

export async function confirmChastShipmentForOrder(
  orderId: number
): Promise<ChastOrderStateResult> {
  const order = await sqlGetOrder(orderId);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }
  if (order.payment_type !== "installments") {
    throw new Error("NOT_INSTALLMENTS");
  }
  if (order.payment_status !== "paid") {
    throw new Error("NOT_PAID");
  }

  const invoiceId =
    typeof order.invoice_id === "string" ? order.invoice_id : "";
  if (!invoiceId) {
    throw new Error("MISSING_INVOICE_ID");
  }

  const currentState = await getChastOrderState(invoiceId);
  if (!canConfirmChastShipment(currentState.orderSubState)) {
    throw new Error("NOT_AWAITING_CONFIRM");
  }

  return confirmChastOrder(invoiceId);
}

export async function syncChastOrderStatus(
  invoiceId: string
): Promise<"paid" | "canceled" | "pending" | "unchanged"> {
  const order = await sqlGetOrderByInvoiceId(invoiceId);
  if (!order || order.payment_type !== "installments") {
    return "unchanged";
  }

  if (order.payment_status === "paid" || order.payment_status === "canceled") {
    return "unchanged";
  }

  const stateResult = await getChastOrderState(invoiceId);
  return applyChastStateToOrder(
    invoiceId,
    stateResult.state,
    stateResult.orderSubState
  );
}
