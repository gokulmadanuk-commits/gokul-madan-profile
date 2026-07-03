import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import TickFigure from "../components/TickFigure";
import ExhibitFrame from "../components/ExhibitFrame";
import MarginNote from "../components/MarginNote";
import { caseFile } from "../lib/caseData";
import { fmtDate, fmtMonth, usd } from "../lib/format";
import type { Account, CaseDocument, DocumentKind } from "../lib/types";

/* ---------------------------------------------------------------------------
   Module-level computation — static data, computed once.
--------------------------------------------------------------------------- */

const DOCS = caseFile.documents;
const ACCOUNTS = caseFile.accounts;
const ACCT_BY_ID = new Map<string, Account>(ACCOUNTS.map((a) => [a.id, a]));

const DOC_COUNT = DOCS.length;
const PAGE_COUNT = DOCS.reduce((s, d) => s + d.pages, 0);
const SCANNED_COUNT = DOCS.filter((d) => d.scanned).length;
const NATIVE_COUNT = DOC_COUNT - SCANNED_COUNT;

const exNum = (d: CaseDocument) => parseInt(d.exhibit.replace(/\D/g, ""), 10) || 0;
const ALL_SORTED: CaseDocument[] = [...DOCS].sort((a, b) => exNum(a) - exNum(b));

const int = (n: number) => Math.round(n).toLocaleString("en-US");

const KIND_LABEL: Record<DocumentKind, string> = {
  "bank-statement": "Bank Statement",
  "card-statement": "Card Statement",
  "brokerage-statement": "Brokerage",
  "tax-return": "Tax Return",
  formation: "Formation",
  "closing-statement": "Settlement",
  letter: "Letter",
  deed: "Deed",
};

const KINDS_PRESENT: DocumentKind[] = (
  [
    "bank-statement",
    "card-statement",
    "brokerage-statement",
    "tax-return",
    "formation",
    "closing-statement",
    "letter",
    "deed",
  ] as DocumentKind[]
).filter((k) => DOCS.some((d) => d.kind === k));

/* --- Key exhibits — the documents the findings hang on. ------------------ */

const REPORTED_BY_YEAR = new Map(caseFile.reported.map((r) => [r.year, r.reportedIncome]));

const KEY_NOTES: Record<string, string> = {
  "bluebonnet-formation":
    "Certificate of formation — Bluebonnet Holdings LLC organized Mar 14, 2023. The undisclosed entity that received chase-biz transfers labeled “LOAN REPAYMENT”; no note or loan is documented.",
  "galveston-deed":
    "Warranty deed — title to 4210 Seawall Blvd Unit 502 vested in Bluebonnet Holdings LLC, not the community estate.",
  "galveston-closing":
    "Settlement statement — $385,000 all-cash purchase, funded by a single Aug 18, 2023 wire from the undisclosed Prosperity account. No lender appears.",
  "whitmore-estate-letter": `Executor’s letter — establishes the ${usd(
    caseFile.tracing.separateAmount,
  )} separate-property corpus of ${caseFile.tracing.claimant}, deposited to Frost savings ····8823 on ${fmtDate(
    caseFile.tracing.separateDate,
  )}.`,
  "1040-2022": `Form 1040 (2022) — reports ${usd(
    REPORTED_BY_YEAR.get(2022) ?? 0,
  )} of total income; the figure each indirect method is tested against.`,
  "1040-2023": `Form 1040 (2023) — reports ${usd(
    REPORTED_BY_YEAR.get(2023) ?? 0,
  )} against a traced lifestyle several times that size. Cf. § III.`,
  "1040-2024": `Form 1040 (2024) — reports ${usd(
    REPORTED_BY_YEAR.get(2024) ?? 0,
  )}; the third consecutive year the returns and the bank records diverge.`,
};

const KEY_IDS = [
  "bluebonnet-formation",
  "galveston-deed",
  "galveston-closing",
  "whitmore-estate-letter",
  "1040-2022",
  "1040-2023",
  "1040-2024",
];

const KEY_DOCS: CaseDocument[] = KEY_IDS.map((id) => DOCS.find((d) => d.id === id)).filter(
  (d): d is CaseDocument => Boolean(d),
);

/* --- The collection, grouped like a shelf list. --------------------------- */

interface ShelfGroup {
  id: string;
  label: string;
  /** Statement shelves collapse; the records shelf opens by default. */
  defaultOpen: boolean;
  undisclosed?: boolean;
  docs: CaseDocument[];
}

const RECORDS_LABEL = "County, State & Federal Records";

