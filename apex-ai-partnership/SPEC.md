# Build spec — Apex AI Partnership interactive proposal

Contract for all builders. Read `research/NOTES.md` first for facts, framing and
demo-craft rules. Deviate from this spec only where it is silent.

## Ground rules

- **Static site, zero build step, must work from `file://`.** Classic
  `<script>` tags and `window.*` globals only — NO ES modules, no fetch() of
  local JSON, no external JS libraries. Google Fonts via `<link>` (Fraunces
  400/500/600 + italic, Inter 400/500/600/700) with serif/sans fallbacks so the
  site degrades fine offline.
- Hand-rolled SVG charts only (via `assets/js/charts.js`).
- Every number shown anywhere comes from `window.APEX_DATA` (assets/js/data.js).
  No literals in page markup for figures that exist in the dataset. Numbers must
  tie across views — finance people will cross-check.
- Terminology: AuA (not AuM), depositary (not depository), NAV delivery,
  transfer agency, ManCo, AIFMD. £/$ conventions: dataset is USD, "$96.2m".
- Negative variances render in parentheses AND with color, never color alone.
  `font-variant-numeric: tabular-nums` on every numeric column/figure.
- Illustrative-data honesty: persistent footer line + small "Illustrative data"
  badge near figure blocks: "Illustrative dataset modelled on public benchmarks
  for global fund administrators (Fitch/peer disclosures). No Apex Group data
  was used or accessed." Clicking/hovering the badge explains the benchmark
  logic in a popover.
- **Never pitch or imply close acceleration / booking automation.** The close
  stays untouched; AI operates before it (prep, drafts) and after it
  (commentary, packs, analysis). This is a trust principle stated on both pages.
- Accessibility & print: WCAG-conscious contrast (use `--accent-ink` not
  `--accent` for text on paper), visible focus states, keyboard-operable
  tabs/chips/cards, `prefers-reduced-motion` honoured (skip typewriter/draw
  animations), `@media print` collapses interactions to end states.
- No emoji, no confetti, no chat avatars, no scroll-jacking, no hockey sticks,
  no "100% accurate" claims, no round numbers.

## Files & ownership (do not edit files you don't own)

| File | Owner |
|---|---|
| `assets/css/tokens.css` | DONE — read-only for all builders |
| `assets/js/data.js` | Agent DATA |
| `assets/js/charts.js`, `assets/css/main.css` | Agent VIZ |
| `index.html`, `assets/js/pitch.js`, `assets/css/pitch.css` | Agent PITCH |
| `dashboard.html`, `assets/js/dashboard.js`, `assets/css/dashboard.css` | Agent DASH |

Load order on every page: tokens.css → main.css → page css; data.js →
charts.js → page js (defer all scripts to end of body).

## 1. `data.js` — `window.APEX_DATA` (Agent DATA)

Fictional but benchmark-anchored FY2026 dataset for "Apex Group (illustrative)".
Context moment: **June 2026 month-end close just completed (WD+8); board pack
due WD+12**. Anchors from research: FY2025 revenue ~$1.52bn; FY2026 budget
grows ~6.5%; EBITDA margin actual ~30.9% YTD vs ~31.6% budget, on a public
march from 31% (2024) to ~35% (2026 target per Fitch commentary).

Required shape (exact keys; values computed by you, internally consistent):

