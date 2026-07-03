/**
 * § I — The Matter. The report cover: court caption, engagement,
 * the punchline, the table of schedules, and the standards note.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import TickFigure from "../components/TickFigure";
import MarginNote from "../components/MarginNote";
import { caseFile } from "../lib/caseData";
import {
  buildNetWorth,
  buildExpenditures,
  buildBankDeposits,
  buildConvergence,
  buildLifestyle,
} from "../engines";
import { fmtDate, pct, usd } from "../lib/format";

// ---------------------------------------------------------------------------
// Engine results — pure functions over static data, computed once.
// ---------------------------------------------------------------------------

const nw = buildNetWorth(caseFile);
const ex = buildExpenditures(caseFile);
const bd = buildBankDeposits(caseFile);
const convergence = buildConvergence(nw, ex, bd);
const lifestyle = buildLifestyle(caseFile);

const latest = lifestyle[lifestyle.length - 1]; // 2024
const latestReturnDoc = (() => {
  const rep = caseFile.reported.find((r) => r.year === latest.year);
  return rep ? caseFile.documents.find((d) => d.id === rep.docId) : undefined;
})();

/** Annual unreported-income band across all three methods, all years. */
const annualLow = Math.min(
  ...convergence.flatMap((c) => [c.netWorth, c.expenditures, c.bankDeposits]),
);
const annualHigh = Math.max(
  ...convergence.flatMap((c) => [c.netWorth, c.expenditures, c.bankDeposits]),
);
const worstSpread = Math.max(...convergence.map((c) => c.spread));

// Corpus counts for the stat row.
const docCount = caseFile.documents.length;
const pageCount = caseFile.documents.reduce((acc, d) => acc + d.pages, 0);
const entryCount = caseFile.transactions.length;
const accountCount = caseFile.accounts.length;
const undisclosedCount = caseFile.accounts.filter((a) => !a.disclosed).length;
const periodMonths = (() => {
  const [ys, ms] = caseFile.matter.periodStart.split("-").map(Number);
  const [ye, me] = caseFile.matter.periodEnd.split("-").map(Number);
  return ye * 12 + me - (ys * 12 + ms) + 1;
})();

const nf = (n: number) => n.toLocaleString("en-US");

// ---------------------------------------------------------------------------
// Court caption rows — Texas filing style, § column between the blocks.
// ---------------------------------------------------------------------------

const CAPTION_ROWS: { left: ReactNode; right: string }[] = [
  { left: "In re the Marriage of", right: "In the District Court" },
  {
    left: (
      <>
        {caseFile.matter.spouse},&ensp;
        <span className="normal-case italic tracking-normal">Petitioner,</span>
      </>
    ),
    right: "311th Judicial District",
  },
  { left: "and", right: "Harris County, Texas" },
  {
    left: (
      <>
        {caseFile.matter.subject},&ensp;
        <span className="normal-case italic tracking-normal">Respondent</span>
      </>
    ),
    right: "",
  },
];

