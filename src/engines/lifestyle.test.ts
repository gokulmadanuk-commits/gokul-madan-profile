import { describe, expect, it } from "vitest";
import { buildLifestyle } from "./lifestyle";
import { fixtureCase as cf } from "./fixtures";

describe("lifestyle analysis", () => {
  const years = buildLifestyle(cf);

  it("groups living-expense outflows by category, sorted descending, transfers excluded", () => {
    expect(years).toHaveLength(1);
    expect(years[0].byCategory).toEqual([
      { category: "Home Improvement", amount: 1_500_000 },
      { category: "Travel", amount: 460_000 },
      { category: "Mortgage", amount: 200_000 },
      { category: "Dining", amount: 90_000 },
      { category: "Groceries", amount: 80_000 },
    ]);
  });

  it("totals lifestyle spend and the gap vs reported income", () => {
    expect(years[0].totalLifestyle).toBe(2_330_000);
    expect(years[0].reportedIncome).toBe(1_000_000);
    expect(years[0].gap).toBe(1_330_000);
  });
});
