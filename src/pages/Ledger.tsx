import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import PageHeader from "../components/PageHeader";
import TickFigure from "../components/TickFigure";
import ExhibitFrame from "../components/ExhibitFrame";
import { caseFile } from "../lib/caseData";
import { fmtDateShort, usdExact } from "../lib/format";
import type { CaseDocument, Cents, Transaction } from "../lib/types";

/* ---------------------------------------------------------------------------
   Module-level computation — static data, computed once.
--------------------------------------------------------------------------- */

const TXNS = caseFile.transactions;
const DOCS = caseFile.documents;
const ACCOUNTS = caseFile.accounts;

const DOC_BY_ID = new Map(DOCS.map((d) => [d.id, d]));
const ACCT_BY_ID = new Map(ACCOUNTS.map((a) => [a.id, a]));

const DOC_COUNT = DOCS.length;
const PAGE_COUNT = DOCS.reduce((s, d) => s + d.pages, 0);
const SCANNED_COUNT = DOCS.filter((d) => d.scanned).length;
const ROW_COUNT = TXNS.length;
const RESOLVED_COUNT = TXNS.filter((t) => t.counterpartyId).length;
const TRANSFER_PAIRS = new Set(TXNS.filter((t) => t.transferGroup).map((t) => t.transferGroup)).size;
const AVG_CONFIDENCE = TXNS.reduce((s, t) => s + t.confidence, 0) / ROW_COUNT;

/** Mean extraction confidence per document (for the manifest's scanned rows). */
const DOC_CONFIDENCE: Map<string, number> = (() => {
  const sum = new Map<string, { s: number; n: number }>();
  for (const t of TXNS) {
    const e = sum.get(t.doc.docId) ?? { s: 0, n: 0 };
    e.s += t.confidence;
    e.n += 1;
    sum.set(t.doc.docId, e);
  }
  const out = new Map<string, number>();
  for (const [id, { s, n }] of sum) out.set(id, s / n);
  return out;
})();

function docInstitution(d: CaseDocument): string {
  const acct = d.accountId ? ACCT_BY_ID.get(d.accountId) : undefined;
  return acct ? acct.institution : "County, State & Federal Records";
}

/** Manifest grouped by institution, largest productions first, records last. */
const MANIFEST_GROUPS: { institution: string; docs: CaseDocument[] }[] = (() => {
  const groups = new Map<string, CaseDocument[]>();
  for (const d of DOCS) {
    const k = docInstitution(d);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(d);
  }
  return [...groups.entries()]
    .sort((a, b) => {
      const rec = "County, State & Federal Records";
      if (a[0] === rec) return 1;
      if (b[0] === rec) return -1;
      return b[1].length - a[1].length;
    })
    .map(([institution, docs]) => ({ institution, docs }));
})();

const ACCT_ABBREV: Record<string, string> = {
  "frost-checking": "FROST CHK",
  "frost-savings": "FROST SAV",
  "chase-biz": "CHASE BIZ",
  amex: "AMEX",
  sapphire: "SAPPHIRE",
  fidelity: "FIDELITY",
  "prosperity-bluebonnet": "PROSPERITY",
};

function acctLabel(accountId: string): string {
  const a = ACCT_BY_ID.get(accountId);
  const abbrev = ACCT_ABBREV[accountId] ?? (a?.institution.split(" ")[0].toUpperCase() ?? "—");
  return `${abbrev} ·${a?.last4 ?? ""}`;
}

const CATEGORIES: string[] = [...new Set(TXNS.map((t) => t.category))].sort();
const YEARS = ["2022", "2023", "2024"];

const FLAG_TAGS = new Set(["structuring-flag", "loan-labeled", "income-hidden"]);
const isFlagged = (t: Transaction) => t.tags.some((g) => FLAG_TAGS.has(g));
const FLAGGED_TOTAL = TXNS.filter(isFlagged).length;

const int = (n: number) => Math.round(n).toLocaleString("en-US");

