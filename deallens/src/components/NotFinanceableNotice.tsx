import { AlertCircle } from "lucide-react";
import { Card } from "@/components/Card";

/**
 * Shown in place of returns-dependent tab content when the entry structure
 * cannot be financed (debt exceeds EV plus fees) — return metrics, the equity
 * bridge, and simulated distributions are not meaningful in that state.
 */
export default function NotFinanceableNotice() {
  return (
    <Card title="Not financeable">
      <div className="flex items-start gap-3 py-2">
        <AlertCircle
          size={18}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-status-critical"
        />
        <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
          Entry debt exceeds enterprise value plus transaction fees, so the
          sponsor equity check is zero or negative — this capital structure
          cannot close. Reduce senior or mezzanine leverage, or raise the entry
          multiple, and the analysis will re-enable automatically.
        </p>
      </div>
    </Card>
  );
}
