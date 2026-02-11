"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Todos", value: "" },
  { label: "Completados", value: "sale" },
  { label: "Cancelados", value: "cancel" },
] as const;

export function OrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get("status") ?? "";
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const pushParams = useCallback(
    (status: string, q: string) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (q.trim()) params.set("q", q.trim());
      const qs = params.toString();
      router.push(qs ? `/orders?${qs}` : "/orders");
    },
    [router],
  );

  return (
    <div className="mb-8 space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => pushParams(tab.value, query)}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors duration-200",
              activeStatus === tab.value
                ? "bg-foreground text-background"
                : "border-2 border-foreground bg-background text-foreground hover:bg-foreground hover:text-background",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nro. de pedido..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pushParams(activeStatus, query);
          }}
          className="w-full border-b-2 border-foreground bg-transparent py-2 pl-6 pr-2 text-sm placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
        />
      </div>
    </div>
  );
}
