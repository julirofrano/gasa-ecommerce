import { MERCADOPAGO_ACCESS_TOKEN } from "./client";

interface PreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

interface CreatePreferenceParams {
  items: PreferenceItem[];
  payerEmail?: string;
  externalReference: string;
}

export async function createPreference(params: CreatePreferenceParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: params.items.map((item) => ({
          ...item,
          currency_id: item.currency_id || "ARS",
        })),
        payer: params.payerEmail ? { email: params.payerEmail } : undefined,
        external_reference: params.externalReference,
        back_urls: {
          success: `${appUrl}/checkout/success`,
          failure: `${appUrl}/checkout/failure`,
          pending: `${appUrl}/checkout/pending`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/payments/webhook`,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`MercadoPago error: ${response.statusText}`);
  }

  return response.json();
}
