import { describe, expect, it } from "vitest";
import { runLbo } from "@/engine/lbo";
import { runMonteCarlo } from "@/engine/montecarlo";
import { runSensitivity } from "@/engine/sensitivity";
import { DEFAULT_MC_CONFIG, SCENARIOS } from "@/engine/presets";
import type { DealAssumptions } from "@/engine/types";

const base = SCENARIOS.find((s) => s.id === "base")!.assumptions;

describe("value creation bridge", () => {
  it.each(SCENARIOS)(
    "reconciles to exitEquity - sponsorEquity within 1e-6 ($id)",
    (scenario) => {
      const r = runLbo(scenario.assumptions);
      const sum =
        r.bridge.revenueEffect +
        r.bridge.marginEffect +
        r.bridge.multipleEffect +
        r.bridge.deleveragingEffect +
        r.bridge.feesEffect;
      const target = r.exit.equityValue - r.entry.sponsorEquity;
      expect(sum).toBeCloseTo(target, 6);
      expect(r.bridge.totalValueCreated).toBeCloseTo(target, 6);
    },
  );
});

describe("IRR", () => {
  it.each(SCENARIOS)(
    "equals moic^(1/holdYears) - 1 within 1e-6 ($id)",
    (scenario) => {
      const r = runLbo(scenario.assumptions);
      const analytic = Math.pow(r.moic, 1 / scenario.assumptions.holdYears) - 1;
      expect(r.irr).toBeCloseTo(analytic, 6);
    },
  );
});

describe("hand-computed 2-year toy case", () => {
  // Zero growth, zero amort, zero sweep, zero fees, flat margin: every line
  // of the model is derivable by hand.
  const toy: DealAssumptions = {
    companyName: "Toy Co",
    entryRevenue: 100,
    entryEbitdaMargin: 0.2,
    entryMultiple: 5.0,
    transactionFeesPct: 0,
    seniorDebtX: 2.0,
    seniorRate: 0.1,
    seniorAmortPct: 0,
    mezzDebtX: 0.5,
    mezzRate: 0.1,
    cashSweepPct: 0,
    holdYears: 2,
    revenueGrowth: [0, 0],
    exitEbitdaMargin: 0.2, // flat — interpolation collapses to 0.20 every year
    capexPctRevenue: 0.05,
    nwcPctRevenue: 0.1,
    daPctRevenue: 0.04,
    taxRate: 0.25,
    exitMultiple: 5.0,
  };

  const r = runLbo(toy);

  it("entry", () => {
    expect(r.entry.ebitda).toBeCloseTo(20, 10); // 100 * 0.20
    expect(r.entry.enterpriseValue).toBeCloseTo(100, 10); // 20 * 5.0
    expect(r.entry.seniorDebt).toBeCloseTo(40, 10); // 20 * 2.0
    expect(r.entry.mezzDebt).toBeCloseTo(10, 10); // 20 * 0.5
    expect(r.entry.totalDebt).toBeCloseTo(50, 10); // 40 + 10
    expect(r.entry.fees).toBeCloseTo(0, 10); // 100 * 0
    expect(r.entry.sponsorEquity).toBeCloseTo(50, 10); // 100 + 0 - 50
    expect(r.entry.entryLeverage).toBeCloseTo(2.5, 10); // 50 / 20
  });

  // Both years have an identical income statement (zero growth, flat margin,
  // no debt paydown so interest never changes):
  //   revenue   = 100
  //   ebitda    = 100 * 0.20            = 20
  //   da        = 100 * 0.04            = 4
  //   ebit      = 20 - 4                = 16
  //   interest  = 40*0.10 + 10*0.10     = 5     (opening balances)
  //   ebt       = 16 - 5                = 11
  //   taxes     = 11 * 0.25             = 2.75
  //   netIncome = 11 - 2.75             = 8.25
  //   capex     = 100 * 0.05            = 5
  //   nwcChange = (100 - 100) * 0.10    = 0
  //   fcf       = 8.25 + 4 - 5 - 0      = 7.25
  //   amort = 0, sweep = 0 -> balances stay 40 / 10, cash accumulates fcf.
  it.each([
    // [year, cash, netDebt]  cash: 7.25 then 14.5; netDebt = 50 - cash
    [1, 7.25, 42.75],
    [2, 14.5, 35.5],
  ])("year %i row matches hand-derived values", (year, cash, netDebt) => {
    const row = r.years[(year as number) - 1];
    expect(row.year).toBe(year);
    expect(row.revenue).toBeCloseTo(100, 10);
    expect(row.revenueGrowth).toBeCloseTo(0, 10);
    expect(row.ebitdaMargin).toBeCloseTo(0.2, 10);
    expect(row.ebitda).toBeCloseTo(20, 10);
    expect(row.da).toBeCloseTo(4, 10);
    expect(row.ebit).toBeCloseTo(16, 10);
    expect(row.interest).toBeCloseTo(5, 10);
    expect(row.taxes).toBeCloseTo(2.75, 10);
    expect(row.netIncome).toBeCloseTo(8.25, 10);
    expect(row.capex).toBeCloseTo(5, 10);
    expect(row.nwcChange).toBeCloseTo(0, 10);
    expect(row.fcf).toBeCloseTo(7.25, 10);
    expect(row.mandatoryAmort).toBeCloseTo(0, 10);
    expect(row.sweep).toBeCloseTo(0, 10);
    expect(row.seniorBalance).toBeCloseTo(40, 10);
    expect(row.mezzBalance).toBeCloseTo(10, 10);
    expect(row.totalDebt).toBeCloseTo(50, 10);
    expect(row.cash).toBeCloseTo(cash as number, 10);
    expect(row.netDebt).toBeCloseTo(netDebt as number, 10);
    expect(row.leverageRatio).toBeCloseTo(2.5, 10); // 50 / 20
  });

  it("exit, returns and bridge", () => {
    expect(r.exit.ebitda).toBeCloseTo(20, 10); // ebitda[2]
    expect(r.exit.enterpriseValue).toBeCloseTo(100, 10); // 20 * 5.0
    expect(r.exit.netDebt).toBeCloseTo(35.5, 10); // 50 - 14.5
    expect(r.exit.equityValue).toBeCloseTo(64.5, 10); // 100 - 35.5
    expect(r.moic).toBeCloseTo(1.29, 10); // 64.5 / 50
    expect(r.irr).toBeCloseTo(Math.sqrt(1.29) - 1, 7); // 1.29^(1/2) - 1 ~ 13.578%
    expect(r.bridge.revenueEffect).toBeCloseTo(0, 10);
    expect(r.bridge.marginEffect).toBeCloseTo(0, 10);
    expect(r.bridge.multipleEffect).toBeCloseTo(0, 10);
    expect(r.bridge.deleveragingEffect).toBeCloseTo(14.5, 10); // 50 - 35.5
    expect(r.bridge.feesEffect).toBeCloseTo(0, 10);
    expect(r.bridge.totalValueCreated).toBeCloseTo(14.5, 10); // 64.5 - 50
    expect(r.cashShortfall).toBe(false);
  });
});

