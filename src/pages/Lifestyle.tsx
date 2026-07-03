import { useState } from "react";
import clsx from "clsx";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import TickFigure from "../components/TickFigure";
import ScheduleTable from "../components/ScheduleTable";
import type { ScheduleRow } from "../components/ScheduleTable";
import MarginNote from "../components/MarginNote";
import {
  barProps,
  chartColors,
  fontBody,
  linePrimaryProps,
  referenceLabelStyle,
  strokes,
  tooltipProps,
  xAxisProps,
  yAxisProps,
} from "../components/chartTheme";
import { caseFile } from "../lib/caseData";
import { buildLifestyle, personalAccountIds } from "../engines";
import type { LifestyleYear } from "../lib/types";
import { fmtMonth, usd, usdCompact } from "../lib/format";

// ---------------------------------------------------------------------------
// Engine results — pure functions over static data; computed once at module level.
// ---------------------------------------------------------------------------

const lifestyle: LifestyleYear[] = buildLifestyle(caseFile);
const latest = lifestyle[lifestyle.length - 1];

/** Exhibit mark of the filed return backing a year's reported income. */
function returnExhibit(year: number): string | undefined {
  const docId = caseFile.reported.find((r) => r.year === year)?.docId;
  return caseFile.documents.find((d) => d.id === docId)?.exhibit;
}

/**
 * 36-month spending rhythm: monthly living-expense outflows across personal
 * accounts (transfers excluded, card purchases counted once at the card),
 * with the months that contain structuring-flagged cash deposits marked.
 */
const rhythm = (() => {
  const scope = personalAccountIds(caseFile);
  const totals = new Map<string, number>();
  const structured = new Set<string>();
  for (const t of caseFile.transactions) {
    const month = t.date.slice(0, 7);
    if (month < "2022-01" || month > "2024-12") continue;
    if (t.tags.includes("structuring-flag")) structured.add(month);
    if (!scope.has(t.accountId)) continue;
    if (t.transferGroup) continue;
    if (t.amount >= 0) continue;
    if (!t.tags.includes("living-expense")) continue;
    totals.set(month, (totals.get(month) ?? 0) + -t.amount);
  }
  const months: { month: string; spend: number; flagged: number | null }[] = [];
  for (let y = 2022; y <= 2024; y++) {
    for (let m = 1; m <= 12; m++) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const spend = totals.get(key) ?? 0;
      months.push({ month: key, spend, flagged: structured.has(key) ? spend : null });
    }
  }
  return months;
})();

const flaggedMonthCount = rhythm.filter((m) => m.flagged !== null).length;

// ---------------------------------------------------------------------------
// Schedule rows — court-schedule grammar: itemized categories, subtotal,
// reported income deducted in parentheses, flagged excess under a double rule.
// ---------------------------------------------------------------------------

