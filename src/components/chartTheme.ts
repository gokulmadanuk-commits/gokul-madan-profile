/**
 * Shared Recharts theme for LUCA — "nothing moves that ink cannot do."
 * Every page's charts import from here so exhibits read as one report:
 * 1.25–1.5px strokes, bottle-green primary, no gridline lattice, no legends
 * (direct-label line termini), paper-card tooltips, square-cornered bars.
 */
import type { CSSProperties } from "react";

// --- Palette (mirrors tailwind.config.ts tokens) ------------------------------

export const chartColors = {
  primary: "#1E3A2F", // bottle green — primary series
  secondary: "#2E5943", // lighter green — secondary series
  brass: "#9C7C46", // tertiary series, reference curves
  brassLight: "#C4A96B", // fine gilt hairlines / leader lines
  oxblood: "#6E2B31", // flagged periods and adverse findings ONLY
  oxbloodWash: "#F3E4DE",
  credit: "#2F5D45",
  debit: "#8C3A3D",
  ink: "#1C1B16",
  inkSecondary: "#57534A",
  inkFaint: "#8A8375",
  paper: "#F7F3EA",
  paperRaised: "#FBF8F1",
  greenWash: "#DCE5DD",
  hairline: "rgba(28,27,22,0.15)",
  hairlineStrong: "rgba(28,27,22,0.35)",
} as const;

export const fontMono = '"IBM Plex Mono", ui-monospace, monospace';
export const fontBody = '"Newsreader", Georgia, serif';

// --- Strokes ------------------------------------------------------------------

export const strokes = {
  line: 1.5, // primary line series
  lineSecondary: 1.25, // secondary/tertiary series
  bar: 1, // 1px ink outline on bars
  reference: 1, // dotted reference lines
} as const;

/** Area fills at most a ~5% green tint. */
export const areaFillOpacity = 0.05;
/** Bar fill: paper or a faint green tint, always with a 1px ink outline. */
export const barFillOpacity = 0.08;

// --- Axes: baseline only, hairline; no gridline lattice ------------------------

export const axisTick = {
  fill: chartColors.inkSecondary,
  fontSize: 11,
  fontFamily: fontMono,
} as const;

/** Spread onto <XAxis {...xAxisProps} dataKey="..." /> */
export const xAxisProps = {
  axisLine: { stroke: chartColors.hairlineStrong, strokeWidth: 1 },
  tickLine: false as const,
  tick: axisTick,
  tickMargin: 8,
};

/** Spread onto <YAxis {...yAxisProps} /> — no axis line, figures only. */
export const yAxisProps = {
  axisLine: false as const,
  tickLine: false as const,
  tick: axisTick,
  tickMargin: 6,
};

/** Do NOT use CartesianGrid; if you must anchor a value, use a ReferenceLine: */
export const referenceLineProps = {
  stroke: chartColors.inkFaint,
  strokeDasharray: "2 4",
  strokeWidth: strokes.reference,
};

/** In-chart reference-line label, examiner's-marginalia register. */
export const referenceLabelStyle = {
  fill: chartColors.inkSecondary,
  fontSize: 11,
  fontFamily: fontBody,
  fontStyle: "italic",
} as const;

// --- Tooltip: a small paper card with a hairline border ------------------------

export const tooltipContentStyle: CSSProperties = {
  backgroundColor: chartColors.paperRaised,
  border: `1px solid ${chartColors.hairlineStrong}`,
  borderRadius: 0,
  boxShadow: "0 1px 0 rgba(28,27,22,.06), 0 8px 24px rgba(28,27,22,.05)",
  padding: "8px 10px",
  fontFamily: fontMono,
  fontSize: 12,
  color: chartColors.ink,
};

export const tooltipLabelStyle: CSSProperties = {
  fontFamily: fontBody,
  fontStyle: "italic",
  fontSize: 12,
  color: chartColors.inkSecondary,
  marginBottom: 4,
};

export const tooltipItemStyle: CSSProperties = {
  fontFamily: fontMono,
  fontSize: 12,
  color: chartColors.ink,
  padding: 0,
};

/** Spread onto <Tooltip {...tooltipProps} formatter={...} /> */
export const tooltipProps = {
  contentStyle: tooltipContentStyle,
  labelStyle: tooltipLabelStyle,
  itemStyle: tooltipItemStyle,
  cursor: { stroke: chartColors.hairlineStrong, strokeWidth: 1 },
  isAnimationActive: false as const,
};

// --- Series presets -------------------------------------------------------------

/** Primary line: <Line {...linePrimaryProps} dataKey="..." /> */
export const linePrimaryProps = {
  stroke: chartColors.primary,
  strokeWidth: strokes.line,
  dot: false as const,
  activeDot: { r: 3, fill: chartColors.ink, stroke: "none" },
  isAnimationActive: false as const,
};

/** Secondary line (lighter green). */
export const lineSecondaryProps = {
  ...linePrimaryProps,
  stroke: chartColors.secondary,
  strokeWidth: strokes.lineSecondary,
};

/** Tertiary line (brass). */
export const lineBrassProps = {
  ...linePrimaryProps,
  stroke: chartColors.brass,
  strokeWidth: strokes.lineSecondary,
};

/** Square-cornered bars: 1px ink outline, faint green fill. */
export const barProps = {
  fill: chartColors.primary,
  fillOpacity: barFillOpacity,
  stroke: chartColors.ink,
  strokeWidth: strokes.bar,
  radius: 0 as const,
  isAnimationActive: false as const,
};

/** Adverse/flagged bars — oxblood, for suspect periods only. */
export const barAdverseProps = {
  ...barProps,
  fill: chartColors.oxblood,
  fillOpacity: 0.14,
  stroke: chartColors.oxblood,
};

/** Area fill ≤5% green tint over a primary stroke. */
export const areaPrimaryProps = {
  stroke: chartColors.primary,
  strokeWidth: strokes.line,
  fill: chartColors.primary,
  fillOpacity: areaFillOpacity,
  dot: false as const,
  isAnimationActive: false as const,
};

/**
 * Direct-label style for line termini (use a <text> in a Customized layer or
 * the label prop of the last point) — 12px Newsreader italic, no legends.
 */
export const seriesLabelStyle = {
  fontFamily: fontBody,
  fontStyle: "italic",
  fontSize: 12,
  fill: chartColors.inkSecondary,
} as const;
