/**
 * Hand-built test fixture — a miniature Delaney case with exact-cents,
 * hand-computed expectations. Every engine test derives from this file.
 *
 * Ledger map (all 2022; opening year 2021):
 *
 *   chk  (Frost personal checking, joint, open $5,000.00)
 *     t1  01-15  +$8,000.00  Salary (emp)                      bal 13,000.00
 *     t2  01-20  −$2,000.00  Mortgage [living]                 bal 11,000.00
 *     t3  02-01  −$3,000.00  Transfer→sav (tg1)                bal  8,000.00
 *     t4  02-10  +$9,500.00  Cash deposit [hidden]             bal 17,500.00
 *     t5  03-05  −$1,700.00  Card payment (tg2)                bal 15,800.00
 *     t6  03-20  −$4,000.00  Taxes Paid                        bal 11,800.00
 *     t7  04-02    −$800.00  Groceries [living]                bal 11,000.00
 *     t8  05-10    +$200.00  Refund [nontaxable]               bal 11,200.00
 *   sav  (Frost savings — the commingled tracing account, open $10,000.00)
 *     s1  02-01  +$3,000.00  Transfer from chk (tg1, community) bal 13,000.00
 *     s2  06-15 +$50,000.00  Inheritance (separate, est)        bal 63,000.00
 *     s3  08-10 −$15,000.00  Home Improvement [living]          bal 48,000.00  ← breach: 13,000 comm + 2,000 sep
 *     s4  09-01  +$5,000.00  Side-job check [hidden, community] bal 53,000.00
 *     s5  10-01  −$4,000.00  Travel [living]                    bal 49,000.00
 *   card (Amex, subject, open −$200.00)
 *     t9  02-20    −$900.00  Dining [living]                   bal −1,100.00
 *     t9b 03-01    −$600.00  Travel [living]                   bal −1,700.00
 *     t10 03-05  +$1,700.00  Payment (tg2)                     bal      0.00
 *   biz  (Chase business — disclosed entity, OUT of deposits scope, open $1,000.00)
 *     r1  03-10  +$6,000.00  Business Revenue                  bal  7,000.00
 *     b0  04-15  −$2,000.00  "LOAN REPAYMENT" out [loan-labeled] bal 5,000.00
 *   blue (Prosperity Bluebonnet — DISCOVERED entity, open $0.00)
 *     b1  04-15  +$2,000.00  "LOAN REPAYMENT" in [hidden, loan-labeled, cp emp] bal 2,000.00
 *     b2  05-01  +$1,400.00  Rental income [hidden, cp mgmt]   bal 3,400.00
 *     b3  07-01  −$3,000.00  Wire → title co [capital]         bal   400.00
 *
 * Hand-computed engine expectations (cents):
 *   PLE 2022                = 200000+80000+90000+60000+1500000+400000 = 233_00_00 → 2,330,000
 *   taxesPaid 2022          = 400,000
 *   nontaxableInflows 2022  = 20,000 (refund) + 5,000,000 (inheritance) = 5,020,000
 *   Net worth: NW2021 = 2,500,000 − 2,020,000 = 480,000
 *              NW2022 = 7,260,000 − 2,000,000 = 5,260,000; increase 4,780,000
 *              understatement = 4,780,000 + 2,730,000 − 5,020,000 − 1,000,000 = 1,490,000
 *   Expenditures: applications = 2,330,000 + 400,000 + 300,000 + 20,000 + 4,560,000 = 7,610,000
 *                 sources = 1,000,000 + 5,020,000 = 6,020,000; understatement 1,590,000
 *   Bank deposits: total 7,910,000 − transfers 300,000 − nonincome 5,020,000 = 2,590,000
 *                  understatement = 2,590,000 − 1,000,000 = 1,590,000
 *   Tracing: breach at s3 → separate 4,800,000; min balance 4,800,000 @ 2022-08-10;
 *            MSB = COF = 4,800,000; ending balance 4,900,000
 */
import type { Account, CaseFile, Entity, Transaction } from "../lib/types";

type TxSpec = Omit<Transaction, "doc" | "confidence"> &
  Partial<Pick<Transaction, "doc" | "confidence">>;

let line = 0;
export function tx(spec: TxSpec): Transaction {
  line += 1;
  return {
    doc: { docId: "doc-fixture", page: 1, line },
    confidence: 0.95,
    ...spec,
  };
}

const entities: Entity[] = [
  { id: "emp", name: "Delaney Mechanical Services LLC", kind: "employer" },
  { id: "llc-blue", name: "Bluebonnet Holdings LLC", kind: "llc", discovered: true },
  { id: "est", name: "Estate of Margaret H. Whitmore", kind: "estate" },
  { id: "title", name: "Gulf Coast Title Co.", kind: "title-company" },
  { id: "mgmt", name: "Gulf Breeze Property Mgmt", kind: "vendor" },
];

