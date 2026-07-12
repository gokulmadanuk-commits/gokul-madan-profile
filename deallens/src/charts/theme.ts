/**
 * Shared chart theme constants. Colors reference the CSS custom properties
 * declared in src/index.css — never raw hex — so the charts stay in lockstep
 * with the design tokens.
 */

export const SERIES = {
  s1: "var(--series-1)", // blue — senior debt, revenue, equity, histogram
  s2: "var(--series-2)", // aqua — EBITDA, positive waterfall effects, cash
  s3: "var(--series-3)", // yellow — FCF
  s5: "var(--series-5)", // violet — mezz
  s6: "var(--series-6)", // red — negative waterfall effects, below hurdle
} as const;

export const INK = {
  primary: "var(--text-primary)",
  secondary: "var(--text-secondary)",
  muted: "var(--text-muted)",
} as const;

export const GRIDLINE = "var(--gridline)";
export const BASELINE = "var(--baseline)";
export const SURFACE_1 = "var(--surface-1)";
export const SURFACE_2 = "var(--surface-2)";

/** Tick styling shared by every axis: muted ink, 11px. */
export const AXIS_TICK = { fill: INK.muted, fontSize: 11 } as const;

/** Subtle wash used as the bar-chart hover cursor. */
export const CURSOR_FILL = { fill: "rgba(255,255,255,0.05)" } as const;

/** Crosshair cursor for line/area charts. */
export const CURSOR_LINE = { stroke: GRIDLINE, strokeWidth: 1 } as const;

/** Year tick label: 0 -> "Entry", n -> "Y{n}". */
export function fmtYear(y: number): string {
  return y === 0 ? "Entry" : `Y${y}`;
}

/** Long-form year label for tooltips. */
export function fmtYearLong(y: number): string {
  return y === 0 ? "Entry (Year 0)" : `Year ${y}`;
}
