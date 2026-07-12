/**
 * Project Meridian — preset scenarios and Monte Carlo defaults.
 *
 * A mid-market B2B software & tech-enabled services platform: $120M revenue,
 * 22% EBITDA margins, sticky enterprise contracts, acquired at 9.0x with a
 * 3.5x senior / 1.0x mezz structure over a 5-year hold.
 */
import type { DealAssumptions, MonteCarloConfig, Scenario } from "@/engine/types";

const BASE_ASSUMPTIONS: DealAssumptions = {
  companyName: "Project Meridian",
  // Entry
  entryRevenue: 120,
  entryEbitdaMargin: 0.22,
  entryMultiple: 9.0,
  transactionFeesPct: 0.02,
  // Financing
  seniorDebtX: 3.5,
  seniorRate: 0.08,
  seniorAmortPct: 0.05,
  mezzDebtX: 1.0,
  mezzRate: 0.12,
  cashSweepPct: 0.75,
  // Operations
  holdYears: 5,
  revenueGrowth: [0.09, 0.09, 0.08, 0.08, 0.07],
  exitEbitdaMargin: 0.245,
  capexPctRevenue: 0.035,
  nwcPctRevenue: 0.12,
  daPctRevenue: 0.03,
  taxRate: 0.25,
  // Exit
  exitMultiple: 9.0,
};

export const SCENARIOS: Scenario[] = [
  {
    id: "base",
    label: "Base",
    description:
      "Management plan: high-single-digit growth moderating over the hold, " +
      "modest margin expansion from pricing and mix, exit at the entry multiple.",
    assumptions: BASE_ASSUMPTIONS,
  },
  {
    id: "bull",
    label: "Bull",
    description:
      "Upside case: 12% growth from new-logo acceleration and cross-sell, " +
      "margins reaching 27% on operating leverage, exit re-rated to 10.0x.",
    assumptions: {
      ...BASE_ASSUMPTIONS,
      revenueGrowth: [0.12, 0.12, 0.12, 0.12, 0.12],
      exitEbitdaMargin: 0.27,
      exitMultiple: 10.0,
    },
  },
  {
    id: "bear",
    label: "Bear",
    description:
      "Downside case: growth stalls to 2-3% on churn and macro pressure, " +
      "margins compress to 20%, exit de-rated to 7.5x.",
    assumptions: {
      ...BASE_ASSUMPTIONS,
      revenueGrowth: [0.03, 0.025, 0.025, 0.02, 0.02],
      exitEbitdaMargin: 0.2,
      exitMultiple: 7.5,
    },
  },
];

export const DEFAULT_MC_CONFIG: MonteCarloConfig = {
  iterations: 5000,
  revenueGrowth: { min: 0.02, mode: 0.08, max: 0.13 },
  exitMultiple: { min: 7.0, mode: 9.0, max: 11.0 },
  exitEbitdaMargin: { min: 0.2, mode: 0.245, max: 0.28 },
  seed: 42,
};