const accounts: Account[] = [
  {
    id: "chk", institution: "Frost Bank", name: "Personal Checking", kind: "checking",
    last4: "4417", owner: "joint", disclosed: true, openingBalance: 500_000,
  },
  {
    id: "sav", institution: "Frost Bank", name: "Premier Savings", kind: "savings",
    last4: "8823", owner: "joint", disclosed: true, openingBalance: 1_000_000,
  },
  {
    id: "card", institution: "American Express", name: "Platinum Card", kind: "card",
    last4: "71002", owner: "subject", disclosed: true, openingBalance: -20_000,
  },
  {
    id: "biz", institution: "Chase", name: "Business Complete Checking", kind: "checking",
    last4: "3301", owner: "entity", entityId: "emp", disclosed: true, openingBalance: 100_000,
  },
  {
    id: "blue", institution: "Prosperity Bank", name: "Business Checking (Bluebonnet)", kind: "checking",
    last4: "9174", owner: "entity", entityId: "llc-blue", disclosed: false, openingBalance: 0,
    opened: "2022-04-01",
  },
];

const transactions: Transaction[] = [
  tx({ id: "t1", accountId: "chk", date: "2022-01-15", description: "PAYROLL DELANEY MECHANICAL", amount: 800_000, category: "Salary", channel: "payroll", counterpartyId: "emp", tags: ["income-known"], balanceAfter: 1_300_000 }),
  tx({ id: "t2", accountId: "chk", date: "2022-01-20", description: "CADENCE BANK MORTGAGE PMT", amount: -200_000, category: "Mortgage", channel: "ach", tags: ["living-expense"], balanceAfter: 1_100_000 }),
  tx({ id: "t3", accountId: "chk", date: "2022-02-01", description: "TRANSFER TO SAVINGS 8823", amount: -300_000, category: "Transfer", channel: "transfer", transferGroup: "tg1", tags: ["transfer"], balanceAfter: 800_000 }),
  tx({ id: "s1", accountId: "sav", date: "2022-02-01", description: "TRANSFER FROM CHECKING 4417", amount: 300_000, category: "Transfer", channel: "transfer", transferGroup: "tg1", tags: ["transfer"], fundSource: "community", balanceAfter: 1_300_000 }),
  tx({ id: "t4", accountId: "chk", date: "2022-02-10", description: "DEPOSIT CASH BRANCH 004 HOUSTON TX", amount: 950_000, category: "Cash Deposit", channel: "cash", tags: ["income-hidden", "cash-deposit", "structuring-flag"], balanceAfter: 1_750_000 }),
  tx({ id: "t9", accountId: "card", date: "2022-02-20", description: "UCHI HOUSTON TX", amount: -90_000, category: "Dining", channel: "card", tags: ["living-expense"], balanceAfter: -110_000 }),
  tx({ id: "t9b", accountId: "card", date: "2022-03-01", description: "FOUR SEASONS RESORT", amount: -60_000, category: "Travel", channel: "card", tags: ["living-expense"], balanceAfter: -170_000 }),
  tx({ id: "t5", accountId: "chk", date: "2022-03-05", description: "AMEX EPAYMENT ACH PMT", amount: -170_000, category: "Card Payment", channel: "ach", transferGroup: "tg2", tags: ["transfer"], balanceAfter: 1_580_000 }),
  tx({ id: "t10", accountId: "card", date: "2022-03-05", description: "ONLINE PAYMENT RECEIVED — THANK YOU", amount: 170_000, category: "Card Payment", channel: "ach", transferGroup: "tg2", tags: ["transfer"], balanceAfter: 0 }),
  tx({ id: "r1", accountId: "biz", date: "2022-03-10", description: "DEPOSIT — GREENWAY PLAZA JOB", amount: 600_000, category: "Business Revenue", channel: "check", tags: ["income-known"], balanceAfter: 700_000 }),
  tx({ id: "t6", accountId: "chk", date: "2022-03-20", description: "IRS USATAXPYMT", amount: -400_000, category: "Taxes Paid", channel: "ach", tags: [], balanceAfter: 1_180_000 }),
  tx({ id: "t7", accountId: "chk", date: "2022-04-02", description: "CENTRAL MARKET HOUSTON TX", amount: -80_000, category: "Groceries", channel: "card", tags: ["living-expense"], balanceAfter: 1_100_000 }),
  tx({ id: "b0", accountId: "biz", date: "2022-04-15", description: "CHECK 2201 — LOAN REPAYMENT", amount: -200_000, category: "Business Expense", channel: "check", counterpartyId: "llc-blue", tags: ["loan-labeled"], balanceAfter: 500_000 }),
  tx({ id: "b1", accountId: "blue", date: "2022-04-15", description: "DEPOSIT — LOAN REPAYMENT DELANEY MECH", amount: 200_000, category: "Other Deposit", channel: "check", counterpartyId: "emp", tags: ["income-hidden", "loan-labeled"], balanceAfter: 200_000 }),
  tx({ id: "b2", accountId: "blue", date: "2022-05-01", description: "GULF BREEZE PROP MGMT RENT", amount: 140_000, category: "Rental Income", channel: "ach", counterpartyId: "mgmt", tags: ["income-hidden"], balanceAfter: 340_000 }),
  tx({ id: "t8", accountId: "chk", date: "2022-05-10", description: "TXU ENERGY REFUND", amount: 20_000, category: "Refund", channel: "ach", tags: ["nontaxable"], balanceAfter: 1_120_000 }),
  tx({ id: "s2", accountId: "sav", date: "2022-06-15", description: "WIRE IN — ESTATE OF MARGARET H WHITMORE", amount: 5_000_000, category: "Inheritance", channel: "wire", counterpartyId: "est", tags: ["nontaxable", "separate-property"], fundSource: "separate", balanceAfter: 6_300_000 }),
  tx({ id: "b3", accountId: "blue", date: "2022-07-01", description: "WIRE OUT — GULF COAST TITLE CO", amount: -300_000, category: "Real Estate Purchase", channel: "wire", counterpartyId: "title", tags: ["capital"], balanceAfter: 40_000 }),
  tx({ id: "s3", accountId: "sav", date: "2022-08-10", description: "CHECK 1187 — MERIDIAN POOLS", amount: -1_500_000, category: "Home Improvement", channel: "check", tags: ["living-expense"], balanceAfter: 4_800_000 }),
  tx({ id: "s4", accountId: "sav", date: "2022-09-01", description: "DEPOSIT CHECK — SIDE JOB", amount: 500_000, category: "Check Deposit", channel: "check", tags: ["income-hidden"], fundSource: "community", balanceAfter: 5_300_000 }),
  tx({ id: "s5", accountId: "sav", date: "2022-10-01", description: "WIRE OUT — ASPEN TRAVEL", amount: -400_000, category: "Travel", channel: "wire", tags: ["living-expense"], balanceAfter: 4_900_000 }),
];

