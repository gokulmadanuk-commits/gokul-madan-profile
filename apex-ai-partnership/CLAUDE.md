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
- [x] Research synthesised into `research/NOTES.md` (Apex brand = #EF6419 orange
      per Brandfetch — navy/yellow memory debunked; real Fitch financials:
      ~$1.5bn revenue, 31%→35% margin march, 7.6x→5.8x deleveraging; CFO
      DeTrask "future-looking finance function" mandate; GenAI PI STE model).
- [x] Design tokens + categorical palette validated (dataviz six-checks, all
      PASS on paper surface #FAF8F3).
- [x] Seeded dataset authored (`data.js`) — June 2026 close, every view foots;
      self-check IIFE runs clean.
- [x] Pitch page built (`index.html`) — 8 acts, interactive capability map
      (grid/list, filters, drawer), engagement timeline, 14 footnoted sources.
- [x] Dashboard demo built (`dashboard.html`) — #command (KPIs, T12 charts,
      EBITDA bridge + streamed AI commentary), #ask (7 worked answers, fuzzy
      free-text fallback), #boardpack (animated pipeline → printable pack),
      #workbook (scanner with 6 findings on a fee-model grid).
- [x] Integration pass fixed one real bug (dash:true rendered budget lines
      solid) and verified number ties, links, footnotes, console cleanliness.
- [x] Verified end-to-end in headless Chromium (11 screenshots reviewed,
      console clean, print-pack mode works, all four modules driven).
- [x] Committed & pushed to `claude/apex-ai-transformation-pitch-nyokqh`.

## Known follow-ups (next session)

- Verify #EF6419 against apexgroup.com in real devtools (site was 403-blocked
  from this environment; Brandfetch is third-party).
- Contact block uses Gokul Madan / gokulmadan2@gmail.com — confirm the firm
  name/brand to present under before the meeting.
- Revenue T12 legend shows Budget/Prior-year with same grey swatch (dash
  disambiguates in-plot) — acceptable, could add dashed legend swatches.
- Optional: deploy (e.g. Vercel/GitHub Pages) for a shareable link; site is
  fully static and works from file://.

## Session notes

- Ambiguity resolved: brief said "we should do anything relating directly to close
  acceleration" immediately after describing close as well-controlled — read as
  "should NOT". The pitch explicitly frames "we don't touch your close" as a
  trust point.
