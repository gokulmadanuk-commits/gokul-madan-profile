/**
 * § IV — The Three Methods.
 *
 * The court-grade centerpiece: convergence exhibit, then the three classic
 * schedules (Net Worth per Holland; Source & Application of Funds; Bank
 * Deposits & Cash Expenditures per Gleckman), closed by the Holland
 * safeguards panel. Every figure is computed by the engines from the
 * unified ledger — nothing on this page is hand-keyed.
 */
import PageHeader from "../components/PageHeader";
import ScheduleTable from "../components/ScheduleTable";
import type { ScheduleColumn, ScheduleRow } from "../components/ScheduleTable";
import StatTile from "../components/StatTile";
import TickFigure from "../components/TickFigure";
import MarginNote from "../components/MarginNote";
import { caseFile } from "../lib/caseData";
import { usd, pct } from "../lib/format";
import {
  buildNetWorth,
  buildExpenditures,
  buildBankDeposits,
  buildConvergence,
  taxesPaid,
  isPersonalAccount,
  isDiscoveredEntityAccount,
  yearOf,
} from "../engines";

// ---------------------------------------------------------------------------
// Engine results — pure functions over static data, computed once at module load.
// ---------------------------------------------------------------------------

const nw = buildNetWorth(caseFile);
const ex = buildExpenditures(caseFile);
const bd = buildBankDeposits(caseFile);
const convergence = buildConvergence(nw, ex, bd);

const maxSpread = Math.max(...convergence.map((c) => c.spread));
const maxUnderstatement = Math.max(
  ...convergence.flatMap((c) => [c.netWorth, c.expenditures, c.bankDeposits]),
);

/** Federal income taxes paid per year (split out of the engine's PLE+tax add-back). */
const taxesByYear = new Map(nw.method.map((m) => [m.year, taxesPaid(caseFile, m.year)]));

/** Count of eliminated inter-account transfer deposit legs, per year, within
 *  the bank-deposits scope (personal checking/savings + discovered nominee). */
const bdScope = new Set(
  caseFile.accounts
    .filter(
      (a) =>
        (a.kind === "checking" || a.kind === "savings") &&
        (isPersonalAccount(a) || isDiscoveredEntityAccount(caseFile, a)),
    )
    .map((a) => a.id),
);
const transferCounts = new Map<number, number>();
for (const t of caseFile.transactions) {
  if (t.amount <= 0 || !t.transferGroup || !bdScope.has(t.accountId)) continue;
  const y = yearOf(t.date);
  transferCounts.set(y, (transferCounts.get(y) ?? 0) + 1);
}

const whitmoreExhibit =
  caseFile.documents.find((d) => d.id === "whitmore-estate-letter")?.exhibit ?? "Ex. 4";

// ---------------------------------------------------------------------------
// Schedule 1 — Net Worth Method (the classic Holland court schedule).
// ---------------------------------------------------------------------------

const nwColumns: ScheduleColumn[] = [
  { key: "item", label: "Item" },
  ...nw.schedule.map((col) => ({
    key: `y${col.year}`,
    label: `12/31/${String(col.year).slice(2)} ($)`,
    align: "right" as const,
  })),
];

const methodByYear = new Map(nw.method.map((m) => [m.year, m]));

/** One bridge cell per schedule column; the 2021 opening column stays blank. */
function bridgeCells(label: string, value: (y: number) => number | null): ScheduleRow["cells"] {
  return [label, ...nw.schedule.map((col) => (methodByYear.has(col.year) ? value(col.year) : null))];
}

