/**
 * Net Worth Method — the classic Holland schedule.
 *
 * Holland v. United States, 348 U.S. 121 (1954): assets at COST less
 * liabilities, anchored to a firm opening net worth (2021-12-31 here);
 * Increase in Net Worth + Personal Living Expenditures + Federal Income
 * Taxes Paid − Nontaxable Sources (inheritance etc.) − Reported Income
 * = Understatement, computed year by year.
 */
import type { CaseFile, Cents, NetWorthMethodYear, NetWorthResult, NetWorthYear } from "../lib/types";
import {
  nontaxableInflows,
  personalLivingExpenditures,
  reportedIncomeFor,
  taxesPaid,
} from "./expenses";

/** Sorted union of all years present in the schedule's valuesByYear. */
function scheduleYears(cf: CaseFile): number[] {
  const years = new Set<number>();
  for (const item of cf.schedule) {
    for (const key of Object.keys(item.valuesByYear)) years.add(Number(key));
  }
  return [...years].sort((a, b) => a - b);
}

function valueFor(values: Record<string, Cents>, year: number): Cents {
  return values[String(year)] ?? 0;
}

export function buildNetWorth(cf: CaseFile): NetWorthResult {
  const years = scheduleYears(cf); // 2021 (opening) .. 2024
  const assetsItems = cf.schedule.filter((s) => s.kind !== "liability");
  const liabilityItems = cf.schedule.filter((s) => s.kind === "liability");

  const schedule: NetWorthYear[] = years.map((year) => {
    const assets = assetsItems.map((s) => ({
      itemId: s.id,
      name: s.name,
      value: valueFor(s.valuesByYear, year),
    }));
    // Liabilities shown as positive magnitudes, subtracted (court-schedule form).
    const liabilities = liabilityItems.map((s) => ({
      itemId: s.id,
      name: s.name,
      value: Math.abs(valueFor(s.valuesByYear, year)),
    }));
    const totalAssets = assets.reduce((acc, a) => acc + a.value, 0);
    const totalLiabilities = liabilities.reduce((acc, l) => acc + l.value, 0);
    return {
      year,
      assets,
      totalAssets,
      liabilities,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
    };
  });

  const netWorthByYear = new Map(schedule.map((c) => [c.year, c.netWorth]));

  const method: NetWorthMethodYear[] = years.slice(1).map((year) => {
    const netWorthEnd = netWorthByYear.get(year) ?? 0;
    const netWorthStart = netWorthByYear.get(year - 1) ?? 0;
    const increase = netWorthEnd - netWorthStart;
    // PLE plus federal income taxes paid — the nondeductible add-backs.
    const personalExpenditures = personalLivingExpenditures(cf, year) + taxesPaid(cf, year);
    const totalApplication = increase + personalExpenditures;
    const nontaxableSources = nontaxableInflows(cf, year);
    const reportedIncome = reportedIncomeFor(cf, year);
    const understatement = totalApplication - nontaxableSources - reportedIncome;
    return {
      year,
      netWorthEnd,
      netWorthStart,
      increase,
      personalExpenditures,
      totalApplication,
      nontaxableSources,
      reportedIncome,
      understatement,
    };
  });

  return {
    schedule,
    method,
    totalUnderstatement: method.reduce((acc, m) => acc + m.understatement, 0),
  };
}
