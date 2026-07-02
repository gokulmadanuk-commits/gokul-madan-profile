import { describe, expect, it } from "vitest";
import { buildBankDeposits } from "./bankDeposits";
import { fixtureCase as cf } from "./fixtures";

describe("bank deposits and cash expenditures method (Gleckman)", () => {
  const result = buildBankDeposits(cf);
  const y = result.years[0];

  it("totals deposits only for in-scope accounts (chk, sav, blue)", () => {
    // chk: 800,000 + 950,000 + 20,000; sav: 300,000 + 5,000,000 + 500,000;
    // blue: 200,000 + 140,000. Excludes biz revenue 600,000 (disclosed
    // operating business) and the card payment 170,000 (card account).
    expect(y.totalDeposits).toBe(7_910_000);
  });

  it("strips inter-account transfers by transferGroup", () => {
    expect(y.interAccountTransfers).toBe(300_000); // s1 only
  });

  it("strips non-income deposits (nontaxable + refunds), counting dual-tagged rows once", () => {
    expect(y.nonIncomeDeposits).toBe(5_020_000); // inheritance 5,000,000 + refund 20,000
  });

  it("computes net deposits and gross receipts with zero cash expenditures", () => {
    expect(y.netDeposits).toBe(2_590_000);
    expect(y.cashExpenditures).toBe(0);
    expect(y.grossReceipts).toBe(2_590_000);
    expect(y.nontaxableSources).toBe(0);
  });

  it("understatement = gross receipts − reported income", () => {
    expect(y.reportedIncome).toBe(1_000_000);
    expect(y.understatement).toBe(1_590_000);
    expect(result.totalUnderstatement).toBe(1_590_000);
  });
});
