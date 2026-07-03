import { useEffect, useRef, useState } from "react";
import {
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import clsx from "clsx";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import TickFigure from "../components/TickFigure";
import ExhibitFrame from "../components/ExhibitFrame";
import MarginNote from "../components/MarginNote";
import {
  chartColors,
  fontBody,
  fontMono,
  referenceLabelStyle,
  referenceLineProps,
  tooltipContentStyle,
  tooltipLabelStyle,
  xAxisProps,
  yAxisProps,
} from "../components/chartTheme";
import { caseFile } from "../lib/caseData";
import { buildFlowGraph } from "../engines/flows";
import { fmtDate, fmtDateShort, usd, usdExact } from "../lib/format";
import type { CaseDocument, Cents } from "../lib/types";

// ---------------------------------------------------------------------------
// Engine results & derived facts — computed once at module level
// ---------------------------------------------------------------------------

const graph = buildFlowGraph(caseFile);
const docById = new Map(caseFile.documents.map((d) => [d.id, d]));
const entityById = new Map(caseFile.entities.map((e) => [e.id, e]));

/** Aggregate every graph edge matching any (from, to) pair. */
function agg(pairs: [string, string][]) {
  let total: Cents = 0;
  let count = 0;
  let flag: string | undefined;
  for (const e of graph.edges) {
    if (pairs.some(([f, t]) => e.fromId === f && e.toId === t)) {
      total += e.total;
      count += e.count;
      flag = flag ?? e.flag;
    }
  }
  return { total, count, flag };
}

const SIDE_JOB_IDS = ["memorial-villages-mep", "bayou-city-builders", "westchase-dev"];

const eSalary = agg([["delaney-mechanical", "frost-checking"]]);
const eCash = agg([["src-cash", "frost-checking"]]);
const eSideToChecking = agg(SIDE_JOB_IDS.map((id) => [id, "frost-checking"] as [string, string]));
const eSideToBluebonnet = agg(
  SIDE_JOB_IDS.map((id) => [id, "prosperity-bluebonnet"] as [string, string]),
);
const eRent = agg([["gulf-breeze-pm", "prosperity-bluebonnet"]]);
const eEstate = agg([["whitmore-estate", "frost-savings"]]);
const eLoan = agg([["chase-biz", "prosperity-bluebonnet"]]); // flagged
const eCkToSv = agg([["frost-checking", "frost-savings"]]);
const eSvToCk = agg([["frost-savings", "frost-checking"]]);
const eSeed = agg([["frost-checking", "prosperity-bluebonnet"]]);
const eReturn = agg([["prosperity-bluebonnet", "frost-checking"]]);
const eLifestyle = agg([
  ["frost-checking", "amex"],
  ["frost-checking", "sapphire"],
]);
const eFidelity = agg([["frost-checking", "fidelity"]]);
const eTitle = agg([["prosperity-bluebonnet", "gulf-coast-title"]]); // flagged

// -- Bluebonnet narrative facts ----------------------------------------------

const formationDoc = caseFile.documents.find((d) => d.kind === "formation")!;
const closingDoc = caseFile.documents.find((d) => d.kind === "closing-statement")!;
const deedDoc = caseFile.documents.find((d) => d.kind === "deed")!;

const firstLoanTxn = caseFile.transactions.find(
  (t) => t.tags.includes("loan-labeled") && t.amount > 0,
)!;
const loanDoc = docById.get(firstLoanTxn.doc.docId)!;

const rentTxns = caseFile.transactions.filter((t) => t.category === "Rental Income");
const rentTotal = rentTxns.reduce((s, t) => s + t.amount, 0);
const rentDoc = docById.get(rentTxns[0].doc.docId)!;

const wireTxn = caseFile.transactions.find((t) => t.category === "Real Estate Purchase")!;
const prosperityAcct = caseFile.accounts.find((a) => a.id === "prosperity-bluebonnet")!;

// -- Structuring exhibit -------------------------------------------------------

interface DepositPoint {
  ts: number;
  cents: Cents;
  date: string;
  flagged: boolean;
}

const cashDeposits = caseFile.transactions.filter(
  (t) => t.amount > 0 && t.tags.includes("cash-deposit"),
);
const depositPoints: DepositPoint[] = cashDeposits.map((t) => ({
  ts: Date.parse(t.date),
  cents: t.amount,
  date: t.date,
  flagged: t.tags.includes("structuring-flag"),
}));
const ordinaryDeposits = depositPoints.filter((p) => !p.flagged);
const flaggedDeposits = depositPoints.filter((p) => p.flagged);
const cashTotal = cashDeposits.reduce((s, t) => s + t.amount, 0);
const flaggedTotal = flaggedDeposits.reduce((s, p) => s + p.cents, 0);
const maxDeposit = Math.max(...cashDeposits.map((t) => t.amount));

const CTR_THRESHOLD: Cents = 1_000_000; // $10,000

const monthTicks: number[] = [];
for (let y = 2022; y <= 2024; y++) {
  monthTicks.push(Date.parse(`${y}-01-01`), Date.parse(`${y}-07-01`));
}
monthTicks.push(Date.parse("2025-01-01"));

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtTick = (ts: number) => {
  const d = new Date(ts);
  return `${MON[d.getUTCMonth()]} ’${String(d.getUTCFullYear()).slice(2)}`;
};

// -- Counterparty roll-up --------------------------------------------------------

interface CpStat {
  total: Cents;
  count: number;
  first: string;
  last: string;
}
const cpStats = new Map<string, CpStat>();
for (const t of caseFile.transactions) {
  if (!t.counterpartyId) continue;
  const cur = cpStats.get(t.counterpartyId) ?? {
    total: 0,
    count: 0,
    first: t.date,
    last: t.date,
  };
  cur.total += Math.abs(t.amount);
  cur.count += 1;
  if (t.date < cur.first) cur.first = t.date;
  if (t.date > cur.last) cur.last = t.date;
  cpStats.set(t.counterpartyId, cur);
}

interface CpRow {
  id: string;
  name: string;
  character: string;
  flagged?: boolean;
  stat: CpStat;
}

function cpRow(id: string, character: string, flagged?: boolean): CpRow | null {
  const stat = cpStats.get(id);
  if (!stat) return null;
  return { id, name: entityById.get(id)?.name ?? id, character, flagged, stat };
}

const cashRow: CpRow = {
  id: "cash-branch",
  name: "Currency deposits — branch counters",
  character: `${cashDeposits.length} deposits, each below $10,000 — see Fig. 2`,
  flagged: true,
  stat: {
    total: cashTotal,
    count: cashDeposits.length,
    first: cashDeposits[0].date,
    last: cashDeposits[cashDeposits.length - 1].date,
  },
};

const flaggedCpRows: CpRow[] = [
  cashRow,
  cpRow("bluebonnet-holdings", "“Loan repayment” transfers from the business account — no note documented", true),
  cpRow("gulf-coast-title", "Closing agent — 4210 Seawall Blvd Unit 502, Galveston", true),
  cpRow("memorial-villages-mep", "Side-job checks deposited outside the business account", true),
  cpRow("bayou-city-builders", "Side-job checks deposited outside the business account", true),
  cpRow("gulf-breeze-pm", "Net rent remitted to undisclosed account; on no filed return", true),
  cpRow("westchase-dev", "Side-job checks deposited outside the business account", true),
].filter((r): r is CpRow => r !== null);

const ordinaryCpRows: CpRow[] = [
  cpRow("delaney-mechanical", "Payroll and member draws to personal checking"),
  cpRow("whitmore-estate", "Estate distribution — Petitioner’s separate-property claim"),
  cpRow("cadence-bank", "Residence note — Tanglewood"),
  cpRow("kinkaid", "Tuition, two children"),
  cpRow("irs", "Federal tax payments per filed returns"),
  cpRow("range-rover-finance", "Auto note"),
  cpRow("porsche-financial", "Auto note"),
  cpRow("bayou-oaks", "Club dues and house charges"),
].filter((r): r is CpRow => r !== null);

// ---------------------------------------------------------------------------
// Fig. 1 — the flow map (hand-rolled SVG, fixed composed layout)
// ---------------------------------------------------------------------------

interface MapNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  sub?: string;
  /** inferred (non-account) source — dashed border */
  inferred?: boolean;
  /** undisclosed account — oxblood treatment + plate */
  undisclosed?: boolean;
}