describe("debt waterfall caps", () => {
  it("sweep never drives balances negative and stops at outstanding balances", () => {
    // Huge FCF: enormous margins, light debt, 100% sweep — debt is repaid in
    // full almost immediately.
    const a: DealAssumptions = {
      ...base,
      entryEbitdaMargin: 0.45,
      exitEbitdaMargin: 0.45,
      seniorDebtX: 1.0,
      mezzDebtX: 0.5,
      cashSweepPct: 1.0,
    };
    const r = runLbo(a);
    for (const row of r.years) {
      expect(row.seniorBalance).toBeGreaterThanOrEqual(0);
      expect(row.mezzBalance).toBeGreaterThanOrEqual(0);
      expect(row.sweep).toBeGreaterThanOrEqual(0);
    }
    // Debt is fully repaid before the end of the hold; once balances are
    // zero, sweep must be exactly zero (nothing left to repay).
    const last = r.years[r.years.length - 1];
    expect(last.seniorBalance).toBeCloseTo(0, 10);
    expect(last.mezzBalance).toBeCloseTo(0, 10);
    expect(last.sweep).toBeCloseTo(0, 10);
    expect(last.mandatoryAmort).toBeCloseTo(0, 10);
    // Total repayments never exceed original principal.
    const repaid = r.years.reduce((s, y) => s + y.mandatoryAmort + y.sweep, 0);
    expect(repaid).toBeCloseTo(r.entry.totalDebt, 6);
  });

  it("mandatory amort is capped at the remaining senior balance", () => {
    // 50% amort with no sweep: senior fully amortizes in exactly 2 years,
    // after which mandatoryAmort must fall to 0, not go negative.
    const a: DealAssumptions = {
      ...base,
      seniorAmortPct: 0.5,
      cashSweepPct: 0,
    };
    const r = runLbo(a);
    const senior0 = r.entry.seniorDebt;
    expect(r.years[0].mandatoryAmort).toBeCloseTo(senior0 * 0.5, 10);
    expect(r.years[0].seniorBalance).toBeCloseTo(senior0 * 0.5, 10);
    expect(r.years[1].mandatoryAmort).toBeCloseTo(senior0 * 0.5, 10);
    expect(r.years[1].seniorBalance).toBeCloseTo(0, 10);
    for (const row of r.years.slice(2)) {
      expect(row.mandatoryAmort).toBeCloseTo(0, 10);
      expect(row.seniorBalance).toBeCloseTo(0, 10);
    }
  });
});

