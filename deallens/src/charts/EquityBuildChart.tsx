/**
 * Equity value trajectory: implied equity per year
 * (implied[t] = ebitda[t] * exitMultiple - netDebt[t]; year 0 = sponsor
 * equity). Series-1 area with 2px stroke and gradient fill to transparent;
 * crosshair tooltip with implied equity + implied MOIC vs sponsor equity.
 */
import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EquityBuildChartProps } from "@/charts/contracts";
import ChartTooltip from "@/charts/ChartTooltip";
import {
  AXIS_TICK,
  BASELINE,
  CURSOR_LINE,
  fmtYear,
  fmtYearLong,
  GRIDLINE,
  SERIES,
} from "@/charts/theme";
import { fmtM, fmtX } from "@/lib/format";

interface Row {
  year: number;
  equity: number;
}

export default function EquityBuildChart({
  years,
  exitMultiple,
  sponsorEquity,
}: EquityBuildChartProps) {
  const gradientId = useId().replace(/:/g, "");

  const data = useMemo<Row[]>(
    () => [
      { year: 0, equity: sponsorEquity },
      ...years.map((y) => ({
        year: y.year,
        equity: y.ebitda * exitMultiple - y.netDebt,
      })),
    ],
    [years, exitMultiple, sponsorEquity]
  );

  const renderTooltip = (tp: { active?: boolean; label?: number }) => {
    if (tp.active !== true) return null;
    const row = data.find((d) => d.year === tp.label);
    if (row === undefined) return null;
    return (
      <ChartTooltip
        title={fmtYearLong(row.year)}
        rows={[
          {
            label: "Implied equity",
            value: fmtM(row.equity),
            swatch: SERIES.s1,
          },
          {
            label: "Implied MOIC",
            value:
              sponsorEquity > 0 ? fmtX(row.equity / sponsorEquity) : "—",
            muted: true,
          },
        ]}
      />
    );
  };

  return (
    <div className="w-full" style={{ minHeight: 280 }}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRIDLINE} strokeWidth={1} />
          <XAxis
            dataKey="year"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: BASELINE, strokeWidth: 1 }}
            tickFormatter={fmtYear}
            interval={0}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmtM}
            width={56}
            domain={[
              (dataMin: number) => Math.min(0, dataMin),
              (dataMax: number) => dataMax * 1.05,
            ]}
          />
          <Tooltip
            cursor={CURSOR_LINE}
            content={renderTooltip}
            isAnimationActive={false}
          />
          <Area
            dataKey="equity"
            stroke={SERIES.s1}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4.5,
              fill: SERIES.s1,
              stroke: "var(--surface-1)",
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
