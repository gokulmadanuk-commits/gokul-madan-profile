/**
 * Sensitivity heatmap: pure CSS grid (no Recharts). Cells colored on a
 * 6-step one-hue blue ramp mapped linearly over the grid's min..max; base
 * case outlined with a 2px white ring; hover scales the cell and shows a
 * real absolutely-positioned tooltip.
 */
import { useMemo, useRef, useState } from "react";
import type { SensitivityHeatmapProps } from "@/charts/contracts";
import type { SensitivityAxis } from "@/engine/types";
import ChartTooltip from "@/charts/ChartTooltip";
import { fmtPct, fmtX } from "@/lib/format";

/** Light -> dark sequential blue ramp; darker = higher value. */
const RAMP = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#104281"];
/** Cell label ink per ramp step: dark text on the 3 light steps, white on the 3 dark. */
const CELL_INK = ["#0b0b0b", "#0b0b0b", "#0b0b0b", "#ffffff", "#ffffff", "#ffffff"];

function fmtAxisValue(axis: SensitivityAxis, v: number): string {
  return axis === "exitEbitdaMargin" || axis === "uniformRevenueGrowth"
    ? fmtPct(v)
    : fmtX(v);
}

function metricLabel(metric: "irr" | "moic"): string {
  return metric === "irr" ? "IRR" : "MOIC";
}

interface Hover {
  i: number;
  j: number;
  left: number; // px, relative to container
  top: number; // px, relative to container
}

export default function SensitivityHeatmap({
  grid,
  formatValue,
  xLabel,
  yLabel,
  baseX,
  baseY,
}: SensitivityHeatmapProps) {
  const { xValues, yValues, xAxis, yAxis, metric } = grid.request;
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<Hover | null>(null);

  const { min, max } = useMemo(() => {
    let lo = Infinity;
    let hi = -Infinity;
    for (const row of grid.rows) {
      for (const v of row) {
        if (Number.isNaN(v)) continue; // unfinanceable cell, excluded from ramp
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    return { min: lo, max: hi };
  }, [grid.rows]);

  const stepOf = (v: number): number => {
    if (!Number.isFinite(min) || max - min < 1e-12) return 2;
    const t = (v - min) / (max - min);
    return Math.min(RAMP.length - 1, Math.max(0, Math.floor(t * RAMP.length)));
  };

  const isBase = (i: number, j: number): boolean => {
    const eps = 1e-6;
    return (
      baseX !== undefined &&
      baseY !== undefined &&
      Math.abs(xValues[j]! - baseX) < eps &&
      Math.abs(yValues[i]! - baseY) < eps
    );
  };

  const onEnter = (i: number, j: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (container === null) return;
    const c = container.getBoundingClientRect();
    const r = e.currentTarget.getBoundingClientRect();
    setHover({ i, j, left: r.left - c.left + r.width / 2, top: r.top - c.top });
  };

  const hoverValue = hover !== null ? grid.rows[hover.i]?.[hover.j] : undefined;

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: 280 }}>
      {/* x-axis title */}
      <div
        className="mb-1.5 text-center"
        style={{ color: "var(--text-muted)", fontSize: 11, paddingLeft: 72 }}
      >
        {xLabel}
      </div>
      <div className="flex items-stretch">
        {/* y-axis title, rotated */}
        <div
          className="flex w-5 shrink-0 items-center justify-center"
          style={{ color: "var(--text-muted)", fontSize: 11 }}
        >
          <span style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            {yLabel}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="grid gap-[2px]"
            style={{
              gridTemplateColumns: `52px repeat(${xValues.length}, minmax(0, 1fr))`,
              gridAutoRows: "minmax(36px, 1fr)",
              minHeight: 240,
            }}
          >
            {/* corner + column headers */}
            <div />
            {xValues.map((x, j) => (
              <div
                key={`x${j}`}
                className="tabular-nums flex items-end justify-center pb-1"
                style={{ color: "var(--text-muted)", fontSize: 11 }}
              >
                {fmtAxisValue(xAxis, x)}
              </div>
            ))}
            {/* rows: header + cells */}
            {yValues.map((y, i) => (
              <div key={`row${i}`} className="contents">
                <div
                  className="tabular-nums flex items-center justify-end pr-2"
                  style={{ color: "var(--text-muted)", fontSize: 11 }}
                >
                  {fmtAxisValue(yAxis, y)}
                </div>
                {xValues.map((_, j) => {
                  const v = grid.rows[i]?.[j] ?? 0;
                  const nm = Number.isNaN(v); // not financeable at this cell
                  const step = stepOf(v);
                  const base = isBase(i, j);
                  const hovered = hover?.i === i && hover?.j === j;
                  return (
                    <div
                      key={`c${i}-${j}`}
                      onMouseEnter={onEnter(i, j)}
                      onMouseLeave={() => setHover(null)}
                      className={`tabular-nums flex cursor-default items-center justify-center rounded-[3px] transition-transform duration-100${
                        base ? " ring-2 ring-white ring-inset" : ""
                      }`}
                      style={{
                        background: nm ? "var(--surface-2)" : RAMP[step],
                        border: nm ? "1px solid var(--gridline)" : undefined,
                        color: nm ? "var(--text-muted)" : CELL_INK[step],
                        fontSize: 11,
                        fontWeight: base ? 600 : 500,
                        transform: hovered ? "scale(1.06)" : undefined,
                        position: "relative",
                        zIndex: hovered ? 2 : undefined,
                      }}
                    >
                      {nm ? "n.m." : formatValue(v)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* absolutely-positioned hover tooltip */}
      {hover !== null && hoverValue !== undefined && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            left: hover.left,
            top: hover.top - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <ChartTooltip
            title={
              isBase(hover.i, hover.j)
                ? `${metricLabel(metric)} — base case`
                : metricLabel(metric)
            }
            rows={[
              {
                label: xLabel,
                value: fmtAxisValue(xAxis, xValues[hover.j] ?? 0),
                muted: true,
              },
              {
                label: yLabel,
                value: fmtAxisValue(yAxis, yValues[hover.i] ?? 0),
                muted: true,
              },
              {
                label: metricLabel(metric),
                value: Number.isNaN(hoverValue)
                  ? "n.m. — not financeable"
                  : formatValue(hoverValue),
              },
            ]}
          />
        </div>
      )}
    </div>
  );
}