describe("monte carlo", () => {
  const quick = { ...DEFAULT_MC_CONFIG, iterations: 500 };

  it("is deterministic for a given seed", () => {
    const a = runMonteCarlo(base, quick);
    const b = runMonteCarlo(base, quick);
    expect(a.meanIrr).toBe(b.meanIrr);
    expect(a.irrs).toEqual(b.irrs);
    expect(a.moics).toEqual(b.moics);
  });

  it("differs for a different seed", () => {
    const a = runMonteCarlo(base, quick);
    const b = runMonteCarlo(base, { ...quick, seed: 1337 });
    expect(a.meanIrr).not.toBe(b.meanIrr);
  });

  it("returns sorted arrays and coherent percentiles", () => {
    const r = runMonteCarlo(base, quick);
    expect(r.irrs).toHaveLength(quick.iterations);
    for (let i = 1; i < r.irrs.length; i++) {
      expect(r.irrs[i]).toBeGreaterThanOrEqual(r.irrs[i - 1]);
      expect(r.moics[i]).toBeGreaterThanOrEqual(r.moics[i - 1]);
    }
    expect(r.p5Irr).toBeLessThanOrEqual(r.p25Irr);
    expect(r.p25Irr).toBeLessThanOrEqual(r.medianIrr);
    expect(r.medianIrr).toBeLessThanOrEqual(r.p75Irr);
    expect(r.p75Irr).toBeLessThanOrEqual(r.p95Irr);
    expect(r.probIrrAbove25).toBeLessThanOrEqual(r.probIrrAbove20);
    expect(r.probIrrAbove20).toBeLessThanOrEqual(r.probIrrAbove15);
  });
});

describe("sensitivity", () => {
  it("produces the requested grid shape and IRR strictly increases with exit multiple", () => {
    const xValues = [7.0, 8.0, 9.0, 10.0, 11.0];
    const yValues = [8.0, 9.0, 10.0];
    const grid = runSensitivity({
      base,
      xAxis: "exitMultiple",
      xValues,
      yAxis: "entryMultiple",
      yValues,
      metric: "irr",
    });
    expect(grid.rows).toHaveLength(yValues.length);
    for (const row of grid.rows) {
      expect(row).toHaveLength(xValues.length);
      // Holding everything else fixed, a richer exit multiple must yield a
      // strictly higher IRR.
      for (let j = 1; j < row.length; j++) {
        expect(row[j]).toBeGreaterThan(row[j - 1]);
      }
    }
  });

  it("uniformRevenueGrowth overwrites every year's growth without mutating base", () => {
    const original = [...base.revenueGrowth];
    const grid = runSensitivity({
      base,
      xAxis: "uniformRevenueGrowth",
      xValues: [0.02, 0.06, 0.1],
      yAxis: "exitMultiple",
      yValues: [9.0],
      metric: "irr",
    });
    expect(base.revenueGrowth).toEqual(original);
    // Faster uniform growth -> higher IRR.
    expect(grid.rows[0][2]).toBeGreaterThan(grid.rows[0][0]);
  });
});

describe("guards", () => {
  it("over-levered inputs (sponsorEquity <= 0) are flagged not financeable", () => {
    // Debt of 12x EBITDA against a 9x purchase price: equity check is negative.
    const a: DealAssumptions = { ...base, seniorDebtX: 10, mezzDebtX: 2 };
    const r = runLbo(a);
    expect(r.financeable).toBe(false);
    // Raw equity check is preserved (negative) so the bridge still reconciles.
    expect(r.entry.sponsorEquity).toBeLessThan(0);
    expect(r.bridge.totalValueCreated).toBeCloseTo(
      r.exit.equityValue - r.entry.sponsorEquity,
      6,
    );
    // Sentinels instead of absurd returns.
    expect(r.irr).toBe(0);
    expect(r.moic).toBe(0);
    expect(Number.isNaN(r.irr)).toBe(false);
    expect(Number.isNaN(r.moic)).toBe(false);
  });

  it("financeable deals expose financeable = true", () => {
    expect(runLbo(base).financeable).toBe(true);
  });

  it("revenueGrowth shorter than holdYears carries the last rate forward instead of NaN", () => {
    const a: DealAssumptions = { ...base, holdYears: 7 }; // growth array has 5 entries
    const r = runLbo(a);
    expect(r.years).toHaveLength(7);
    for (const y of r.years) {
      expect(Number.isFinite(y.revenue)).toBe(true);
      expect(Number.isFinite(y.fcf)).toBe(true);
    }
    expect(r.years[6].revenueGrowth).toBe(base.revenueGrowth[4]);
    expect(Number.isFinite(r.moic)).toBe(true);
  });

  it("sensitivity grid emits NaN for unfinanceable cells", () => {
    const grid = runSensitivity({
      base,
      xAxis: "entryMultiple",
      // 2.5x entry against 4.5x total leverage is unfinanceable; 9x is fine.
      xValues: [2.5, 9.0],
      yAxis: "exitMultiple",
      yValues: [9.0],
      metric: "irr",
    });
    expect(Number.isNaN(grid.rows[0][0])).toBe(true);
    expect(Number.isFinite(grid.rows[0][1])).toBe(true);
  });

  it("scenario sanity: bull beats base beats bear", () => {
    const [b, bull, bear] = ["base", "bull", "bear"].map(
      (id) => runLbo(SCENARIOS.find((s) => s.id === id)!.assumptions).irr,
    );
    expect(bull).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(bear);
    expect(b).toBeGreaterThan(0.15);
    expect(b).toBeLessThan(0.25);
    expect(bear).toBeLessThan(0.1);
  });
});
