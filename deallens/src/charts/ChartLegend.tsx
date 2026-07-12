/**
 * Shared legend row: small colored square + label in --text-secondary.
 * Rendered as plain HTML above the plot (kept outside Recharts so the same
 * component serves the CSS heatmap too).
 */

export interface LegendItem {
  label: string;
  color: string;
}

export default function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-end gap-x-4 gap-y-1">
      {items.map((item) => (
        <span
          key={item.label}
          className="flex items-center gap-1.5"
          style={{ color: "var(--text-secondary)", fontSize: 11 }}
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-[2px]"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
