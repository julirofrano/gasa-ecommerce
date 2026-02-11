import { formatDateTime } from "@/lib/utils/formatting";

export interface TimelineEntry {
  date: string;
  title: string;
  description?: string;
}

interface TimelineProps {
  entries: TimelineEntry[];
}

export function Timeline({ entries }: TimelineProps) {
  return (
    <div className="relative ml-3 border-l-2 border-foreground pl-6">
      {entries.map((entry, i) => (
        <div key={i} className="relative pb-6 last:pb-0">
          {/* Dot */}
          <div className="dot-indicator absolute -left-[31px] top-0.5 h-4 w-4 border-2 border-foreground bg-background" />

          <p className="text-sm font-bold">{entry.title}</p>
          {entry.description && (
            <p className="text-sm text-muted-foreground">{entry.description}</p>
          )}
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {formatDateTime(entry.date)}
          </p>
        </div>
      ))}
    </div>
  );
}
