import type { LboResult } from "@/engine/types";
import EquityBuildChart from "@/charts/EquityBuildChart";
import CashFlowChart from "@/charts/CashFlowChart";
import { Card } from "@/components/Card";

/**
 * Returns tab: equity value trajectory over the hold plus operating cash
 * generation by year.
 */
export default function ReturnsTab({ result }: { result: LboResult }) {
  const { entry, exit, years, assumptions } = result;
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card
        title="Equity value build"
        subtitle={`Implied equity value by year — enterprise value at the ${assumptions.exitMultiple.toFixed(
          2,
        )}x exit multiple less net debt.`}
      >
        <EquityBuildChart
          entry={entry}
          exit={exit}
          years={years}
          exitMultiple={assumptions.exitMultiple}
          sponsorEquity={entry.sponsorEquity}
        />
      </Card>
      <Card
        title="Operating performance"
        subtitle="Revenue, EBITDA, and free cash flow available for debt service by year."
      >
        <CashFlowChart
          years={years}
          entryRevenue={assumptions.entryRevenue}
          entryEbitda={entry.ebitda}
        />
      </Card>
    </div>
  );
}
