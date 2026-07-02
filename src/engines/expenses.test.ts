import { describe, expect, it } from "vitest";
import {
  fmtDollars,
  livingExpenseByCategory,
  nontaxableInflows,
  personalLivingExpenditures,
  reportedIncomeFor,
  taxesPaid,
} from "./expenses";
import { fixtureCase as cf } from "./fixtures";

describe("expense helpers", () => {
  it("sums personal living expenditures across joint/subject accounts incl. cards", () => {
    // t2 200,000 + t7 80,000 + t9 90,000 + t9b 60,000 + s3 1,500,000 + s5 400,000
    expect(personalLivingExpenditures(cf, 2022)).toBe(2_330_000);
  });

  it("never counts transferGroup rows or entity-account outflows as living expenses", () => {
    // Card payment legs (tg2) and the Bluebonnet wire (entity account) are out.
    const total = personalLivingExpenditures(cf, 2022);
    expect(total).not.toBeGreaterThan(2_330_000);
  });

  it("returns zero for a year with no activity", () => {
    expect(personalLivingExpenditures(cf, 2023)).toBe(0);
  });

  it("sums taxes paid by category", () => {
    expect(taxesPaid(cf, 2022)).toBe(400_000);
  });

  it("sums nontaxable inflows (inheritance + refund)", () => {
    expect(nontaxableInflows(cf, 2022)).toBe(5_020_000);
  });

  it("groups living expenses by category, sorted descending", () => {
    expect(livingExpenseByCategory(cf, 2022)).toEqual([
      { category: "Home Improvement", amount: 1_500_000 },
      { category: "Travel", amount: 460_000 },
      { category: "Mortgage", amount: 200_000 },
      { category: "Dining", amount: 90_000 },
      { category: "Groceries", amount: 80_000 },
    ]);
  });

  it("reads reported income per return", () => {
    expect(reportedIncomeFor(cf, 2022)).toBe(1_000_000);
    expect(reportedIncomeFor(cf, 2019)).toBe(0);
  });

  it("formats dollars deterministically", () => {
    expect(fmtDollars(940_000)).toBe("$9,400.00");
    expect(fmtDollars(260_000)).toBe("$2,600.00");
    expect(fmtDollars(0)).toBe("$0.00");
    expect(fmtDollars(123_456_789)).toBe("$1,234,567.89");
  });
});
