/**
 * Shared dark tooltip used by every DealLens chart (Recharts and CSS charts
 * alike): raised surface-2 body, hairline border, 12px text, tabular-nums
 * values, optional color swatch per row.
 */

export interface TooltipRow {
  label: string;
  value: string;
  /** Optional series swatch color (CSS color, e.g. "var(--series-1)"). */
  swatch?: string;
  /** Optional emphasis for the row value (defaults to primary ink). */
  muted?: boolean;
}

export interface ChartTooltipProps {
  title?: string;
  rows: TooltipRow[];
}

export default function ChartTooltip({ title, rows }: ChartTooltipProps) {
  return (
    <div
      className="rounded-lg px-3 py-2 shadow-lg"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border-strong)",
        fontSize: 12,
        lineHeight: 1.5,
        pointerEvents: "none",
        minWidth: 120,
      }}
    >
      {title !== undefined && (
        <div
          className="mb-1 font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {title}
        </div>
      )}
      {rows.map((row, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="flex items-center gap-1.5">
            {row.swatch !== undefined && (
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-[2px]"
                style={{ background: row.swatch }}
              />
            )}
            {row.label}
          </span>
          <span
            className="tabular-nums font-medium"
            style={{
              color: row.muted ? "var(--text-muted)" : "var(--text-primary)",
            }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
