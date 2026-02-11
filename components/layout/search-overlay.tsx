"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/lib/utils/constants";

export function SearchOverlay() {
  const { isSearchOpen, closeSearch, toggleSearch } = useUIStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Auto-focus on open
  useEffect(() => {
    if (isSearchOpen) {
      // Small delay to let the overlay render
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isSearchOpen]);

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K / Ctrl+K to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleSearch();
      }
      // Escape to close
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, toggleSearch, closeSearch]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = (formData.get("q") as string)?.trim();
    if (!query) return;
    router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}`);
    closeSearch();
  }

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[55]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/60"
        onClick={closeSearch}
      />

      {/* Search bar */}
      <div className="relative border-b-2 border-foreground bg-background md:border-b-4">
        <div className="container mx-auto px-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-4 py-5 md:py-6"
          >
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              name="q"
              type="text"
              placeholder="Buscar productos..."
              autoComplete="off"
              className="flex-1 border-b-2 border-foreground bg-transparent pb-1 text-lg font-bold uppercase tracking-wide placeholder:text-muted-foreground focus:border-[#0094BB] focus:outline-none"
            />
            <button
              type="button"
              onClick={closeSearch}
              className="shrink-0 p-2 transition-colors duration-200 hover:text-[#0094BB]"
              aria-label="Cerrar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
