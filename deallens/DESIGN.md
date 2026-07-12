# DealLens — PE Deal Intelligence Studio

An interactive LBO modeling and deal analytics studio. Client-side only, no
backend. Built by Gokul Madan (Xolution) as a live demonstration of deals
automation for PE sponsors and portfolio-company CFOs.

## Stack

Vite + React 18 + TypeScript (strict) + Tailwind + Recharts + lucide-react.
Path alias `@/` -> `src/`. Tests with vitest (`npm test`).

## Normative contracts (do not change without updating all consumers)

- `src/engine/types.ts` — all engine types AND the exact LBO formulas (in the
  header comment). Implementations must match those formulas to the letter.
- `src/charts/contracts.ts` — chart component prop interfaces and import paths.

## Layout (desktop-first, responsive down to tablet)

Dark fintech UI on `--surface-0` page plane. Cards on `--surface-1` with a
hairline border (`rgba(255,255,255,0.10)`), rounded-xl, generous padding.

```
┌───────────────────────────────────────────────────────────────┐
│ Header: DealLens wordmark · scenario switcher (Base/Bull/Bear)│
│         · "Built by Gokul Madan" credit                       │
├───────────────┬───────────────────────────────────────────────┤
│ Assumptions   │  KPI strip: IRR · MOIC · Sponsor Equity ·     │
│ panel         │  Exit Equity · Entry/Exit leverage            │
│ (sticky,      ├───────────────────────────────────────────────┤
│  sliders +    │  Tabs:                                        │
│  numeric      │   1. Returns    (EquityBuildChart +           │
│  inputs,      │                  CashFlowChart)               │
│  grouped:     │   2. Value creation (WaterfallChart + short   │
│  Entry /      │                  narrative auto-generated)    │
│  Financing /  │   3. Debt       (DebtScheduleChart +          │
│  Operations / │                  leverage ratio readout)      │
│  Exit)        │   4. Sensitivity (two SensitivityHeatmaps:    │
│               │      IRR: exit multiple × entry multiple,     │
│               │      IRR: revenue growth × exit margin)       │
│               │   5. Monte Carlo (IrrHistogram + stat tiles + │
│               │      iterations/hurdle controls)              │
│               │   6. Financials (full YearRow table,          │
│               │      tabular-nums, sticky header)             │
└───────────────┴───────────────────────────────────────────────┘
```

Every assumption change recomputes the model synchronously (< 1ms); Monte
Carlo (5,000 runs) recomputes in a `useMemo` debounced ~150ms — it is fast
enough client-side.

## Dataviz rules (non-negotiable)

- Colors ONLY from the CSS custom properties in `src/index.css` / tailwind
  tokens (`series-1..8`, `status-*`, `ink-*`, `surface-*`). Series get fixed
  slots: senior debt = series-1 (blue), mezz = series-5 (violet), cash =
  series-2 (aqua), revenue = series-1, EBITDA = series-2, FCF = series-3,
  equity = series-1. Status colors only for good/bad deltas (e.g. IRR above
  or below hurdle), never as series colors.
- One axis per chart. Never dual-axis.
- Waterfall: floating bars — positive effects in series-2, negative in
  series-6, anchor bars (sponsor equity, exit equity) in series-1. 2px gap
  between bars, 4px rounded data-end corners, connector hairlines in
  `--gridline`. Direct value labels on each bar in `--text-secondary`.
- Heatmap: one-hue sequential blue ramp (from `#cde2fb` -> `#0d366b` band —
  use ~6 steps, darker = higher). Cell value labels: white text on dark
  cells, `#0b0b0b` on light cells. Outline the base case cell with a 2px
  white ring.
- Histogram: bars in series-1; bars left of MOIC 1.0x / below hurdle marked
  with series-6; hurdle line as a labeled vertical reference in
  `--text-muted` dashed.
- Tooltips on all charts: dark raised surface (`--surface-2`), hairline
  border, 12px text, values tabular-nums. Recharts default styling must be
  overridden.
- Legends: present for every chart with >= 2 series; small colored square +
  label in `--text-secondary`.
- Gridlines: `--gridline`, hairline, horizontal only where meaningful. Axis
  text in `--text-muted`, 11-12px. No axis lines except the baseline in
  `--baseline`.
- Numbers: $12.5M / 23.4% / 2.6x formats. Helpers live in `src/lib/format.ts`
  (`fmtM`, `fmtPct`, `fmtX`) — anyone may create/extend this module; keep
  helper names stable.

## Tone

Institutional, precise, understated. No emoji in the UI. Footer credit:
"Built by Gokul Madan — DealLens is a demonstration of client-side deals
automation. Illustrative only; not investment advice."
