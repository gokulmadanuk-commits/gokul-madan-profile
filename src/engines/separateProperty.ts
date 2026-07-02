/**
 * Texas separate-property tracing through the commingled account.
 *
 * - Community-out-first: Sibley v. Sibley, 286 S.W.2d 657 (Tex. Civ.
 *   App.—Dallas 1955) — withdrawals consume community funds first;
 *   separate dollars sink to the bottom.
 * - Minimum sum balance (lowest intermediate balance): Snider v. Snider,
 *   613 S.W.2d 8 — separate character survives only to the lowest total
 *   balance reached after the separate deposit; dips ratchet the claim
 *   down permanently.
 * - Clearinghouse scan: deposits matched to withdrawals of identical
 *   amount within days suggest conduit use (McKinley identical-sum
 *   inference).
 *
 * Burden: clear and convincing evidence, Tex. Fam. Code §3.003(b).
 */
import type {
  CaseFile,
  Cents,
  SeparatePropertyResult,
  TracingLedgerRow,
  Transaction,
} from "../lib/types";
import { fmtDollars } from "./expenses";

const MS_PER_DAY = 86_400_000;
const CLEARINGHOUSE_WINDOW_DAYS = 5;

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / MS_PER_DAY);
}

export function buildSeparateProperty(cf: CaseFile): SeparatePropertyResult {
  const { accountId, separateAmount } = cf.tracing;
  const account = cf.accounts.find((a) => a.id === accountId);

  const txns = cf.transactions
    .filter((t) => t.accountId === accountId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

  // Opening balance predates the separate corpus — community by presumption
  // (Tex. Fam. Code §3.003(a)).
  let community: Cents = account?.openingBalance ?? 0;
  let separate: Cents = 0;

  const describeSource = (t: Transaction): string => {
    if (t.transferGroup) {
      const other = cf.transactions.find(
        (o) => o.transferGroup === t.transferGroup && o.id !== t.id,
      );
      const otherAccount = other ? cf.accounts.find((a) => a.id === other.accountId) : undefined;
      return otherAccount ? `transfer from ${otherAccount.name.toLowerCase()}` : "transfer";
    }
    if (t.counterpartyId) {
      const entity = cf.entities.find((e) => e.id === t.counterpartyId);
      if (entity) return entity.name;
    }
    return t.category.toLowerCase();
  };

  const rows: TracingLedgerRow[] = [];
  let seenSeparateDeposit = false;
  let minimumBalance = Number.POSITIVE_INFINITY;
  let minimumBalanceDate = cf.tracing.separateDate;

  for (const t of txns) {
    let characterization: string;
    if (t.amount >= 0) {
      if (t.fundSource === "separate") {
        separate += t.amount;
        characterization = `Separate deposit — ${describeSource(t)}`;
      } else {
        community += t.amount;
        characterization = `Community deposit — ${describeSource(t)}`;
      }
    } else {
      const w = -t.amount;
      const fromCommunity = Math.min(community, w);
      const fromSeparate = Math.min(separate, w - fromCommunity);
      community -= fromCommunity;
      separate -= fromSeparate;
      // Any residual beyond both layers (overdraft) is community by presumption.
      community -= w - fromCommunity - fromSeparate;
      characterization = `Withdrawal — community out first (${fmtDollars(
        fromCommunity,
      )} community, ${fmtDollars(fromSeparate)} separate)`;
    }

    const totalBalance = community + separate;
    if (t.amount > 0 && t.fundSource === "separate") seenSeparateDeposit = true;
    if (seenSeparateDeposit && totalBalance < minimumBalance) {
      minimumBalance = totalBalance;
      minimumBalanceDate = t.date;
    }

    rows.push({
      transactionId: t.id,
      date: t.date,
      description: t.description,
      amount: t.amount,
      communityBalance: community,
      separateBalance: separate,
      totalBalance,
      characterization,
    });
  }

  const endingBalance = rows.length ? rows[rows.length - 1].totalBalance : community + separate;
  if (!Number.isFinite(minimumBalance)) minimumBalance = endingBalance;

  // Clearinghouse scan: non-transfer deposits matched to a later non-transfer
  // withdrawal of the identical amount within the window; each leg used once.
  const deposits = txns.filter((t) => t.amount > 0 && !t.transferGroup);
  const withdrawals = txns.filter((t) => t.amount < 0 && !t.transferGroup);
  const usedWithdrawals = new Set<string>();
  const clearinghouseMatches: SeparatePropertyResult["clearinghouseMatches"] = [];
  for (const d of deposits) {
    const match = withdrawals.find((w) => {
      if (usedWithdrawals.has(w.id)) return false;
      if (-w.amount !== d.amount) return false;
      const days = daysBetween(d.date, w.date);
      return days >= 0 && days <= CLEARINGHOUSE_WINDOW_DAYS;
    });
    if (match) {
      usedWithdrawals.add(match.id);
      clearinghouseMatches.push({
        inId: d.id,
        outId: match.id,
        amount: d.amount,
        daysApart: daysBetween(d.date, match.date),
      });
    }
  }

  return {
    accountId,
    rows,
    minimumBalance,
    minimumBalanceDate,
    separateContribution: separateAmount,
    minimumSumBalanceResult: Math.min(separateAmount, minimumBalance),
    communityOutFirstResult: separate,
    endingBalance,
    clearinghouseMatches,
  };
}
