import type { LboResult } from "@/engine/types";
import WaterfallChart from "@/charts/WaterfallChart";
import { Card } from "@/components/Card";
import { fmtM } from "@/lib/format";

interface Lever {
  label: string;
  value: number;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Join items as "A", "A and B", or "A, B, and C". */
function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/**
 * Auto-generated 2-3 sentence narrative from the value-creation bridge:
 * headline outcome, dominant lever(s), and drags.
 */
export function buildNarrative(result: LboResult): string {
  const { bridge, entry, exit, assumptions } = result;
  const total = bridge.totalValueCreated;
  const h = assumptions.holdYears;

  const levers: Lever[] = [
    {
      label: bridge.revenueEffect >= 0 ? "revenue growth" : "revenue decline",
      value: bridge.revenueEffect,
    },
    {
      label:
        bridge.marginEffect >= 0 ? "margin expansion" : "margin compression",
      value: bridge.marginEffect,
    },
    {
      label:
        bridge.multipleEffect >= 0
          ? "multiple expansion"
          : "multiple contraction",
      value: bridge.multipleEffect,
    },
    { label: "debt paydown", value: bridge.deleveragingEffect },
  ];
  const positives = levers
    .filter((l) => l.value > 0.05)
    .sort((a, b) => b.value - a.value);
  const negatives = levers
    .filter((l) => l.value < -0.05)
    .sort((a, b) => a.value - b.value);

  const sentences: string[] = [];

  // 1. Headline.
  if (total >= 0) {
    sentences.push(
      `Sponsor equity of ${fmtM(entry.sponsorEquity)} grows to ${fmtM(
        exit.equityValue,
      )} at exit — ${fmtM(total)} of value created over the ${h}-year hold.`,
    );
  } else {
    sentences.push(
      `Sponsor equity of ${fmtM(entry.sponsorEquity)} falls to ${fmtM(
        exit.equityValue,
      )} at exit — ${fmtM(-total)} of value destroyed over the ${h}-year hold.`,
    );
  }

  // 2. Dominant lever(s).
  if (positives.length > 0) {
    const top = positives[0];
    const share =
      total > 0 && top.value / total < 1.5
        ? ` (${Math.round((top.value / total) * 100)}% of the total)`
        : "";
    let s = `${cap(top.label)} is the dominant lever, contributing ${fmtM(
      top.value,
    )}${share}`;
    if (positives.length > 1) {
      s += `, followed by ${positives[1].label} at ${fmtM(positives[1].value)}`;
    }
    sentences.push(s + ".");
  } else {
    sentences.push(
      "No lever contributes positively under these assumptions.",
    );
  }

  // 3. Drags.
  const feeDrag = -bridge.feesEffect;
  if (negatives.length > 0) {
    const parts = negatives.map((l) => `${l.label} (${fmtM(l.value)})`);
    let s = `${cap(joinList(parts))}`;
    s += negatives.length > 1 ? " weigh on the outcome" : " weighs on the outcome";
    if (feeDrag > 0.05) {
      s += `, alongside ${fmtM(feeDrag)} of transaction fees`;
    }
    sentences.push(s + ".");
  } else if (feeDrag > 0.05) {
    sentences.push(
      `Transaction fees of ${fmtM(feeDrag)} are the only drag on returns.`,
    );
  }

  return sentences.join(" ");
}

/**
 * Value creation tab: equity bridge waterfall plus an auto-generated
 * narrative summarizing the dominant levers.
 */
export default function ValueCreationTab({ result }: { result: LboResult }) {
  const narrative = buildNarrative(result);
  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Value creation bridge"
        subtitle="From sponsor equity at close to equity value at exit, decomposed into revenue, margin, multiple, deleveraging, and fee effects."
      >
        <WaterfallChart
          bridge={result.bridge}
          sponsorEquity={result.entry.sponsorEquity}
          exitEquity={result.exit.equityValue}
        />
      </Card>
      <Card title="Read-out">
        <p className="max-w-3xl text-sm leading-relaxed text-ink-secondary">
          {narrative}
        </p>
      </Card>
    </div>
  );
}
