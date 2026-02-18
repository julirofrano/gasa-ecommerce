"use client";

import { useEffect, useState } from "react";
import { verifyPayment } from "./actions";

interface PaymentVerifierProps {
  paymentId: string;
  externalReference: string;
}

export function PaymentVerifier({
  paymentId,
  externalReference,
}: PaymentVerifierProps) {
  const [orderNames, setOrderNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyPayment(paymentId, externalReference)
      .then((result) => {
        if (result.orderNames.length > 0) {
          setOrderNames(result.orderNames);
        }
      })
      .finally(() => setLoading(false));
  }, [paymentId, externalReference]);

  if (loading) {
    return (
      <div className="mt-6 flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 border-2 border-muted" />
          <div
            className="absolute inset-0 animate-spin border-2 border-transparent border-t-accent"
            style={{ animationDuration: "0.8s" }}
          />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Verificando pago
        </p>
      </div>
    );
  }

  if (orderNames.length === 0) return null;

  return (
    <div className="mt-4 border-2 border-foreground p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {orderNames.length > 1 ? "Números de pedido" : "Número de pedido"}
      </p>
      <p className="mt-1 text-lg font-bold">{orderNames.join(" / ")}</p>
    </div>
  );
}
