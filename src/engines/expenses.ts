/**
 * Shared expenditure helpers for the indirect methods.
 *
 * Methodology (IRM 4.10.4 / 9.5.9; Holland v. United States, 348 U.S. 121 (1954)):
 * personal living expenditures (PLE) are built item-by-item from documented
 * outlays — never estimated — and inter-account transfers are never expenses.
 *
 * All money in integer cents. Pure functions over CaseFile.
 */
import type { Account, CaseFile, Category, Cents, Transaction } from "../lib/types";

/** Year of an ISO date string. */
export function yearOf(date: string): number {
  return Number(date.slice(0, 4));
}

/** "$9,400.00" — deterministic, no locale dependence. */
export function fmtDollars(cents: Cents): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const rem = (abs % 100).toString().padStart(2, "0");
  return `${sign}$${dollars}.${rem}`;
}

/** Accounts owned by the marital estate directly (joint / subject / spouse), incl. cards. */
export function isPersonalAccount(a: Account): boolean {
  return a.owner === "joint" || a.owner === "subject" || a.owner === "spouse";
}

/** True when the account belongs to an entity surfaced by the investigation. */
export function isDiscoveredEntityAccount(cf: CaseFile, a: Account): boolean {
  if (a.owner !== "entity") return false;
  const entity = a.entityId ? cf.entities.find((e) => e.id === a.entityId) : undefined;
  return entity?.discovered === true || a.disclosed === false;
}

/** ids of personal accounts (joint/subject/spouse), including card accounts. */
export function personalAccountIds(cf: CaseFile): Set<string> {
  return new Set(cf.accounts.filter(isPersonalAccount).map((a) => a.id));
}

/** ids of personal accounts PLUS accounts of discovered (nominee) entities. */
export function personalPlusDiscoveredAccountIds(cf: CaseFile): Set<string> {
  return new Set(
    cf.accounts
      .filter((a) => isPersonalAccount(a) || isDiscoveredEntityAccount(cf, a))
      .map((a) => a.id),
  );
}

/** Rows carrying a transferGroup are inter-account movements — never expenses/income. */
function isTransfer(t: Transaction): boolean {
  return t.transferGroup !== undefined && t.transferGroup !== null;
}

/**
 * Personal living expenditures for a year: the sum of outflows tagged
 * "living-expense" across accounts owned joint/subject/spouse INCLUDING cards.
 * Card purchases count here; the card payments that fund them carry a
 * transferGroup and are excluded, so nothing is double counted.
 */
export function personalLivingExpenditures(cf: CaseFile, year: number): Cents {
  const scope = personalAccountIds(cf);
  let sum = 0;
  for (const t of cf.transactions) {
    if (yearOf(t.date) !== year) continue;
    if (!scope.has(t.accountId)) continue;
    if (isTransfer(t)) continue;
    if (t.amount >= 0) continue;
    if (!t.tags.includes("living-expense")) continue;
    sum += -t.amount;
  }
  return sum;
}

/** Federal/state income taxes paid in a year (category "Taxes Paid", personal accounts). */
export function taxesPaid(cf: CaseFile, year: number): Cents {
  const scope = personalAccountIds(cf);
  let sum = 0;
  for (const t of cf.transactions) {
    if (yearOf(t.date) !== year) continue;
    if (!scope.has(t.accountId)) continue;
    if (isTransfer(t)) continue;
    if (t.amount >= 0) continue;
    if (t.category !== "Taxes Paid") continue;
    sum += -t.amount;
  }
  return sum;
}

/**
 * Nontaxable inflows for a year (inheritance, refunds, other tagged-nontaxable
 * receipts) across personal accounts and discovered nominee-entity accounts.
 * These are the "nontaxable sources" the indirect methods must negate (Massei).
 */
export function nontaxableInflows(cf: CaseFile, year: number): Cents {
  const scope = personalPlusDiscoveredAccountIds(cf);
  let sum = 0;
  for (const t of cf.transactions) {
    if (yearOf(t.date) !== year) continue;
    if (!scope.has(t.accountId)) continue;
    if (isTransfer(t)) continue;
    if (t.amount <= 0) continue;
    if (!t.tags.includes("nontaxable")) continue;
    sum += t.amount;
  }
  return sum;
}

/**
 * Living-expense outflows grouped by category for a year (personal accounts,
 * transfers excluded), sorted descending by amount. Feeds the lifestyle
 * analysis and the expenditures schedule's itemized applications.
 */
export function livingExpenseByCategory(
  cf: CaseFile,
  year: number,
): { category: Category; amount: Cents }[] {
  const scope = personalAccountIds(cf);
  const byCat = new Map<Category, Cents>();
  for (const t of cf.transactions) {
    if (yearOf(t.date) !== year) continue;
    if (!scope.has(t.accountId)) continue;
    if (isTransfer(t)) continue;
    if (t.amount >= 0) continue;
    if (!t.tags.includes("living-expense")) continue;
    byCat.set(t.category, (byCat.get(t.category) ?? 0) + -t.amount);
  }
  return [...byCat.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category));
}

/**
 * All outflows grouped by category for a year (transfers excluded).
 * scope: "personal" (default) or "all" (includes entity accounts —
 * used e.g. for the Galveston purchase wired out of the nominee LLC).
 */
export function outflowsByCategory(
  cf: CaseFile,
  year: number,
  scope: "personal" | "all" = "personal",
): Map<Category, Cents> {
  const ids =
    scope === "personal" ? personalAccountIds(cf) : new Set(cf.accounts.map((a) => a.id));
  const byCat = new Map<Category, Cents>();
  for (const t of cf.transactions) {
    if (yearOf(t.date) !== year) continue;
    if (!ids.has(t.accountId)) continue;
    if (isTransfer(t)) continue;
    if (t.amount >= 0) continue;
    byCat.set(t.category, (byCat.get(t.category) ?? 0) + -t.amount);
  }
  return byCat;
}

/** Reported income per the filed return for a year (0 when no return on file). */
export function reportedIncomeFor(cf: CaseFile, year: number): Cents {
  return cf.reported.find((r) => r.year === year)?.reportedIncome ?? 0;
}
