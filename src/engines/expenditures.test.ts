import { describe, expect, it } from "vitest";
import { buildExpenditures } from "./expenditures";
import { fixtureCase as cf } from "./fixtures";

describe("source and application of funds method", () => {
  const result = buildExpenditures(cf);
  const y = result.years[0];

  it("computes one year per filed return", () => {
    expect(result.years.map((r) => r.year)).toEqual([2022]);
  });

  it("itemizes applications: living top-5, taxes, acquisitions, debt reduction, bank increase", () => {
    const byLabel = new Map(y.applications.map((a) => [a.label, a.amount]));
    expect(byLabel.get("Living expenses — Home Improvement")).toBe(1_500_000);
    expect(byLabel.get("Living expenses — Travel")).toBe(460_000);
    expect(byLabel.get("Living expenses — Mortgage")).toBe(200_000);
    expect(byLabel.get("Living expenses — Dining")).toBe(90_000);
    expect(byLabel.get("Living expenses — Groceries")).toBe(80_000);
    expect(byLabel.has("Other living costs")).toBe(false); // exactly 5 categories
    expect(byLabel.get("Federal income taxes paid")).toBe(400_000);
    expect(byLabel.get("Real property acquired (cash purchase)")).toBe(300_000);
    expect(byLabel.get("Reduction of liability — American Express balance")).toBe(20_000);
    expect(byLabel.get("Increase in cash in banks")).toBe(4_560_000);
    expect(y.totalApplications).toBe(7_610_000);
  });

  it("does not book a liability line for the flat mortgage", () => {
    expect(
      y.applications.some((a) => a.label.includes("Cadence")) ||
        y.knownSources.some((s) => s.label.includes("Cadence")),
    ).toBe(false);
  });

  it("itemizes known sources: reported income + nontaxable receipts", () => {
    const byLabel = new Map(y.knownSources.map((s) => [s.label, s.amount]));
    expect(byLabel.get("Income per filed return")).toBe(1_000_000);
    expect(byLabel.get("Nontaxable receipts")).toBe(5_020_000);
    expect(y.totalKnownSources).toBe(6_020_000);
  });

  it("understatement = applications − known sources", () => {
    expect(y.understatement).toBe(1_590_000);
    expect(result.totalUnderstatement).toBe(1_590_000);
  });
});
