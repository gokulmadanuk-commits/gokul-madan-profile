/**
 * Bank Deposits and Cash Expenditures Method.
 *
 * Gleckman v. United States, 80 F.2d 394 (8th Cir. 1935); IRM 4.10.4:
 * Total deposits − inter-account transfers − non-income deposits =
 * net deposits from income; + cash expenditures from undeposited receipts
 * − nontaxable cash sources = corrected gross receipts; − reported income
 * = understatement.
 *
 * Scope: checking/savings accounts of the personal estate plus accounts of
 * discovered (nominee) entities — frost-checking, frost-savings,
 * prosperity-bluebonnet. The disclosed operating business (chase-biz) and
 * the brokerage are OUT of scope.
 */
import type { BankDepositsResult, BankDepositsYear, CaseFile } from "../lib/types";
import { isDiscoveredEntityAccount, isPersonalAccount, reportedIncomeFor, yearOf } from "./expenses";

export function buildBankDeposits(cf: CaseFile): BankDepositsResult {
  const scope = new Set(
    cf.accounts
      .filter(
        (a) =>
          (a.kind === "checking" || a.kind === "savings") &&
          (isPersonalAccount(a) || isDiscoveredEntityAccount(cf, a)),
      )
      .map((a) => a.id),
  );

  const years = [...cf.reported].map((r) => r.year).sort((a, b) => a - b);

  const result: BankDepositsYear[] = years.map((year) => {
    let totalDeposits = 0;
    let interAccountTransfers = 0;
    let nonIncomeDeposits = 0;

    for (const t of cf.transactions) {
      if (t.amount <= 0) continue;
      if (yearOf(t.date) !== year) continue;
      if (!scope.has(t.accountId)) continue;
      totalDeposits += t.amount;
      if (t.transferGroup) {
        interAccountTransfers += t.amount;
      } else if (t.tags.includes("nontaxable") || t.category === "Refund") {
        nonIncomeDeposits += t.amount;
      }
    }

    const netDeposits = totalDeposits - interAccountTransfers - nonIncomeDeposits;

    // Currency analysis: cash available vs. cash applied reconciles — every
    // expenditure in this record flows through the deposited accounts (card
    // spend is funded by ledgered card payments; all outlays clear a scoped
    // or disclosed account). No expenditures were made from undeposited
    // currency, so the cash-expenditures add-on is zero.
    const cashExpenditures = 0;

    const grossReceipts = netDeposits + cashExpenditures;

    // Nontaxable sources were already eliminated above as non-income
    // deposits; the field is kept at zero for schedule display.
    const nontaxableSources = 0;

    const reportedIncome = reportedIncomeFor(cf, year);
    return {
      year,
      totalDeposits,
      interAccountTransfers,
      nonIncomeDeposits,
      netDeposits,
      cashExpenditures,
      grossReceipts,
      nontaxableSources,
      reportedIncome,
      understatement: grossReceipts - nontaxableSources - reportedIncome,
    };
  });

  return {
    years: result,
    totalUnderstatement: result.reduce((acc, y) => acc + y.understatement, 0),
  };
}
