/**
 * Debt schedule: stacked senior (series-1) + mezz (series-5) closing balances
 * per year (year 0 = entry), with a net-debt line in --text-secondary.
 * One $M axis, legend, shared dark tooltip.
 */
import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DebtScheduleChartProps } from "@/charts/contracts";
import ChartLegend from "@/charts/ChartLegend";
import ChartTooltip from "@/charts/ChartTooltip";
import { stackSegmentBar } from "@/charts/shapes";
import {
  AXIS_TICK,
  BASELINE,
  CURSOR_FILL,
  fmtYear,
  fmtYearLong,
  GRIDLINE,
  INK,
  SERIES,
} from "@/charts/theme";
import { fmtM } from "@/lib/format";

interface Row {
  year: number;
  senior: number;
  mezz: number;
  netDebt: number;
  cash: number;
}

export default function DebtScheduleChart({
  entry,
  years,
}: DebtScheduleChartProps) {
  const data = useMemo<Row[]>(
    () => [
      {
        year: 0,
        senior: entry.seniorDebt,
        mezz: entry.mezzDebt,
        netDebt: entry.totalDebt, // cash starts at 0
        cash: 0,
      },
      ...years.map((y) => ({
        year: y.year,
        senior: y.seniorBalance,
        mezz: y.mezzBalance,
        netDebt: y.netDebt,
        cash: y.cash,
      })),
    ],
    [entry, years]
  );

  const renderTooltip = (tp: { active?: boolean; label?: number }) => {
    if (tp.active !== true) return null;
    const row = data.find((d) => d.year === tp.label);
    if (row === undefined) return null;
    return (
      <ChartTooltip
        title={fmtYearLong(row.year)}
        rows={[
          { label: "Senior debt", value: fmtM(row.senior), swatch: SERIES.s1 },
          { label: "Mezzanine", value: fmtM(row.mezz), swatch: SERIES.s5 },
          { label: "Cash", value: fmtM(row.cash), muted: true },
          { label: "Net debt", value: fmtM(row.netDebt), swatch: INK.secondary },
        ]}
      />
    );
  };

  return (
    <div className="w-full" style={{ minHeight: 280 }}>
      <ChartLegend
        items={[
          { label: "Senior debt", color: SERIES.s1 },
          { label: "Mezzanine", color: SERIES.s5 },
          { label: "Net debt", color: INK.secondary },
        ]}
      />
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 4 }}
          barCategoryGap="24%"
        >
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
          />
          <Tooltip
            cursor={CURSOR_FILL}
            content={renderTooltip}
            isAnimationActive={false}
          />
          <Bar
            dataKey="senior"
            stackId="debt"
            fill={SERIES.s1}
            maxBarSize={56}
            isAnimationActive={false}
            shape={(p: unknown) =>
              stackSegmentBar(p as Parameters<typeof stackSegmentBar>[0], {
                // Senior is the visible stack top when mezz is fully repaid.
                isTop: (payload) => ((payload.mezz as number) ?? 0) < 0.05,
              })
            }
          />
          <Bar
            dataKey="mezz"
            stackId="debt"
            fill={SERIES.s5}
            maxBarSize={56}
            isAnimationActive={false}
            shape={(p: unknown) =>
              stackSegmentBar(p as Parameters<typeof stackSegmentBar>[0], {
                isTop: () => true,
                gapBelow: true, // 2px gap against the senior segment below
              })
            }
          />
          <Line
            dataKey="netDebt"
            stroke={INK.secondary}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: INK.secondary }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
