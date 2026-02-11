import { createHmac, timingSafeEqual } from "crypto";
import { MERCADOPAGO_ACCESS_TOKEN } from "./client";
import {
  getOrderById,
  confirmOrder,
  cancelOrder,
  writeOrderPaymentRef,
} from "@/lib/odoo/orders";

const MERCADOPAGO_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";

export function validateWebhookSignature(
  dataId: string,
  xSignature: string | null,
  xRequestId: string | null,
): boolean {
  if (!xSignature || !xRequestId) return false;
  if (!MERCADOPAGO_WEBHOOK_SECRET) {
    console.warn(
      "MERCADOPAGO_WEBHOOK_SECRET not set — skipping signature validation",
    );
    return true;
  }

  // Parse ts and v1 from x-signature header (format: "ts=...,v1=...")
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key.trim(), rest.join("=").trim()];
    }),
  );

  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  // Build the template string per MercadoPago docs
  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const hmac = createHmac("sha256", MERCADOPAGO_WEBHOOK_SECRET)
    .update(template)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
  } catch {
    return false;
  }
}

export async function getPaymentInfo(paymentId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch payment: ${response.statusText}`);
  }

  return response.json();
}

/** Parse order IDs from external_reference: "order_123" or "orders_123_456" */
function parseOrderIds(externalReference: string): number[] {
  // Multi-order format: orders_123_456
  const multi = externalReference.match(/^orders_(\d+)_(\d+)$/);
  if (multi) return [parseInt(multi[1], 10), parseInt(multi[2], 10)];

  // Single order format: order_123
  const single = externalReference.match(/^order_(\d+)$/);
  if (single) return [parseInt(single[1], 10)];

  return [];
}

async function processOrderPayment(
  orderId: number,
  paymentId: string,
  status: string,
) {
  const order = await getOrderById(orderId);
  if (!order) {
    console.error(
      `Order ${orderId} not found in Odoo for payment ${paymentId}`,
    );
    return;
  }

  const mpPaymentRef = `MP-${paymentId}`;

  switch (status) {
    case "approved": {
      if (order.state === "sale") {
        console.log(`Order ${orderId} already confirmed — skipping`);
        break;
      }
      if (order.state !== "draft" && order.state !== "sent") {
        console.warn(
          `Order ${orderId} in state "${order.state}" — cannot confirm`,
        );
        break;
      }
      await confirmOrder(orderId);
      await writeOrderPaymentRef(orderId, mpPaymentRef);
      console.log(
        `Order ${orderId} confirmed with payment ref ${mpPaymentRef}`,
      );
      break;
    }

    case "rejected": {
      if (order.state === "cancel") {
        console.log(`Order ${orderId} already cancelled — skipping`);
        break;
      }
      if (order.state !== "draft" && order.state !== "sent") {
        console.warn(
          `Order ${orderId} in state "${order.state}" — cannot cancel`,
        );
        break;
      }
      await writeOrderPaymentRef(orderId, mpPaymentRef);
      await cancelOrder(orderId);
      console.log(`Order ${orderId} cancelled due to rejected payment`);
      break;
    }

    case "pending":
    case "in_process": {
      if (!order.client_order_ref) {
        await writeOrderPaymentRef(orderId, mpPaymentRef);
      }
      console.log(`Order ${orderId} payment ${status} — keeping as draft`);
      break;
    }

    default:
      console.log(
        `Payment ${paymentId} status "${status}" — no action for order ${orderId}`,
      );
  }
}

export async function processPaymentNotification(paymentId: string) {
  const payment = await getPaymentInfo(paymentId);

  const externalReference: string | undefined = payment.external_reference;
  if (!externalReference) {
    console.warn(`Payment ${paymentId} has no external_reference — skipping`);
    return payment;
  }

  const orderIds = parseOrderIds(externalReference);
  if (orderIds.length === 0) {
    console.warn(
      `Payment ${paymentId} has invalid external_reference: ${externalReference}`,
    );
    return payment;
  }

  for (const orderId of orderIds) {
    await processOrderPayment(orderId, paymentId, payment.status);
  }

  return payment;
}