const N: Record<string, MapNode> = {
  "delaney-mechanical": { id: "delaney-mechanical", x: 6, y: 30, w: 200, h: 48, name: "Delaney Mechanical Svcs LLC", sub: "operating company" },
  "src-cash": { id: "src-cash", x: 6, y: 158, w: 200, h: 48, name: "Cash customers", sub: "undocumented receipts", inferred: true },
  "src-side-jobs": { id: "src-side-jobs", x: 6, y: 274, w: 200, h: 48, name: "Side-job payors", sub: "3 payors · checks off-books", inferred: true },
  "gulf-breeze-pm": { id: "gulf-breeze-pm", x: 6, y: 392, w: 200, h: 48, name: "Gulf Breeze Property Mgmt", sub: "rent — 4210 Seawall #502" },
  "whitmore-estate": { id: "whitmore-estate", x: 6, y: 498, w: 200, h: 48, name: "Estate of M. H. Whitmore", sub: "bequest to Petitioner" },

  "chase-biz": { id: "chase-biz", x: 470, y: 34, w: 220, h: 48, name: "Chase — Business Checking", sub: "Delaney Mechanical · ····3301" },
  "frost-checking": { id: "frost-checking", x: 470, y: 178, w: 220, h: 48, name: "Frost — Personal Checking", sub: "····4417 · joint" },
  "frost-savings": { id: "frost-savings", x: 470, y: 340, w: 220, h: 48, name: "Frost — Premier Savings", sub: "····8823 · commingled" },
  "prosperity-bluebonnet": { id: "prosperity-bluebonnet", x: 470, y: 486, w: 220, h: 52, name: "Prosperity — Business Checking", sub: "Bluebonnet Holdings LLC · ····9174", undisclosed: true },

  "dest-lifestyle": { id: "dest-lifestyle", x: 952, y: 128, w: 222, h: 48, name: "Lifestyle spend", sub: "Amex ····71002 · Sapphire ····5566" },
  fidelity: { id: "fidelity", x: 952, y: 246, w: 222, h: 48, name: "Fidelity Brokerage", sub: "Z40-118226 · contributions" },
  "gulf-coast-title": { id: "gulf-coast-title", x: 952, y: 440, w: 222, h: 48, name: "Gulf Coast Title Co.", sub: "closing agent · Galveston" },
};

