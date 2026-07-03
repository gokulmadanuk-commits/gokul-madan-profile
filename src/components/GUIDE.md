# LUCA component kit — API guide

Folio chrome and primitives for the Examiner's Folio design language. All money
props are integer **cents**; format at the edge via `src/lib/format.ts`
(`usd`, `usdExact`, `usdCompact`). Import paths shown from `src/pages/*`.

## Layout — `../components/Layout`

App frame: masthead (LUCA wordmark, matter caption, § I–VII table-of-contents
rail, brass Oxford rule) + footer (Masin attribution, synthetic-data notice,
CONFIDENTIAL stamp, Prepared by / Reviewed by). Already wired in `App.tsx` —
**pages never import it**. Pages render inside `<main class="max-w-folio px-6/10 py-10">`,
so do not add your own outer max-width/padding wrapper.

```tsx
<Layout>{children}</Layout>
```

## PageHeader — `../components/PageHeader`

```tsx
<PageHeader
  kicker="Section IV · Schedule 3"   // brass small caps
  title="The Three Methods"          // Fraunces display
  lede="Optional Newsreader lede, ~62ch max."
  exhibit="Ex. 12"                   // optional, mono, right-aligned
/>
```
Renders the Oxford rule beneath; start every page with one.

## StatTile — `../components/StatTile`

```tsx
<StatTile
  label="Understatement, 2023"
  value={<TickFigure cents={42_000_000} />}  // ReactNode or string; 42_000_000 cents = $420,000
  note="All three methods converge within 5%."
  tone="adverse"   // 'default' | 'adverse' (oxblood) | 'credit' (green)
/>
```
Lay several in a `grid grid-cols-2 sm:grid-cols-4 gap-8` row.

## TickFigure — `../components/TickFigure`

```tsx
<TickFigure cents={41_200_000} />                       // → $412,000 via usd()
<TickFigure cents={-124000} format={usdExact} />        // → ($1,240.00)
<TickFigure cents={total} className="text-[2.25rem]" /> // size via className
```
Ticks digit-by-digit ~400ms (ease-out) on mount and whenever `cents` changes;
instant under `prefers-reduced-motion`. Always Plex Mono tabular.

## ScheduleTable — `../components/ScheduleTable`

Generic court-schedule renderer. Numbers in `cells` are **cents** and are
auto-formatted (default `usd`: accountant's parentheses, debit color when
negative). Currency symbol lives in the column head, not per cell.

```tsx
<ScheduleTable
  columns={[
    { key: "item", label: "Item" },                      // align defaults: text left
    { key: "y22", label: "2022 ($)", align: "right" },   // numbers default right
    { key: "y23", label: "2023 ($)", align: "right" },
  ]}
  rows={[
    { id: "g1", cells: ["Assets", null, null], kind: "group" },
    { id: "res", cells: ["Residence — Tanglewood", 145_000_000, 145_000_000], indent: 1 },
    { id: "veh", cells: ["Vehicles", 21_400_000, 18_900_000], indent: 1,
      flag: true, note: "† Porsche acquired mid-year; see Ex. 22." },
    { id: "sub", cells: ["Total assets", 320_000_000, 355_000_000], kind: "subtotal" },
    { id: "tot", cells: ["Net worth", 268_000_000, 301_000_000], kind: "total" },
  ]}
  format={usdExact}          // optional; default usd (whole dollars)
  caption="Schedule 1 — Net worth by year, at cost."   // optional marginalia
/>
```
Row kinds: `item` (hover wash) · `group` (small-caps heading, extra top space) ·
`subtotal` (single rule above) · `total` (single rule above + double rule under).
`indent: 0|1|2` indents the first cell. `flag: true` = oxblood left rule + wash +
superscript † beside the last numeric cell. `note` renders as marginalia under
the first cell.

## ExhibitFrame — `../components/ExhibitFrame`

```tsx
import { caseFile } from "../lib/caseData";
const doc = caseFile.documents.find((d) => d.id === "frost-checking-2022-06")!;
<ExhibitFrame doc={doc} height={720} />   // height optional, default 560
```
Brass "EXHIBIT 14" plate, hairline ink frame around an `<iframe>` of `doc.file`,
chain-of-custody strip (id · period · pages · "produced via subpoena"/"produced
natively" · sha256 stub) in Plex Mono.

## MarginNote — `../components/MarginNote`

```tsx
<MarginNote>$385,000 wire to Gulf Coast Title — no note or loan documented.</MarginNote>
<MarginNote mark="‡">Cf. Schedule 5, line 14.</MarginNote>
```
Newsreader italic, brass dagger. Use for examiner's asides and figure captions.

## chartTheme — `../components/chartTheme`

Spread-style presets so every Recharts exhibit matches: no grid lattice, no
legends (label line termini directly), baseline-only axes, paper tooltips.

```tsx
import {
  chartColors, xAxisProps, yAxisProps, tooltipProps, referenceLineProps,
  referenceLabelStyle, linePrimaryProps, lineSecondaryProps, lineBrassProps,
  barProps, barAdverseProps, areaPrimaryProps, seriesLabelStyle,
} from "../components/chartTheme";

<LineChart data={data} margin={{ top: 8, right: 96, bottom: 4, left: 8 }}>
  <XAxis {...xAxisProps} dataKey="year" />
  <YAxis {...yAxisProps} tickFormatter={(v) => usdCompact(v)} />
  <Tooltip {...tooltipProps} formatter={(v: number) => usd(v)} />
  <ReferenceLine y={reported} {...referenceLineProps}
    label={{ value: "reported income", position: "right", ...referenceLabelStyle }} />
  <Line {...linePrimaryProps} dataKey="lifestyle" />
  <Line {...lineSecondaryProps} dataKey="reported" />
</LineChart>
```
Palette: `chartColors.primary` (bottle green), `.secondary`, `.brass`,
`.oxblood` (flagged periods ONLY), `.credit`/`.debit`. Also exported:
`strokes`, `areaFillOpacity`, `barFillOpacity`, `axisTick`, `fontMono`, `fontBody`,
`tooltipContentStyle`/`tooltipLabelStyle`/`tooltipItemStyle`.

## CSS utilities (src/index.css)

`.label-caps` `.rule-hairline` `.rule-oxford` `.rule-oxford-brass`
`.rule-subtotal` `.rule-total` `.figure` `.figure-debit` `.figure-credit`
`.row-flagged` `.sheet` `.marginalia` `.transition-ink` `.animate-settle`
(fade + 6px settle) `.animate-fade` (opacity only).

House rules: no rounded corners > 2px, no shadows beyond `.shadow-sheet`, no
gradients, no zebra striping, no legends, oxblood only for adverse findings,
brass under 5% of any screen, every numeral in Plex Mono.
