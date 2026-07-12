import { useState, type ReactNode } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { DealAssumptions } from "@/engine/types";
import { fmtM, fmtPct, fmtX } from "@/lib/format";
import SliderControl from "@/components/SliderControl";

interface AssumptionsPanelProps {
  assumptions: DealAssumptions;
  /** Keys currently overridden away from the scenario preset. */
  overriddenKeys: ReadonlySet<keyof DealAssumptions>;
  dirty: boolean;
  scenarioDescription: string;
  onSet: (patch: Partial<DealAssumptions>) => void;
  onReset: () => void;
}

/** Resize a growth vector to `n` years: truncate, or pad with the last value. */
export function resizeGrowth(growth: number[], n: number): number[] {
  if (growth.length >= n) return growth.slice(0, n);
  const last = growth.length > 0 ? growth[growth.length - 1] : 0.05;
  return [...growth, ...Array(n - growth.length).fill(last)];
}

function Group({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded px-1 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {title}
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className={`text-ink-muted transition-transform duration-150 ${
            open ? "" : "-rotate-90"
          }`}
        />
      </button>
      {open && <div className="px-1 pb-4">{children}</div>}
    </div>
  );
}

/**
 * Left-hand assumptions panel: collapsible Entry / Financing / Operations /
 * Exit groups of slider controls driving the LBO engine.
 */
