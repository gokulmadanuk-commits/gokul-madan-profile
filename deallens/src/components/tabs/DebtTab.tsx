import type { LboResult } from "@/engine/types";
import DebtScheduleChart from "@/charts/DebtScheduleChart";
import { Card } from "@/components/Card";
import { fmtM, fmtX } from "@/lib/format";

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-b-0">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="tabular-nums text-sm font-semibold text-ink-primary">
        {value}
      </span>
    </div>
  );
}

/**
 * Debt tab: senior/mezz paydown schedule plus a leverage and repayment
 * readout for the hold period.
 */
export default function DebtTab({ result }: { result: LboResult }) {
  const { entry, years } = result;
  const last = years[years.length - 1];
  const seniorRepaid = entry.seniorDebt - (last?.seniorBalance ?? 0);
  const mezzRepaid = entry.mezzDebt - (last?.mezzBalance ?? 0);
  const totalInterest = years.reduce((s, y) => s + y.interest, 0);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
      <Card
        title="Debt schedule"
        subtitle="Senior and mezzanine balances by year, with accumulated cash — entry shown as year 0."
      >
        <DebtScheduleChart entry={entry} years={years} />
      </Card>
      <Card
        title="Leverage readout"
        subtitle="Deleveraging over the hold period."
      >
        <Readout
          label="Leverage (entry → exit)"
          value={`${fmtX(entry.entryLeverage)} → ${fmtX(
            last?.leverageRatio ?? 0,
          )}`}
        />
        <Readout label="Senior repaid" value={fmtM(seniorRepaid)} />
        <Readout label="Mezzanine repaid" value={fmtM(mezzRepaid)} />
        <Readout label="Cash at exit" value={fmtM(last?.cash ?? 0)} />
        <Readout label="Net debt at exit" value={fmtM(last?.netDebt ?? 0)} />
        <Readout label="Interest paid (cumulative)" value={fmtM(totalInterest)} />
      </Card>
    </div>
  );
}
