import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  validateWebhookSignature,
  processPaymentNotification,
} from "@/lib/mercadopago/webhooks";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    const xSignature = request.headers.get("x-signature");
    const xRequestId = request.headers.get("x-request-id");
    const dataId = String(data.data?.id ?? "");

    if (!validateWebhookSignature(dataId, xSignature, xRequestId)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    if (data.type === "payment") {
      await processPaymentNotification(String(data.data.id));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