export const fixtureCase: CaseFile = {
  matter: {
    number: "TEST-0001",
    caption: "In re the Marriage of Fixture",
    court: "311th Judicial District Court, Harris County, Texas",
    engagedBy: "Counsel for Petitioner",
    preparedFor: "Masin Advisory Group — Risk & Resolution",
    subject: "Marcus T. Delaney",
    spouse: "Sarah W. Delaney",
    periodStart: "2022-01-01",
    periodEnd: "2022-12-31",
    summary: "Unit-test fixture.",
  },
  entities,
  accounts,
  transactions,
  documents: [],
  schedule: [
    // Cash in banks: chk + sav + blue (biz excluded as the disclosed operating business).
    { id: "cash-banks", name: "Cash in banks", kind: "bank", valuesByYear: { "2021": 1_500_000, "2022": 6_060_000 } },
    { id: "rental", name: "Rental — 4210 Seawall Blvd #502, Galveston", kind: "real-property", valuesByYear: { "2021": 0, "2022": 300_000 }, acquired: "2022-07-01" },
    { id: "porsche", name: "2020 Porsche 911 Carrera", kind: "vehicle", valuesByYear: { "2021": 1_000_000, "2022": 900_000 } },
    { id: "mortgage", name: "Cadence Bank mortgage", kind: "liability", valuesByYear: { "2021": 2_000_000, "2022": 2_000_000 } },
    { id: "card-liab", name: "American Express balance", kind: "liability", valuesByYear: { "2021": 20_000, "2022": 0 } },
  ],
  reported: [
    {
      year: 2022,
      reportedIncome: 1_000_000,
      agi: 1_000_000,
      filingStatus: "Married filing jointly",
      federalTax: 400_000,
      docId: "doc-1040-2022",
    },
  ],
  tracing: {
    accountId: "sav",
    claimant: "Sarah W. Delaney",
    separateSource: "Estate of Margaret H. Whitmore",
    separateAmount: 5_000_000,
    separateDate: "2022-06-15",
  },
};

/**
 * Minimal case builder for focused separate-property scenarios:
 * one savings account, caller-supplied transactions and tracing terms.
 */
export function makeTracingCase(opts: {
  openingBalance: number;
  transactions: Transaction[];
  separateAmount: number;
  separateDate: string;
}): CaseFile {
  return {
    ...fixtureCase,
    accounts: [
      {
        id: "trace-acct",
        institution: "Frost Bank",
        name: "Premier Savings",
        kind: "savings",
        last4: "0001",
        owner: "joint",
        disclosed: true,
        openingBalance: opts.openingBalance,
      },
    ],
    entities: [],
    transactions: opts.transactions,
    schedule: [],
    reported: [],
    tracing: {
      accountId: "trace-acct",
      claimant: "Sarah W. Delaney",
      separateSource: "Estate of Margaret H. Whitmore",
      separateAmount: opts.separateAmount,
      separateDate: opts.separateDate,
    },
  };
}
