import type { Cents } from "./types";

/** $1,234,567 — whole dollars, for schedules and stats */
export function usd(cents: Cents): string {
  const dollars = Math.round(cents / 100);
  const abs = Math.abs(dollars).toLocaleString("en-US");
  return dollars < 0 ? `(${"$"}${abs})` : `$${abs}`;
}

/** $1,234,567.89 — exact, for ledger rows */
export function usdExact(cents: Cents): string {
  const abs = Math.abs(cents) / 100;
  const s = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return cents < 0 ? `($${s})` : `$${s}`;
}

/** Compact: $412k / $1.45M */
export function usdCompact(cents: Cents): string {
  const d = cents / 100;
  const abs = Math.abs(d);
  let out: string;
  if (abs >= 1_000_000) out = `$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 2).replace(/\.00$/, "")}M`;
  else if (abs >= 1_000) out = `$${Math.round(abs / 1_000)}k`;
  else out = `$${Math.round(abs)}`;
  return d < 0 ? `(${out})` : out;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Jun 15, 2022" */
export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** "06/15/22" — statement style */
export function fmtDateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

/** "June 2022" */
export function fmtMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  const FULL = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  return `${FULL[m - 1]} ${y}`;
}

export function pct(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}
