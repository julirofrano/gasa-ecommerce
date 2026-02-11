"use server";

import { getPaymentInfo } from "@/lib/mercadopago/webhooks";
import {
  getOrderById,
  confirmOrder,
  writeOrderPaymentRef,
} from "@/lib/odoo/orders";

interface VerifyPaymentResult {
  /** Comma-separated order names when split */
  orderNames: string[];
  orderState: string | null;
  paymentStatus: string | null;
  error?: string;
}

/** Parse order IDs from external_reference: "order_123" or "orders_123_456" */
function parseOrderIds(ref: string): number[] {
  const multi = ref.match(/^orders_(\d+)_(\d+)$/);
  if (multi) return [parseInt(multi[1], 10), parseInt(multi[2], 10)];

  const single = ref.match(/^order_(\d+)$/);
  if (single) return [parseInt(single[1], 10)];

  return [];
}

export async function verifyPayment(
  paymentId: string,
  externalReference: string,
): Promise<VerifyPaymentResult> {
  try {
    const orderIds = parseOrderIds(externalReference);
    if (orderIds.length === 0) {
      return {
        orderNames: [],
        orderState: null,
        paymentStatus: null,
        error: "Referencia de pedido inválida",
      };
    }

    // Verify payment status with MercadoPago
    const payment = await getPaymentInfo(paymentId);

    const orderNames: string[] = [];
    let lastState: string | null = null;

    for (const orderId of orderIds) {
      const order = await getOrderById(orderId);
      if (!order) continue;

      // Backup confirmation: if payment is approved but order still draft
      if (
        payment.status === "approved" &&
        (order.state === "draft" || order.state === "sent")
      ) {
        const mpPaymentRef = `MP-${paymentId}`;
        await confirmOrder(orderId);
        await writeOrderPaymentRef(orderId, mpPaymentRef);
      }

      const updated = await getOrderById(orderId);
      orderNames.push(updated?.name ?? order.name);
      lastState = updated?.state ?? order.state;
    }

    if (orderNames.length === 0) {
      return {
        orderNames: [],
        orderState: null,
        paymentStatus: payment.status,
        error: "Pedido no encontrado",
      };
    }

    return {
      orderNames,
      orderState: lastState,
      paymentStatus: payment.status,
    };
  } catch (error) {
    console.error("Payment verification error:", error);
    return {
      orderNames: [],
      orderState: null,
      paymentStatus: null,
      error: "Error al verificar el pago",
    };
  }
}
