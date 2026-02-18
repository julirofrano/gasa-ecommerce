"use client";

import { useState } from "react";
import { markContainerEmptyAction } from "@/app/(account)/containers/actions";

interface MarkEmptyButtonProps {
  containerId: number;
}

export function MarkEmptyButton({ containerId }: MarkEmptyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    setLoading(true);

    const result = await markContainerEmptyAction(containerId);

    if (!result.success) {
      setError(result.error || "Error desconocido.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="border-2 border-foreground bg-background px-3 py-1 text-xs font-bold uppercase tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50 group-hover:border-background group-hover:text-background group-hover:hover:bg-background group-hover:hover:text-accent"
      >
        {loading ? "Enviando..." : "Marcar vacío"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
