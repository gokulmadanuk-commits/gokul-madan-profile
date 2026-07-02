import { describe, expect, it } from "vitest";
import { buildNetWorth } from "./netWorth";
import { fixtureCase as cf } from "./fixtures";

describe("net worth method (Holland schedule)", () => {
  const result = buildNetWorth(cf);

  it("builds the opening (2021) and year-end (2022) columns", () => {
    expect(result.schedule.map((c) => c.year)).toEqual([2021, 2022]);

    const y2021 = result.schedule[0];
    expect(y2021.totalAssets).toBe(2_500_000); // 1,500,000 banks + 0 rental + 1,000,000 vehicle
    expect(y2021.totalLiabilities).toBe(2_020_000); // 2,000,000 mortgage + 20,000 card
    expect(y2021.netWorth).toBe(480_000);

    const y2022 = result.schedule[1];
    expect(y2022.totalAssets).toBe(7_260_000); // 6,060,000 + 300,000 + 900,000
    expect(y2022.totalLiabilities).toBe(2_000_000);
    expect(y2022.netWorth).toBe(5_260_000);
  });

  it("lists every schedule item in each column", () => {
    const y2022 = result.schedule[1];
    expect(y2022.assets.map((a) => a.itemId)).toEqual(["cash-banks", "rental", "porsche"]);
    expect(y2022.liabilities.map((l) => l.itemId)).toEqual(["mortgage", "card-liab"]);
    expect(y2022.assets.find((a) => a.itemId === "rental")?.value).toBe(300_000);
  });

  it("computes the classic bridge: increase + PLE + taxes − nontaxable − reported", () => {
    expect(result.method).toHaveLength(1);
    const m = result.method[0];
    expect(m.year).toBe(2022);
    expect(m.netWorthStart).toBe(480_000);
    expect(m.netWorthEnd).toBe(5_260_000);
    expect(m.increase).toBe(4_780_000);
    expect(m.personalExpenditures).toBe(2_730_000); // 2,330,000 PLE + 400,000 taxes
    expect(m.totalApplication).toBe(7_510_000);
    expect(m.nontaxableSources).toBe(5_020_000);
    expect(m.reportedIncome).toBe(1_000_000);
    expect(m.understatement).toBe(1_490_000);
  });

  it("totals the understatement across method years", () => {
    expect(result.totalUnderstatement).toBe(1_490_000);
  });
});