const SHELVES: ShelfGroup[] = (() => {
  const records = ALL_SORTED.filter((d) => !d.accountId);
  const institutions = [...new Set(ACCOUNTS.map((a) => a.institution))];
  const shelves: ShelfGroup[] = [
    { id: "records", label: RECORDS_LABEL, defaultOpen: true, docs: records },
  ];
  for (const inst of institutions) {
    const acctIds = new Set(ACCOUNTS.filter((a) => a.institution === inst).map((a) => a.id));
    const docs = ALL_SORTED.filter((d) => d.accountId && acctIds.has(d.accountId));
    if (docs.length === 0) continue;
    const undisclosed = ACCOUNTS.filter((a) => a.institution === inst).every((a) => !a.disclosed);
    shelves.push({ id: inst, label: inst, defaultOpen: false, undisclosed, docs });
  }
  return shelves;
})();

function periodLabel(d: CaseDocument): string {
  if (!d.periodStart || !d.periodEnd) return "—";
  if (d.periodStart.slice(0, 7) === d.periodEnd.slice(0, 7)) return fmtMonth(d.periodStart);
  return `${fmtMonth(d.periodStart)} – ${fmtMonth(d.periodEnd)}`;
}

function accountLabel(accountId?: string): string {
  if (!accountId) return "—";
  const a = ACCT_BY_ID.get(accountId);
  return a ? `${a.institution} ····${a.last4}` : accountId;
}

/** Production column: filled glyph for paper served under subpoena, open for native files. */
function ProductionMark({ scanned }: { scanned: boolean }) {
  return (
    <span className="whitespace-nowrap font-mono text-caption text-ink-faint">
      <span aria-hidden="true" className={clsx(scanned ? "text-ink-secondary" : "text-ink-faint")}>
        {scanned ? "■" : "□"}
      </span>{" "}
      {scanned ? "subpoena" : "native"}
    </span>
  );
}

/* ---------------------------------------------------------------------------
   The exhibit viewer — slide-over plate mount with prev/next navigation.
--------------------------------------------------------------------------- */

