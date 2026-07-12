/**
 * Chart component contracts. Each chart in src/charts/ default-exports a React
 * component with exactly these props. UI code imports them by these paths:
 *
 *   import WaterfallChart from "@/charts/WaterfallChart";
 *   import DebtScheduleChart from "@/charts/DebtScheduleChart";
 *   import SensitivityHeatmap from "@/charts/SensitivityHeatmap";
 *   import IrrHistogram from "@/charts/IrrHistogram";
 *   import CashFlowChart from "@/charts/CashFlowChart";
 *   import EquityBuildChart from "@/charts/EquityBuildChart";
 */
import type {
  EntrySummary,
  ExitSummary,
  MonteCarloResult,
  SensitivityGrid,
  ValueBridge,
  YearRow,
} from "@/engine/types";

/** Value-creation waterfall: sponsor equity -> effects -> exit equity. */
export interface WaterfallChartProps {
  bridge: ValueBridge;
  sponsorEquity: number;
  exitEquity: number;
}

/** Stacked senior/mezz/cash paydown over the hold, entry included as year 0. */
export interface DebtScheduleChartProps {
  entry: EntrySummary;
  years: YearRow[];
}

/** 2D grid; cells colored by a one-hue sequential ramp, value labels in cells. */
export interface SensitivityHeatmapProps {
  grid: SensitivityGrid;
  /** Format a metric value for the cell label, e.g. 0.234 -> "23.4%". */
  formatValue: (v: number) => string;
  xLabel: string;
  yLabel: string;
  /** Base-case coordinates to outline, if present in the grid. */
  baseX?: number;
  baseY?: number;
}

/** IRR distribution histogram with percentile markers. */
export interface IrrHistogramProps {
  result: MonteCarloResult;
  /** Hurdle rate to mark, decimal (e.g. 0.20). */
  hurdle: number;
}

/** Revenue/EBITDA/FCF by year (grouped bars or bars+line, one axis). */
export interface CashFlowChartProps {
  years: YearRow[];
  entryRevenue: number;
  entryEbitda: number;
}

/** Equity value trajectory: implied equity (EV at exit multiple - net debt) per year. */
export interface EquityBuildChartProps {
  entry: EntrySummary;
  exit: ExitSummary;
  years: YearRow[];
  exitMultiple: number;
  sponsorEquity: number;
}