```js
window.APEX_DATA = {
  meta: { period: "June 2026", periodShort: "Jun-26", closeDay: "WD+8",
          boardPackDue: "WD+12", currency: "USD",
          disclaimer: "...", benchmarkNote: "..." },
  group: {
    aua: 3.4e12, employees: 13240, countries: 52, offices: 88,
    marginTarget2026: 0.35, leverage: { fy24: 7.6, fy25: 6.6, fy26e: 5.8 },
  },
  months: ["Jul-25", ..., "Jun-26"],   // trailing 12 months, labels
  monthly: {                            // per month, $m, one decimal
    revenue:      { actual: [...12], budget: [...12], priorYear: [...12] },
    ebitda:       { actual: [...12], budget: [...12], priorYear: [...12] },
    ebitdaMarginPct: { actual: [...12], budget: [...12] },  // derived, 1dp
  },
  ytd: { // Jan-26..Jun-26 sums, plus % variance vs budget & PY (computed)
    revenue: { actual, budget, priorYear }, ebitda: { actual, budget, priorYear },
  },
  serviceLines: [ // shares of FY26 YTD revenue; must sum to ytd.revenue.actual
    { key:"fund",  name:"Fund Solutions",             seriesVar:"--series-1", ytdRevenue, budget, yoyPct:+7.8, note:"core engine; AuA-linked" },
    { key:"corp",  name:"Corporate & Legal Solutions",seriesVar:"--series-2", ..., yoyPct:+6.1 },
    { key:"custody",name:"Custody & Depositary",      seriesVar:"--series-3", ..., yoyPct:+1.9, note:"fee compression -40bps" },
    { key:"esg",   name:"ESG & Regulatory Reporting", seriesVar:"--series-4", ..., yoyPct:+26.3, note:"growth story (Holtara)" },
    { key:"digital",name:"Digital Banking & Other",   seriesVar:"--series-5", ..., yoyPct:+9.4 },
  ], // mix ≈ 52/22/17/5/4 — tune so everything foots
  regions: [ {name:"EMEA", sharePct:54,...}, {name:"Americas",29}, {name:"APAC",17} ],
  bridge: { // June EBITDA: budget → actual, $m one decimal, MUST foot exactly
    startLabel:"Jun budget EBITDA", start: <≈42.6>,
    steps: [
      { label:"AuA growth & markets",      value:+1.4, side:"favourable", explain:"..." },
      { label:"ESG mandate uptake",        value:+0.5, side:"favourable", explain:"..." },
      { label:"Billing timing (WIP release)", value:+0.4, side:"favourable", explain:"..." },
      { label:"Comp inflation — Luxembourg", value:-1.3, side:"adverse", explain:"cites GL 6100–6240, entities LU-014, LU-022" },
      { label:"Contractor backfill",       value:-0.7, side:"adverse", explain:"..." },
      { label:"Depositary fee compression", value:-0.6, side:"adverse", explain:"..." },
      { label:"FX translation",            value:-0.5, side:"adverse", explain:"..." },
    ],
    endLabel:"Jun actual EBITDA", end: <start + Σsteps>,
  },
  ops: { unbilledWipM: 52.3, wipMoMChangeM: +6.2, dsoDays: 63, dsoTarget: 55,
         billingLeakagePct: 1.8, attritionPct: 17.6,
         reportingTimeline: {
           current: [ {day:"WD+1..8", label:"Close & controls (untouched)"},
                      {day:"WD+8",  label:"Flash available"},
                      {day:"WD+9-10", label:"Variance analysis (manual)"},
                      {day:"WD+11-12", label:"Commentary & pack assembly"} ],
           withAI:  [ same close untouched; drafts ready WD+8 EOD; humans review WD+9; pack out WD+9 ],
         } },
  kpis: [ // Command-centre KPI row (6 tiles): revenue, EBITDA, margin vs budget,
          // unbilled WIP, DSO, ESG YoY — each {label, value, format, deltaVsBudget, spark:[...12]}
  ],
  askQuestions: [ // 7 canned Q&As for the ask-box. Each:
    // { id, chip:"short label", question:"full text", answerBlocks:[
    //     {type:"p", text:"streams as typewriter"},
    //     {type:"chart", spec:{kind:"line"|"bars"|"bridge", ...refs into data above}},
    //     {type:"table", rows:[...]},
    //     {type:"sources", items:["GL 6100–6240","Entity LU-014 AMS","Consolidation v2026.06.03"]},
    //     {type:"caveat", text:"TA billing feed for two Jersey entities lags 3 business days"} ] }
    // REQUIRED set: margin miss why (bridge); growth driver YTD (bars); margin
    // march vs 35% plan (line + budget); WIP/DSO story (MUST include caveat block);
    // Luxembourg comp vs plan (MUST include sources block); depositary fee
    // compression exposure; "draft the revenue paragraph for the June board pack" (long p).
  ],
  boardPack: { // content for the generator
    pipeline: ["Pull June consolidation extract","Reconcile to trial balance",
               "Compute variances vs budget & PY","Draft commentary (grounded)",
               "Assemble pack for review"],  // each with ~ms duration for animation
    sections: [ cover, execSummary(3 short paragraphs, written), plSummaryTable
                (rows: revenue by service line, total revenue, opex, EBITDA,
                 margin %; cols: Jun actual/budget/var, YTD actual/budget/var/PY),
                bridgeFigure(ref), serviceLinePerformance(short para each),
                outlook(para + risks bullets) ],
    reviewNote: "Every figure traced to consolidation v2026.06.03 — click any
                 number in a real deployment to see lineage. Draft requires
                 human sign-off before circulation."
  },
  workbook: { // "Global fee revenue model v14 FINAL (3).xlsx" pastiche
    name:"Group_Fee_Revenue_Model_v14_FINAL(3).xlsx", sheets:31, links:14,
    lastAudit:"never", riskScore:"High",
    grid: { // one visible sheet ~10 cols x 14 rows: client, product, AuA, fee bps,
            // FX, revenue formulas etc. Cells: {v:"display", f:"formula?", risk?:id}
    },
    findings: [ // 6: 2 high (hardcoded override in formula col; broken external
                // link → stale values), 3 medium (pasted values over formulas,
                // inconsistent FX rate vs rates sheet, hidden column feeding
                // total), 1 low (duplicate client row). Each {id, severity,
                // cell:"D7", title, detail, fix} — cross-ref grid cells.
    ],
    stats: { errorRatePct: 5.2, source:"Panko, U. Hawaii" }, // for side panel
  },
  capabilities: [ /* 12 use-case cards for index.html — see §3; keep here so both
                     pages could reference. Fields: id, title, function
                     ("Reporting"|"FP&A"|"Revenue & Billing"|"Treasury"|"Firmwide"),
                     horizon ("Now"|"Next"|"Later"), value (1-5), readiness (1-5),
                     oneLiner, detail (2-3 sentences), impactStat {text, source},
                     dataNeeded, controlsPosture, demo:null|"dashboard.html#ask" etc. */ ],
  stats: { /* sourced stats used by pitch page: fpaTimePct75, boardPackCostGBP3M,
              spreadsheetErrorPct90, adoption2024_6, adoption2025_41, gartner90by2026,
              unilever3x, coin360kHours, idcRoi3_7, leakage1to5, cfoHallucination86,
              humanOversight97 ... each {value, text, source, url} */ },
};
```

