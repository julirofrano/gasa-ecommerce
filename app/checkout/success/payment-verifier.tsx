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
      <div className="mt-4 text-sm text-muted-foreground">
        Verificando pago...
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
