import type { ReactNode } from "react";
import clsx from "clsx";

export interface StatTileProps {
  /** Small-caps label above the figure */
  label: string;
  /** The figure — a string, or a <TickFigure /> for animated totals */
  value: ReactNode;
  /** Optional marginalia note beneath the figure */
  note?: string;
  /** 'adverse' = oxblood (findings against), 'credit' = restrained green */
  tone?: "default" | "adverse" | "credit";
}

/** A KPI set like a report figure: label-caps, large mono figure, marginal note. */
export default function StatTile({ label, value, note, tone = "default" }: StatTileProps) {
  return (
    <div className="min-w-0">
      <p className="label-caps text-ink-secondary">{label}</p>
      <p
        className={clsx(
          "mt-1.5 font-mono text-[2.25rem] leading-[1.1] tabular-nums",
          tone === "adverse" && "text-oxblood",
          tone === "credit" && "text-credit",
          tone === "default" && "text-ink",
        )}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      {note && <p className="marginalia mt-1.5">{note}</p>}
    </div>
  );
}