Also expose `window.APEX_FMT = { m(v), pct(v), delta(v), money(v) }` formatting
helpers ("$96.2m", "30.9%", "+1.6%"/"(1.3)%", "$3.4T"). Rules: one decimal for
$m and %, parentheses for negative deltas, thin non-breaking space before "m"?
No — style "$96.2m" exactly. Everything believable and non-round; monthly series
show seasonality (Q4/Q1 heavier billing, summer softer) and a gentle upward
trend; actual vs budget wiggle ±(0.5–2.5)%. Validate internally: write a
self-check IIFE at the bottom that console.warn's if service lines don't sum to
YTD revenue (±0.15), bridge doesn't foot (±0.01), or margins don't recompute —
warnings only, never throw. 12-month arrays align to `months` labels.

## 2. `charts.js` + `main.css` (Agent VIZ)

`window.Viz` — hand-rolled responsive SVG (viewBox 0 0 W H, width:100%), all
reading CSS custom properties via getComputedStyle at render time. Follow the
dataviz rules embedded here:

- Thin marks: 2px lines, bars ≤ 40px wide with 2px surface gaps, 4px rounded
  ends anchored to baseline (round the value end only), hairline gridlines
  (`--hairline`), baseline `--baseline`, axis labels 11–12px `--ink-3`,
  tabular-nums everywhere. One y-axis only — never dual axes.
