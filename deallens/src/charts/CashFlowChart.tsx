/**
 * Operating build: grouped bars per year — revenue (series-1), EBITDA
 * (series-2), FCF (series-3). Year 0 shows entry revenue/EBITDA (FCF n/a).
 * One $M axis, legend, shared dark tooltip.
 */
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CashFlowChartProps } from "@/charts/contracts";
import ChartLegend from "@/charts/ChartLegend";
import ChartTooltip from "@/charts/ChartTooltip";
import { dataEndBar } from "@/charts/shapes";
import {
  AXIS_TICK,
  BASELINE,
  CURSOR_FILL,
  fmtYear,
  fmtYearLong,
  GRIDLINE,
  SERIES,
} from "@/charts/theme";
import { fmtM } from "@/lib/format";

interface Row {
  year: number;
  revenue: number;
  ebitda: number;
  fcf: number | null; // null at entry — not applicable
}

const roundedShape = (p: unknown) =>
  dataEndBar(p as Parameters<typeof dataEndBar>[0], 3);

export default function CashFlowChart({
  years,
  entryRevenue,
  entryEbitda,
}: CashFlowChartProps) {
  const data = useMemo<Row[]>(
    () => [
      { year: 0, revenue: entryRevenue, ebitda: entryEbitda, fcf: null },
      ...years.map((y) => ({
        year: y.year,
        revenue: y.revenue,
        ebitda: y.ebitda,
        fcf: y.fcf,
      })),
    ],
    [years, entryRevenue, entryEbitda]
  );

  const renderTooltip = (tp: { active?: boolean; label?: number }) => {
    if (tp.active !== true) return null;
    const row = data.find((d) => d.year === tp.label);
    if (row === undefined) return null;
    return (
      <ChartTooltip
        title={fmtYearLong(row.year)}
        rows={[
          { label: "Revenue", value: fmtM(row.revenue), swatch: SERIES.s1 },
          { label: "EBITDA", value: fmtM(row.ebitda), swatch: SERIES.s2 },
          {
            label: "FCF",
            value: row.fcf === null ? "n/a" : fmtM(row.fcf),
            swatch: SERIES.s3,
            muted: row.fcf === null,
          },
        ]}
      />
    );
  };

  return (
    <div className="w-full" style={{ minHeight: 280 }}>
      <ChartLegend
        items={[
          { label: "Revenue", color: SERIES.s1 },
          { label: "EBITDA", color: SERIES.s2 },
          { label: "FCF", color: SERIES.s3 },
        ]}
      />
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 4 }}
          barCategoryGap="22%"
          barGap={2}
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
            dataKey="revenue"
            fill={SERIES.s1}
            maxBarSize={22}
            isAnimationActive={false}
            shape={roundedShape}
          />
          <Bar
            dataKey="ebitda"
            fill={SERIES.s2}
            maxBarSize={22}
            isAnimationActive={false}
            shape={roundedShape}
          />
          <Bar
            dataKey="fcf"
            fill={SERIES.s3}
            maxBarSize={22}
            isAnimationActive={false}
            shape={roundedShape}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
