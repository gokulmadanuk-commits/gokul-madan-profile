/**
 * Custom Recharts bar shapes: 4px-rounded corners on the DATA END of a bar
 * (top for positive values, bottom for negative), square at the baseline.
 * Recharts' built-in `radius` prop cannot vary per cell or per sign, so
 * charts pass these factories to `shape`.
 */
import type { ReactElement } from "react";

/** SVG path for a rect with independently rounded top/bottom corners. */
export function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  rTop: number,
  rBottom: number
): string {
  const rt = Math.max(0, Math.min(rTop, w / 2, h));
  const rb = Math.max(0, Math.min(rBottom, w / 2, h - rt));
  return [
    `M${x},${y + rt}`,
    rt > 0 ? `a${rt},${rt} 0 0 1 ${rt},${-rt}` : "",
    `h${w - rt - rt}`,
    rt > 0 ? `a${rt},${rt} 0 0 1 ${rt},${rt}` : "",
    `v${h - rt - rb}`,
    rb > 0 ? `a${rb},${rb} 0 0 1 ${-rb},${rb}` : "",
    `h${-(w - rb - rb)}`,
    rb > 0 ? `a${rb},${rb} 0 0 1 ${-rb},${-rb}` : "",
    "Z",
  ].join("");
}

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  value?: number | [number, number];
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

function normalize(props: BarShapeProps) {
  let { x = 0, y = 0, width = 0, height = 0 } = props;
  if (height < 0) {
    y += height;
    height = -height;
  }
  return { x, y, width, height, fill: props.fill };
}

/** Sign of the bar's value (stacked bars pass [start, end]). */
function barSign(value: BarShapeProps["value"]): number {
  if (Array.isArray(value)) return value[1] - value[0] >= 0 ? 1 : -1;
  return (value ?? 0) >= 0 ? 1 : -1;
}

/**
 * Bar rounded at its data end (top when positive, bottom when negative).
 * Optional `dir` forces the direction (used by the waterfall floats, whose
 * stacked values are always positive).
 */
export function dataEndBar(
  props: BarShapeProps,
  radius = 4,
  dir?: "up" | "down"
): ReactElement {
  const { x, y, width, height, fill } = normalize(props);
  if (width <= 0 || height <= 0) return <g />;
  const up = dir !== undefined ? dir === "up" : barSign(props.value) >= 0;
  const d = up
    ? roundedRectPath(x, y, width, height, radius, 0)
    : roundedRectPath(x, y, width, height, 0, radius);
  return <path d={d} fill={fill} />;
}

/**
 * Stacked-segment shape. `isTop(payload)` decides whether this segment is the
 * visible top of its stack (gets rounded corners); `gapBelow` insets the
 * segment's bottom edge by 2px so adjacent fills read as separate marks.
 */
export function stackSegmentBar(
  props: BarShapeProps,
  opts: {
    isTop: (payload: Record<string, unknown>) => boolean;
    gapBelow?: boolean;
    radius?: number;
  }
): ReactElement {
  const { x, y, width, fill } = normalize(props);
  let { height } = normalize(props);
  if (width <= 0 || height <= 0) return <g />;
  const gap = opts.gapBelow === true && height > 4 ? 2 : 0;
  height -= gap;
  const top = opts.isTop(props.payload ?? {});
  const d = roundedRectPath(x, y, width, height, top ? (opts.radius ?? 4) : 0, 0);
  return <path d={d} fill={fill} />;
}