- Legends: for ≥2 series render a legend row (swatch + name in `--ink-2`);
  single series takes no legend (title names it). Selective direct labels
  (first/last/extremes), never every point.
- Hover layer BY DEFAULT: line charts get crosshair + shared tooltip listing
  all series at that x; bar/bridge get per-mark tooltip. Tooltip = absolutely-
  positioned div, `--paper-raise` bg, hairline border, shadow; 16px min hit
  targets. Tooltips also work with keyboard focus.
- API (all take (el, opts), clear el, return void):
  - `Viz.line(el,{labels, series:[{name,color,values,dash?}], format, markers?, annotate?})`
    (support a horizontal budget/target reference line via `refLine:{value,label}`)
  - `Viz.bars(el,{labels, series:[...], format, horizontal?})` grouped; also
    single-series (all bars same slot-1 color unless colors passed per-datum
    intentionally for service lines — allowed since each bar IS its own series
    identity there, then direct-label each bar and skip legend)
  - `Viz.bridge(el,{start:{label,value}, steps:[{label,value,side}], end:{label,value}, format})`
    waterfall: start/end bars `--neutral-bar`, favourable `--favourable`,
    adverse `--adverse`, connector hairlines, direct value labels with +/-,
    supports sequential reveal animation (`.play()` returned handle) synced to
    commentary — but instant under reduced-motion.
  - `Viz.spark(el, values, {color})` 90×28 sparkline, no axes, endpoint dot.
  - `Viz.timeline(el, {tracks:[{name, segments:[{day,label,kind}]}]})` for the
    before/after reporting cycle (kind: "locked" renders hatched/neutral for
    the untouched close, "manual" vs "ai" tones).
- `main.css`: reset; body paper/ink; typography scale (Fraunces display h1-h3,
  Inter text; h1 clamp(2.6rem,5vw,4rem) weight 560, tight leading; small-caps
  letterspaced eyebrows with number prefix "01 —"); `.wrap`/`.wrap-narrow`
  containers; hairline `.rule`; editorial components: `.eyebrow`, `.pullquote`
  (Fraunces italic, hairlines above/below), `.footnote` + superscript refs,
  `.badge-illustrative` + popover, `.btn` (primary = ink block w/ orange hover
  underline shift; secondary = hairline), `.card`, `.stat-tile` (big Fraunces
  number, Inter label, delta row with sign), `.table-fin` (right-aligned
  numerics, zebra `--paper-recess`, subtotal rules, parentheses negatives),
  tabs, chips, `.ai-panel` (the reserved AI-layer treatment: `--accent-wash`
  bg, 3px `--accent` left rule, "AI draft — for human review" tag), skeleton
  shimmer for latency theater, focus-visible styles, print styles, reduced-
  motion overrides. Keep it one coherent system — pages add layout only.
- Include a tiny `Viz.typewriter(el, textOrNodes, {cps:55, skippable:true})`
  used for AI output only (instant under reduced-motion; click to complete).

## 3. `index.html` — the editorial pitch (Agent PITCH)

Long-form editorial page, ~8 acts, numbered eyebrows, generous whitespace,
`--wrap-narrow` prose with full-width breakouts for interactive figures.

