/**
 * Convergence of the three indirect methods.
 *
 * All three are restatements of the same economic identity; running them
 * independently and showing the annual understatements agree within a
 * narrow band rebuts the claim that any result is a method artifact
 * (IRM / DOJ Tax Division corroboration practice).
 */
import type {
  BankDepositsResult,
  ConvergenceYear,
  ExpendituresResult,
  NetWorthResult,
} from "../lib/types";

export function buildConvergence(
  nw: NetWorthResult,
  ex: ExpendituresResult,
  bd: BankDepositsResult,
): ConvergenceYear[] {
  return nw.method.map((m) => {
    const netWorth = m.understatement;
    const expenditures = ex.years.find((y) => y.year === m.year)?.understatement ?? 0;
    const bankDeposits = bd.years.find((y) => y.year === m.year)?.understatement ?? 0;
    const values = [netWorth, expenditures, bankDeposits];
    const mean = (netWorth + expenditures + bankDeposits) / 3;
    const spread = mean === 0 ? 0 : (Math.max(...values) - Math.min(...values)) / mean;
    return { year: m.year, netWorth, expenditures, bankDeposits, spread };
  });
}
