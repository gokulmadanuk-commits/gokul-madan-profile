/**
 * Integration invariants against the generated case file. Skipped while
 * src/data/case.json is still the empty stub (generator runs separately).
 */
import { describe, expect, it } from "vitest";
import raw from "../data/case.json";
import type { CaseFile } from "../lib/types";
import { buildBankDeposits } from "./bankDeposits";
import { buildConvergence } from "./convergence";
import { buildExpenditures } from "./expenditures";
import { buildFlowGraph } from "./flows";
import { buildNetWorth } from "./netWorth";
import { buildSeparateProperty } from "./separateProperty";

const cf = raw as unknown as CaseFile;

const BAND_LOW = 28_000_000; // $280,000
const BAND_HIGH = 44_000_000; // $440,000

describe.skipIf(cf.transactions.length === 0)("generated case invariants", () => {
  it("the three methods converge within 5% each year", () => {
    const conv = buildConvergence(buildNetWorth(cf), buildExpenditures(cf), buildBankDeposits(cf));
    expect(conv.map((c) => c.year)).toEqual([2022, 2023, 2024]);
    for (const year of conv) {
      expect(year.spread).toBeGreaterThanOrEqual(0);
      expect(year.spread).toBeLessThanOrEqual(0.05);
    }
  });

  it("per-year understatements land in the $280k–$440k band for every method", () => {
    const nw = buildNetWorth(cf);
    const ex = buildExpenditures(cf);
    const bd = buildBankDeposits(cf);
    const all = [
      ...nw.method.map((m) => m.understatement),
      ...ex.years.map((y) => y.understatement),
      ...bd.years.map((y) => y.understatement),
    ];
    expect(all).toHaveLength(9);
    for (const u of all) {
      expect(u).toBeGreaterThanOrEqual(BAND_LOW);
      expect(u).toBeLessThanOrEqual(BAND_HIGH);
    }
  });

  it("minimum sum balance: $187,340.00 on 2023-11-17", () => {
    const sp = buildSeparateProperty(cf);
    expect(sp.minimumSumBalanceResult).toBe(18_734_000);
    expect(sp.minimumBalanceDate).toBe("2023-11-17");
  });

  it("flow graph carries the $189,200 Bluebonnet→title-company closing wire", () => {
    const graph = buildFlowGraph(cf);
    const wire = graph.edges.find(
      (e) => e.fromId === "prosperity-bluebonnet" && e.toId === "gulf-coast-title",
    );
    expect(wire).toBeDefined();
    expect(wire?.total).toBe(18_920_000);
    expect(wire?.flag).toBeTruthy();
  });
});