const opening = nw.schedule[0];
const nwRows: ScheduleRow[] = [
  { id: "g-assets", kind: "group", cells: ["Assets — at cost", null, null, null, null] },
  ...opening.assets.map((asset, i) => {
    const nominee = asset.name.includes("Bluebonnet");
    return {
      id: `a-${asset.itemId}`,
      indent: 1 as const,
      flag: nominee,
      note: nominee ? "† Nominee entity surfaced in discovery — Ex. 5." : undefined,
      cells: [
        asset.name,
        ...nw.schedule.map((col) => col.assets[i].value),
      ],
    };
  }),
  {
    id: "t-assets",
    kind: "subtotal",
    cells: ["Total assets", ...nw.schedule.map((col) => col.totalAssets)],
  },
  { id: "g-liab", kind: "group", cells: ["Liabilities", null, null, null, null] },
  ...opening.liabilities.map((liab, i) => ({
    id: `l-${liab.itemId}`,
    indent: 1 as const,
    cells: [liab.name, ...nw.schedule.map((col) => col.liabilities[i].value)],
  })),
  {
    id: "t-liab",
    kind: "subtotal",
    cells: ["Total liabilities", ...nw.schedule.map((col) => col.totalLiabilities)],
  },
  {
    id: "t-nw",
    kind: "total",
    cells: ["Net worth — assets less liabilities", ...nw.schedule.map((col) => col.netWorth)],
  },
  {
    id: "g-bridge",
    kind: "group",
    cells: ["Determination of understatement", null, null, null, null],
  },
  {
    id: "b-increase",
    indent: 1,
    note: "Prior-column net worth subtracted.",
    cells: bridgeCells(
      "Increase in net worth",
      (y) => methodByYear.get(y)!.increase,
    ),
  },
  {
    id: "b-ple",
    indent: 1,
    cells: bridgeCells(
      "Add — Personal living expenditures",
      (y) => methodByYear.get(y)!.personalExpenditures - (taxesByYear.get(y) ?? 0),
    ),
  },
  {
    id: "b-tax",
    indent: 1,
    cells: bridgeCells("Add — Federal income taxes paid", (y) => taxesByYear.get(y) ?? 0),
  },
  {
    id: "b-nontax",
    indent: 1,
    note: `2022 — Estate of Margaret H. Whitmore distribution, see ${whitmoreExhibit}; residual amounts are documented refunds.`,
    cells: bridgeCells("Less — Nontaxable sources", (y) => -methodByYear.get(y)!.nontaxableSources),
  },
  {
    id: "b-cagi",
    kind: "subtotal",
    cells: bridgeCells(
      "Corrected adjusted gross income",
      (y) => methodByYear.get(y)!.totalApplication - methodByYear.get(y)!.nontaxableSources,
    ),
  },
  {
    id: "b-reported",
    indent: 1,
    note: "Per filed returns, Ex. 1–3.",
    cells: bridgeCells("Less — Income per filed return", (y) => -methodByYear.get(y)!.reportedIncome),
  },
  {
    id: "b-under",
    kind: "total",
    flag: true,
    cells: bridgeCells("Understatement of income", (y) => methodByYear.get(y)!.understatement),
  },
];

// ---------------------------------------------------------------------------
// Schedule 3 — Bank Deposits & Cash Expenditures (years as columns).
// ---------------------------------------------------------------------------

const bdColumns: ScheduleColumn[] = [
  { key: "item", label: "Item" },
  ...bd.years.map((y) => ({
    key: `y${y.year}`,
    label: `${y.year} ($)`,
    align: "right" as const,
  })),
];

const transferCountNote = bd.years
  .map((y) => `${transferCounts.get(y.year) ?? 0} items (${y.year})`)
  .join(" · ");

const bdRows: ScheduleRow[] = [
  {
    id: "deposits",
    note: "Frost checking ····4417 · Frost savings ····8823 · Prosperity ····9174 (Bluebonnet Holdings LLC, nominee).",
    cells: ["Total deposits — all scoped accounts", ...bd.years.map((y) => y.totalDeposits)],
  },
  {
    id: "transfers",
    indent: 1,
    note: `${transferCountNote} — every eliminated deposit is matched to its funding withdrawal by transfer group.`,
    cells: [
      "Less — Inter-account transfers eliminated",
      ...bd.years.map((y) => -y.interAccountTransfers),
    ],
  },
  {
    id: "nonincome",
    indent: 1,
    note: "Inheritance corpus and documented refunds — non-income character established.",
    cells: ["Less — Non-income deposits", ...bd.years.map((y) => -y.nonIncomeDeposits)],
  },
  {
    id: "net",
    kind: "subtotal",
    cells: ["Net deposits from income", ...bd.years.map((y) => y.netDeposits)],
  },
  {
    id: "cash",
    indent: 1,
    note: "Currency analysis reconciles — no outlay traced to undeposited cash.",
    cells: [
      "Add — Cash expenditures from undeposited currency",
      ...bd.years.map((y) => y.cashExpenditures),
    ],
  },
  {
    id: "reported",
    indent: 1,
    cells: ["Less — Income per filed return", ...bd.years.map((y) => -y.reportedIncome)],
  },
  {
    id: "under",
    kind: "total",
    flag: true,
    cells: ["Understatement of income", ...bd.years.map((y) => y.understatement)],
  },
];

// ---------------------------------------------------------------------------
// Holland safeguards.
// ---------------------------------------------------------------------------

