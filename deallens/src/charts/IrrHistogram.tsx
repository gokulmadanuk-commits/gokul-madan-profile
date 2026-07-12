/**
 * Monte Carlo IRR distribution: ~30 bins computed client-side. Bars below
 * the hurdle in series-6, above in series-1; dashed vertical reference line
 * at the hurdle (labeled) and a subtle median marker.
 */
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { IrrHistogramProps } from "@/charts/contracts";
import ChartLegend from "@/charts/ChartLegend";
import ChartTooltip from "@/charts/ChartTooltip";
import {
  AXIS_TICK,
  BASELINE,
  CURSOR_FILL,
  GRIDLINE,
  INK,
  SERIES,
} from "@/charts/theme";
import { fmtPct } from "@/lib/format";

const BIN_COUNT = 30;

interface Bin {
  x: number; // bin midpoint (decimal IRR)
  from: number;
  to: number;
  count: number;
}

function buildBins(irrs: number[]): Bin[] {
  if (irrs.length === 0) return [];
  const min = irrs[0]!;
  const max = irrs[irrs.length - 1]!; // sorted ascending per contract
  if (max - min < 1e-12) {
    return [{ x: min, from: min, to: max, count: irrs.length }];
  }
  const width = (max - min) / BIN_COUNT;
  const bins: Bin[] = Array.from({ length: BIN_COUNT }, (_, k) => ({
    x: min + (k + 0.5) * width,
    from: min + k * width,
    to: min + (k + 1) * width,
    count: 0,
  }));
  for (const irr of irrs) {
    const k = Math.min(BIN_COUNT - 1, Math.floor((irr - min) / width));
    bins[k]!.count += 1;
  }
  return bins;
}

/**
 * Bin midpoint closest to a value — ReferenceLine must snap to a band.
 * Returns undefined when the value lies outside the binned range: drawing it
 * at an edge bin would mislabel the line's true position.
 */
function nearestBinX(bins: Bin[], v: number): number | undefined {
  if (bins.length === 0) return undefined;
  if (v < bins[0]!.from || v > bins[bins.length - 1]!.to) return undefined;
  let best: number | undefined;
  let bestDist = Infinity;
  for (const b of bins) {
    const d = Math.abs(b.x - v);
    if (d < bestDist) {
      bestDist = d;
      best = b.x;
    }
  }
  return best;
}

export default function IrrHistogram({ result, hurdle }: IrrHistogramProps) {
  const bins = useMemo(() => buildBins(result.irrs), [result.irrs]);
  const total = result.irrs.length;

  const hurdleX = useMemo(() => nearestBinX(bins, hurdle), [bins, hurdle]);
  const medianX = useMemo(
    () => nearestBinX(bins, result.medianIrr),
    [bins, result.medianIrr]
  );

  const renderTooltip = (tp: { active?: boolean; label?: number }) => {
    if (tp.active !== true) return null;
    const bin = bins.find((b) => b.x === tp.label);
    if (bin === undefined) return null;
    const below = bin.x < hurdle;
    return (
      <ChartTooltip
        title={`IRR ${fmtPct(bin.from)} – ${fmtPct(bin.to)}`}
        rows={[
          {
            label: "Runs",
            value: bin.count.toLocaleString("en-US"),
            swatch: below ? SERIES.s6 : SERIES.s1,
          },
          {
            label: "Share",
            value: total > 0 ? fmtPct(bin.count / total) : "—",
            muted: true,
          },
        ]}
      />
    );
  };

  if (bins.length === 0) {
    return (
      <div
        className="flex w-full items-center justify-center"
        style={{ minHeight: 280, color: "var(--text-muted)", fontSize: 12 }}
      >
        No simulation runs yet
      </div>
    );
  }

  return (
    <div className="w-full" style={{ minHeight: 280 }}>
      <ChartLegend
        items={[
          { label: "Above hurdle", color: SERIES.s1 },
          { label: "Below hurdle", color: SERIES.s6 },
        ]}
      />
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={bins}
          margin={{ top: 18, right: 8, bottom: 0, left: 4 }}
          barCategoryGap={1}
        >
          <CartesianGrid vertical={false} stroke={GRIDLINE} strokeWidth={1} />
          <XAxis
            dataKey="x"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: BASELINE, strokeWidth: 1 }}
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={44}
          />
          <Tooltip
            cursor={CURSOR_FILL}
            content={renderTooltip}
            isAnimationActive={false}
          />
          {medianX !== undefined && (
            <ReferenceLine
              x={medianX}
              stroke={BASELINE}
              strokeDasharray="3 3"
              label={{
                value: "Median",
                position: "insideTopLeft",
                fill: INK.muted,
                fontSize: 10,
              }}
            />
          )}
          {hurdleX !== undefined && (
            <ReferenceLine
              x={hurdleX}
              stroke={INK.muted}
              strokeDasharray="4 4"
              label={{
                value: `Hurdle ${fmtPct(hurdle)}`,
                position: "top",
                fill: INK.muted,
                fontSize: 11,
              }}
            />
          )}
          <Bar dataKey="count" radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {bins.map((bin, k) => (
              <Cell key={k} fill={bin.x < hurdle ? SERIES.s6 : SERIES.s1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
