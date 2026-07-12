import { useId, useMemo } from "react";
import type { DealAssumptions, Triangular } from "@/engine/types";
import { runMonteCarlo } from "@/engine/montecarlo";
import { DEFAULT_MC_CONFIG } from "@/engine/presets";
import IrrHistogram from "@/charts/IrrHistogram";
import { Card } from "@/components/Card";
import { fmtPct } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const ITERATION_CHOICES = [1000, 5000, 10000] as const;

interface MonteCarloTabProps {
  assumptions: DealAssumptions;
  iterations: number;
  hurdle: number;
  onIterationsChange: (n: number) => void;
  onHurdleChange: (h: number) => void;
}

/** Shift a triangular distribution so its mode sits on the current value. */
function recenter(t: Triangular, mode: number): Triangular {
  return {
    min: mode - (t.mode - t.min),
    mode,
    max: mode + (t.max - t.mode),
  };
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2/60 px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold leading-none text-ink-primary">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[11px] leading-none text-ink-muted">{sub}</p>}
    </div>
  );
}

/**
 * Monte Carlo tab: seeded simulation over growth, exit multiple, and exit
 * margin (triangular distributions centered on the live assumptions), with an
 * IRR histogram, summary tiles, and iteration/hurdle controls.
 */
export default function MonteCarloTab({
  assumptions,
  iterations,
  hurdle,
  onIterationsChange,
  onHurdleChange,
}: MonteCarloTabProps) {
  const hurdleId = useId();
  const debounced = useDebouncedValue(assumptions, 150);

  const result = useMemo(() => {
    const active = debounced.revenueGrowth.slice(0, debounced.holdYears);
    const meanGrowth =
      active.length > 0
        ? active.reduce((s, g) => s + g, 0) / active.length
        : 0;
    return runMonteCarlo(debounced, {
      ...DEFAULT_MC_CONFIG,
      iterations,
      revenueGrowth: recenter(DEFAULT_MC_CONFIG.revenueGrowth, meanGrowth),
      exitMultiple: recenter(
        DEFAULT_MC_CONFIG.exitMultiple,
        debounced.exitMultiple,
      ),
      exitEbitdaMargin: recenter(
        DEFAULT_MC_CONFIG.exitEbitdaMargin,
        debounced.exitEbitdaMargin,
      ),
    });
  }, [debounced, iterations]);

  const probAboveHurdle = useMemo(() => {
    if (result.irrs.length === 0) return 0;
    // irrs are sorted ascending — count the tail above the hurdle.
    let lo = 0;
    let hi = result.irrs.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (result.irrs[mid] > hurdle) hi = mid;
      else lo = mid + 1;
    }
    return (result.irrs.length - lo) / result.irrs.length;
  }, [result, hurdle]);

  return (
    <Card
      title="Monte Carlo simulation"
      subtitle="Triangular distributions for revenue growth, exit multiple, and exit margin, centered on the live assumptions. Seeded and fully reproducible."
    >
      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
            Iterations
          </p>
          <div
            role="group"
            aria-label="Iterations"
            className="flex rounded-lg border border-line bg-surface-2/60 p-0.5"
          >
            {ITERATION_CHOICES.map((n) => {
              const active = n === iterations;
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onIterationsChange(n)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    active
                      ? "bg-surface-3 text-ink-primary"
                      : "text-ink-muted hover:text-ink-secondary"
                  }`}
                >
                  {n.toLocaleString("en-US")}
                </button>
              );
            })}
          </div>
        </div>
        <div className="w-64 max-w-full">
          <div className="mb-1.5 flex items-baseline justify-between">
            <label
              htmlFor={hurdleId}
              className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted"
            >
              Hurdle rate
            </label>
            <output
              htmlFor={hurdleId}
              className="tabular-nums text-xs font-semibold text-ink-primary"
            >
              {fmtPct(hurdle)}
            </output>
          </div>
          <input
            id={hurdleId}
            type="range"
            min={0.1}
            max={0.3}
            step={0.01}
            value={hurdle}
            onChange={(e) => onHurdleChange(Number(e.target.value))}
            aria-valuetext={fmtPct(hurdle)}
            className="focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Median IRR" value={fmtPct(result.medianIrr)} />
        <StatTile
          label="P5 – P95 range"
          value={`${fmtPct(result.p5Irr)} – ${fmtPct(result.p95Irr)}`}
        />
        <StatTile
          label={`P(IRR > ${fmtPct(hurdle)})`}
          value={fmtPct(probAboveHurdle)}
          sub="clears the hurdle"
        />
        <StatTile
          label="P(loss)"
          value={fmtPct(result.probLoss)}
          sub="MOIC below 1.0x"
        />
      </div>

      <IrrHistogram result={result} hurdle={hurdle} />
    </Card>
  );
}