/** Numerals inside running text — always Plex Mono. */
function M({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[0.9em] tabular-nums">{children}</span>;
}

// ---------------------------------------------------------------------------
// Table of Schedules — § II–VII.
// ---------------------------------------------------------------------------

const SCHEDULES: { to: string; folio: string; title: string; blurb: ReactNode }[] = [
  {
    to: "/ledger",
    folio: "II",
    title: "Ingestion & the Unified Ledger",
    blurb: (
      <>
        <M>{nf(docCount)}</M> source documents — <M>{nf(pageCount)}</M> pages of statements,
        filings, and returns — resolved into one ledger of <M>{nf(entryCount)}</M> entries, each
        citing its document, page, and line.
      </>
    ),
  },
  {
    to: "/lifestyle",
    folio: "III",
    title: "Lifestyle Analysis",
    blurb: (
      <>
        What the household demonstrably spends, by category and by year, set against income per
        the filed returns.
      </>
    ),
  },
  {
    to: "/methods",
    folio: "IV",
    title: "The Three Methods",
    blurb: (
      <>
        Net worth, source and application of funds, and bank deposits — run independently from the
        same records, converging within <M>{pct(worstSpread)}</M>.
      </>
    ),
  },
  {
    to: "/tracing",
    folio: "V",
    title: "Follow the Money",
    blurb: (
      <>
        Sub-threshold cash deposits, transfers labeled as loan repayments, and an undisclosed
        entity account behind a <M>$385,000</M> Galveston purchase.
      </>
    ),
  },
  {
    to: "/separate",
    folio: "VI",
    title: "Separate Property — Texas Tracing",
    blurb: (
      <>
        The Whitmore inheritance traced through a commingled savings account: community-out-first
        and minimum sum balance, carried at clear and convincing.
      </>
    ),
  },
  {
    to: "/documents",
    folio: "VII",
    title: "The Evidence Room",
    blurb: (
      <>
        The exhibit index — every document cited in these schedules, viewable to the page and
        line.
      </>
    ),
  },
];

// ---------------------------------------------------------------------------

export default function Overview() {
  const summary = caseFile.matter.summary;
  const dropCap = summary.charAt(0);
  const summaryRest = summary.slice(1);

  return (
    <>
      <PageHeader
        kicker="Section I"
        title="The Matter"
        lede="Report of the examiner: reconstruction of the Respondent's income by three independent, court-recognized indirect methods, and tracing of the Petitioner's separate estate."
      />

      {/* ------------------------------------------------------------------ */}
      {/* Court caption — hairline-framed sheet, Texas filing style           */}
      {/* ------------------------------------------------------------------ */}
      <section className="sheet animate-settle mx-auto max-w-[46rem] px-6 py-8 sm:px-12 sm:py-10">
        <p className="text-center font-mono text-table tracking-[0.14em] text-ink">
          CAUSE NO. {caseFile.matter.number}
        </p>

        <div className="mt-8 space-y-1.5">
          {CAPTION_ROWS.map((row, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-baseline gap-x-4 sm:gap-x-8">
              <p className="font-body text-table uppercase tracking-[0.06em] text-ink">
                {row.left}
              </p>
              <p aria-hidden="true" className="select-none font-body text-table text-brass">
                §
              </p>
              <p className="text-right font-body text-table uppercase tracking-[0.06em] text-ink">
                {row.right}
              </p>
            </div>
          ))}
        </div>

        <div className="rule-hairline mt-8" aria-hidden="true" />

        <p className="label-caps mt-6 text-center text-ink">
          Examiner&rsquo;s Report — Income Reconstruction &amp; Separate-Property Tracing
        </p>
        <p className="mt-3 text-center font-mono text-caption text-ink-secondary">
          Engaged by {caseFile.matter.engagedBy} · Analysis period{" "}
          {fmtDate(caseFile.matter.periodStart)} — {fmtDate(caseFile.matter.periodEnd)}
        </p>
        <p className="mt-1 text-center font-mono text-caption text-ink-faint">
          Prepared for {caseFile.matter.preparedFor}
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Engagement — drop cap                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="animate-settle mt-14" style={{ animationDelay: "60ms" }}>
        <p className="mx-auto max-w-[66ch] font-body text-[1.0625rem] leading-[1.75] text-ink">
          <span
            aria-hidden="true"
            className="float-left mr-3 mt-[0.24em] select-none font-display text-[3.6rem] leading-[0.78] text-green"
            style={{ fontWeight: 380, fontVariationSettings: '"opsz" 144' }}
          >
            {dropCap}
          </span>
          <span className="sr-only">{dropCap}</span>
          {summaryRest}
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The punchline                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section
        className="animate-settle mx-auto mt-16 max-w-[46rem]"
        style={{ animationDelay: "120ms" }}
        aria-label="Principal finding"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          <h2
            className="font-display text-page text-ink sm:text-display"
            style={{ fontWeight: 380, fontVariationSettings: '"opsz" 144' }}
          >
            They live on
          </h2>
          <TickFigure
            cents={latest.totalLifestyle}
            className="text-[2.75rem] leading-none text-ink sm:text-[4.25rem]"
          />
        </div>
        <p className="marginalia mt-2 text-right">
          documented living expenditures, {latest.year} — Schedule III
        </p>

        <div className="rule-oxford-brass my-7" aria-hidden="true" />

        <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-2">
          <h2
            className="font-display text-page text-ink sm:text-display"
            style={{ fontWeight: 380, fontVariationSettings: '"opsz" 144' }}
          >
            They report
          </h2>
          <TickFigure
            cents={latest.reportedIncome}
            className="text-[2.75rem] leading-none text-ink-secondary sm:text-[4.25rem]"
          />
        </div>
        <p className="marginalia mt-2 text-right">
          total income per the {latest.year} return
          {latestReturnDoc ? ` — ${latestReturnDoc.exhibit}` : ""}
        </p>

        <p className="mt-10 max-w-[52ch] font-body text-section leading-[1.5] text-ink">
          Three independent methods place unreported income at{" "}
          <span className="whitespace-nowrap font-mono text-[0.95em] tabular-nums text-oxblood">
            {usd(annualLow)}
          </span>
          &#8202;–&#8202;
          <span className="whitespace-nowrap font-mono text-[0.95em] tabular-nums text-oxblood">
            {usd(annualHigh)}
          </span>{" "}
          per year.
        </p>
        <MarginNote className="mt-3">
          Net worth, expenditures, and bank deposits, {convergence[0].year}–
          {convergence[convergence.length - 1].year}; the widest divergence among the three in any
          year is {pct(worstSpread)}. Schedule IV.
        </MarginNote>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The corpus                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="animate-settle mt-16" style={{ animationDelay: "160ms" }}>
        <div className="rule-hairline pb-2">
          <h2 className="label-caps text-ink-secondary">The Record Before the Examiner</h2>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile
            label="Documents ingested"
            value={nf(docCount)}
            note="Bank, card & brokerage statements; returns; filings."
          />
          <StatTile
            label="Statement pages"
            value={nf(pageCount)}
            note="Every ledger row cites its page and line."
          />
          <StatTile
            label="Ledger entries"
            value={nf(entryCount)}
            note="One unified ledger across all accounts."
          />
          <StatTile
            label="Accounts"
            value={nf(accountCount)}
            note={`${nf(undisclosedCount)} undisclosed — surfaced by the analysis.`}
          />
          <StatTile
            label="Period"
            value={`${nf(periodMonths)} mo.`}
            note={`${fmtDate(caseFile.matter.periodStart)} — ${fmtDate(caseFile.matter.periodEnd)}.`}
          />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Table of Schedules                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="animate-settle mt-16" style={{ animationDelay: "200ms" }}>
        <div className="rule-oxford pb-2 pt-2">
          <h2
            className="mt-2 font-display text-section text-ink"
            style={{ fontWeight: 400, fontVariationSettings: '"opsz" 60' }}
          >
            Table of Schedules
          </h2>
        </div>
        <ol className="mt-2">
          {SCHEDULES.map((s) => (
            <li key={s.to} className="rule-hairline">
              <Link
                to={s.to}
                className="group grid grid-cols-[3.25rem_1fr] gap-x-4 py-5 sm:grid-cols-[4.5rem_1fr] sm:gap-x-6"
              >
                <span className="pt-0.5 font-mono text-table text-ink-secondary transition-ink group-hover:text-brass">
                  §&thinsp;{s.folio}
                </span>
                <span className="min-w-0">
                  <span
                    className="relative inline-block font-display text-section text-ink transition-ink group-hover:text-green"
                    style={{ fontWeight: 500 }}
                  >
                    {s.title}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100"
                    />
                  </span>
                  <span className="mt-1 block max-w-[62ch] font-body text-body text-ink-secondary">
                    {s.blurb}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Method & standards                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="animate-settle mt-16" style={{ animationDelay: "240ms" }}>
        <div className="rule-hairline pb-2">
          <h2 className="label-caps text-ink-secondary">Method &amp; Standards</h2>
        </div>
        <div className="mt-6 grid max-w-[72rem] gap-x-12 gap-y-5 lg:grid-cols-3">
          <MarginNote>
            Opening net worth is established with reasonable certainty at December 31, 2021 — the
            firm starting point required by <span className="not-italic">Holland v. United
            States</span>, 348 U.S. 121 (1954) — and likely source, leads, and nontaxable
            explanations are addressed before any understatement is stated.
          </MarginNote>
          <MarginNote mark="‡">
            Each method rests on a testable accounting identity, published in the Internal Revenue
            Manual and decades of case law, with its known error surfaces controlled — transfers
            stripped, nontaxable sources credited, assets at cost — the application posture
            required under <span className="not-italic">Daubert</span> and FRE 702.
          </MarginNote>
          <MarginNote mark="§">
            Property possessed on dissolution is presumed community; separate character is carried
            at clear and convincing evidence, Tex. Fam. Code § 3.003, by community-out-first
            tracing (<span className="not-italic">Sibley</span>) corroborated by minimum sum
            balance. LUCA prepares as staff; the practitioner signs as reviewer.
          </MarginNote>
        </div>
      </section>
    </>
  );
}
