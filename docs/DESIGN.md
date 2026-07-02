# LUCA design contract — "The Examiner's Folio"

The interface is a meticulously typeset case file that happens to be interactive: a private
bank's annual report crossed with a broadsheet ledger and a rare-books catalog. Full rationale
in `docs/research/research-design.json` — read it.

## Non-negotiables

- **Never pure white, never #000, never cool grays.** Paper `#F7F3EA`, raised sheet `#FBF8F1`,
  well `#EFE8D9`, hover wash `#E6DECB`. Ink `#1C1B16`, secondary `#57534A`, faint `#8A8375`.
- **One authoritative color:** bottle green `#1E3A2F` (hover `#142B22`, secondary series
  `#2E5943`, wash `#DCE5DD`). Brass `#9C7C46`/`#C4A96B` for exhibit numbers, masthead rules,
  gilt details — under 5% of any screen. Oxblood `#6E2B31` (+wash `#F3E4DE`) ONLY for flags
  and adverse findings. Ledger: credit `#2F5D45`, debit `#8C3A3D` (accountant's parentheses).
- **Type:** Fraunces (display; 350–400 large, 600 small-caps labels), Newsreader (body,
  true italics for marginalia), IBM Plex Mono 400/500 for EVERY numeral, account number,
  date-in-table, money figure. Fonts loaded in index.html.
- **No** rounded corners >2px, no drop shadows beyond `.shadow-sheet`, no gradients, no
  glassmorphism, no zebra striping, no spring/bounce/parallax animation, no SaaS blue.
- **Motion:** opacity fades and 4–8px vertical settles, 120–200ms, ease-out. Totals may
  tick digit-by-digit (mono keeps width stable). Rules may draw themselves in (300ms).

## Tailwind tokens (already configured in tailwind.config.ts)

Colors: `paper`, `paper-raised`, `paper-well`, `paper-hover`, `ink`, `ink-secondary`,
`ink-faint`, `green`, `green-deep`, `green-soft`, `green-wash`, `brass`, `brass-light`,
`oxblood`, `oxblood-wash`, `credit`, `debit`.
Fonts: `font-display`, `font-body`, `font-mono`.
Sizes: `text-caption/table/body/section/page/display/hero`. Max width: `max-w-folio` (1240px).

CSS classes in `src/index.css`: `.label-caps`, `.rule-hairline`, `.rule-oxford`,
`.rule-oxford-brass`, `.rule-subtotal`, `.rule-total` (double rule under grand totals),
`.figure`, `.figure-debit`, `.figure-credit`, `.row-flagged`, `.sheet`, `.marginalia`,
`.transition-ink`.

## Grammar

- **Tables:** right-align numerics, tabular mono, column heads in `.label-caps` with hairline
  beneath; NO vertical column rules; hairlines between row groups, not every row; negative
  amounts in debit color with accountant's parentheses `(1,240.00)`; single rule above
  subtotals, DOUBLE rule (`.rule-total`) under final totals; currency symbol in the column
  head, not per cell; generous 12–14px row padding; row hover = paper-hover wash, no shadow.
- **Flags:** 2px oxblood left rule + oxblood wash + superscript dagger (†) linking to a finding.
- **Charts (Recharts):** 1.25–1.5px strokes, green primary, brass/green-soft secondary,
  oxblood for flagged periods; NO gridline lattice (baseline + at most 2–3 dotted labeled
  reference lines); no legends — direct labels at line termini; area fills ≤5% green tint;
  bars square-cornered with 1px ink outline; tooltips = small paper card, hairline border.
- **Page headers:** report mastheads — kicker in brass small caps ("Schedule 3"), title in
  Fraunces, matter number in Plex Mono, Oxford rule beneath.
- **Chrome:** folio conventions — section numbers (§), exhibit marks ("Ex. 12"), audit tick
  marks (F footed, T traced, V vouched), "Prepared by / Reviewed by" fields.
- **Footer on every page:** "Prepared for Masin Advisory Group, LLC — Risk & Resolution ·
  Houston, Texas" + "Synthetic demonstration data — no real persons or accounts." +
  "CONFIDENTIAL — DRAFT FOR DISCUSSION" stamp treatment.

## Voice

Echo Masin's language (see research-brand.json): "rigor and neutrality", "from ambiguity to
alignment", financial neutrality, mediation-ready, Daubert-defensible. The engine is the
neutral's instrument, not an advocate's weapon. Position AI as staff-level preparer;
practitioner signs as reviewer.
