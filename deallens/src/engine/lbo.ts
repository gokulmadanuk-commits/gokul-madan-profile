/**
 * Core LBO engine. Implements the normative formulas in the header comment of
 * `types.ts` exactly. Deterministic and side-effect free.
 */
import type {
  DealAssumptions,
  EntrySummary,
  ExitSummary,
  LboResult,
  ValueBridge,
  YearRow,
} from "@/engine/types";

/** NPV of a cashflow array (index = period) at rate r. */
function npv(cashflows: number[], r: number): number {
  let total = 0;
  for (let t = 0; t < cashflows.length; t++) {
    total += cashflows[t] / Math.pow(1 + r, t);
  }
  return total;
}

/**
 * Numeric IRR via bisection on the NPV function.
 * Bounds [-0.99, 10], tolerance 1e-9. If the root lies outside the bounds the
 * nearest bound is returned; a non-positive terminal inflow (total loss)
 * returns -1 (a -100% outcome). Never returns NaN.
 */
export function irrBisection(cashflows: number[]): number {
  // Total-loss / degenerate case: no positive inflow after the outflow.
  const hasInflow = cashflows.some((cf, t) => t > 0 && cf > 0);
  if (!hasInflow) return -1;

  let lo = -0.99;
  let hi = 10;
  let fLo = npv(cashflows, lo);
  let fHi = npv(cashflows, hi);
  if (fLo === 0) return lo;
  if (fHi === 0) return hi;
  // NPV is monotone decreasing in r for [-E, 0, ..., X>0]; if the root is not
  // bracketed, clamp to the nearest bound.
  if (fLo < 0 && fHi < 0) return lo;
  if (fLo > 0 && fHi > 0) return hi;

  while (hi - lo > 1e-9) {
    const mid = (lo + hi) / 2;
    const fMid = npv(cashflows, mid);
    if (fMid === 0) return mid;
    if ((fMid > 0) === (fLo > 0)) {
      lo = mid;
      fLo = fMid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

/** Run the full LBO model for a set of deal assumptions. */
export function runLbo(a: DealAssumptions): LboResult {
  // ---- ENTRY -------------------------------------------------------------
  const entryEbitda = a.entryRevenue * a.entryEbitdaMargin;
  const enterpriseValue = entryEbitda * a.entryMultiple;
  const seniorDebt0 = entryEbitda * a.seniorDebtX;
  const mezzDebt0 = entryEbitda * a.mezzDebtX;
  const totalDebt0 = seniorDebt0 + mezzDebt0;
  const fees = enterpriseValue * a.transactionFeesPct;
  const sponsorEquity = enterpriseValue + fees - totalDebt0;

  // When entry debt exceeds EV + fees the structure cannot be financed. The
  // raw (non-positive) equity check is kept so the bridge still reconciles;
  // irr/moic become 0 sentinels and consumers gate on `financeable`.
  const financeable = sponsorEquity > 0;

  const entry: EntrySummary = {
    ebitda: entryEbitda,
    enterpriseValue,
    seniorDebt: seniorDebt0,
    mezzDebt: mezzDebt0,
    totalDebt: totalDebt0,
    fees,
    sponsorEquity,
    entryLeverage: totalDebt0 / entryEbitda,
  };

  // ---- OPERATING YEARS + DEBT WATERFALL -----------------------------------
  const H = a.holdYears;
  const years: YearRow[] = [];
  let prevRevenue = a.entryRevenue;
  let seniorBalance = seniorDebt0;
  let mezzBalance = mezzDebt0;
  let cash = 0;
  let cashShortfall = false;

  for (let t = 1; t <= H; t++) {
    // Contract requires revenueGrowth.length >= holdYears; if violated, carry
    // the last known growth rate forward rather than NaN-cascading.
    const growth =
      a.revenueGrowth[t - 1] ?? a.revenueGrowth[a.revenueGrowth.length - 1] ?? 0;
    const revenue = prevRevenue * (1 + growth);
    const margin =
      a.entryEbitdaMargin + (a.exitEbitdaMargin - a.entryEbitdaMargin) * (t / H);
    const ebitda = revenue * margin;
    const da = revenue * a.daPctRevenue;
    const ebit = ebitda - da;
    // Interest accrues on opening balances.
    const interest = seniorBalance * a.seniorRate + mezzBalance * a.mezzRate;
    const ebt = ebit - interest;
    const taxes = Math.max(0, ebt) * a.taxRate;
    const netIncome = ebt - taxes;
    const capex = revenue * a.capexPctRevenue;
    const nwcChange = (revenue - prevRevenue) * a.nwcPctRevenue;
    const fcf = netIncome + da - capex - nwcChange;

    // Debt waterfall (in order): mandatory amort -> cash sweep senior-first.
    const mandatoryAmort = Math.min(seniorBalance, seniorDebt0 * a.seniorAmortPct);
    const cashAfterAmort = fcf - mandatoryAmort;
    const sweepAvailable = Math.max(0, cashAfterAmort) * a.cashSweepPct;
    const seniorAfterAmort = seniorBalance - mandatoryAmort;
    const seniorSweep = Math.min(seniorAfterAmort, sweepAvailable);
    const mezzSweep = Math.min(mezzBalance, sweepAvailable - seniorSweep);
    const sweep = seniorSweep + mezzSweep;

    seniorBalance = seniorAfterAmort - seniorSweep;
    mezzBalance = mezzBalance - mezzSweep;
    cash = cash + fcf - mandatoryAmort - sweep;
    if (cash < 0) cashShortfall = true;

    const totalDebt = seniorBalance + mezzBalance;
    years.push({
      year: t,
      revenue,
      revenueGrowth: growth,
      ebitdaMargin: margin,
      ebitda,
      da,
      ebit,
      interest,
      taxes,
      netIncome,
      capex,
      nwcChange,
      fcf,
      mandatoryAmort,
      sweep,
      seniorBalance,
      mezzBalance,
      totalDebt,
      cash,
      netDebt: totalDebt - cash,
      leverageRatio: totalDebt / ebitda,
    });
    prevRevenue = revenue;
  }

  // ---- EXIT ----------------------------------------------------------------
  const finalYear = years[H - 1];
  const exitEbitda = finalYear.ebitda;
  const exitEV = exitEbitda * a.exitMultiple;
  const exitEquity = exitEV - finalYear.netDebt;

  const exit: ExitSummary = {
    ebitda: exitEbitda,
    enterpriseValue: exitEV,
    netDebt: finalYear.netDebt,
    equityValue: exitEquity,
  };

  let moic = 0;
  let irr = 0;
  if (financeable) {
    moic = exitEquity / sponsorEquity;
    // IRR of [-sponsorEquity, 0, ..., exitEquity].
    const cashflows = new Array<number>(H + 1).fill(0);
    cashflows[0] = -sponsorEquity;
    cashflows[H] = exitEquity;
    irr = irrBisection(cashflows);
  }

  // ---- VALUE CREATION BRIDGE -------------------------------------------------
  const ebitdaGrowthEffect = (exitEbitda - entryEbitda) * a.entryMultiple;
  const revenueEffect =
    (finalYear.revenue - a.entryRevenue) * a.entryEbitdaMargin * a.entryMultiple;
  const marginEffect = ebitdaGrowthEffect - revenueEffect;
  const multipleEffect = (a.exitMultiple - a.entryMultiple) * exitEbitda;
  const deleveragingEffect = totalDebt0 - finalYear.netDebt;
  const feesEffect = -fees;

  const bridge: ValueBridge = {
    revenueEffect,
    marginEffect,
    multipleEffect,
    deleveragingEffect,
    feesEffect,
    totalValueCreated:
      revenueEffect + marginEffect + multipleEffect + deleveragingEffect + feesEffect,
  };

  return {
    assumptions: a,
    entry,
    years,
    exit,
    irr,
    moic,
    bridge,
    cashShortfall,
    financeable,
  };
}
