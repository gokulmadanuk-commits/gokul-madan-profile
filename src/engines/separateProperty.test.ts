import { describe, expect, it } from "vitest";
import { buildSeparateProperty } from "./separateProperty";
import { fixtureCase as cf, makeTracingCase, tx } from "./fixtures";

describe("separate-property tracing — community out first (Sibley)", () => {
  const result = buildSeparateProperty(cf);

  it("runs the chronological ledger with running community/separate/total balances", () => {
    expect(result.accountId).toBe("sav");
    expect(result.rows.map((r) => r.transactionId)).toEqual(["s1", "s2", "s3", "s4", "s5"]);

    const [s1, s2, s3, s4, s5] = result.rows;
    // Opening $10,000 community; +$3,000 community transfer.
    expect([s1.communityBalance, s1.separateBalance, s1.totalBalance]).toEqual([1_300_000, 0, 1_300_000]);
    expect(s1.characterization).toBe("Community deposit — transfer from personal checking");
    // Inheritance corpus lands separate.
    expect([s2.communityBalance, s2.separateBalance, s2.totalBalance]).toEqual([1_300_000, 5_000_000, 6_300_000]);
    expect(s2.characterization).toBe("Separate deposit — Estate of Margaret H. Whitmore");
    // $15,000 withdrawal breaches the community layer: 13,000 community + 2,000 separate.
    expect([s3.communityBalance, s3.separateBalance, s3.totalBalance]).toEqual([0, 4_800_000, 4_800_000]);
    expect(s3.characterization).toBe(
      "Withdrawal — community out first ($13,000.00 community, $2,000.00 separate)",
    );
    // Community deposit does NOT replenish the separate layer (the ratchet).
    expect([s4.communityBalance, s4.separateBalance]).toEqual([500_000, 4_800_000]);
    // Later withdrawal consumes community only.
    expect([s5.communityBalance, s5.separateBalance, s5.totalBalance]).toEqual([100_000, 4_800_000, 4_900_000]);
    expect(s5.characterization).toBe(
      "Withdrawal — community out first ($4,000.00 community, $0.00 separate)",
    );
  });

  it("finds the minimum balance after the separate deposit", () => {
    expect(result.minimumBalance).toBe(4_800_000);
    expect(result.minimumBalanceDate).toBe("2022-08-10");
  });

  it("agreement case: MSB and community-out-first coincide with a single corpus deposit", () => {
    expect(result.separateContribution).toBe(5_000_000);
    expect(result.minimumSumBalanceResult).toBe(4_800_000); // min(5,000,000, 4,800,000)
    expect(result.communityOutFirstResult).toBe(4_800_000);
    expect(result.endingBalance).toBe(4_900_000);
  });

  it("finds no clearinghouse matches in the main fixture", () => {
    expect(result.clearinghouseMatches).toEqual([]);
  });
});

describe("separate-property tracing — MSB vs COF disagreement", () => {
  // Two separate deposits: a dip between them ratchets the naive single-floor
  // MSB down to $10,000, while community-out-first credits the second
  // separate deposit and sustains $30,000.
  const mini = makeTracingCase({
    openingBalance: 0,
    separateAmount: 5_000_000, // $30k + $20k claimed corpus
    separateDate: "2022-06-15",
    transactions: [
      tx({ id: "d1", accountId: "trace-acct", date: "2022-06-15", description: "ESTATE DISTRIBUTION 1", amount: 3_000_000, category: "Inheritance", channel: "wire", tags: ["nontaxable", "separate-property"], fundSource: "separate", balanceAfter: 3_000_000 }),
      tx({ id: "w1", accountId: "trace-acct", date: "2022-07-01", description: "CHECK 101", amount: -2_000_000, category: "Cash Withdrawal", channel: "check", tags: [], balanceAfter: 1_000_000 }),
      tx({ id: "d2", accountId: "trace-acct", date: "2022-08-01", description: "ESTATE DISTRIBUTION 2", amount: 2_000_000, category: "Inheritance", channel: "wire", tags: ["nontaxable", "separate-property"], fundSource: "separate", balanceAfter: 3_000_000 }),
      tx({ id: "d3", accountId: "trace-acct", date: "2022-09-01", description: "PAYROLL DEPOSIT", amount: 1_000_000, category: "Salary", channel: "payroll", tags: ["income-known"], fundSource: "community", balanceAfter: 4_000_000 }),
    ],
  });
  const result = buildSeparateProperty(mini);

  it("ratchets the withdrawal through the (empty) community layer into separate", () => {
    expect(result.rows[1].characterization).toBe(
      "Withdrawal — community out first ($0.00 community, $20,000.00 separate)",
    );
    expect(result.rows[1].separateBalance).toBe(1_000_000);
  });

  it("MSB floor is the low-water mark; COF credits the later separate deposit", () => {
    expect(result.minimumBalance).toBe(1_000_000);
    expect(result.minimumBalanceDate).toBe("2022-07-01");
    expect(result.minimumSumBalanceResult).toBe(1_000_000); // min(5,000,000, 1,000,000)
    expect(result.communityOutFirstResult).toBe(3_000_000); // 1,000,000 + 2,000,000 new corpus
    expect(result.minimumSumBalanceResult).not.toBe(result.communityOutFirstResult);
  });
});

describe("separate-property tracing — clearinghouse scan", () => {
  const mini = makeTracingCase({
    openingBalance: 100_000,
    separateAmount: 850_000,
    separateDate: "2022-03-01",
    transactions: [
      // Conduit pair: identical amount, 3 days apart → match.
      tx({ id: "c1", accountId: "trace-acct", date: "2022-03-01", description: "DEPOSIT CHECK", amount: 850_000, category: "Check Deposit", channel: "check", tags: [], fundSource: "separate", balanceAfter: 950_000 }),
      tx({ id: "c2", accountId: "trace-acct", date: "2022-03-04", description: "WIRE OUT", amount: -850_000, category: "Cash Withdrawal", channel: "wire", tags: [], balanceAfter: 100_000 }),
      // Identical amounts but transferGroup legs → excluded.
      tx({ id: "c3", accountId: "trace-acct", date: "2022-04-01", description: "TRANSFER IN", amount: 200_000, category: "Transfer", channel: "transfer", transferGroup: "tgx", tags: ["transfer"], balanceAfter: 300_000 }),
      tx({ id: "c4", accountId: "trace-acct", date: "2022-04-02", description: "TRANSFER OUT", amount: -200_000, category: "Transfer", channel: "transfer", transferGroup: "tgy", tags: ["transfer"], balanceAfter: 100_000 }),
      // Identical amount but 19 days apart → outside the 5-day window.
      tx({ id: "c5", accountId: "trace-acct", date: "2022-05-01", description: "DEPOSIT CHECK", amount: 300_000, category: "Check Deposit", channel: "check", tags: [], balanceAfter: 400_000 }),
      tx({ id: "c6", accountId: "trace-acct", date: "2022-05-20", description: "CHECK 118", amount: -300_000, category: "Cash Withdrawal", channel: "check", tags: [], balanceAfter: 100_000 }),
    ],
  });
  const result = buildSeparateProperty(mini);

  it("matches identical-amount in/out pairs within 5 days, excluding transfers", () => {
    expect(result.clearinghouseMatches).toEqual([
      { inId: "c1", outId: "c2", amount: 850_000, daysApart: 3 },
    ]);
  });
});
