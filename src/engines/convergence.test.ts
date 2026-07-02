import { describe, expect, it } from "vitest";
import { buildBankDeposits } from "./bankDeposits";
import { buildConvergence } from "./convergence";
import { buildExpenditures } from "./expenditures";
import { buildNetWorth } from "./netWorth";
import { fixtureCase as cf } from "./fixtures";

describe("three-method convergence", () => {
  const conv = buildConvergence(buildNetWorth(cf), buildExpenditures(cf), buildBankDeposits(cf));

  it("carries each method's understatement per year", () => {
    expect(conv).toHaveLength(1);
    expect(conv[0].year).toBe(2022);
    expect(conv[0].netWorth).toBe(1_490_000);
    expect(conv[0].expenditures).toBe(1_590_000);
    expect(conv[0].bankDeposits).toBe(1_590_000);
  });

  it("spread = (max − min) / mean", () => {
    // mean = 4,670,000/3; spread = 100,000 / (4,670,000/3) = 300,000/4,670,000
    expect(conv[0].spread).toBeCloseTo(300_000 / 4_670_000, 10);
  });
});
