/**
 * Value-creation waterfall: sponsor equity -> effects -> exit equity.
 * Floating bars via an invisible base Bar + visible float Bar. Anchors in
 * series-1, positive effects series-2, negative series-6; connector
 * hairlines in --gridline; direct value labels in --text-secondary.
 */
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Customized,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WaterfallChartProps } from "@/charts/contracts";
import ChartLegend from "@/charts/ChartLegend";
import ChartTooltip from "@/charts/ChartTooltip";
import { dataEndBar } from "@/charts/shapes";
import {
  AXIS_TICK,
  BASELINE,
  CURSOR_FILL,
  GRIDLINE,
  INK,
  SERIES,
} from "@/charts/theme";
import { fmtM } from "@/lib/format";

interface WfItem {
  name: string;
  kind: "anchor" | "effect";
  value: number;
  base: number; // invisible stack segment
  float: number; // visible bar height (always >= 0)
  cum: number; // running total after this bar (connector level)
  color: string; // NOT named "fill": Recharts merges payload.fill into every bar segment, which would paint the invisible base bars
  dir: "up" | "down";
}

function buildItems({
  bridge,
  sponsorEquity,
  exitEquity,
}: WaterfallChartProps): WfItem[] {
  const effects: Array<[string, number]> = [
    ["Revenue growth", bridge.revenueEffect],
    ["Margin expansion", bridge.marginEffect],
    ["Multiple expansion", bridge.multipleEffect],
    ["Deleveraging", bridge.deleveragingEffect],
    ["Transaction fees", bridge.feesEffect],
  ];
  const items: WfItem[] = [
    {
      name: "Sponsor equity",
      kind: "anchor",
      value: sponsorEquity,
      base: Math.min(0, sponsorEquity),
      float: Math.abs(sponsorEquity),
      cum: sponsorEquity,
      color: SERIES.s1,
      dir: "up",
    },
  ];
  let cum = sponsorEquity;
  for (const [name, value] of effects) {
    const next = cum + value;
    items.push({
      name,
      kind: "effect",
      value,
      base: Math.min(cum, next),
      float: Math.abs(value),
      cum: next,
      color: value >= 0 ? SERIES.s2 : SERIES.s6,
      dir: value >= 0 ? "up" : "down",
    });
    cum = next;
  }
  items.push({
    name: "Exit equity",
    kind: "anchor",
    value: exitEquity,
    base: Math.min(0, exitEquity),
    float: Math.abs(exitEquity),
    cum: exitEquity,
    color: SERIES.s1,
    dir: "up",
  });
  return items;
}

/** Category tick wrapped to two lines. */
function TwoLineTick(props: {
  x?: number;
  y?: number;
  payload?: { value?: string | number };
}) {
  const { x = 0, y = 0, payload } = props;
  const words = String(payload?.value ?? "").split(" ");
  const line1 = words[0] ?? "";
  const line2 = words.slice(1).join(" ");
  return (
    <text x={x} y={y + 4} textAnchor="middle" fill={INK.muted} fontSize={11}>
      <tspan x={x} dy="0.6em">
        {line1}
      </tspan>
      {line2 !== "" && (
        <tspan x={x} dy="1.15em">
          {line2}
        </tspan>
      )}
    </text>
  );
}

/** Direct value label above (up) / below (down) each bar. */
function ValueLabel(
  props: {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    height?: number | string;
    index?: number;
  },
  items: WfItem[]
) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const item = items[props.index ?? 0];
  if (item === undefined) return <g />;
  const down = item.dir === "down";
  const text =
    item.kind === "effect" && item.value >= 0
      ? `+${fmtM(item.value)}`
      : fmtM(item.value);
  return (
    <text
      x={x + width / 2}
      y={down ? y + height + 14 : y - 6}
      textAnchor="middle"
      fill={INK.secondary}
      fontSize={11}
      className="tabular-nums"
    >
      {text}
    </text>
  );
}

