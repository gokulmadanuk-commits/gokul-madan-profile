/**
 * Lifestyle analysis: documented living-expense outflows by category per
 * year (inter-account transfers excluded, card purchases counted once at
 * the card), against income per the filed returns — the "$412k lifestyle
 * on $141k of reported income" gap.
 */
import type { CaseFile, LifestyleYear } from "../lib/types";
import { livingExpenseByCategory, reportedIncomeFor } from "./expenses";

export function buildLifestyle(cf: CaseFile): LifestyleYear[] {
  const years = [...cf.reported].map((r) => r.year).sort((a, b) => a - b);
  return years.map((year) => {
    const byCategory = livingExpenseByCategory(cf, year); // already sorted desc
    const totalLifestyle = byCategory.reduce((acc, c) => acc + c.amount, 0);
    const reportedIncome = reportedIncomeFor(cf, year);
    return {
      year,
      byCategory,
      totalLifestyle,
      reportedIncome,
      gap: totalLifestyle - reportedIncome,
    };
  });
}
