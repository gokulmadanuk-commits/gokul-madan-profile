/**
 * Seeded Monte Carlo simulation over the LBO engine.
 *
 * Deterministic: a given (base, config) pair always produces identical output.
 * PRNG is mulberry32 seeded from config.seed; triangular variates are drawn
 * via the inverse-CDF method.
 */
import { runLbo } from "@/engine/lbo";
import type {
  DealAssumptions,
  MonteCarloConfig,
  MonteCarloResult,
  Triangular,
} from "@/engine/types";

/** mulberry32 — small, fast, seedable 32-bit PRNG returning uniforms in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Inverse-CDF sample from a triangular distribution given uniform u in [0, 1). */
export function sampleTriangular(dist: Triangular, u: number): number {
  const { min, mode, max } = dist;
  const range = max - min;
  if (range <= 0) return min;
  const fc = (mode - min) / range;
  if (u < fc) {
    return min + Math.sqrt(u * range * (mode - min));
  }
  return max - Math.sqrt((1 - u) * range * (max - mode));
}

/** Percentile of a sorted-ascending array with linear interpolation. */
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const idx = p * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.min(lo + 1, sorted.length - 1);
  const frac = idx - lo;
  return sorted[lo] + frac * (sorted[hi] - sorted[lo]);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let total = 0;
  for (const v of values) total += v;
  return total / values.length;
}

/** Run a seeded Monte Carlo simulation of the deal. */
export function runMonteCarlo(
  base: DealAssumptions,
  config: MonteCarloConfig,
): MonteCarloResult {
  const rand = mulberry32(config.seed);
  const irrs: number[] = [];
  const moics: number[] = [];

  for (let i = 0; i < config.iterations; i++) {
    const growth = sampleTriangular(config.revenueGrowth, rand());
    const exitMultiple = sampleTriangular(config.exitMultiple, rand());
    const exitEbitdaMargin = sampleTriangular(config.exitEbitdaMargin, rand());

    const assumptions: DealAssumptions = {
      ...base,
      revenueGrowth: base.revenueGrowth.map(() => growth),
      exitMultiple,
      exitEbitdaMargin,
    };
    const result = runLbo(assumptions);
    irrs.push(result.irr);
    moics.push(result.moic);
  }

  const n = irrs.length;
  const countIrrAbove = (hurdle: number) =>
    n === 0 ? 0 : irrs.filter((r) => r >= hurdle).length / n;
  const probLoss = n === 0 ? 0 : moics.filter((m) => m < 1).length / n;

  irrs.sort((a, b) => a - b);
  moics.sort((a, b) => a - b);

  return {
    config,
    irrs,
    moics,
    meanIrr: mean(irrs),
    medianIrr: percentile(irrs, 0.5),
    p5Irr: percentile(irrs, 0.05),
    p25Irr: percentile(irrs, 0.25),
    p75Irr: percentile(irrs, 0.75),
    p95Irr: percentile(irrs, 0.95),
    meanMoic: mean(moics),
    medianMoic: percentile(moics, 0.5),
    probIrrAbove15: countIrrAbove(0.15),
    probIrrAbove20: countIrrAbove(0.2),
    probIrrAbove25: countIrrAbove(0.25),
    probLoss,
  };
}
