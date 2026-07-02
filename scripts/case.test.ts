/**
 * Invariants on the generated case file (scripts/generate-case.ts output).
 * These re-assert the generator's self-checks from the outside, so a bad
 * regeneration can never ship silently.
 */
import { describe, expect, it } from "vitest";
import raw from "../src/data/case.json";
import type { CaseFile } from "../src/lib/types";

const cf = raw as unknown as CaseFile;
const yearOf = (d: string) => Number(d.slice(0, 4));

describe("generated case file", () => {
  it("has the full cast", () => {
    expect(cf.accounts).toHaveLength(7);
    expect(cf.transactions.length).toBeGreaterThan(1800);
    expect(cf.documents.length).toBeGreaterThan(200);
    expect(cf.documents.reduce((a, d) => a + d.pages, 0)).toBeGreaterThanOrEqual(300);
  });

  it("running balances are continuous per account", () => {
    for (const acct of cf.accounts) {
      let bal = acct.openingBalance;
      for (const t of cf.transactions) {
        if (t.accountId !== acct.id) continue;
        bal += t.amount;
        expect(t.balanceAfter).toBe(bal);
      }
    }
  });

  it("every transferGroup nets to zero with exactly two legs", () => {
    const groups = new Map<string, number[]>();
    for (const t of cf.transactions) {
      if (!t.transferGroup) continue;
      const g = groups.get(t.transferGroup) ?? [];
      g.push(t.amount);
      groups.set(t.transferGroup, g);
    }
    expect(groups.size).toBeGreaterThan(100);
    for (const legs of groups.values()) {
      expect(legs).toHaveLength(2);
      expect(legs[0] + legs[1]).toBe(0);
    }
  });

  it("the savings account bottoms at exactly $187,340.00 on 2023-11-17", () => {
    const acct = cf.accounts.find((a) => a.id === "frost-savings")!;
    let bal = acct.openingBalance;
    let min = Infinity;
    let minDate = "";
    let seen = false;
    for (const t of cf.transactions) {
      if (t.accountId !== "frost-savings") continue;
      bal += t.amount;
      if (t.fundSource === "separate") seen = true;
      if (seen && bal < min) {
        min = bal;
        minDate = t.date;
      }
    }
    expect(min).toBe(18_734_000);
    expect(minDate).toBe("2023-11-17");
  });

  it("reported income is cents-exact against the returns", () => {
    expect(cf.reported.map((r) => r.reportedIncome)).toEqual([13_850_000, 14_120_000, 14_380_000]);
  });

  it("cash deposits all sit under the $10,000 CTR threshold", () => {
    const cash = cf.transactions.filter((t) => t.tags.includes("cash-deposit"));
    expect(cash.length).toBeGreaterThan(60);
    for (const t of cash) {
      expect(t.amount).toBeGreaterThan(0);
      expect(t.amount).toBeLessThan(1_000_000);
    }
    expect(cash.some((t) => t.tags.includes("structuring-flag"))).toBe(true);
  });

  it("every transaction carries provenance to a real document", () => {
    const docs = new Map(cf.documents.map((d) => [d.id, d]));
    for (const t of cf.transactions) {
      const doc = docs.get(t.doc.docId);
      expect(doc, `doc for ${t.id}`).toBeDefined();
      expect(t.doc.page).toBeGreaterThanOrEqual(2);
      expect(t.doc.page).toBeLessThanOrEqual(doc!.pages);
      expect(t.confidence).toBeGreaterThan(0.6);
      expect(t.confidence).toBeLessThanOrEqual(1);
    }
  });

  it("every deposit into the commingled account carries a fund source", () => {
    for (const t of cf.transactions) {
      if (t.accountId !== "frost-savings" || t.amount <= 0) continue;
      expect(t.fundSource, t.id).toBeDefined();
    }
  });
});
