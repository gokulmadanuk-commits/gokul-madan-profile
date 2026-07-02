# LUCA — Forensic Income Reconstruction Engine

A demo platform built for **Masin Advisory Group — Risk & Resolution** (Houston, TX).
Named for Luca Pacioli, the father of double-entry bookkeeping.

The engine automates the three court-recognized indirect methods of proving unreported
income — **Net Worth**, **Expenditures (Source & Application of Funds)**, and **Bank
Deposits** — plus **Texas separate-property tracing** through commingled accounts
(community-out-first / Sibley, minimum sum balance, clearinghouse).

## The Case (synthetic, deterministic)

**Matter 2025-0147 — In re the Marriage of Delaney** (Harris County, TX, 311th District Court).
Masin Advisory R&R engaged by counsel for Petitioner **Sarah W. Delaney** to (1) reconstruct
the true income of Respondent **Marcus T. Delaney**, owner of **Delaney Mechanical Services LLC**
(commercial HVAC contractor, Houston), and (2) trace Sarah's separate-property inheritance
through a commingled account.

**Analysis period:** 2022-01-01 → 2024-12-31 (36 months). Opening net worth firmly
established at 2021-12-31 (the Holland "firm starting point").

### The numbers (targets the data generator must hit, ±2%)

| | 2022 | 2023 | 2024 |
|---|---|---|---|
| Reported income (returns) | $138,500 | $141,200 | $143,800 |
| True lifestyle spend | ~$385,000 | ~$412,000 | ~$438,000 |
| Understatement (all 3 methods converge ±5%) | ~$230k | ~$265k | ~$285k |

### Accounts (7)

| id | Institution | Account | last4 | Owner | Disclosed |
|---|---|---|---|---|---|
| frost-checking | Frost Bank | Personal Checking | 4417 | joint | yes |
| frost-savings | Frost Bank | Premier Savings | 8823 | joint (commingled) | yes |
| chase-biz | Chase | Business Complete Checking (Delaney Mechanical Services LLC) | 3301 | entity | yes |
| amex | American Express | Platinum Card | 71002 | subject | yes |
| sapphire | Chase | Sapphire Reserve | 5566 | joint | yes |
| fidelity | Fidelity | Brokerage Z40-118226 | 8226 | joint | yes |
| prosperity-bluebonnet | Prosperity Bank | Business Checking (Bluebonnet Holdings LLC) | 9174 | entity | **no — discovered** |

### Story beats encoded in the transactions

1. **Cash deposits / structuring:** recurring cash deposits to frost-checking, $6,800–$9,700,
   2–3×/month — consistently just under $10,000 (CTR threshold). Tagged `cash-deposit`, some `structuring-flag`.
2. **Bluebonnet funnel:** Bluebonnet Holdings LLC formed 2023-03-14 (TX SOS Certificate of
   Formation, doc). Receives checks from side jobs + transfers from chase-biz labeled
   "LOAN REPAYMENT" (no loan exists). 2023-08-18: $385,000 wire to Gulf Coast Title Co. —
   cash purchase of a Galveston rental (4210 Seawall Blvd Unit 502; closing statement doc).
   Rental income (~$2,800/mo, undeclared) flows back in from 2023-10.
3. **Separate property:** 2022-06-15 Sarah deposits $250,000 — Estate of Margaret H. Whitmore
   (her mother; executor letter doc) — into frost-savings, which already holds and continues
   to receive community funds. Withdrawals follow; balance hits a minimum of ~$187,340
   (2023-11-17) then recovers to ~$233,000 at 2024-12-31. Minimum sum balance ⇒ $187,340
   retains separate character; community-out-first ledger shows every withdrawal consuming
   community first.
4. **Lifestyle:** Tanglewood home mortgage (~$6,400/mo, Cadence Bank), Kinkaid School tuition
   (2 kids, ~$2,900/mo eq.), Bayou Oaks Country Club, Aspen/Cabo travel, Range Rover +
   Porsche payments, heavy Amex spend (dining, retail, travel).
5. **Transfers:** legitimate inter-account transfers (checking→savings, checking→card payments,
   checking→fidelity) all carry `transferGroup` so the Bank Deposits engine strips them.

### Assets & liabilities (year-end schedule, for Net Worth Method)

Assets: Tanglewood residence ($1.45M basis, fixed at cost per method), Galveston rental
(from 2023: $385k), vehicles (Range Rover, Porsche 911 — declining), Fidelity brokerage
(cost basis), bank balances (from ledger), Delaney Mechanical member interest (fixed $220k).
Liabilities: Cadence mortgage (amortizing from $980k), auto notes, credit-card balances at year-end.

## Architecture

- **Vite + React + TS SPA**, react-router, Tailwind (custom editorial theme), Recharts.
- `src/lib/types.ts` — the data contract (single source of truth).
- `scripts/generate-case.ts` — seeded deterministic generator → `src/data/case.json` (~2,500 txns).
  Seeded PRNG (mulberry32), NO Math.random. Run: `npm run gen:case`.
- `scripts/generate-documents.ts` — pdf-lib → `public/documents/*.pdf` (~150 docs, 300+ pages:
  monthly bank/card statements, brokerage quarterlies, SOS formation, closing statement,
  executor letter, 1040 summaries) + manifest merged into case.json documents[]. Run: `npm run gen:docs`.
- `src/engines/` — pure functions, unit-tested with vitest:
  - `netWorth.ts`, `expenditures.ts`, `bankDeposits.ts` (convergence), `lifestyle.ts` (category spend vs declared), `flows.ts` (asset tracing graph), `separateProperty.ts` (community-out-first running ledger, minimum sum balance, clearinghouse scan).
- Every transaction carries provenance `{docId, page, line}` + extraction `confidence` —
  every ledger row links back to the exact statement PDF page.

### Pages (react-router)

1. `/` — The Matter. Editorial cover: case caption, the punchline stat ("lives on $412k, reports $141k"), engagement summary, navigation styled like a report table of contents.
2. `/ledger` — Ingestion & Unified Ledger. Demo moment: 150 documents / 300+ pages → one ledger. Animated ingestion sequence, then filterable/searchable ledger with provenance links.
3. `/lifestyle` — Lifestyle Analysis. Category spend vs declared income, per-year; the $412k/$141k gap.
4. `/methods` — The Three Methods. Net worth schedule (classic court exhibit layout), expenditures schedule, bank deposits schedule, convergence chart.
5. `/tracing` — Follow the Money. Flow map accounts→entities; Bluebonnet funnel to Galveston property; structuring timeline.
6. `/separate` — Separate Property (Texas). Commingled account ledger with community/separate columns, minimum-balance chart, Sibley community-out-first, clear-and-convincing summary.
7. `/documents` — The Evidence Room. Exhibit index + embedded PDF viewer.

### Design language (editorial luxury)

Tokens per docs/DESIGN.md: paper `#F7F3EA`, ink `#1C1B16`, bottle green `#1E3A2F`,
brass accent, oxblood for flags/debits. Fraunces (display serif), Newsreader (body),
IBM Plex Mono (tabular figures). Hairline rules, broadsheet tables, no SaaS chrome.
Footer: "Prepared for Masin Advisory Group — Risk & Resolution · Houston, Texas.
Synthetic demonstration data."

## Verification

`npm test` (vitest): engine unit tests on small fixtures AND invariant tests against the
generated case.json (three methods converge within 5%; ledger balances tie to statement
ending balances; transfer legs net to zero; minimum-balance result matches hand-computed value).
`npm run build` must pass clean.