const safeguards = [
  {
    id: "start",
    title: "Firm starting point",
    body: "Opening net worth fixed at 12/31/2021 from third-party records — statement balances, deed and note documentation; opening cash on hand corroborated.",
  },
  {
    id: "source",
    title: "Likely source",
    body: "A cash-intensive commercial HVAC contracting business with recurring sub-$10,000 currency deposits — the likely taxable source Holland requires.",
  },
  {
    id: "leads",
    title: "Leads followed",
    body: `Nontaxable sources identified and removed from every computation — the Whitmore estate distribution (${whitmoreExhibit}) and documented refunds.`,
  },
  {
    id: "convergence",
    title: "Convergence of methods",
    body: `Three independent computations from the same records agree within ${pct(maxSpread)} in every year — the result is not a method artifact.`,
  },
];

// ---------------------------------------------------------------------------
// Presentation helpers.
// ---------------------------------------------------------------------------

function SectionHead({
  kicker,
  title,
  cite,
}: {
  kicker: string;
  title: string;
  cite: string;
}) {
  return (
    <div className="mb-6 mt-16">
      <div className="flex items-baseline justify-between gap-6">
        <p className="label-caps text-brass">{kicker}</p>
        <p className="hidden font-mono text-caption text-ink-secondary sm:block">{cite}</p>
      </div>
      <h2 className="mt-1.5 font-display text-section text-ink" style={{ fontWeight: 400 }}>
        {title}
      </h2>
      <div className="rule-hairline mt-3" aria-hidden="true" />
    </div>
  );
}

const barSeries = [
  { key: "netWorth" as const, label: "Net worth", color: "#1E3A2F" },
  { key: "expenditures" as const, label: "Expenditures", color: "#2E5943" },
  { key: "bankDeposits" as const, label: "Bank deposits", color: "#9C7C46" },
];

