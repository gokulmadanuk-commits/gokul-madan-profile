/**
 * DealLens engine contract.
 *
 * All monetary values are in $ millions. All rates/percentages are decimals
 * (0.25 = 25%). Multiples are turns of EBITDA (5.5 = 5.5x).
 *
 * FORMULAS (normative — implementations and tests must match exactly):
 *
 * ENTRY
 *   entryEbitda      = entryRevenue * entryEbitdaMargin
 *   enterpriseValue  = entryEbitda * entryMultiple
 *   seniorDebt0      = entryEbitda * seniorDebtX
 *   mezzDebt0        = entryEbitda * mezzDebtX
 *   totalDebt0       = seniorDebt0 + mezzDebt0
 *   fees             = enterpriseValue * transactionFeesPct
 *   sponsorEquity    = enterpriseValue + fees - totalDebt0   (equity check = plug)
 *
 * OPERATING YEARS t = 1..holdYears
 *   revenue[t]   = revenue[t-1] * (1 + revenueGrowth[t-1]),  revenue[0] = entryRevenue
 *   margin[t]    = entryEbitdaMargin + (exitEbitdaMargin - entryEbitdaMargin) * t / holdYears
 *   ebitda[t]    = revenue[t] * margin[t]
 *   da[t]        = revenue[t] * daPctRevenue
 *   ebit[t]      = ebitda[t] - da[t]
 *   interest[t]  = seniorBalance[t-1] * seniorRate + mezzBalance[t-1] * mezzRate
 *                  (interest accrues on opening balances)
 *   ebt[t]       = ebit[t] - interest[t]
 *   taxes[t]     = max(0, ebt[t]) * taxRate            (no loss carryforwards)
 *   netIncome[t] = ebt[t] - taxes[t]
 *   capex[t]     = revenue[t] * capexPctRevenue
 *   nwcChange[t] = (revenue[t] - revenue[t-1]) * nwcPctRevenue
 *   fcf[t]       = netIncome[t] + da[t] - capex[t] - nwcChange[t]
 *                  (free cash flow available for debt service, pre-amortization)
 *
 * DEBT WATERFALL (per year, in order)
 *   mandatoryAmort[t] = min(seniorBalance[t-1], seniorDebt0 * seniorAmortPct)
 *   cashAfterAmort    = fcf[t] - mandatoryAmort[t]     (may be negative)
 *   sweepAvailable    = max(0, cashAfterAmort) * cashSweepPct
 *   sweep[t]          = applied first to remaining senior balance, then mezz,
 *                       capped at outstanding balances
 *   seniorBalance[t]  = seniorBalance[t-1] - mandatoryAmort[t] - seniorSweep[t]
 *   mezzBalance[t]    = mezzBalance[t-1] - mezzSweep[t]
 *   cash[t]           = cash[t-1] + fcf[t] - mandatoryAmort[t] - sweep[t]
 *                       cash[0] = 0. Cash may go negative in stress cases —
 *                       the engine flags this via `cashShortfall` rather than
 *                       modeling a revolver.
 *   netDebt[t]        = seniorBalance[t] + mezzBalance[t] - cash[t]
 *
 * EXIT (at end of year holdYears, H = holdYears)
 *   exitEbitda   = ebitda[H]
 *   exitEV       = exitEbitda * exitMultiple
 *   exitEquity   = exitEV - netDebt[H]
 *   moic         = exitEquity / sponsorEquity
 *   irr          = IRR of [-sponsorEquity, 0, 0, ..., exitEquity]
 *                  (computed numerically via bisection/Newton on NPV; with a
 *                  single inflow it equals moic^(1/H) - 1, which tests exploit)
 *
 * VALUE CREATION BRIDGE (must reconcile: sum of components = exitEquity - sponsorEquity)
 *   ebitdaGrowthEffect   = (exitEbitda - entryEbitda) * entryMultiple
 *     revenueEffect      = (revenue[H] - entryRevenue) * entryEbitdaMargin * entryMultiple
 *     marginEffect       = ebitdaGrowthEffect - revenueEffect
 *   multipleEffect       = (exitMultiple - entryMultiple) * exitEbitda
 *   deleveragingEffect   = netDebt[0entry] - netDebt[H]
 *                          where netDebt[0entry] = totalDebt0 (cash starts at 0)
 *   feesEffect           = -fees   (fees paid at entry, never recovered)
 *   check: revenueEffect + marginEffect + multipleEffect + deleveragingEffect + feesEffect
 *          = exitEquity - sponsorEquity   (within 1e-6 tolerance)
 */

