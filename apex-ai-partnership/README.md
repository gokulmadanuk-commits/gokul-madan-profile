# Apex Group × AI — The Art of the Possible

An **interactive, editorial pitch microsite** proposing an **AI transformation partnership**
to Apex Group's Office of the CFO — built to show the *art of the possible* with AI across
FP&A, board packs, workbooks and decks, and to prove we're the partner to deliver it.

It is a single-page scrolling narrative with live, interactive demos:

- **Art of the possible** — five signature "wow" automations.
- **Interactive capability map** — 22 use cases plotted on a value-vs-effort matrix,
  filterable by category, hover-linked to the plot. This is the opportunity space from
  which we pick **one or two lighthouse use cases** to prove together.
- **Live board dashboard** — seeded with realistic, internally-consistent Apex-scale data
  (revenue actual vs budget vs forecast, AUM by region, revenue by service line,
  AI-drafted variance commentary). Hand-rolled SVG charts.
- **Board-pack generator** — pick a document, period and tone; watch AI draft a
  board-ready narrative live, with every figure pulled from the dashboard numbers.
- **Ask your numbers** — a working conversational engine: ask in plain English, get an
  answer computed from the demo numbers with a source citation for every figure.
- **ROI value calculator** — drag your own inputs; see capacity returned, FTE-equivalents
  and payback vs a lighthouse. Grounded, deliberately conservative defaults.
- **Sponsor scorecard** — maps each capability to the PE metrics the board watches
  (adjusted EBITDA, synergy, cash conversion, covenant headroom, exit-readiness).
- **Governance & trust** — the guardrails (human-in-the-loop, data residency, audit trail,
  model-risk) that let a controls-heavy group move fast.
- **The evidence** — 16 filterable, sourced third-party benchmarks (McKinsey, Gartner,
  KPMG, Deloitte, BCG, AFP, Hackett).
- **Why us** — competitive market-map (vs strategy houses & software vendors) and the
  "complement to your own AI" positioning.
- **Partnership model** — phased: land 1–2 → prove ROI → strategy/roadmap → train to AI-native.

## Run it

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8099
# open http://localhost:8099/index.html
```

(Data is loaded via `fetch`, so use a local server rather than opening the file directly.)

## Design

Editorial "paper" aesthetic on the Apex palette:
- Off-white paper background (`#f7f3ea`) with subtle grain.
- Apex signature **Solar Flare gold** `#f6b717` as the accent; ink black for type.
- Data-viz secondary palette: green `#0dc182`, blue `#4e98f9`, purple `#a145e4`,
  orange `#dd7027`, red `#dd2748`.
- Type: **Fraunces** (serif display) + **Inter** (body) + **IBM Plex Mono** (labels).

## Structure

```
index.html                 # the microsite
assets/css/style.css       # editorial design system
assets/js/main.js          # interactions, SVG charts, generator (vanilla JS, no deps)
assets/data/demo.json      # seeded FP&A / board dashboard dataset
assets/data/usecases.json  # capability-map use-case catalogue (22 use cases)
CLAUDE.md                  # build notes & progress tracker
```

## Note on data
All figures in the dashboard and generator are **illustrative and synthetic**, sized to be
plausible for a group of Apex's scale — for demonstration only, not Apex financials.
Brand colours are used in the spirit of Apex's visual identity.