function ConvergenceBars() {
  return (
    <div className="space-y-8">
      {convergence.map((c) => (
        <div key={c.year} className="flex gap-6">
          <p className="w-12 shrink-0 pt-0.5 font-mono text-table text-ink">{c.year}</p>
          <div className="min-w-0 flex-1 space-y-2.5">
            {barSeries.map((s) => {
              const value = c[s.key];
              const width = (value / maxUnderstatement) * 100;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <p className="label-caps w-28 shrink-0 text-ink-secondary">{s.label}</p>
                  <div className="relative h-2 flex-1">
                    <div
                      className="h-full"
                      style={{ width: `${width}%`, backgroundColor: s.color }}
                    />
                  </div>
                  <p className="figure w-24 shrink-0 text-right text-table">{usd(value)}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page.
// ---------------------------------------------------------------------------

export default function Methods() {
  return (
    <>
      <PageHeader
        kicker="Section IV · Matter 2025-0147"
        title="The Three Methods"
        lede="Income must go somewhere: into assets, spending, or bank accounts. Three independent computations from the same records."
        exhibit="Schedules 1–3"
      />
      <p className="-mt-4 mb-12 font-mono text-caption tracking-[0.04em] text-ink-secondary">
        IRM 4.10.4 · Holland v. United States, 348 U.S. 121 (1954) · Gleckman v. United States,
        80 F.2d 394 (8th Cir. 1935)
      </p>

      {/* -- (a) Convergence exhibit -------------------------------------- */}
      <section className="animate-settle" aria-label="Convergence of the three methods">
        <div className="mb-6 flex items-baseline justify-between gap-6">
          <p className="label-caps text-ink">Convergence of independent computations</p>
          <p className="hidden font-mono text-caption text-ink-secondary sm:block">
            understatement by method, per year
          </p>
        </div>
        <ConvergenceBars />
        <MarginNote className="mt-5">
          Maximum divergence: {pct(maxSpread)} — the result is not an artifact of any one method.
        </MarginNote>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <StatTile
            label="Net worth method · 2022–24"
            value={<TickFigure cents={nw.totalUnderstatement} />}
            note="Holland v. United States — assets at cost."
            tone="adverse"
          />
          <StatTile
            label="Expenditures method · 2022–24"
            value={<TickFigure cents={ex.totalUnderstatement} />}
            note="Source & application of funds — IRM 4.10.4."
            tone="adverse"
          />
          <StatTile
            label="Bank deposits method · 2022–24"
            value={<TickFigure cents={bd.totalUnderstatement} />}
            note="Gleckman — net deposits from income."
            tone="adverse"
          />
        </div>
      </section>

      {/* -- (b) Schedule 1 — Net Worth ------------------------------------ */}
      <section aria-label="Schedule 1 — Net Worth Method">
        <SectionHead
          kicker="Schedule 1"
          title="Net Worth Method"
          cite="Holland v. United States, 348 U.S. 121 (1954)"
        />
        <ScheduleTable
          columns={nwColumns}
          rows={nwRows}
          caption="Assets stated at historical cost per Holland — unrealized appreciation is not income. Opening column 12/31/21 is the firm starting point; each year's increase is bridged to corrected adjusted gross income and compared to the filed return."
        />
      </section>

      {/* -- (c) Schedule 2 — Source & Application of Funds ---------------- */}
      <section aria-label="Schedule 2 — Source and Application of Funds">
        <SectionHead
          kicker="Schedule 2"
          title="Source & Application of Funds"
          cite="United States v. Johnson, 319 U.S. 503 (1943) · IRM 4.10.4"
        />
        <div className="space-y-12">
          {ex.years.map((y) => (
            <div key={y.year}>
              <p className="label-caps mb-4 text-ink">
                Year ended December 31, {y.year}
              </p>
              <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-2">
                <ScheduleTable
                  columns={[
                    { key: "app", label: "Applications of funds" },
                    { key: "amt", label: `${y.year} ($)`, align: "right" },
                  ]}
                  rows={[
                    ...y.applications.map((a, i) => ({
                      id: `app-${y.year}-${i}`,
                      indent: 1 as const,
                      cells: [a.label, a.amount] as (string | number)[],
                    })),
                    {
                      id: `app-total-${y.year}`,
                      kind: "total",
                      cells: ["Total applications of funds", y.totalApplications],
                    },
                  ]}
                />
                <ScheduleTable
                  columns={[
                    { key: "src", label: "Known sources of funds" },
                    { key: "amt", label: `${y.year} ($)`, align: "right" },
                  ]}
                  rows={[
                    ...y.knownSources.map((s, i) => ({
                      id: `src-${y.year}-${i}`,
                      indent: 1 as const,
                      cells: [s.label, s.amount] as (string | number)[],
                    })),
                    {
                      id: `src-sub-${y.year}`,
                      kind: "subtotal",
                      cells: ["Total known sources of funds", y.totalKnownSources],
                    },
                    {
                      id: `src-under-${y.year}`,
                      indent: 1,
                      flag: true,
                      note: "† Applications in excess of known sources — unreported income.",
                      cells: ["Understatement of income", y.understatement],
                    },
                    {
                      id: `src-total-${y.year}`,
                      kind: "total",
                      cells: ["Total sources, as corrected", y.totalKnownSources + y.understatement],
                    },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>
        <MarginNote className="mt-6">
          The T-presentation balances: total applications equal known sources plus the
          understatement. A one-period cash-flow restatement of the net worth method — best
          suited to a subject who consumes rather than accumulates.
        </MarginNote>
      </section>

      {/* -- (d) Schedule 3 — Bank Deposits & Cash Expenditures ------------- */}
      <section aria-label="Schedule 3 — Bank Deposits and Cash Expenditures">
        <SectionHead
          kicker="Schedule 3"
          title="Bank Deposits & Cash Expenditures"
          cite="Gleckman v. United States, 80 F.2d 394 (8th Cir. 1935)"
        />
        <ScheduleTable
          columns={bdColumns}
          rows={bdRows}
          caption="Scope: personal checking and savings accounts plus the discovered nominee-entity account. The disclosed operating company and brokerage are excluded."
        />
        <MarginNote className="mt-4">
          Transfer-elimination discipline: the classic attack on a bank-deposits computation is
          the double-counted transfer. Every inter-account movement in the unified ledger carries
          a transfer group binding both legs; each deposit eliminated above is matched, item for
          item, to the withdrawal that funded it before any dollar is treated as income.
        </MarginNote>
      </section>

      {/* -- (e) Holland safeguards ----------------------------------------- */}
      <section aria-label="Holland safeguards">
        <SectionHead
          kicker="Safeguards"
          title="Holland Safeguards"
          cite="348 U.S. 121, 125–129 (1954)"
        />
        <div className="sheet">
          {safeguards.map((s, i) => (
            <div
              key={s.id}
              className={
                i > 0
                  ? "grid grid-cols-[auto_11rem_1fr] items-baseline gap-x-5 border-t border-[rgba(28,27,22,0.15)] px-6 py-5 max-sm:grid-cols-[auto_1fr]"
                  : "grid grid-cols-[auto_11rem_1fr] items-baseline gap-x-5 px-6 py-5 max-sm:grid-cols-[auto_1fr]"
              }
            >
              <span aria-hidden="true" className="select-none font-mono text-table text-credit">
                ✓
              </span>
              <p className="label-caps text-ink">{s.title}</p>
              <p className="font-body text-table text-ink-secondary max-sm:col-span-2 max-sm:col-start-2 max-sm:mt-1">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <MarginNote className="mt-4">
          The method is “fraught with danger for the innocent” — Holland’s words. The safeguards
          above are the reason these schedules survive Daubert: a firm opening point, a likely
          taxable source, leads run to ground, and three computations that agree.
        </MarginNote>
      </section>
    </>
  );
}