export interface DealAssumptions {
  companyName: string;
  // Entry
  entryRevenue: number; // $M LTM revenue
  entryEbitdaMargin: number; // decimal
  entryMultiple: number; // x EV/EBITDA
  transactionFeesPct: number; // decimal, % of EV
  // Financing
  seniorDebtX: number; // turns of entry EBITDA
  seniorRate: number; // decimal
  seniorAmortPct: number; // decimal, % of original senior principal per year
  mezzDebtX: number; // turns of entry EBITDA
  mezzRate: number; // decimal
  cashSweepPct: number; // decimal, % of post-amort FCF swept to debt
  // Operations
  holdYears: number; // integer 3..7
  revenueGrowth: number[]; // decimals, length >= holdYears (index 0 = year 1)
  exitEbitdaMargin: number; // decimal, linearly interpolated from entry
  capexPctRevenue: number; // decimal
  nwcPctRevenue: number; // decimal
  daPctRevenue: number; // decimal
  taxRate: number; // decimal
  // Exit
  exitMultiple: number; // x EV/EBITDA
}

export interface YearRow {
  year: number; // 1-indexed
  revenue: number;
  revenueGrowth: number; // decimal used for this year
  ebitdaMargin: number;
  ebitda: number;
  da: number;
  ebit: number;
  interest: number;
  taxes: number;
  netIncome: number;
  capex: number;
  nwcChange: number;
  fcf: number;
  mandatoryAmort: number;
  sweep: number;
  seniorBalance: number; // closing
  mezzBalance: number; // closing
  totalDebt: number; // closing senior + mezz
  cash: number; // closing
  netDebt: number; // closing
  leverageRatio: number; // totalDebt / ebitda
}

export interface EntrySummary {
  ebitda: number;
  enterpriseValue: number;
  seniorDebt: number;
  mezzDebt: number;
  totalDebt: number;
  fees: number;
  sponsorEquity: number;
  entryLeverage: number; // totalDebt / entryEbitda
}

export interface ExitSummary {
  ebitda: number;
  enterpriseValue: number;
  netDebt: number;
  equityValue: number;
}

export interface ValueBridge {
  revenueEffect: number;
  marginEffect: number;
  multipleEffect: number;
  deleveragingEffect: number;
  feesEffect: number;
  totalValueCreated: number; // = exitEquity - sponsorEquity
}

export interface LboResult {
  assumptions: DealAssumptions;
  entry: EntrySummary;
  years: YearRow[];
  exit: ExitSummary;
  irr: number; // decimal
  moic: number;
  bridge: ValueBridge;
  cashShortfall: boolean; // true if closing cash went negative in any year
}

// ---------------------------------------------------------------------------
// Sensitivity analysis
// ---------------------------------------------------------------------------

/** Keys of DealAssumptions that sensitivity grids may vary. */
export type SensitivityAxis =
  | "entryMultiple"
  | "exitMultiple"
  | "seniorDebtX"
  | "exitEbitdaMargin"
  | "uniformRevenueGrowth"; // special: overwrites every year's growth

export interface SensitivityRequest {
  base: DealAssumptions;
  xAxis: SensitivityAxis;
  xValues: number[];
  yAxis: SensitivityAxis;
  yValues: number[];
  metric: "irr" | "moic";
}

export interface SensitivityGrid {
  request: SensitivityRequest;
  /** rows[i][j] = metric at yValues[i], xValues[j] */
  rows: number[][];
}

// ---------------------------------------------------------------------------
// Monte Carlo
// ---------------------------------------------------------------------------

/** Triangular distribution parameters (min, mode, max). */
export interface Triangular {
  min: number;
  mode: number;
  max: number;
}

export interface MonteCarloConfig {
  iterations: number; // e.g. 5000
  /** Uniform annual revenue growth sampled once per run, applied to all years. */
  revenueGrowth: Triangular;
  exitMultiple: Triangular;
  exitEbitdaMargin: Triangular;
  seed: number; // deterministic PRNG seed (mulberry32 or similar)
}

export interface MonteCarloResult {
  config: MonteCarloConfig;
  irrs: number[]; // sorted ascending
  moics: number[]; // sorted ascending, same run order lost — sorted independently
  meanIrr: number;
  medianIrr: number;
  p5Irr: number;
  p25Irr: number;
  p75Irr: number;
  p95Irr: number;
  meanMoic: number;
  medianMoic: number;
  /** Probability IRR clears common hurdles. */
  probIrrAbove15: number;
  probIrrAbove20: number;
  probIrrAbove25: number;
  probLoss: number; // P(MOIC < 1)
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export type ScenarioId = "base" | "bull" | "bear";

export interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  assumptions: DealAssumptions;
}
