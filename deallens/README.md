# DealLens — PE Deal Intelligence Studio

An interactive LBO modeling and deal analytics application, built entirely
client-side. Drag an assumption slider and the full model — debt schedule,
returns, value-creation bridge, sensitivities, Monte Carlo — recomputes live.

Built by [Gokul Madan](https://linkedin.com/in/gokulmadan) as a working
demonstration of deals automation for PE sponsors and portfolio-company CFOs.

## What's inside

- **LBO engine** (`src/engine/lbo.ts`) — entry structuring, senior + mezzanine
  tranches, mandatory amortization, cash-sweep waterfall, linear margin
  interpolation, numeric IRR (bisection), MOIC, and a value-creation bridge
  that reconciles to the penny. The normative formulas live in the header of
  `src/engine/types.ts`; the test suite (`npm test`, 22 tests) includes a
  fully hand-computed toy case and bridge-reconciliation checks.
- **Sensitivity engine** (`src/engine/sensitivity.ts`) — two-way grids over
  any pair of drivers; unfinanceable combinations surface as `n.m.` rather
  than fake returns.
- **Monte Carlo** (`src/engine/montecarlo.ts`) — seeded (reproducible)
  triangular sampling over growth, exit multiple, and exit margin; up to
  10,000 iterations in well under a second, client-side.
- **Scenarios** (`src/engine/presets.ts`) — Base / Bull / Bear cases for
  "Project Meridian", a realistic mid-market B2B software deal.
- **Charts** (`src/charts/`) — value-creation waterfall, debt paydown
  schedule, sensitivity heatmaps, IRR histogram, equity build, and operating
  performance — hand-tuned dark fintech styling with accessible palettes.

## Run it

```sh
npm install
npm run dev      # local dev server
npm test         # 22-test engine suite
npm run build    # production build to dist/
```

No backend, no data leaves the browser.

> Illustrative only; not investment advice.
