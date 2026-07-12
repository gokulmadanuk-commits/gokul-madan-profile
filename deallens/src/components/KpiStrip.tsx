import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { LboResult } from "@/engine/types";
import { fmtM, fmtPct, fmtX } from "@/lib/format";

interface KpiStripProps {
  result: LboResult;
}

function irrStatus(irr: number) {
  if (irr >= 0.2)
    return {
      label: "Above target",
      className: "text-status-good",
      Icon: CheckCircle2,
    };
  if (irr >= 0.12)
    return {
      label: "Below 20% target",
      className: "text-status-warning",
      Icon: AlertTriangle,
    };
  return {
    label: "Below 12% hurdle",
    className: "text-status-critical",
    Icon: AlertCircle,
  };
}

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-1 px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </p>
      <p className="mt-1.5 text-[30px] font-semibold leading-none tracking-tight text-ink-primary">
        {value}
      </p>
      {sub && <div className="mt-2 text-[11px] leading-none">{sub}</div>}
    </div>
  );
}

/**
 * Five headline stat tiles: IRR (with status accent), MOIC, sponsor equity,
 * exit equity, and entry-to-exit leverage. Plus a shortfall banner when the
 * hold period requires an assumed revolver draw.
 */
export default function KpiStrip({ result }: KpiStripProps) {
  const { entry, exit, years, irr, moic, assumptions, financeable } = result;
  const status = irrStatus(irr);
  const StatusIcon = status.Icon;
  const exitLeverage =
    years.length > 0 ? years[years.length - 1].leverageRatio : 0;

  return (
    <div>
      {!financeable && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2.5 rounded-lg border border-status-critical/40 bg-status-critical/10 px-4 py-2.5"
        >
          <AlertCircle
            size={14}
            aria-hidden="true"
            className="shrink-0 text-status-critical"
          />
          <p className="text-xs text-ink-secondary">
            <span className="font-semibold text-status-critical">
              Structure not financeable
            </span>{" "}
            — entry debt of {fmtM(entry.totalDebt)} exceeds enterprise value
            plus fees ({fmtM(entry.enterpriseValue + entry.fees)}). Reduce
            leverage or raise the entry multiple; return metrics are not
            meaningful.
          </p>
        </div>
      )}
      {financeable && result.cashShortfall && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2.5 rounded-lg border border-status-serious/40 bg-status-serious/10 px-4 py-2.5"
        >
          <AlertTriangle
            size={14}
            aria-hidden="true"
            className="shrink-0 text-status-serious"
          />
          <p className="text-xs text-ink-secondary">
            <span className="font-semibold text-status-serious">
              Cash shortfall in hold period
            </span>{" "}
            — revolver assumed. Free cash flow does not cover mandatory debt
            service in at least one year.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Tile
          label="IRR"
          value={financeable ? fmtPct(irr) : "n.m."}
          sub={
            financeable ? (
              <span
                className={`inline-flex items-center gap-1 font-medium ${status.className}`}
              >
                <StatusIcon size={11} aria-hidden="true" />
                {status.label}
              </span>
            ) : (
              <span className="text-ink-muted">not financeable</span>
            )
          }
        />
        <Tile
          label="MOIC"
          value={financeable ? fmtX(moic) : "n.m."}
          sub={
            <span className="text-ink-muted">
              {financeable
                ? `${assumptions.holdYears}-year hold`
                : "not financeable"}
            </span>
          }
        />
        <Tile
          label="Sponsor equity"
          value={fmtM(entry.sponsorEquity)}
          sub={<span className="text-ink-muted">invested at close</span>}
        />
        <Tile
          label="Exit equity"
          value={fmtM(exit.equityValue)}
          sub={
            <span className="text-ink-muted">
              {fmtM(exit.enterpriseValue)} EV − {fmtM(exit.netDebt)} net debt
            </span>
          }
        />
        <Tile
          label="Leverage"
          value={`${fmtX(entry.entryLeverage)} → ${fmtX(exitLeverage)}`}
          sub={<span className="text-ink-muted">entry → exit, × EBITDA</span>}
        />
      </div>
    </div>
  );
}
