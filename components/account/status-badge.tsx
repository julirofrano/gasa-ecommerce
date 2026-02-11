import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "muted";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-foreground text-background",
  accent: "bg-[#0094BB] text-white",
  muted: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  children,
  variant = "default",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-1 text-xs font-bold uppercase tracking-wide",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
