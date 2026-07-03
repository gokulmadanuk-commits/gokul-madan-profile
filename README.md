# LUCA — Forensic Income Reconstruction Engine

Prepared for **Masin Advisory Group — Risk & Resolution** · Houston, Texas.

LUCA (named for Luca Pacioli, the father of double-entry bookkeeping) is a demonstration
platform that automates forensic income reconstruction for litigation support. It ingests
a corpus of institution-branded financial documents — bank statements, card statements,
brokerage quarterlies, closing statements, formation filings — into a single provenance-linked
ledger, then runs the analyses a forensic accountant would present as court exhibits.

## The methods

LUCA implements the three court-recognized **indirect methods** of proving unreported income,
run independently so their convergence corroborates the finding: the **Net Worth Method**
(year-over-year change in net worth plus nondeductible living expenses, less reported income,
against a firmly established opening net worth), the **Expenditures Method** (source and
application of funds — total outlays that reported sources cannot fund), and the **Bank
Deposits Method** (total deposits across all accounts, stripped of inter-account transfers
and non-income items). Alongside these, LUCA performs **Texas separate-property tracing**
through a commingled account: the community-out-first presumption (*Sibley*), the minimum
sum balance method, and a clearinghouse scan — building the clear-and-convincing record
required to overcome the community presumption.

## The demo case

**Matter 2025-0147 — In re the Marriage of Delaney**, 311th District Court, Harris County, TX.
Respondent Marcus T. Delaney (owner of Delaney Mechanical Services LLC, a Houston commercial
HVAC contractor) reports ~$141k/yr while living on ~$412k. The ledger encodes sub-$10,000
cash-deposit structuring, an undisclosed entity (Bluebonnet Holdings LLC) funneling funds
into a $385,000 cash purchase of a Galveston rental, and Petitioner Sarah W. Delaney's
$250,000 inheritance commingled into a joint savings account — traced to a $187,340 minimum
sum balance that retains its separate character. All three indirect methods converge on the
understatement within 1%.

## Quickstart

```bash
npm install       # install dependencies
npm run gen       # regenerate the case ledger (case.json) and the PDF evidence corpus
npm run dev       # start the dev server
npm test          # engine unit tests + invariant tests against the generated case
npm run build     # production build
```

## Architecture

```
scripts/
  generate-case.ts       seeded deterministic generator → src/data/case.json (2,087 txns)
  generate-documents.ts  pdf-lib → public/documents/*.pdf (220 exhibits) + manifest
src/
  lib/types.ts           the data contract (single source of truth)
  lib/caseData.ts        typed accessor over case.json
  lib/format.ts          money (integer cents), dates, tabular formatting
  engines/               pure, unit-tested analysis functions
    netWorth.ts          net worth method schedule
    expenditures.ts      source & application of funds
    bankDeposits.ts      deposits method + transfer stripping
    lifestyle.ts         category spend vs. declared income
    flows.ts             account/entity flow graph (asset tracing)
    separateProperty.ts  community-out-first ledger, minimum sum balance, clearinghouse
  components/            editorial kit: Layout, PageHeader, ScheduleTable, ExhibitFrame…
  pages/                 § I–VII: Matter, Ledger, Lifestyle, Methods, Tracing,
                         Separate Property, Evidence Room
```

All money is handled in integer cents; dates are ISO `YYYY-MM-DD`. Every transaction carries
provenance (`docId`, page, line) linking it back to the exact statement PDF page.

## Disclaimer

**All data is synthetic.** Every person, entity, account, institution document, and
transaction in this demonstration is fabricated by a seeded deterministic generator.
No real persons, entities, or accounts are depicted.

---

Prepared for Masin Advisory Group — Risk & Resolution.
