/**
 * Two-way sensitivity grids over the LBO engine.
 */
import { runLbo } from "@/engine/lbo";
import type {
  DealAssumptions,
  SensitivityAxis,
  SensitivityGrid,
  SensitivityRequest,
} from "@/engine/types";

/** Return a copy of `base` with `axis` set to `value`. */
function applyAxis(
  base: DealAssumptions,
  axis: SensitivityAxis,
  value: number,
): DealAssumptions {
  const next: DealAssumptions = { ...base, revenueGrowth: [...base.revenueGrowth] };
  if (axis === "uniformRevenueGrowth") {
    next.revenueGrowth = next.revenueGrowth.map(() => value);
  } else {
    next[axis] = value;
  }
  return next;
}

/** Compute a sensitivity grid: rows[i][j] = metric at yValues[i], xValues[j]. */
export function runSensitivity(req: SensitivityRequest): SensitivityGrid {
  const rows: number[][] = req.yValues.map((yValue) =>
    req.xValues.map((xValue) => {
      const assumptions = applyAxis(
        applyAxis(req.base, req.yAxis, yValue),
        req.xAxis,
        xValue,
      );
      const result = runLbo(assumptions);
      // Unfinanceable combinations (debt > EV + fees) have no meaningful
      // return metric — emit NaN so the heatmap renders "n.m." for the cell.
      if (!result.financeable) return NaN;
      return req.metric === "irr" ? result.irr : result.moic;
    }),
  );
  return { request: req, rows };
}
