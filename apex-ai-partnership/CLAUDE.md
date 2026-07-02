# Apex Group — AI Transformation Partnership Pitch

Interactive web proposal pitching us as Apex Group's AI transformation partner.
Audience: deputy CFO / FP&A leader at Apex Group (global fund-administration firm,
~$3T+ AUA, grown through 40+ acquisitions). They use no AI today but are keen.

## Hard constraints (from the brief)

- **Do NOT pitch close-of-books acceleration or booking-adjustment automation.**
  Their close is deliberately slow and well-controlled across many systems —
  respect the controls, position AI *around* them, never inside them.
- Sweet spots they explicitly want: **board pack automation, Excel workbooks,
  deck generation** — plus anything "incredible" (art of the possible).
- Structure: capability map → they pick 1–2 use cases → we implement → then
  strategy, transformation roadmap, training & education for wider deployment.
- Visual: Apex Group brand colours, but **editorial** feel — off-white paper
  background, Apex accent colours, serif display type, generous whitespace.
- Seeded with plausible (clearly-labelled illustrative) data; must include a
  **functional interactive dashboard**.
- Everything lives in this folder (`apex-ai-partnership/`), built from scratch,
  no reuse of the surrounding repo (which is an unrelated Vite profile site).

## Architecture

Static site, zero build step — open `index.html` in a browser.

- `index.html` — the editorial pitch: hero, why-now, capability map (interactive),
  engagement model (crawl→walk→run), why us, CTA.
- `dashboard.html` — the "art of the possible" working demo: FP&A command centre
  with seeded data, AI commentary streaming, board-pack generator, ask-your-P&L
  natural-language box, workbook risk scanner.
- `assets/css/tokens.css` — design tokens (Apex brand + editorial system).
- `assets/css/main.css` — shared layout/typography/components.
- `assets/js/data.js` — the seeded dataset (single source of truth for both pages).
- `assets/js/charts.js` — hand-rolled SVG chart helpers (no chart library).
- `assets/js/dashboard.js`, `assets/js/pitch.js` — page behaviour.

## Design system

- Paper background `#faf7f2`-ish off-white; ink near-black.
- Apex accent colours: verify exact hex from apexgroup.com research
  (expected: deep navy/dark primary + bright yellow accent).
- Fonts: serif display (e.g. Fraunces/Playfair-class) + neutral sans for UI/data,
  loaded from Google Fonts with system fallbacks.
- Data-viz follows the dataviz skill rules: validated categorical palette
  (validator run against the paper surface), one axis, thin marks, legends for
  ≥2 series, tooltips, no dual axes, illustrative-data labelling.

## Progress log

- [x] 2026-07-02 Branch `claude/apex-ai-transformation-pitch-nyokqh`, folder scaffolded.
- [x] 2026-07-02 Research workflow launched (Apex brand/business, genaipi.org &
      pitch playbooks, finance-AI use cases + benchmarks, demo craft).
- [ ] Research synthesised into `research/NOTES.md`.
- [ ] Design tokens + palette validated.
- [ ] Seeded dataset authored (`data.js`).
- [ ] Pitch page built.
- [ ] Dashboard demo built.
- [ ] Verified in headless Chromium (screenshots, console clean).
- [ ] Committed & pushed.

## Session notes

- Ambiguity resolved: brief said "we should do anything relating directly to close
  acceleration" immediately after describing close as well-controlled — read as
  "should NOT". The pitch explicitly frames "we don't touch your close" as a
  trust point.
