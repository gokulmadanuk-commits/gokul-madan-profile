import type { LboResult, YearRow } from "@/engine/types";
import { Card } from "@/components/Card";
import { fmtM, fmtPct, fmtX } from "@/lib/format";

interface RowDef {
  label: string;
  /** Entry (year 0) cell; null renders an em-dash. */
  entry: string | null;
  cell: (y: YearRow) => string;
  /** Secondary metric line (growth %, margin %) — muted, indented. */
  sub?: boolean;
}

interface GroupDef {
  name: string;
  rows: RowDef[];
}

function buildGroups(result: LboResult): GroupDef[] {
  const { entry, assumptions } = result;
  return [
    {
      name: "Income statement",
      rows: [
        {
          label: "Revenue",
          entry: fmtM(assumptions.entryRevenue),
          cell: (y) => fmtM(y.revenue),
        },
        {
          label: "Growth %",
          entry: null,
          cell: (y) => fmtPct(y.revenueGrowth),
          sub: true,
        },
        {
          label: "EBITDA",
          entry: fmtM(entry.ebitda),
          cell: (y) => fmtM(y.ebitda),
        },
        {
          label: "Margin %",
          entry: fmtPct(assumptions.entryEbitdaMargin),
          cell: (y) => fmtPct(y.ebitdaMargin),
          sub: true,
        },
        { label: "D&A", entry: null, cell: (y) => fmtM(-y.da) },
        { label: "EBIT", entry: null, cell: (y) => fmtM(y.ebit) },
        { label: "Interest", entry: null, cell: (y) => fmtM(-y.interest) },
        { label: "Taxes", entry: null, cell: (y) => fmtM(-y.taxes) },
        { label: "Net income", entry: null, cell: (y) => fmtM(y.netIncome) },
      ],
    },
    {
      name: "Cash flow",
      rows: [
        { label: "Capex", entry: null, cell: (y) => fmtM(-y.capex) },
        { label: "Δ NWC", entry: null, cell: (y) => fmtM(-y.nwcChange) },
        {
          label: "Free cash flow",
          entry: null,
          cell: (y) => fmtM(y.fcf),
        },
      ],
    },
    {
      name: "Debt & leverage",
      rows: [
        {
          label: "Mandatory amort",
          entry: null,
          cell: (y) => fmtM(-y.mandatoryAmort),
        },
        { label: "Cash sweep", entry: null, cell: (y) => fmtM(-y.sweep) },
        {
          label: "Senior debt",
          entry: fmtM(entry.seniorDebt),
          cell: (y) => fmtM(y.seniorBalance),
        },
        {
          label: "Mezzanine debt",
          entry: fmtM(entry.mezzDebt),
          cell: (y) => fmtM(y.mezzBalance),
        },
        { label: "Cash", entry: fmtM(0), cell: (y) => fmtM(y.cash) },
        {
          label: "Net debt",
          entry: fmtM(entry.totalDebt),
          cell: (y) => fmtM(y.netDebt),
        },
        {
          label: "Leverage",
          entry: fmtX(entry.entryLeverage),
          cell: (y) => fmtX(y.leverageRatio),
        },
      ],
    },
  ];
}

/**
 * Financials tab: the full operating model — income statement, cash flow,
 * and debt schedule by year, entry column included.
 */
export default function FinancialsTab({ result }: { result: LboResult }) {
  const groups = buildGroups(result);
  const { years } = result;

  return (
    <Card
      title="Operating model"
      subtitle="All figures in $ millions unless noted. Interest accrues on opening balances; taxes floored at zero (no loss carryforwards)."
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 z-10 bg-surface-1 py-2 pr-4 text-left font-medium text-ink-muted"
              >
                &nbsp;
              </th>
              <th
                scope="col"
                className="tabular-nums whitespace-nowrap py-2 pl-4 text-right font-semibold text-ink-secondary"
              >
                Entry
              </th>
              {years.map((y) => (
                <th
                  key={y.year}
                  scope="col"
                  className="tabular-nums whitespace-nowrap py-2 pl-4 text-right font-semibold text-ink-secondary"
                >
                  Year {y.year}
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group.name}>
              <tr>
                <th
                  scope="rowgroup"
                  colSpan={years.length + 2}
                  className="border-t border-white/10 pb-1.5 pt-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted"
                >
                  <span className="sticky left-0 inline-block">
                    {group.name}
                  </span>
                </th>
              </tr>
              {group.rows.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-white/[0.06]"
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 whitespace-nowrap bg-surface-1 py-1.5 pr-4 text-left font-normal ${
                      row.sub ? "pl-3 text-ink-muted" : "text-ink-secondary"
                    }`}
                  >
                    {row.label}
                  </th>
                  <td
                    className={`tabular-nums whitespace-nowrap py-1.5 pl-4 text-right ${
                      row.sub ? "text-ink-muted" : "text-ink-secondary"
                    }`}
                  >
                    {row.entry ?? "—"}
                  </td>
                  {years.map((y) => (
                    <td
                      key={y.year}
                      className={`tabular-nums whitespace-nowrap py-1.5 pl-4 text-right ${
                        row.sub ? "text-ink-muted" : "text-ink-primary"
                      }`}
                    >
                      {row.cell(y)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </Card>
  );
}
