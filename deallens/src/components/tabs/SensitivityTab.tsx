import { useMemo } from "react";
import type { DealAssumptions } from "@/engine/types";
import { runSensitivity } from "@/engine/sensitivity";
import SensitivityHeatmap from "@/charts/SensitivityHeatmap";
import { Card } from "@/components/Card";
import { fmtPct } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/** 7 values centered on `center`, spaced by `step`, rounded to kill FP noise. */
function centeredRange(center: number, step: number): number[] {
  return Array.from({ length: 7 }, (_, i) =>
    round6(center + (i - 3) * step),
  );
}

function round6(v: number): number {
  return Math.round(v * 1e6) / 1e6;
}

/**
 * Sensitivity tab: two 7x7 IRR heatmaps — exit x entry multiple, and
 * uniform revenue growth x exit EBITDA margin — centered on the current case.
 */
export default function SensitivityTab({
  assumptions,
}: {
  assumptions: DealAssumptions;
}) {
  const debounced = useDebouncedValue(assumptions, 150);

  const multiplesGrid = useMemo(() => {
    return runSensitivity({
      base: debounced,
      xAxis: "exitMultiple",
      xValues: centeredRange(debounced.exitMultiple, 0.5),
      yAxis: "entryMultiple",
      yValues: centeredRange(debounced.entryMultiple, 0.5),
      metric: "irr",
    });
  }, [debounced]);

  const growthMarginGrid = useMemo(() => {
    const active = debounced.revenueGrowth.slice(0, debounced.holdYears);
    const meanGrowth =
      active.length > 0
        ? active.reduce((s, g) => s + g, 0) / active.length
        : 0;
    return {
      baseGrowth: round6(meanGrowth),
      grid: runSensitivity({
        base: debounced,
        xAxis: "uniformRevenueGrowth",
        xValues: centeredRange(meanGrowth, 0.02),
        yAxis: "exitEbitdaMargin",
        yValues: centeredRange(debounced.exitEbitdaMargin, 0.04 / 3),
        metric: "irr",
      }),
    };
  }, [debounced]);

  return (
    <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
      <Card
        title="IRR — exit multiple × entry multiple"
        subtitle="Seven half-turn steps either side of the current case. The outlined cell is the live scenario."
      >
        <SensitivityHeatmap
          grid={multiplesGrid}
          formatValue={fmtPct}
          xLabel="Exit multiple (EV / EBITDA)"
          yLabel="Entry multiple (EV / EBITDA)"
          baseX={round6(debounced.exitMultiple)}
          baseY={round6(debounced.entryMultiple)}
        />
      </Card>
      <Card
        title="IRR — revenue growth × exit margin"
        subtitle="Uniform annual growth ±6pp against exit EBITDA margin ±4pp around the current case."
      >
        <SensitivityHeatmap
          grid={growthMarginGrid.grid}
          formatValue={fmtPct}
          xLabel="Revenue growth (uniform, annual)"
          yLabel="Exit EBITDA margin"
          baseX={growthMarginGrid.baseGrowth}
          baseY={round6(debounced.exitEbitdaMargin)}
        />
      </Card>
    </div>
  );
}