function ExhibitViewer({
  doc,
  navList,
  onNavigate,
  onClose,
}: {
  doc: CaseDocument;
  navList: CaseDocument[];
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const idx = navList.findIndex((d) => d.id === doc.id);
  const prev = idx > 0 ? navList[idx - 1] : undefined;
  const next = idx >= 0 && idx < navList.length - 1 ? navList[idx + 1] : undefined;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && prev) onNavigate(prev.id);
      else if (e.key === "ArrowRight" && next) onNavigate(next.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNavigate, prev, next]);

  const keyNote = KEY_NOTES[doc.id];

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
        className="fixed inset-y-0 right-0 z-50 w-full max-w-[680px] overflow-y-auto border-l border-hairline-strong bg-paper px-6 py-6 shadow-sheet sm:px-8"
        initial={{ x: 16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 16, opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-label={`Exhibit ${exNum(doc)}`}
      >
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="label-caps text-ink">The Plate Mount</h2>
          <button
            type="button"
            onClick={onClose}
            className="label-caps text-ink-faint transition-ink hover:text-ink"
          >
            Close &#x2715;
          </button>
        </div>
        <div className="rule-oxford mt-3" aria-hidden="true" />

        <div className="mt-4 flex items-baseline justify-between gap-6">
          <button
            type="button"
            disabled={!prev}
            onClick={() => prev && onNavigate(prev.id)}
            className={clsx(
              "font-mono text-caption tracking-[0.08em] transition-ink",
              prev ? "text-ink-secondary hover:text-ink" : "cursor-default text-ink-faint/50",
            )}
          >
            &#x2190; {prev ? `Ex. ${exNum(prev)}` : "—"}
          </button>
          <p className="font-mono text-caption tracking-[0.08em] text-ink-secondary">
            {idx >= 0 ? `${int(idx + 1)} of ${int(navList.length)} in view` : doc.exhibit}
          </p>
          <button
            type="button"
            disabled={!next}
            onClick={() => next && onNavigate(next.id)}
            className={clsx(
              "font-mono text-caption tracking-[0.08em] transition-ink",
              next ? "text-ink-secondary hover:text-ink" : "cursor-default text-ink-faint/50",
            )}
          >
            {next ? `Ex. ${exNum(next)}` : "—"} &#x2192;
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          {(
            [
              ["Kind", KIND_LABEL[doc.kind]],
              ["Account", accountLabel(doc.accountId)],
              ["Period", periodLabel(doc)],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="label-caps text-ink-faint">{k}</dt>
              <dd className="mt-0.5 font-mono text-table text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {keyNote && <MarginNote className="mt-4">{keyNote}</MarginNote>}

        <ExhibitFrame doc={doc} height={640} />
      </motion.aside>
    </>
  );
}

/* ---------------------------------------------------------------------------
   The page.
--------------------------------------------------------------------------- */

export default function Documents() {
  const [kind, setKind] = useState<"all" | DocumentKind>("all");
  const [accountId, setAccountId] = useState<string>("all");
  const [scannedOnly, setScannedOnly] = useState(false);
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(SHELVES.filter((g) => g.defaultOpen).map((g) => g.id)),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const anyFilter = kind !== "all" || accountId !== "all" || scannedOnly;

  const shelves = useMemo(() => {
    const matches = (d: CaseDocument) =>
      (kind === "all" || d.kind === kind) &&
      (accountId === "all" || d.accountId === accountId) &&
      (!scannedOnly || d.scanned);
    return SHELVES.map((g) => ({ ...g, docs: g.docs.filter(matches) })).filter(
      (g) => g.docs.length > 0,
    );
  }, [kind, accountId, scannedOnly]);

  const flatVisible = useMemo(() => shelves.flatMap((g) => g.docs), [shelves]);
  const shownCount = flatVisible.length;

  const selected = selectedId ? DOCS.find((d) => d.id === selectedId) ?? null : null;
  const navList =
    selected && flatVisible.some((d) => d.id === selected.id) ? flatVisible : ALL_SORTED;

  const toggleShelf = (id: string) =>
    setOpen((prev) => {
      const nxt = new Set(prev);
      if (nxt.has(id)) nxt.delete(id);
      else nxt.add(id);
      return nxt;
    });

  const rowProps = (d: CaseDocument) => ({
    role: "button" as const,
    tabIndex: 0,
    onClick: () => setSelectedId(d.id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedId(d.id);
      }
    },
  });

  return (
    <>
      <PageHeader
        kicker="Section VII · Exhibit Index"
        title="The Evidence Room"
        lede={`Every source document in the production, catalogued and mounted. ${int(
          DOC_COUNT,
        )} exhibits across ${int(
          PAGE_COUNT,
        )} pages — statements, returns, and county records — each traceable to the ledger rows extracted from it, and each ledger row traceable back to its page and line.`}
        exhibit={`Exs. 1–${exNum(ALL_SORTED[ALL_SORTED.length - 1])}`}
      />

      {/* Production statistics */}
      <section className="grid grid-cols-2 gap-8 sm:grid-cols-4" aria-label="Production statistics">
        <StatTile
          label="Documents catalogued"
          value={<TickFigure cents={DOC_COUNT} format={int} />}
          note="Complete production set, Exs. 1 forward."
        />
        <StatTile
          label="Pages"
          value={<TickFigure cents={PAGE_COUNT} format={int} />}
          note="Every page paginated and hash-stamped."
        />
        <StatTile
          label="Scanned"
          value={<TickFigure cents={SCANNED_COUNT} format={int} />}
          note="Produced via subpoena; OCR-extracted."
        />
        <StatTile
          label="Born-digital"
          value={<TickFigure cents={NATIVE_COUNT} format={int} />}
          note="Produced natively; parsed at full confidence."
        />
      </section>

      {/* Key exhibits — pinned */}
      <section className="mt-12" aria-label="Key exhibits">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="label-caps text-ink">Key Exhibits</h2>
          <p className="marginalia">The documents the findings rest on.</p>
        </div>
        <div className="rule-oxford-brass mt-2" aria-hidden="true" />
        <ul className="animate-settle">
          {KEY_DOCS.map((d) => (
            <li key={d.id} className="rule-hairline">
              <button
                type="button"
                onClick={() => setSelectedId(d.id)}
                className="transition-ink flex w-full items-baseline gap-4 px-2 py-3 text-left hover:bg-paper-hover sm:gap-6"
              >
                <span className="w-14 shrink-0 font-mono text-table text-brass">
                  Ex. {exNum(d)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-body text-table text-ink">{d.title}</span>
                  <span className="marginalia mt-0.5 block">{KEY_NOTES[d.id]}</span>
                </span>
                <span className="hidden shrink-0 sm:block">
                  <ProductionMark scanned={d.scanned} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Filter rail */}
      <section className="mt-12" aria-label="Exhibit filters">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
            <label className="block">
              <span className="label-caps block text-ink-faint">Kind</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as "all" | DocumentKind)}
                className="transition-ink mt-1.5 border border-hairline-strong bg-paper-raised px-2 py-1.5 font-mono text-caption text-ink focus:border-ink focus:outline-none"
              >
                <option value="all">All kinds</option>
                {KINDS_PRESENT.map((k) => (
                  <option key={k} value={k}>
                    {KIND_LABEL[k]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label-caps block text-ink-faint">Account</span>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="transition-ink mt-1.5 border border-hairline-strong bg-paper-raised px-2 py-1.5 font-mono text-caption text-ink focus:border-ink focus:outline-none"
              >
                <option value="all">All accounts</option>
                {ACCOUNTS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.institution} ····{a.last4} — {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2 pb-1.5">
              <input
                type="checkbox"
                checked={scannedOnly}
                onChange={(e) => setScannedOnly(e.target.checked)}
                className="h-3.5 w-3.5 cursor-pointer accent-[#1E3A2F]"
              />
              <span className="label-caps text-ink-secondary">Scanned only</span>
            </label>
          </div>
          <p className="font-mono text-caption text-ink-faint">
            {int(shownCount)} of {int(DOC_COUNT)} exhibits in view
          </p>
        </div>
      </section>

      {/* The collection — broadsheet index */}
      <section className="mt-6 overflow-x-auto" aria-label="Exhibit index">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-hairline-strong">
              <th className="label-caps w-[4.5rem] px-2 pb-2 text-left text-ink-secondary">
                No.
              </th>
              <th className="label-caps px-2 pb-2 text-left text-ink-secondary">Title</th>
              <th className="label-caps w-[8.5rem] px-2 pb-2 text-left text-ink-secondary">
                Kind
              </th>
              <th className="label-caps w-[11rem] px-2 pb-2 text-left text-ink-secondary">
                Period
              </th>
              <th className="label-caps w-[3.5rem] px-2 pb-2 text-right text-ink-secondary">
                pp.
              </th>
              <th className="label-caps w-[7rem] px-2 pb-2 text-left text-ink-secondary">
                Production
              </th>
            </tr>
          </thead>
          {shelves.map((g) => {
            const expanded = anyFilter || open.has(g.id);
            const pages = g.docs.reduce((s, d) => s + d.pages, 0);
            return (
              <tbody key={g.id}>
                <tr>
                  <td colSpan={6} className="px-0 pb-0 pt-6">
                    <button
                      type="button"
                      onClick={() => toggleShelf(g.id)}
                      disabled={anyFilter}
                      aria-expanded={expanded}
                      className={clsx(
                        "transition-ink flex w-full items-baseline gap-3 border-b border-hairline-strong px-2 pb-1.5 text-left",
                        !anyFilter && "hover:bg-paper-hover",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="w-3 shrink-0 font-mono text-caption text-ink-faint"
                      >
                        {expanded ? "−" : "+"}
                      </span>
                      <span className="label-caps text-ink">{g.label}</span>
                      {g.undisclosed && (
                        <span className="label-caps text-oxblood">
                          † undisclosed — surfaced by analysis
                        </span>
                      )}
                      <span className="ml-auto shrink-0 font-mono text-caption text-ink-faint">
                        {int(g.docs.length)} exhibits · {int(pages)} pp.
                      </span>
                    </button>
                  </td>
                </tr>
                {expanded &&
                  g.docs.map((d) => (
                    <tr
                      key={d.id}
                      {...rowProps(d)}
                      className={clsx(
                        "transition-ink cursor-pointer border-b border-hairline",
                        selectedId === d.id ? "bg-paper-well" : "hover:bg-paper-hover",
                      )}
                    >
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-table text-brass">
                        Ex. {exNum(d)}
                      </td>
                      <td className="px-2 py-3 font-body text-table text-ink">{d.title}</td>
                      <td className="label-caps whitespace-nowrap px-2 py-3 text-ink-secondary">
                        {KIND_LABEL[d.kind]}
                      </td>
                      <td className="whitespace-nowrap px-2 py-3 font-mono text-caption text-ink-secondary">
                        {periodLabel(d)}
                      </td>
                      <td className="figure px-2 py-3 text-right text-ink">{d.pages}</td>
                      <td className="px-2 py-3">
                        <ProductionMark scanned={d.scanned} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            );
          })}
        </table>
        {shelves.length === 0 && (
          <p className="marginalia mt-6">No exhibits match the current filters.</p>
        )}
      </section>

      <MarginNote className="mt-8">
        Chain of custody: scanned productions were served under subpoena duces tecum and bear the
        producing institution&rsquo;s Bates treatment; born-digital records were exported by the
        account holders and parsed without OCR. Every ledger entry in § II cites its exhibit,
        page, and line.
      </MarginNote>

      <AnimatePresence>
        {selected && (
          <ExhibitViewer
            key="viewer"
            doc={selected}
            navList={navList}
            onNavigate={setSelectedId}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
