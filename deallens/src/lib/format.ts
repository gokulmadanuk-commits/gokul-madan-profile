/**
 * Number formatting helpers shared across DealLens.
 *
 * Conventions (DESIGN.md): money in $ millions, rates as decimals, multiples
 * as turns of EBITDA. Examples: fmtM(243.4) -> "$243M", fmtM(8.42) -> "$8.4M",
 * fmtM(-12.1) -> "-$12M", fmtPct(0.234) -> "23.4%", fmtX(2.61) -> "2.6x".
 */

/** Format a $M value: "$243M"; one decimal under 10: "$8.4M"; negatives "-$12M". */
export function fmtM(v: number): string {
  const a = Math.abs(v);
  let body: string;
  if (a < 9.95) {
    body = a.toFixed(1);
    if (body === "0.0") body = "0";
  } else {
    body = Math.round(a).toLocaleString("en-US");
  }
  const negative = v < 0 && body !== "0";
  return `${negative ? "-" : ""}$${body}M`;
}

/** Format a decimal rate as a percentage: 0.234 -> "23.4%". */
export function fmtPct(v: number): string {
  let body = (v * 100).toFixed(1);
  if (body === "-0.0") body = "0.0";
  return `${body}%`;
}

/** Format a multiple: 2.61 -> "2.6x". */
export function fmtX(v: number): string {
  let body = v.toFixed(1);
  if (body === "-0.0") body = "0.0";
  return `${body}x`;
}