/** Ledger figure without the currency symbol — the $ lives in the column head. */
function ledgerFig(cents: Cents): string {
  const abs = (Math.abs(cents) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return cents < 0 ? `(${abs})` : abs;
}

/* ---------------------------------------------------------------------------
   Act I — the ingestion sequence.
--------------------------------------------------------------------------- */

const PHASES: { caption: string; ms: number; docs: number; pages: number; rows: number }[] = [
  {
    caption: `Reading ${int(DOC_COUNT)} source documents`,
    ms: 1900,
    docs: DOC_COUNT - SCANNED_COUNT,
    pages: Math.round(PAGE_COUNT * 0.64),
    rows: Math.round(ROW_COUNT * 0.38),
  },
  {
    caption: `OCR — ${int(SCANNED_COUNT)} scanned statements`,
    ms: 1600,
    docs: DOC_COUNT,
    pages: PAGE_COUNT,
    rows: Math.round(ROW_COUNT * 0.71),
  },
  {
    caption: `Resolving counterparties — ${int(RESOLVED_COUNT)} matched`,
    ms: 1400,
    docs: DOC_COUNT,
    pages: PAGE_COUNT,
    rows: Math.round(ROW_COUNT * 0.9),
  },
  {
    caption: `Matching inter-account transfers — ${int(TRANSFER_PAIRS)} pairs`,
    ms: 1300,
    docs: DOC_COUNT,
    pages: PAGE_COUNT,
    rows: Math.round(ROW_COUNT * 0.97),
  },
  {
    caption: `Ledger assembled — ${int(ROW_COUNT)} entries`,
    ms: 1200,
    docs: DOC_COUNT,
    pages: PAGE_COUNT,
    rows: ROW_COUNT,
  },
];
const TOTAL_MS = PHASES.reduce((s, p) => s + p.ms, 0);

function ManifestRow({ doc }: { doc: CaseDocument }) {
  const conf = DOC_CONFIDENCE.get(doc.id);
  return (
    <div className="flex items-baseline gap-3 py-[3px] font-mono text-[0.6875rem] leading-[1.5] text-ink-secondary">
      <span className="w-14 shrink-0 text-brass">{doc.exhibit}</span>
      <span className="min-w-0 flex-1 truncate">{doc.id}</span>
      <span className="shrink-0 text-ink-faint">
        {doc.pages} {doc.pages === 1 ? "p" : "pp"}
      </span>
      <span className="w-20 shrink-0 text-right text-ink-faint">
        {doc.scanned && conf !== undefined ? (
          <>
            <span aria-label="scanned document">▤</span> ocr {Math.round(conf * 100)}%
          </>
        ) : doc.scanned ? (
          <span aria-label="scanned document">▤ scan</span>
        ) : null}
      </span>
    </div>
  );
}

function IngestionSequence({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    let acc = 0;
    for (let i = 1; i < PHASES.length; i++) {
      acc += PHASES[i - 1].ms;
      timers.push(window.setTimeout(() => setPhase(i), acc));
    }
    acc += PHASES[PHASES.length - 1].ms;
    timers.push(window.setTimeout(onDone, acc + 500));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onDone]);

  // Manifest streams upward through a fixed window for the whole sequence.
  const winRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  useEffect(() => {
    if (winRef.current && listRef.current) {
      setDist(Math.max(0, listRef.current.scrollHeight - winRef.current.clientHeight));
    }
  }, []);

  const p = PHASES[phase];

  return (
    <section className="sheet animate-settle p-6 sm:p-8" aria-label="Ingestion in progress">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Document manifest, scrolling in grouped by institution */}
        <div className="min-w-0">
          <div className="flex items-baseline justify-between">
            <h2 className="label-caps text-ink">Document manifest</h2>
            <span className="font-mono text-caption text-ink-faint">
              {MANIFEST_GROUPS.length} productions
            </span>
          </div>
          <div className="rule-hairline mt-2" aria-hidden="true" />
          <div ref={winRef} className="relative mt-3 h-72 overflow-hidden">
            <motion.div
              ref={listRef}
              initial={{ y: 0 }}
              animate={{ y: -dist }}
              transition={{ duration: (TOTAL_MS - 400) / 1000, ease: "linear" }}
            >
              {MANIFEST_GROUPS.map((g) => (
                <div key={g.institution} className="mb-4">
                  <div className="flex items-baseline justify-between border-b border-hairline pb-1">
                    <span className="label-caps text-ink-secondary">{g.institution}</span>
                    <span className="font-mono text-caption text-ink-faint">
                      {g.docs.length} {g.docs.length === 1 ? "document" : "documents"}
                    </span>
                  </div>
                  <div className="pt-1">
                    {g.docs.map((d) => (
                      <ManifestRow key={d.id} doc={d} />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Counters, phase caption, progress rule */}
        <div className="flex flex-col">
          <dl className="space-y-5">
            {(
              [
                ["Documents", p.docs],
                ["Pages", p.pages],
                ["Entries extracted", p.rows],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <dt className="label-caps text-ink-faint">{label}</dt>
                <dd className="mt-0.5 text-[1.625rem] leading-none text-ink">
                  <TickFigure cents={value} format={int} />
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8">
            <div className="relative h-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={phase}
                  className="label-caps whitespace-nowrap text-green"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  {p.caption}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-2 h-[2px] w-full bg-[rgba(28,27,22,0.12)]">
              <motion.div
                className="h-full bg-green"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: TOTAL_MS / 1000, ease: "linear" }}
              />
            </div>
          </div>

          <div className="mt-auto pt-8 text-right">
            <button
              type="button"
              onClick={onDone}
              className="marginalia underline decoration-[rgba(28,27,22,0.3)] underline-offset-2 transition-ink hover:text-ink"
            >
              Skip to the ledger &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Provenance slide-over — the exact statement page behind a ledger row.
--------------------------------------------------------------------------- */

function ProvenancePanel({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  const doc = DOC_BY_ID.get(txn.doc.docId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-ink/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[640px] overflow-y-auto border-l border-hairline-strong bg-paper px-6 py-6 shadow-sheet sm:px-8"
        initial={{ x: 16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 16, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-label="Source document"
      >
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="label-caps text-ink">Provenance</h2>
          <button
            type="button"
            onClick={onClose}
            className="label-caps text-ink-faint transition-ink hover:text-ink"
          >
            Close ✕
          </button>
        </div>
        <div className="rule-oxford mt-3" aria-hidden="true" />

        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          {(
            [
              ["Entry", txn.id],
              ["Date", fmtDateShort(txn.date)],
              ["Account", acctLabel(txn.accountId)],
              ["Extracted from", `p.${txn.doc.page} · ln ${txn.doc.line}`],
              ["Confidence", `${Math.round(txn.confidence * 100)}%`],
              ["Channel", txn.channel.toUpperCase()],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="label-caps text-ink-faint">{k}</dt>
              <dd className="mt-0.5 font-mono text-table text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 font-mono text-table text-ink">{txn.description}</p>
        <p className={clsx("figure mt-1 text-section", txn.amount < 0 ? "figure-debit" : "figure-credit")}>
          {usdExact(txn.amount)}
        </p>
        {isFlagged(txn) && (
          <p className="marginalia mt-2 text-oxblood">
            † Examiner&rsquo;s flag — {txn.tags.filter((g) => FLAG_TAGS.has(g)).join(", ")}.
          </p>
        )}

        {doc ? (
          <ExhibitFrame doc={{ ...doc, file: `${doc.file}#page=${txn.doc.page}` }} height={620} />
        ) : (
          <p className="marginalia mt-6">Source document not present in the production set.</p>
        )}
      </motion.aside>
    </>
  );
}

/* ---------------------------------------------------------------------------
   Act II — the unified ledger.
--------------------------------------------------------------------------- */

const PAGE_SIZE = 80;
const PAGE_STEP = 120;

function UnifiedLedger({ onReplay }: { onReplay: () => void }) {
  const [q, setQ] = useState("");
  const [acct, setAcct] = useState("all");
  const [cat, setCat] = useState("all");
  const [year, setYear] = useState("all");
  const [flagsOnly, setFlagsOnly] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Transaction | null>(null);

  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [q, acct, cat, year, flagsOnly]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TXNS.filter((t) => {
      if (acct !== "all" && t.accountId !== acct) return false;
      if (cat !== "all" && t.category !== cat) return false;
      if (year !== "all" && !t.date.startsWith(year)) return false;
      if (flagsOnly && !isFlagged(t)) return false;
      if (needle) {
        const hay = `${t.description} ${t.category} ${acctLabel(t.accountId)}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [q, acct, cat, year, flagsOnly]);

  const sums = useMemo(() => {
    let credits = 0;
    let debits = 0;
    let flagged = 0;
    for (const t of filtered) {
      if (t.amount >= 0) credits += t.amount;
      else debits += t.amount;
      if (isFlagged(t)) flagged += 1;
    }
    return { credits, debits, flagged };
  }, [filtered]);

  const visible = filtered.slice(0, shown);

  return (
    <section className="animate-settle">
      {/* Provenance strip above the toolbar */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
        <p className="marginalia">
          {int(DOC_COUNT)} documents · {int(PAGE_COUNT)} pages · {int(ROW_COUNT)} extracted entries ·
          mean extraction confidence {Math.round(AVG_CONFIDENCE * 100)}% · {int(FLAGGED_TOTAL)} entries
          under examiner&rsquo;s flag
        </p>
        <button
          type="button"
          onClick={onReplay}
          className="marginalia underline decoration-[rgba(28,27,22,0.3)] underline-offset-2 transition-ink hover:text-ink"
        >
          Replay ingestion
        </button>
      </div>

      {/* Hairline toolbar */}
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-hairline py-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search descriptions…"
          aria-label="Search ledger entries"
          className="min-w-[200px] flex-1 bg-transparent font-mono text-table text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <select
          value={acct}
          onChange={(e) => setAcct(e.target.value)}
          aria-label="Filter by account"
          className="cursor-pointer bg-transparent font-mono text-caption text-ink-secondary focus:outline-none"
        >
          <option value="all">All accounts</option>
          {ACCOUNTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.institution} — {a.name} ·{a.last4}
            </option>
          ))}
        </select>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Filter by category"
          className="cursor-pointer bg-transparent font-mono text-caption text-ink-secondary focus:outline-none"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Filter by year"
          className="cursor-pointer bg-transparent font-mono text-caption text-ink-secondary focus:outline-none"
        >
          <option value="all">All years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setFlagsOnly((v) => !v)}
          aria-pressed={flagsOnly}
          className={clsx(
            "label-caps border px-3 py-1.5 transition-ink",
            flagsOnly
              ? "border-oxblood bg-oxblood-wash text-oxblood"
              : "border-hairline text-ink-secondary hover:bg-paper-hover",
          )}
        >
          Examiner&rsquo;s flags&thinsp;<sup>†</sup>
        </button>
      </div>

      {/* The broadsheet */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr>
              {(
                [
                  ["Date", "text-left"],
                  ["Account", "text-left"],
                  ["Description", "text-left"],
                  ["Category", "text-left"],
                  ["Amount ($)", "text-right"],
                  ["Balance ($)", "text-right"],
                  ["Source", "text-right"],
                ] as const
              ).map(([label, align]) => (
                <th
                  key={label}
                  scope="col"
                  className={clsx(
                    "label-caps border-b border-hairline-strong pb-2 pt-4 text-ink-secondary",
                    align,
                    label !== "Date" && "pl-4",
                  )}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((t) => {
              const flagged = isFlagged(t);
              const doc = DOC_BY_ID.get(t.doc.docId);
              return (
                <tr
                  key={t.id}
                  className={clsx(
                    "border-b border-[rgba(28,27,22,0.07)] transition-ink",
                    flagged ? "row-flagged" : "hover:bg-paper-hover",
                  )}
                >
                  <td className="whitespace-nowrap py-3 font-mono text-[0.75rem] text-ink-secondary">
                    {fmtDateShort(t.date)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-4 font-mono text-[0.6875rem] tracking-[0.04em] text-ink-secondary">
                    {acctLabel(t.accountId)}
                  </td>
                  <td className="max-w-[300px] py-3 pl-4">
                    <span
                      className="block truncate font-mono text-[0.75rem] text-ink"
                      title={t.description}
                    >
                      {t.description}
                    </span>
                  </td>
                  <td className="whitespace-nowrap py-3 pl-4 font-body text-table text-ink-secondary">
                    {t.category}
                  </td>
                  <td
                    className={clsx(
                      "figure whitespace-nowrap py-3 pl-4 text-right",
                      t.amount < 0 ? "figure-debit" : "figure-credit",
                    )}
                  >
                    {ledgerFig(t.amount)}
                    {flagged && <sup className="text-oxblood"> †</sup>}
                  </td>
                  <td className="figure whitespace-nowrap py-3 pl-4 text-right text-ink">
                    {ledgerFig(t.balanceAfter)}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(t)}
                      className="font-mono text-[0.6875rem] text-green underline decoration-[rgba(30,58,47,0.35)] underline-offset-2 transition-ink hover:text-green-deep"
                      title={doc?.title}
                    >
                      {doc?.exhibit ?? t.doc.docId} · p.{t.doc.page} ln {t.doc.line}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="marginalia py-10 text-center">No entries match the current filters.</p>
      )}

      {shown < filtered.length && (
        <div className="flex justify-center py-6">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_STEP)}
            className="label-caps border border-hairline px-5 py-2 text-ink-secondary transition-ink hover:bg-paper-hover hover:text-ink"
          >
            Load more — {int(filtered.length - shown)} remaining
          </button>
        </div>
      )}

      {/* Footer strip */}
      <div className="rule-subtotal mt-2 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-1 pt-3 font-mono text-caption text-ink-secondary">
        <span>
          {int(filtered.length)} {filtered.length === 1 ? "entry" : "entries"} · {int(Math.min(shown, filtered.length))} shown
          {sums.flagged > 0 && (
            <span className="text-oxblood"> · † {int(sums.flagged)} flagged</span>
          )}
        </span>
        <span className="flex flex-wrap gap-x-8">
          <span>
            Σ credits <span className="figure-credit">{usdExact(sums.credits)}</span>
          </span>
          <span>
            Σ debits <span className="figure-debit">{usdExact(sums.debits)}</span>
          </span>
        </span>
      </div>

      <AnimatePresence>
        {selected && <ProvenancePanel txn={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Page
--------------------------------------------------------------------------- */

const INGESTED_KEY = "luca-ledger-ingested";

export default function Ledger() {
  const [done, setDone] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    if (window.sessionStorage.getItem(INGESTED_KEY) === "1") return true;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  });
  const [runId, setRunId] = useState(0);

  const finish = useCallback(() => {
    window.sessionStorage.setItem(INGESTED_KEY, "1");
    setDone(true);
  }, []);

  const replay = useCallback(() => {
    window.sessionStorage.removeItem(INGESTED_KEY);
    setRunId((r) => r + 1);
    setDone(false);
  }, []);

  return (
    <>
      <PageHeader
        kicker="Section II · Ingestion & Unified Ledger"
        title="The Unified Ledger"
        lede={`${int(DOC_COUNT)} source documents — ${int(PAGE_COUNT)} pages of bank, card, and brokerage statements, filings, and closing papers — read, reconciled, and assembled into a single searchable ledger of ${int(ROW_COUNT)} entries, each traceable to the page and line it came from.`}
      />
      {done ? (
        <UnifiedLedger onReplay={replay} />
      ) : (
        <IngestionSequence key={runId} onDone={finish} />
      )}
    </>
  );
}