function scheduleRows(y: LifestyleYear): ScheduleRow[] {
  const exhibit = returnExhibit(y.year);
  return [
    {
      id: "grp",
      cells: ["Personal living expenditures — documented", null],
      kind: "group",
    },
    ...y.byCategory.map((c) => ({
      id: `cat-${c.category}`,
      cells: [c.category, c.amount] as (string | number)[],
      indent: 1 as const,
    })),
    {
      id: "sub",
      cells: ["Total personal living expenditures", y.totalLifestyle],
      kind: "subtotal",
    },
    {
      id: "reported",
      cells: ["Less — income reported per return", -y.reportedIncome],
      indent: 1,
      note: exhibit ? `Per Form 1040 (${y.year}), ${exhibit}.` : undefined,
    },
    {
      id: "gap",
      cells: ["Excess of lifestyle over reported income", y.gap],
      kind: "total",
      flag: true,
      note: "† Documented outlays the filed return cannot fund; see § IV for the three-method reconciliation.",
    },
  ];
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Lifestyle() {
  const [year, setYear] = useState<number>(latest.year);
  const yd = lifestyle.find((y) => y.year === year) ?? latest;

  const barData = yd.byCategory.map((c) => ({ name: c.category, amount: c.amount }));
  const barDomainMax =
    Math.ceil(
      Math.max(yd.reportedIncome * 1.1, ...yd.byCategory.map((c) => c.amount)) / 2_500_000,
    ) * 2_500_000;
  const barChartHeight = barData.length * 30 + 48;

  return (
    <>
      <PageHeader
        kicker="Section III · Lifestyle Analysis"
        title="How the Household Actually Lives"
        lede={`They live on ${usd(latest.totalLifestyle)} and report ${usd(
          latest.reportedIncome,
        )}. Every figure below is a documented outlay, vouched to a statement line — nothing is estimated.`}
        exhibit="Sched. L"
      />

      {/* Hero: the sentence, in figures */}
      <section className="animate-settle grid grid-cols-2 gap-8 sm:grid-cols-3">
        <StatTile
          label={`True lifestyle spend · ${latest.year}`}
          value={<TickFigure cents={latest.totalLifestyle} />}
          note="Documented personal living expenditures, per the unified ledger."
        />
        <StatTile
          label={`Income reported · ${latest.year}`}
          value={<TickFigure cents={latest.reportedIncome} />}
          note={`Total income per Form 1040 (${latest.year}), ${returnExhibit(latest.year) ?? ""}.`}
        />
        <StatTile
          label="Unexplained"
          value={<TickFigure cents={latest.gap} />}
          note="Per year — lifestyle in excess of income per return."
          tone="adverse"
        />
      </section>

      {/* Year rail */}
      <nav aria-label="Analysis year" className="rule-hairline mt-12 flex items-baseline gap-8">
        {lifestyle.map((y) => (
          <button
            key={y.year}
            type="button"
            onClick={() => setYear(y.year)}
            aria-current={y.year === year ? "true" : undefined}
            className={clsx(
              "transition-ink -mb-px border-b-2 px-0.5 pb-2.5 font-mono text-table tracking-[0.04em]",
              y.year === year
                ? "border-ink text-ink"
                : "border-transparent text-ink-faint hover:text-ink-secondary",
            )}
          >
            {y.year}
          </button>
        ))}
        <span className="marginalia ml-auto hidden pb-2.5 sm:block">
          Tax years under examination, 2022–2024.
        </span>
      </nav>

      {/* Per-year exhibits — keyed on year so a tab change settles in quietly */}
      <div key={year} className="animate-fade">
        {/* (a) Schedule of Personal Living Expenditures */}
        <section className="mt-10">
          <h2 className="label-caps text-ink">
            Schedule L-{year - 2021} — Schedule of Personal Living Expenditures, {year}
          </h2>
          <div className="sheet mt-4 px-4 py-2 sm:px-6">
            <ScheduleTable
              columns={[
                { key: "item", label: "Category" },
                { key: "amount", label: `Year ended 12/31/${String(year).slice(2)} ($)`, align: "right" },
              ]}
              rows={scheduleRows(yd)}
              caption={`Living-expense outflows across the joint and subject accounts, ${year}; inter-account transfers excluded, card purchases counted once at the card.`}
            />
          </div>
        </section>

        {/* (b) Category bars against the income-per-return line */}
        <section className="mt-12">
          <h2 className="label-caps text-ink">
            Fig. L-{year - 2021} — Expenditure by Category against Income per Return, {year}
          </h2>
          <div className="mt-4" style={{ height: barChartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 20, right: 32, bottom: 4, left: 8 }}
                barCategoryGap={9}
              >
                <XAxis
                  {...xAxisProps}
                  type="number"
                  domain={[0, barDomainMax]}
                  tickFormatter={(v: number) => usdCompact(v)}
                />
                <YAxis
                  {...yAxisProps}
                  type="category"
                  dataKey="name"
                  width={148}
                  tick={{ fill: chartColors.inkSecondary, fontSize: 12, fontFamily: fontBody }}
                />
                <Tooltip
                  {...tooltipProps}
                  formatter={(v: number) => [usd(v), "Documented outlay"]}
                />
                <ReferenceLine
                  x={yd.reportedIncome}
                  stroke={chartColors.brass}
                  strokeDasharray="2 4"
                  strokeWidth={strokes.reference}
                  label={{
                    value: `Income per return — ${usd(yd.reportedIncome)}`,
                    position: "insideTopLeft",
                    ...referenceLabelStyle,
                  }}
                />
                <Bar dataKey="amount" {...barProps} barSize={11} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <MarginNote className="mt-2">
            No single category outruns the return; taken together they exceed it by{" "}
            {usd(yd.gap)} in {year}.
          </MarginNote>
        </section>
      </div>

      {/* (c) 36-month spending rhythm */}
      <section className="mt-12">
        <h2 className="label-caps text-ink">
          Fig. L-4 — Spending Rhythm, Monthly Living Expenditures, Jan 2022 – Dec 2024
        </h2>
        <div className="mt-4 h-[264px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rhythm} margin={{ top: 12, right: 32, bottom: 4, left: 8 }}>
              <XAxis
                {...xAxisProps}
                dataKey="month"
                ticks={["2022-01", "2023-01", "2024-01", "2024-12"]}
                tickFormatter={(m: string) => fmtMonth(`${m}-01`).replace(/uary|ember/, "")}
              />
              <YAxis
                {...yAxisProps}
                width={56}
                domain={[0, "auto"]}
                tickFormatter={(v: number) => usdCompact(v)}
              />
              <Tooltip
                {...tooltipProps}
                labelFormatter={(m) => fmtMonth(`${m}-01`)}
                formatter={(v: number) => [usd(v), "Living expenditures"]}
              />
              <Line {...linePrimaryProps} dataKey="spend" />
              <Line
                dataKey="flagged"
                stroke="none"
                dot={{ r: 3, fill: chartColors.oxblood, stroke: "none" }}
                activeDot={false}
                isAnimationActive={false}
                connectNulls={false}
                tooltipType="none"
                legendType="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <MarginNote className="mt-2">
          Oxblood points mark the {flaggedMonthCount} months containing cash deposits flagged for
          sub-$10,000 structuring (§ V) — the cash arrives in the same months the spending crests.
          The rhythm never breaks: the household spends at this level every month of the period.
        </MarginNote>
      </section>

      {/* Examiner's method note */}
      <section className="rule-hairline mt-12 pt-6">
        <MarginNote mark="※">
          Method note — Expenditures are compiled item-by-item from the unified ledger and vouched
          to statement lines (IRM 4.10.4); inter-account transfers are stripped by transfer-group
          pairing, and card purchases are counted once at the card, never again at the payment.
          Because every figure is documented, no Bureau of Labor Statistics table is substituted
          for any element of personal living expense — a BLS floor is unnecessary where the ledger
          itself proves the lifestyle.
        </MarginNote>
      </section>
    </>
  );
}