const PROPERTY_PLATE = { x: 952, y: 548, w: 222, h: 58 };

const hPath = (x1: number, y1: number, x2: number, y2: number) =>
  `M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`;

const edgeWidth = (total: Cents) =>
  Math.min(13, Math.max(1.1, Math.sqrt(total / 100) / 70));

interface EdgeSpec {
  key: string;
  fromId: string;
  toId: string;
  d: string;
  lx: number;
  ly: number;
  anchor?: "start" | "middle" | "end";
  total: Cents;
  count: number;
  flag?: string;
}

const EDGES: EdgeSpec[] = [
  { key: "salary", fromId: "delaney-mechanical", toId: "frost-checking", d: hPath(206, 56, 470, 190), lx: 338, ly: 112, ...eSalary },
  { key: "cash", fromId: "src-cash", toId: "frost-checking", d: hPath(206, 182, 470, 203), lx: 338, ly: 184, ...eCash },
  { key: "side-ck", fromId: "src-side-jobs", toId: "frost-checking", d: hPath(206, 290, 470, 216), lx: 338, ly: 242, ...eSideToChecking },
  { key: "side-bb", fromId: "src-side-jobs", toId: "prosperity-bluebonnet", d: hPath(206, 306, 470, 502), lx: 240, ly: 330, ...eSideToBluebonnet },
  { key: "rent", fromId: "gulf-breeze-pm", toId: "prosperity-bluebonnet", d: hPath(206, 416, 470, 516), lx: 234, ly: 416, ...eRent },
  { key: "estate", fromId: "whitmore-estate", toId: "frost-savings", d: hPath(206, 522, 470, 364), lx: 416, ly: 408, ...eEstate },
  { key: "loan", fromId: "chase-biz", toId: "prosperity-bluebonnet", d: "M 690 58 C 860 85, 830 410, 596 486", lx: 788, ly: 296, anchor: "start", ...eLoan },
  { key: "ck-sv", fromId: "frost-checking", toId: "frost-savings", d: "M 545 226 C 545 268, 545 298, 545 340", lx: 536, ly: 288, anchor: "end", ...eCkToSv },
  { key: "sv-ck", fromId: "frost-savings", toId: "frost-checking", d: "M 625 340 C 625 298, 625 268, 625 226", lx: 634, ly: 288, anchor: "start", ...eSvToCk },
  { key: "seed", fromId: "frost-checking", toId: "prosperity-bluebonnet", d: "M 500 226 C 448 276, 442 448, 470 492", lx: 434, ly: 366, anchor: "end", ...eSeed },
  { key: "return", fromId: "prosperity-bluebonnet", toId: "frost-checking", d: "M 690 496 C 742 434, 742 282, 690 218", lx: 748, ly: 366, anchor: "start", ...eReturn },
  { key: "lifestyle", fromId: "frost-checking", toId: "dest-lifestyle", d: hPath(690, 186, 952, 152), lx: 820, ly: 156, ...eLifestyle },
  { key: "fidelity", fromId: "frost-checking", toId: "fidelity", d: hPath(690, 202, 952, 270), lx: 872, ly: 238, ...eFidelity },
  { key: "title", fromId: "prosperity-bluebonnet", toId: "gulf-coast-title", d: hPath(690, 526, 952, 464), lx: 820, ly: 484, ...eTitle },
];

