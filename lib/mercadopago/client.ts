// MercadoPago SDK configuration
// TODO: bun add mercadopago

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || "";

if (!MERCADOPAGO_ACCESS_TOKEN) {
  console.warn(
    "MERCADOPAGO_ACCESS_TOKEN is not set. Payment features will not work.",
  );
}

export { MERCADOPAGO_ACCESS_TOKEN };
