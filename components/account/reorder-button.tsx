"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { ROUTES } from "@/lib/utils/constants";

interface ReorderLine {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface ReorderButtonProps {
  lines: ReorderLine[];
}

export function ReorderButton({ lines }: ReorderButtonProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  function handleReorder() {
    for (const line of lines) {
      addItem({
        cartKey: line.productId.toString(),
        id: line.productId,
        productId: line.productId,
        name: line.name,
        slug: "",
        price: line.price,
        quantity: line.quantity,
      });
    }
    router.push(ROUTES.CART);
  }

  return (
    <button
      onClick={handleReorder}
      className="inline-flex items-center gap-2 border-2 border-foreground bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Repetir Pedido
    </button>
  );
}
