/**
 * Source and Application of Funds (Expenditures) Method.
 *
 * United States v. Johnson, 319 U.S. 503 (1943); IRM 4.10.4. One-period
 * cash-flow restatement of the net worth method: Total Applications of
 * Funds − Total Known Sources of Funds = Understatement of income.
 */
import type { CaseFile, Cents, ExpendituresResult, ExpendituresYear } from "../lib/types";
import {
  isPersonalAccount,
  livingExpenseByCategory,
  nontaxableInflows,
  reportedIncomeFor,
  taxesPaid,
  yearOf,
} from "./expenses";

const TOP_CATEGORIES = 5;

function valueFor(values: Record<string, Cents>, year: number): Cents {
  return values[String(year)] ?? 0;
}

export function buildExpenditures(cf: CaseFile): ExpendituresResult {
  const years = [...cf.reported].map((r) => r.year).sort((a, b) => a - b);
  const brokerageIds = new Set(
    cf.accounts.filter((a) => a.kind === "brokerage" && isPersonalAccount(a)).map((a) => a.id),
  );
  const bankItems = cf.schedule.filter((s) => s.kind === "bank");
  const liabilityItems = cf.schedule.filter((s) => s.kind === "liability");

  const result: ExpendituresYear[] = years.map((year) => {
    const applications: { label: string; amount: Cents }[] = [];
    const knownSources: { label: string; amount: Cents }[] = [];

    // -- Applications: personal living expenditures, itemized top-5 + remainder.
    const living = livingExpenseByCategory(cf, year);
    for (const { category, amount } of living.slice(0, TOP_CATEGORIES)) {
      applications.push({ label: `Living expenses — ${category}`, amount });
    }
    const otherLiving = living
      .slice(TOP_CATEGORIES)
      .reduce((acc, c) => acc + c.amount, 0);
    if (otherLiving > 0) applications.push({ label: "Other living costs", amount: otherLiving });

    // -- Applications: federal income taxes paid (nondeductible outlay).
    const taxes = taxesPaid(cf, year);
    if (taxes > 0) applications.push({ label: "Federal income taxes paid", amount: taxes });

    // -- Applications: acquisitions of assets.
    // Real property purchased for cash (incl. wires out of nominee-entity accounts).
    let realEstate = 0;
    // Brokerage contributions: funds moved into the brokerage plus reinvested
    // dividends/interest retained there (income applied to an asset).
    let brokerage = 0;
    for (const t of cf.transactions) {
      if (yearOf(t.date) !== year) continue;
      if (t.amount < 0 && t.category === "Real Estate Purchase") realEstate += -t.amount;
      if (t.amount > 0 && brokerageIds.has(t.accountId)) brokerage += t.amount;
    }
    if (realEstate > 0) {
      applications.push({ label: "Real property acquired (cash purchase)", amount: realEstate });
    }
    if (brokerage > 0) {
      applications.push({
        label: "Brokerage contributions (incl. reinvested dividends)",
        amount: brokerage,
      });
    }

    // -- Applications / sources: liability movements from the year-end schedule.
    for (const item of liabilityItems) {
      const prev = Math.abs(valueFor(item.valuesByYear, year - 1));
      const curr = Math.abs(valueFor(item.valuesByYear, year));
      if (curr < prev) {
        applications.push({ label: `Reduction of liability — ${item.name}`, amount: prev - curr });
      } else if (curr > prev) {
        knownSources.push({ label: `Increase in liability — ${item.name}`, amount: curr - prev });
      }
    }

    // -- Applications / sources: net movement in cash-in-banks.
    let bankDelta = 0;
    for (const item of bankItems) {
      bankDelta += valueFor(item.valuesByYear, year) - valueFor(item.valuesByYear, year - 1);
    }
    if (bankDelta > 0) applications.push({ label: "Increase in cash in banks", amount: bankDelta });

    // -- Known sources.
    knownSources.unshift({ label: "Income per filed return", amount: reportedIncomeFor(cf, year) });
    const nontaxable = nontaxableInflows(cf, year);
    if (nontaxable > 0) knownSources.push({ label: "Nontaxable receipts", amount: nontaxable });
    if (bankDelta < 0) knownSources.push({ label: "Decrease in cash in banks", amount: -bankDelta });

    const totalApplications = applications.reduce((acc, a) => acc + a.amount, 0);
    const totalKnownSources = knownSources.reduce((acc, s) => acc + s.amount, 0);

    return {
      year,
      applications,
      totalApplications,
      knownSources,
      totalKnownSources,
      understatement: totalApplications - totalKnownSources,
    };
  });

  return {
    years: result,
    totalUnderstatement: result.reduce((acc, y) => acc + y.understatement, 0),
  };
}