const nodeName = (id: string) => N[id]?.name ?? entityById.get(id)?.name ?? id;

function FlowNode({ n }: { n: MapNode }) {
  return (
    <g>
      {n.undisclosed && (
        <g>
          <rect
            x={n.x}
            y={n.y - 22}
            width={112}
            height={17}
            fill={chartColors.oxbloodWash}
            stroke={chartColors.oxblood}
            strokeWidth={1}
          />
          <text
            x={n.x + 56}
            y={n.y - 10}
            textAnchor="middle"
            style={{
              fontFamily: fontMono,
              fontSize: 8.5,
              letterSpacing: "0.14em",
              fill: chartColors.oxblood,
              fontWeight: 500,
            }}
          >
            UNDISCLOSED
          </text>
        </g>
      )}
      <rect
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        fill={chartColors.paperRaised}
        stroke={n.undisclosed ? chartColors.oxblood : "rgba(28,27,22,0.45)"}
        strokeWidth={n.undisclosed ? 1.25 : 1}
        strokeDasharray={n.inferred ? "3 3" : undefined}
      />
      <text
        x={n.x + 12}
        y={n.y + 20}
        style={{ fontFamily: fontBody, fontSize: 12.5, fill: chartColors.ink }}
      >
        {n.name}
      </text>
      {n.sub && (
        <text
          x={n.x + 12}
          y={n.y + 36}
          style={{ fontFamily: fontMono, fontSize: 9.5, fill: chartColors.inkFaint }}
        >
          {n.sub}
        </text>
      )}
    </g>
  );
}

function FlowMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ key: string; x: number; y: number } | null>(null);

  const move = (key: string) => (ev: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTip({ key, x: ev.clientX - rect.left, y: ev.clientY - rect.top });
  };

  const hovered = tip ? EDGES.find((e) => e.key === tip.key) : undefined;

  const colHead = (x: number, label: string) => (
    <text
      x={x}
      y={14}
      style={{
        fontFamily: '"Fraunces", Georgia, serif',
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: "0.1em",
        fill: chartColors.inkSecondary,
      }}
    >
      {label}
    </text>
  );

  return (
    <div ref={wrapRef} className="relative">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 1180 640" className="block w-full min-w-[900px]" role="img" aria-label="Flow of funds map, 2022 to 2024">
          <defs>
            <marker id="arr-green" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 0 L 7 4 L 0 8 z" fill={chartColors.primary} />
            </marker>
            <marker id="arr-ox" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 0 L 7 4 L 0 8 z" fill={chartColors.oxblood} />
            </marker>
          </defs>

          {colHead(6, "SOURCES")}
          {colHead(470, "ACCOUNTS")}
          {colHead(952, "APPLICATIONS")}

          {/* static ties (dotted, non-interactive) */}
          <path d="M 206 44 C 338 44, 338 52, 470 52" fill="none" stroke={chartColors.inkFaint} strokeWidth={1} strokeDasharray="2 3" />
          <text x={338} y={40} textAnchor="middle" style={{ fontFamily: fontBody, fontStyle: "italic", fontSize: 10, fill: chartColors.inkFaint }}>
            its operating account
          </text>
          <path d={`M 1062 488 L 1062 ${PROPERTY_PLATE.y}`} fill="none" stroke={chartColors.inkFaint} strokeWidth={1} strokeDasharray="2 3" />
          <text x={1070} y={524} style={{ fontFamily: fontBody, fontStyle: "italic", fontSize: 10, fill: chartColors.inkFaint }}>
            deed
          </text>

          {/* edges */}
          {EDGES.map((e) => {
            const isFlag = Boolean(e.flag);
            const active = tip?.key === e.key;
            const dim = tip !== null && !active;
            const stroke = isFlag ? chartColors.oxblood : chartColors.primary;
            return (
              <g key={e.key}>
                <path
                  d={e.d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={edgeWidth(e.total)}
                  strokeOpacity={active ? 0.92 : dim ? 0.14 : isFlag ? 0.6 : 0.42}
                  strokeLinecap="butt"
                  markerEnd={isFlag ? "url(#arr-ox)" : "url(#arr-green)"}
                  className="transition-ink"
                />
                {/* invisible fat hit area */}
                <path
                  d={e.d}
                  fill="none"
                  stroke="rgba(0,0,0,0)"
                  strokeWidth={Math.max(edgeWidth(e.total), 14)}
                  onMouseMove={move(e.key)}
                  onMouseLeave={() => setTip(null)}
                  style={{ cursor: "default" }}
                />
                <text
                  x={e.lx}
                  y={e.ly}
                  textAnchor={e.anchor ?? "middle"}
                  style={{
                    fontFamily: fontMono,
                    fontSize: 10,
                    fill: active ? chartColors.ink : isFlag ? chartColors.oxblood : chartColors.inkSecondary,
                    pointerEvents: "none",
                  }}
                >
                  {usd(e.total)}
                </text>
              </g>
            );
          })}

          {/* nodes over edges */}
          {Object.values(N).map((n) => (
            <FlowNode key={n.id} n={n} />
          ))}

          {/* property plate */}
          <g>
            <rect
              x={PROPERTY_PLATE.x}
              y={PROPERTY_PLATE.y}
              width={PROPERTY_PLATE.w}
              height={PROPERTY_PLATE.h}
              fill={chartColors.paperRaised}
              stroke="rgba(28,27,22,0.45)"
              strokeWidth={1}
            />
            <rect
              x={PROPERTY_PLATE.x + 3}
              y={PROPERTY_PLATE.y + 3}
              width={PROPERTY_PLATE.w - 6}
              height={PROPERTY_PLATE.h - 6}
              fill="none"
              stroke="rgba(28,27,22,0.2)"
              strokeWidth={1}
            />
            <text
              x={PROPERTY_PLATE.x + 14}
              y={PROPERTY_PLATE.y + 21}
              style={{ fontFamily: fontBody, fontSize: 12.5, fill: chartColors.ink }}
            >
              4210 Seawall Blvd #502
            </text>
            <text
              x={PROPERTY_PLATE.x + 14}
              y={PROPERTY_PLATE.y + 35}
              style={{ fontFamily: fontMono, fontSize: 9.5, fill: chartColors.inkFaint }}
            >
              Galveston {"·"} $385,000 {"·"} 2023-08-18
            </text>
            <text
              x={PROPERTY_PLATE.x + 14}
              y={PROPERTY_PLATE.y + 49}
              style={{ fontFamily: fontMono, fontSize: 9, fill: chartColors.oxblood }}
            >
              deed: Bluebonnet Holdings LLC
            </text>
          </g>
        </svg>
      </div>

      {tip && hovered && (
        <div
          className="pointer-events-none absolute z-10 max-w-[300px] border border-[rgba(28,27,22,0.35)] bg-paper-raised px-3 py-2 shadow-sheet"
          style={{ left: Math.min(tip.x + 14, 860), top: tip.y + 12 }}
        >
          <p className="font-body text-caption italic text-ink-secondary" style={{ letterSpacing: 0 }}>
            {nodeName(hovered.fromId)} {"→"} {nodeName(hovered.toId)}
          </p>
          <p className="mt-0.5 font-mono text-table text-ink">
            {usd(hovered.total)}
            <span className="ml-2 text-caption text-ink-faint">
              {hovered.count} {hovered.count === 1 ? "transaction" : "transactions"}
            </span>
          </p>
          {hovered.flag && (
            <p className="mt-1 font-body text-caption italic text-oxblood" style={{ letterSpacing: 0 }}>
              {hovered.flag}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fig. 2 — structuring scatter
// ---------------------------------------------------------------------------

function depositDot(fill: string) {
  return (props: unknown) => {
    const { cx, cy } = props as { cx?: number; cy?: number };
    if (cx == null || cy == null) return <g />;
    return <circle cx={cx} cy={cy} r={2.8} fill={fill} fillOpacity={0.5} stroke={fill} strokeWidth={0.75} />;
  };
}

function DepositTooltip(props: { active?: boolean; payload?: { payload: DepositPoint }[] }) {
  const { active, payload } = props;
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div style={tooltipContentStyle}>
      <div style={tooltipLabelStyle}>{fmtDate(p.date)}</div>
      <div>{usdExact(p.cents)}</div>
      {p.flagged && (
        <div style={{ fontFamily: fontBody, fontStyle: "italic", fontSize: 11, color: chartColors.oxblood, marginTop: 2 }}>
          structuring-pattern cluster
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section chrome
// ---------------------------------------------------------------------------

function SectionHead({ fig, title }: { fig: string; title: string }) {
  return (
    <div className="mb-5 mt-14">
      <p className="label-caps text-brass">{fig}</p>
      <h2 className="mt-1 font-display text-section text-ink" style={{ fontWeight: 420 }}>
        {title}
      </h2>
      <div className="rule-hairline mt-3" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

interface Finding {
  text: React.ReactNode;
  doc: CaseDocument;
  linkLabel: string;
}

const money = (cents: Cents) => <span className="figure whitespace-nowrap">{usd(cents)}</span>;

const FINDINGS: Finding[] = [
  {
    text: (
      <>
        Bluebonnet Holdings LLC was formed on {fmtDate("2023-03-14")} (TX SOS #805221947). Six
        days later, Prosperity Bank business checking {"····"}9174 was opened
        in the LLC{"’"}s name{prosperityAcct.opened ? ` (${fmtDate(prosperityAcct.opened)})` : ""}.
        Neither the entity nor the account appears in Respondent{"’"}s sworn inventory.
      </>
    ),
    doc: formationDoc,
    linkLabel: "Certificate of Formation",
  },
  {
    text: (
      <>
        Between {fmtDate(firstLoanTxn.date)} and the period end, the Delaney Mechanical operating
        account transferred {money(eLoan.total)} to the Prosperity account in {eLoan.count}{" "}
        transfers described {"“"}LOAN REPAYMENT.{"”"} The company{"’"}s books
        reflect no note receivable, and no loan agreement has been produced.
      </>
    ),
    doc: loanDoc,
    linkLabel: "first “loan repayment” entry",
  },
  {
    text: (
      <>
        On {fmtDate(wireTxn.date)}, the Prosperity account wired {money(-wireTxn.amount)} to Gulf
        Coast Title Co., closing the {money(38_500_000)} purchase of 4210 Seawall Blvd Unit 502,
        Galveston. The balance was carried by a {money(20_000_000)} seller note from Shoreline
        Ventures LLC {"—"} a liability disclosed on no statement produced in discovery.
      </>
    ),
    doc: closingDoc,
    linkLabel: "Settlement Statement",
  },
  {
    text: (
      <>
        The warranty deed vests title in Bluebonnet Holdings LLC {"—"} not in Respondent{" "}
        {"—"} placing a {money(38_500_000)} asset outside the sworn inventory of the marital
        estate.
      </>
    ),
    doc: deedDoc,
    linkLabel: "Warranty Deed",
  },
  {
    text: (
      <>
        Since {fmtDate(rentTxns[0].date)}, Gulf Breeze Property Management has remitted net rent
        of {money(rentTxns[0].amount)} per month to the Prosperity account {"—"}{" "}
        {money(rentTotal)} across {rentTxns.length} remittances. No filed return reports rental
        income from the property.
      </>
    ),
    doc: rentDoc,
    linkLabel: "first rent remittance",
  },
];

export default function Tracing() {
  const [exhibitId, setExhibitId] = useState<string | null>(null);
  const exhibitDoc = exhibitId ? docById.get(exhibitId) : undefined;

  useEffect(() => {
    if (!exhibitId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExhibitId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exhibitId]);

  return (
    <>
      <PageHeader
        kicker="Section V · Asset Tracing"
        title="Follow the Money"
        lede="Every material dollar that moved through the estate is put on one map: where it originated, which account carried it, and where it came to rest. The Bluebonnet Holdings funnel — formation, funding, the Galveston purchase, and the rent it now produces — is documented exhibit by exhibit."
        exhibit={`Ex. ${formationDoc.exhibit.replace(/^Ex\.?\s*/i, "")}–${deedDoc.exhibit.replace(/^Ex\.?\s*/i, "")}, ${loanDoc.exhibit.replace(/^Ex\.?\s*/i, "")}, ${rentDoc.exhibit.replace(/^Ex\.?\s*/i, "")}`}
      />

      {/* Headline figures */}
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
        <StatTile
          label="Currency deposits"
          value={<TickFigure cents={cashTotal} />}
          note={`${cashDeposits.length} branch deposits, all below $10,000.`}
        />
        <StatTile
          label="“Loan repayments”"
          value={<TickFigure cents={eLoan.total} />}
          note="No note or loan on the company's books."
          tone="adverse"
        />
        <StatTile
          label="Wire to Gulf Coast Title"
          value={<TickFigure cents={eTitle.total} />}
          note="Closing — 4210 Seawall Blvd #502."
          tone="adverse"
        />
        <StatTile
          label="Undeclared rent"
          value={<TickFigure cents={rentTotal} />}
          note={`${rentTxns.length} remittances since ${fmtDate(rentTxns[0].date)}.`}
        />
      </div>

      {/* (a) Flow map */}
      <SectionHead fig="Fig. 1" title="Flow of funds, 2022–2024" />
      <div className="sheet bg-paper-raised p-4 shadow-sheet sm:p-6">
        <FlowMap />
      </div>
      <MarginNote className="mt-3" mark="†">
        Fig. 1 {"—"} Flow of funds, 2022{"–"}2024. Path weight is proportional to the
        square root of the total moved; oxblood paths mark flagged movements. Hover any path for
        the underlying count. Amounts per the unified ledger, {"§"} II.
      </MarginNote>

      {/* (b) The Bluebonnet narrative */}
      <SectionHead fig="Findings · V(b)" title="The Bluebonnet Holdings funnel" />
      <ol className="max-w-[76ch]">
        {FINDINGS.map((f, i) => (
          <li key={i} className="flex gap-5 border-b border-hairline py-5 last:border-b-0">
            <span className="select-none pt-0.5 font-mono text-table text-brass">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <p className="font-body text-body text-ink">{f.text}</p>
              <p className="mt-2">
                <button
                  type="button"
                  onClick={() => setExhibitId(f.doc.id)}
                  className="transition-ink font-mono text-caption text-green underline decoration-[rgba(30,58,47,0.35)] underline-offset-4 hover:text-green-deep"
                >
                  {f.doc.exhibit} {"—"} {f.linkLabel} {"↗"}
                </button>
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* (c) Structuring exhibit */}
      <SectionHead fig="Fig. 2" title="Currency deposits and the reporting threshold" />
      <div className="sheet bg-paper-raised p-4 shadow-sheet sm:p-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 24, bottom: 4, left: 8 }}>
              <XAxis
                {...xAxisProps}
                dataKey="ts"
                type="number"
                domain={[Date.parse("2021-12-01"), Date.parse("2025-01-15")]}
                ticks={monthTicks}
                tickFormatter={fmtTick}
              />
              <YAxis
                {...yAxisProps}
                dataKey="cents"
                type="number"
                domain={[0, 1_150_000]}
                ticks={[0, 250_000, 500_000, 750_000, 1_000_000]}
                tickFormatter={(v: number) => `$${(v / 100).toLocaleString("en-US")}`}
                width={72}
              />
              <Tooltip
                content={<DepositTooltip />}
                cursor={{ stroke: chartColors.hairlineStrong, strokeWidth: 1 }}
                isAnimationActive={false}
              />
              <ReferenceLine
                y={CTR_THRESHOLD}
                {...referenceLineProps}
                stroke={chartColors.oxblood}
                label={{
                  value: "Currency Transaction Report threshold",
                  position: "insideTopRight",
                  ...referenceLabelStyle,
                  fill: chartColors.oxblood,
                }}
              />
              <Scatter
                data={ordinaryDeposits}
                shape={depositDot(chartColors.primary)}
                isAnimationActive={false}
              />
              <Scatter
                data={flaggedDeposits}
                shape={depositDot(chartColors.oxblood)}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
      <MarginNote className="mt-3" mark="†">
        Fig. 2 {"—"} {cashDeposits.length} currency deposits to Frost checking{" "}
        {"····"}4417 totaling {usd(cashTotal)}; the largest is{" "}
        {usdExact(maxDeposit)}. Every deposit falls below the $10,000 threshold; the{" "}
        {flaggedDeposits.length} deposits in oxblood ({usd(flaggedTotal)}) arrive in clusters of
        two and three inside single weeks.
      </MarginNote>
      <MarginNote className="mt-1.5" mark="‡">
        31 CFR 1010.311 {"—"} pattern consistent with structuring; referred for counsel
        {"’"}s consideration.
      </MarginNote>

      {/* (d) Counterparty table */}
      <SectionHead fig="Table 1" title="Notable counterparties" />
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                { label: "Counterparty", align: "text-left" },
                { label: "Total moved ($)", align: "text-right" },
                { label: "Items", align: "text-right" },
                { label: "First seen", align: "text-right" },
                { label: "Last seen", align: "text-right" },
              ].map((c) => (
                <th
                  key={c.label}
                  scope="col"
                  className={clsx(
                    "label-caps whitespace-nowrap border-b border-[rgba(28,27,22,0.35)] px-3 pb-2 text-ink-secondary",
                    c.align,
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-3 pb-1 pt-5">
                <span className="label-caps text-ink">Flagged for findings</span>
              </td>
            </tr>
            {flaggedCpRows.map((r) => (
              <CounterpartyRow key={r.id} row={r} />
            ))}
            <tr>
              <td colSpan={5} className="px-3 pb-1 pt-6">
                <span className="label-caps text-ink">Ordinary course</span>
              </td>
            </tr>
            {ordinaryCpRows.map((r) => (
              <CounterpartyRow key={r.id} row={r} />
            ))}
          </tbody>
        </table>
      </div>
      <MarginNote className="mt-3" mark="†">
        Table 1 {"—"} Notable counterparties, unified ledger, 2022{"–"}2024. Totals are
        absolute movement (inflows plus outflows) across all seven accounts; flagged rows carry a
        dagger to the findings above.
      </MarginNote>

      {/* Exhibit slide-over */}
      {exhibitDoc && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={exhibitDoc.title}>
          <div
            className="animate-fade absolute inset-0 bg-[rgba(28,27,22,0.45)]"
            onClick={() => setExhibitId(null)}
          />
          <aside className="animate-settle absolute right-0 top-0 h-full w-[min(720px,94vw)] overflow-y-auto border-l border-[rgba(28,27,22,0.4)] bg-paper px-6 py-5 shadow-sheet">
            <div className="flex items-baseline justify-between gap-4">
              <p className="label-caps text-ink-secondary">Exhibit viewer</p>
              <button
                type="button"
                onClick={() => setExhibitId(null)}
                className="transition-ink font-mono text-caption text-ink-secondary underline underline-offset-4 hover:text-ink"
              >
                Close {"×"}
              </button>
            </div>
            <ExhibitFrame doc={exhibitDoc} height={680} />
          </aside>
        </div>
      )}
    </>
  );
}

function CounterpartyRow({ row }: { row: CpRow }) {
  return (
    <tr className={clsx("transition-ink", row.flagged ? "row-flagged" : "hover:bg-paper-hover")}>
      <td className="px-3 py-3 align-baseline">
        <span className="font-body text-table text-ink">{row.name}</span>
        <span className="marginalia mt-0.5 block">{row.character}</span>
      </td>
      <td className="px-3 py-3 text-right align-baseline">
        <span className="figure">{usd(row.stat.total)}</span>
        {row.flagged && <sup className="ml-0.5 select-none font-body text-oxblood">{"†"}</sup>}
      </td>
      <td className="px-3 py-3 text-right align-baseline">
        <span className="figure">{row.stat.count}</span>
      </td>
      <td className="px-3 py-3 text-right align-baseline">
        <span className="font-mono text-caption text-ink-secondary">{fmtDateShort(row.stat.first)}</span>
      </td>
      <td className="px-3 py-3 text-right align-baseline">
        <span className="font-mono text-caption text-ink-secondary">{fmtDateShort(row.stat.last)}</span>
      </td>
    </tr>
  );
}