export default function WaterfallChart(props: WaterfallChartProps) {
  const items = useMemo(() => buildItems(props), [props]);

  /** Connector hairlines between consecutive bars at the running-total level. */
  const renderConnectors = (chartProps: Record<string, unknown>) => {
    const xAxisMap = chartProps.xAxisMap as
      | Record<string, { scale: ((v: string) => number) & { bandwidth?: () => number } }>
      | undefined;
    const yAxisMap = chartProps.yAxisMap as
      | Record<string, { scale: (v: number) => number }>
      | undefined;
    const xAxis = xAxisMap?.[Object.keys(xAxisMap ?? {})[0] ?? ""];
    const yAxis = yAxisMap?.[Object.keys(yAxisMap ?? {})[0] ?? ""];
    if (!xAxis || !yAxis) return <g />;
    const band = xAxis.scale.bandwidth?.() ?? 0;
    return (
      <g>
        {items.slice(0, -1).map((item, i) => {
          const next = items[i + 1];
          if (next === undefined) return null;
          const y = yAxis.scale(item.cum);
          const x1 = xAxis.scale(item.name) + band / 2;
          const x2 = xAxis.scale(next.name) + band / 2;
          if (!Number.isFinite(y) || !Number.isFinite(x1) || !Number.isFinite(x2))
            return null;
          return (
            <line
              key={item.name}
              x1={x1}
              x2={x2}
              y1={y}
              y2={y}
              stroke={GRIDLINE}
              strokeWidth={1}
            />
          );
        })}
      </g>
    );
  };

  const renderTooltip = (tp: {
    active?: boolean;
    label?: string | number;
  }) => {
    if (tp.active !== true) return null;
    const item = items.find((it) => it.name === tp.label);
    if (item === undefined) return null;
    const rows =
      item.kind === "anchor"
        ? [{ label: "Equity value", value: fmtM(item.value), swatch: item.color }]
        : [
            {
              label: "Impact",
              value: `${item.value >= 0 ? "+" : ""}${fmtM(item.value)}`,
              swatch: item.color,
            },
            { label: "Running equity", value: fmtM(item.cum), muted: true },
          ];
    return <ChartTooltip title={item.name} rows={rows} />;
  };

  return (
    <div className="w-full" style={{ minHeight: 280 }}>
      <ChartLegend
        items={[
          { label: "Equity value", color: SERIES.s1 },
          { label: "Increase", color: SERIES.s2 },
          { label: "Decrease", color: SERIES.s6 },
        ]}
      />
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={items}
          margin={{ top: 22, right: 8, bottom: 4, left: 4 }}
          barCategoryGap="18%"
        >
          <CartesianGrid vertical={false} stroke={GRIDLINE} strokeWidth={1} />
          <XAxis
            dataKey="name"
            tick={<TwoLineTick />}
            tickLine={false}
            axisLine={{ stroke: BASELINE, strokeWidth: 1 }}
            interval={0}
            height={36}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={fmtM}
            width={56}
            domain={[
              (dataMin: number) => Math.min(0, dataMin),
              (dataMax: number) => dataMax * 1.06,
            ]}
          />
          <Tooltip
            cursor={CURSOR_FILL}
            content={renderTooltip}
            isAnimationActive={false}
          />
          <Customized component={renderConnectors} />
          {/* Invisible base establishing each float's starting level. */}
          <Bar dataKey="base" stackId="wf" fill="transparent" maxBarSize={72} isAnimationActive={false} />
          <Bar
            dataKey="float"
            stackId="wf"
            maxBarSize={72}
            isAnimationActive={false}
            shape={(p: unknown) =>
              dataEndBar(
                p as Parameters<typeof dataEndBar>[0],
                4,
                (
                  (p as { payload?: { dir?: "up" | "down" } }).payload?.dir
                ) ?? "up"
              )
            }
            label={(p: Parameters<typeof ValueLabel>[0]) => ValueLabel(p, items)}
          >
            {items.map((item) => (
              <Cell key={item.name} fill={item.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