1. **Masthead/hero** (paper, not dark): eyebrow "A working proposal · Prepared
   for Apex Group · July 2026"; display headline built on their own tagline —
   e.g. "The single-source provider deserves a single source of truth." with
   subhead: their clients get Apex Nova and AI-enabled products; this is the
   same ambition applied inside Finance. Two CTAs: "Open the working demo"
   (dashboard.html) + "See the capability map" (#map). Hairline-boxed marginal
   note: what this document is (interactive proposal, illustrative data).
2. **The moment** ("01 — Why now"): narrative prose weaving: DeTrask mandate
   pull-quote ("future-looking finance function… institutional sophistication");
   margin march 31%→35% w/ small line chart vs target; adoption stats
   (6%→41% FP&A adoption; Gartner 90% by 2026; Citco already shipping AI doc
   intelligence); stat band of 3 stat-tiles (75% of FP&A time on data
   wrangling · £3M avg annual board-pack cost · >90% of spreadsheets contain
   errors) each footnoted.
3. **What we will never touch** ("02 — Controls first"): short, strong. The
   close is well-controlled and stays exactly as it is; we build before and
   after it. Principles list: AI drafts / humans approve · grounded in your
   GL, every figure cited · auditable by design (prompt + output logs) ·
   private tenant, never trains on your data · evaluation gates with kill
   criteria. Pull line: "Finance leaders will trust AI when they can audit it."
4. **The capability map** ("03 — Art of the possible", #map): interactive.
   Toggle: grid view (Value vs Readiness scatter of 12 cards, quadrant labels
   "Prove first" etc.) + list view. Filter chips by function & horizon.
   Cards from `APEX_DATA.capabilities`; click → accessible drawer/modal:
   detail, impact stat + source, data needed, controls posture, and for the
   4 with demos a deep-link button into the dashboard module. Mark the four
   demo-backed ones distinctly (orange corner tag "Working demo"). Note under
   heading: "Twelve starting points, none of them your close. In the working
   session we map these to your actual systems and pick two."
5. **The working demo** ("04 — Seeing is believing"): full-width dark
   (`--ink-wash`) band, one strong screenshot-like framed preview (CSS mock,
   not an <img>), copy: seeded with an illustrative dataset modelled on a
   global fund administrator at Apex's scale; list the four modules; big CTA.
6. **The engagement** ("05 — Prove, then scale"): horizontal 4-phase timeline:
   Phase 0 "Art-of-the-possible working session" (2 wks, on YOUR artifacts —
   one real board pack, one workbook, mapped live); Phase 1 "Prove" (pick 1–2
   from the map, 6–8 wk working pilots inside your controls, evaluation gates
   & kill criteria, success = measured hours + bps); Phase 2 "Plan" (AI
   strategy, target operating model, 90-day rolling roadmap, vendor/build
   choices); Phase 3 "Scale & enable" (deployment + AI academy: role-based
   training, champions cohort, certification — 94% of workers want gen-AI
   skills, 5% of orgs train at scale). Commercial posture strip: monthly
   engagement, no annual lock-in — "if we're not compounding value, fire us
   like any other supplier"; accountability: after six months you should be
   able to point at hours returned, a faster pack, a recovered fee.
7. **Why us** ("06 — The right partner"): engineering-led (we ship working
   software in weeks — this proposal IS one: built as a working artifact,
   data model + demo included); controls-native (we design around your
   frameworks, not through them); education-first (we leave your team more
   capable, not more dependent). Honest positioning paragraph.
8. **Objections, answered** ("07"): accordion — hallucination (86% of CFOs
   have seen it → grounded generation + citation + human gate), security
   (private tenant, no training, RBAC, retention), audit (SOC 2, decision
   logs), "does this touch the close?" (No — section 02), "what if a pilot
   fails?" (kill criteria are a feature; you learn cheaply).
9. **Footer**: next-step block ("One working session. Two use cases. Ninety
   days." + contact placeholder mailto), full sources/footnotes list (numbered,
   matching superscripts), illustrative-data disclaimer, "Built as a working
   artifact — view the demo".

`pitch.js`: capability map (render, filters, view toggle, drawer), smooth-
scroll nav w/ active section indicator (thin left progress rail or top bar),
footnote hover popovers, stat-tile count-up on first scroll into view
(respect reduced-motion), accordion.

## 4. `dashboard.html` — the working demo (Agent DASH)

App-like but same editorial skin. Header: wordmark "Finance Intelligence —
working demo for Apex Group", period pill "June 2026 close · WD+8",
illustrative badge, link back to proposal. Four modules as tabs (URL hash
deep-linkable: #command, #ask, #boardpack, #workbook).

1. **#command — Command centre**: KPI row (6 stat tiles w/ sparklines, delta
   vs budget with sign+color); revenue trailing-12 line (actual solid
   `--series-1`, budget dashed `--ink-3`, PY thin) with crosshair tooltip;
   EBITDA margin line vs budget + horizontal 35%-target refLine annotated
   "FY26 ambition"; service-line YTD bars (direct-labeled, per-line colors,
   YoY deltas); **hero: the June EBITDA bridge** — "Run AI commentary" button
   plays sequential bar reveal synced with typewriter commentary in an
   `.ai-panel` beside it (drafts narrative from bridge.explain lines, ends
   with sources line + "AI draft — for human review" tag).
2. **#ask — Ask the numbers**: NL input styled box + 7 clickable chips
   (from askQuestions). On ask: 1.5–2s skeleton "Reading June consolidation…"
   then answer blocks stream: paragraphs typewritten, charts draw in, tables
   fade, sources block renders as chips, caveat block renders amber w/
   warning glyph. Free-typed input: fuzzy-match to nearest canned question
   (keyword match), else graceful: "In deployment this connects to your
   consolidation layer; this demo carries seven worked answers" + chip list.
   Conversation log accumulates upward like a document, not chat bubbles.
3. **#boardpack — Board pack in minutes**: left: config (sections checklist,
   audience "Group Board", period fixed) + "Generate June board pack" button;
   pipeline steps animate (checkmarks, ~700ms each, real step names); right:
   the pack renders as paged document (cover with Apex-orange rule, exec
   summary, P&L table from data, bridge figure re-rendered, service-line
   paras, outlook) inside a paper frame; then toolbar: "Print / save as PDF"
   (window.print printing ONLY the pack via print CSS) + reviewNote banner.
   Before/after strip underneath: `Viz.timeline` current vs with-AI —
   close segment hatched & labelled "untouched".
4. **#workbook — Workbook risk scanner**: fake file header (name, 31 sheets,
   14 external links, "last full audit: never"); "Scan workbook" → progress
   sweep, then Excel-like grid renders w/ column letters/row numbers,
   formula bar showing active cell; finding dots on risky cells (severity
   colors w/ distinct glyphs ▲/●/■ so not color-alone); click dot or finding
   card → cell highlights, panel explains issue + suggested fix; summary
   header: risk score, 6 findings by severity, side stat: "Research: ~5.2%
   of spreadsheet cells contain errors (Panko)". Footer line: "Point this at
   the fee models that feed revenue — before they feed the P&L."

Bottom of every module: consistent "This is illustrative — imagine it on your
consolidation layer" strip + CTA back to proposal §05 (engagement).

`dashboard.js`: tab router (hash), module renderers, typewriter/ pipeline
orchestration, ask matcher. Everything works with JS enabled only (no SSR
concerns), zero console errors, no layout jank at 1280–1680px, usable at
1024px and above (mobile: readable, charts scroll horizontally if needed —
execs may open on iPad).

## 5. Quality bar (all agents)

- Zero console errors/warnings from your own code from `file://`.
- Real content only — no lorem ipsum, no TODO/FIXME/placeholder strings
  except the single contact mailto placeholder.
- British-neutral corporate English, confident but never breathless.
- Self-review against `research/NOTES.md` §4 (demo-craft rules) before done.