export default function AssumptionsPanel({
  assumptions,
  overriddenKeys,
  dirty,
  scenarioDescription,
  onSet,
  onReset,
}: AssumptionsPanelProps) {
  const a = assumptions;
  const [fineTuneOpen, setFineTuneOpen] = useState(false);

  const activeGrowth = a.revenueGrowth.slice(0, a.holdYears);
  const meanGrowth =
    activeGrowth.length > 0
      ? activeGrowth.reduce((s, g) => s + g, 0) / activeGrowth.length
      : 0;
  const growthIsUniform = activeGrowth.every((g) => g === activeGrowth[0]);

  const setYearGrowth = (index: number, v: number) => {
    const next = [...activeGrowth];
    next[index] = v;
    onSet({ revenueGrowth: next });
  };

  const setHoldYears = (n: number) => {
    onSet({
      holdYears: n,
      revenueGrowth: resizeGrowth(activeGrowth, n),
    });
  };

  const isDirty = (k: keyof DealAssumptions) => overriddenKeys.has(k);

  return (
    <aside
      aria-label="Deal assumptions"
      className="rounded-xl border border-white/10 bg-surface-1"
    >
      <div className="border-b border-white/10 px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink-primary">
              {a.companyName}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-muted">
              {scenarioDescription}
            </p>
          </div>
          {dirty && (
            <button
              type="button"
              onClick={onReset}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 bg-surface-2 px-2.5 py-1.5 text-[11px] font-medium text-ink-secondary transition-colors duration-150 hover:text-ink-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RotateCcw size={11} aria-hidden="true" />
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <Group title="Entry">
          <SliderControl
            label="LTM revenue"
            value={a.entryRevenue}
            min={25}
            max={500}
            step={5}
            format={fmtM}
            dirty={isDirty("entryRevenue")}
            onChange={(v) => onSet({ entryRevenue: v })}
          />
          <SliderControl
            label="EBITDA margin (entry)"
            value={a.entryEbitdaMargin}
            min={0.05}
            max={0.45}
            step={0.005}
            format={fmtPct}
            dirty={isDirty("entryEbitdaMargin")}
            onChange={(v) => onSet({ entryEbitdaMargin: v })}
          />
          <SliderControl
            label="Entry multiple (EV / EBITDA)"
            value={a.entryMultiple}
            min={4}
            max={15}
            step={0.25}
            format={fmtX}
            dirty={isDirty("entryMultiple")}
            onChange={(v) => onSet({ entryMultiple: v })}
          />
          <SliderControl
            label="Transaction fees (% of EV)"
            value={a.transactionFeesPct}
            min={0}
            max={0.05}
            step={0.0025}
            format={fmtPct}
            dirty={isDirty("transactionFeesPct")}
            onChange={(v) => onSet({ transactionFeesPct: v })}
          />
        </Group>

        <Group title="Financing">
          <SliderControl
            label="Senior debt (× EBITDA)"
            value={a.seniorDebtX}
            min={0}
            max={6}
            step={0.25}
            format={fmtX}
            dirty={isDirty("seniorDebtX")}
            onChange={(v) => onSet({ seniorDebtX: v })}
          />
          <SliderControl
            label="Senior rate"
            value={a.seniorRate}
            min={0.02}
            max={0.2}
            step={0.0025}
            format={fmtPct}
            dirty={isDirty("seniorRate")}
            onChange={(v) => onSet({ seniorRate: v })}
          />
          <SliderControl
            label="Mandatory amortization (% / yr)"
            value={a.seniorAmortPct}
            min={0}
            max={0.25}
            step={0.01}
            format={fmtPct}
            dirty={isDirty("seniorAmortPct")}
            onChange={(v) => onSet({ seniorAmortPct: v })}
          />
          <SliderControl
            label="Mezzanine debt (× EBITDA)"
            value={a.mezzDebtX}
            min={0}
            max={3}
            step={0.25}
            format={fmtX}
            dirty={isDirty("mezzDebtX")}
            onChange={(v) => onSet({ mezzDebtX: v })}
          />
          <SliderControl
            label="Mezzanine rate"
            value={a.mezzRate}
            min={0.02}
            max={0.2}
            step={0.0025}
            format={fmtPct}
            dirty={isDirty("mezzRate")}
            onChange={(v) => onSet({ mezzRate: v })}
          />
          <SliderControl
            label="Cash sweep (% of FCF)"
            value={a.cashSweepPct}
            min={0}
            max={1}
            step={0.05}
            format={fmtPct}
            dirty={isDirty("cashSweepPct")}
            onChange={(v) => onSet({ cashSweepPct: v })}
          />
        </Group>

        <Group title="Operations">
          <SliderControl
            label="Hold period"
            value={a.holdYears}
            min={3}
            max={7}
            step={1}
            format={(v) => `${v} yrs`}
            dirty={isDirty("holdYears")}
            onChange={setHoldYears}
          />
          <SliderControl
            label={
              growthIsUniform ? "Revenue growth" : "Revenue growth (avg)"
            }
            value={meanGrowth}
            min={-0.05}
            max={0.25}
            step={0.005}
            format={fmtPct}
            dirty={isDirty("revenueGrowth")}
            onChange={(v) =>
              onSet({ revenueGrowth: Array(a.holdYears).fill(v) })
            }
          />
          <button
            type="button"
            aria-expanded={fineTuneOpen}
            onClick={() => setFineTuneOpen((o) => !o)}
            className="mb-1 flex items-center gap-1 rounded text-[11px] font-medium text-ink-muted transition-colors duration-150 hover:text-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronDown
              size={12}
              aria-hidden="true"
              className={`transition-transform duration-150 ${
                fineTuneOpen ? "" : "-rotate-90"
              }`}
            />
            Fine-tune growth by year
          </button>
          {fineTuneOpen && (
            <div className="mb-2 rounded-lg border border-white/10 bg-surface-0/40 px-3 py-1.5">
              {activeGrowth.map((g, i) => (
                <SliderControl
                  key={i}
                  compact
                  label={`Year ${i + 1}`}
                  value={g}
                  min={-0.05}
                  max={0.25}
                  step={0.005}
                  format={fmtPct}
                  onChange={(v) => setYearGrowth(i, v)}
                />
              ))}
            </div>
          )}
          <SliderControl
            label="Capex (% of revenue)"
            value={a.capexPctRevenue}
            min={0}
            max={0.1}
            step={0.0025}
            format={fmtPct}
            dirty={isDirty("capexPctRevenue")}
            onChange={(v) => onSet({ capexPctRevenue: v })}
          />
          <SliderControl
            label="NWC (% of revenue)"
            value={a.nwcPctRevenue}
            min={0}
            max={0.3}
            step={0.005}
            format={fmtPct}
            dirty={isDirty("nwcPctRevenue")}
            onChange={(v) => onSet({ nwcPctRevenue: v })}
          />
          <SliderControl
            label="D&A (% of revenue)"
            value={a.daPctRevenue}
            min={0}
            max={0.1}
            step={0.0025}
            format={fmtPct}
            dirty={isDirty("daPctRevenue")}
            onChange={(v) => onSet({ daPctRevenue: v })}
          />
          <SliderControl
            label="Tax rate"
            value={a.taxRate}
            min={0}
            max={0.4}
            step={0.01}
            format={fmtPct}
            dirty={isDirty("taxRate")}
            onChange={(v) => onSet({ taxRate: v })}
          />
        </Group>

        <Group title="Exit">
          <SliderControl
            label="EBITDA margin (exit)"
            value={a.exitEbitdaMargin}
            min={0.05}
            max={0.45}
            step={0.005}
            format={fmtPct}
            dirty={isDirty("exitEbitdaMargin")}
            onChange={(v) => onSet({ exitEbitdaMargin: v })}
          />
          <SliderControl
            label="Exit multiple (EV / EBITDA)"
            value={a.exitMultiple}
            min={4}
            max={15}
            step={0.25}
            format={fmtX}
            dirty={isDirty("exitMultiple")}
            onChange={(v) => onSet({ exitMultiple: v })}
          />
        </Group>
      </div>
    </aside>
  );
}
