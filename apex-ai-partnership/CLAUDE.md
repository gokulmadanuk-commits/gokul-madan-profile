# CLAUDE.md — Apex Group AI Transformation Partnership Pitch

> Progress tracker + build notes. Read this first when resuming a session.

## What this is
An **interactive, editorial-feeling web microsite** that pitches **[gokul / our firm]** to
**Apex Group** (apexgroup.com) as their **AI transformation partner** — not a single product.

**Audience:** the person second-in-line to Apex's CFO, heavily involved in FP&A. Keen on AI,
but the org uses **zero AI today**. Controls-heavy. Wants to see the *art of the possible*.

**The condition to meet:** a working, interactive proposal that (a) shows Apex the art of
the possible with AI, and (b) proves we're the right partner to deliver it.

## Hard constraints (from the brief)
- **Do NOT pitch financial close acceleration / journal & adjustment booking.** Those are
  well-controlled multi-system processes and are off-limits. Focus AI on: **board packs,
  Excel/workbook automation, decks/narratives, FP&A analytics, forecasting, investor/client
  reporting, finance knowledge assistants.**
- **Design:** editorial magazine feel. **Off-white "paper" background**, Apex accent colours.
  Apex brand = black + signature **"Solar Flare" gold `#F6B717`**. Secondary palette:
  green `#0DC182`, blue `#4E98F9`, purple `#A145E4`, orange `#DD7027`, red `#DD2748`.
- **Structure the story as a capability map** → pick 1–2 lighthouse use cases to implement →
  prove value → then build strategy / transformation / roadmap incl. training & education.
  (Mirrors genaipi.org's fractional-CAIO / 90-day-roadmap / train-to-AI-native model.)
- Seed the demo with **real-looking data** so the dashboard is functional.
- Build **from scratch** in this folder. Do not reuse existing repo (gokul profile) materials.

## Tech approach
- **Vanilla HTML/CSS/JS**, no build step (open `index.html` directly or deploy static).
- Hand-rolled **SVG charts** (no heavy CDN dependency) for the editorial custom look.
- Single-page scrolling narrative + interactive demos.

## File map
- `index.html` — the microsite (single page, sectioned narrative)
- `assets/css/style.css` — design system + layout
- `assets/js/main.js` — interactions, charts, demo generators
- `assets/data/demo.json` — seeded FP&A / board-pack demo dataset
- `assets/data/usecases.json` — capability-map use-case catalogue
- `CLAUDE.md` — this file

## Site sections (narrative arc)
1. Hero — "An AI transformation partner for Apex finance"
2. The moment / why now (art of the possible framing)
3. Art of the possible — signature "wow" automations
4. Interactive Capability Map — value-vs-effort matrix + filterable use-case catalogue
5. Live Dashboard demo — seeded board-pack/FP&A dashboard with SVG charts
6. Board-pack / commentary generator — interactive demo
7. Partnership model — phased: land 1–2 → prove → strategy/roadmap → train to AI-native
8. Why us / close + CTA

## Progress log
- [x] Branch confirmed: `claude/apex-ai-transformation-pitch-vukjue`
- [x] Folder scaffolded, brand palette confirmed (Solar Flare gold + editorial paper)
- [x] Research workflow launched + completed (6 agents: Apex profile, partnership model,
      use cases, demo data, design brief, synthesis). Brief independently validated the
      whole approach (same file structure, palette, narrative arc, scoping).
- [x] Build brief synthesized → content locked
- [x] Design system CSS (`assets/css/style.css`)
- [x] index.html — all 8 sections built with grounded copy + research stats
- [x] SVG charts (trend line/area, AUM donut, segment bars) + interactions (reveal, counters,
      nav-spy, capability-map filter + matrix hover-link)
- [x] Interactive board-pack/commentary generator — period-aware, pulls figures from demo.json
- [x] QA pass: headless Playwright — all dynamic sections render (22 UC, 8 KPI, charts,
      generator), no JS errors, mobile has no horizontal overflow, generator figures consistent
- [x] README.md added
- [ ] Commit + push to branch  ← final step

## Research artifacts (for future sessions)
- Full synthesized build brief: `/tmp/.../tasks/w8isa7meb.output` (session-scoped; may expire)
- Key facts baked into the site: Apex is PE-owned (Genstar majority) roll-up, 22+ acquisitions,
  ~13k staff, ~94 offices, ~$2.75–3.5T AUA. Buyer = Group FC / Head of FP&A, owns the board
  pack, no AI today, keen. Pain = back-half-of-close pack assembly & commentary. Stats used:
  FP&A ~46% time on data / ~35% on insight; ~80% of pack identical MoM; 57% first AI use is
  report-writing; <20% of firms scaled beyond pilots.

## If resuming / iterating
- Serve locally: `python3 -m http.server 8099` in this folder, open index.html.
- Headless QA harness pattern: import playwright from `/opt/node22/lib/node_modules/playwright`
  (CommonJS: `import pw from '...'; const {chromium}=pw;`), executablePath `/opt/pw-browsers/chromium`.
- All content is either static copy in index.html or driven by the two JSON files in assets/data.

## Branch / git
- Develop + push to `claude/apex-ai-transformation-pitch-vukjue`. `git push -u origin <branch>`.
- Do NOT open a PR unless explicitly asked.
