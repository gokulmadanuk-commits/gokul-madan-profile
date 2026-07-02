/**
 * LUCA — Forensic Income Reconstruction Engine
 * Core data contract. Single source of truth for the case file,
 * the generators (scripts/), the engines (src/engines/), and the UI.
 *
 * Conventions:
 *  - All money values are in whole cents (integer). Format at the edge.
 *  - Dates are ISO strings "YYYY-MM-DD".
 *  - Transaction.amount is signed from the ACCOUNT's perspective:
 *    positive = inflow to the account, negative = outflow.
 *    For card accounts, purchases are negative, payments received are positive.
 */

export type Cents = number;
export type ISODate = string;

// ---------------------------------------------------------------------------
// Parties & entities
// ---------------------------------------------------------------------------

export type EntityKind =
  | "person"
  | "llc"
  | "employer"
  | "estate"
  | "title-company"
  | "school"
  | "club"
  | "lender"
  | "vendor"
  | "government"
  | "unknown";

export interface Entity {
  id: string;
  name: string;
  kind: EntityKind;
  /** Short note shown in the UI, e.g. "Formed 2023-03-14, TX SOS #805221947" */
  note?: string;
  /** True when the entity was not disclosed and was surfaced by the analysis */
  discovered?: boolean;
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export type AccountKind = "checking" | "savings" | "card" | "brokerage";
export type AccountOwner = "joint" | "subject" | "spouse" | "entity";

export interface Account {
  id: string;
  institution: string; // "Frost Bank"
  name: string; // "Personal Checking"
  kind: AccountKind;
  last4: string;
  owner: AccountOwner;
  /** Set when owner === "entity" */
  entityId?: string;
  /** False for accounts surfaced by the investigation (e.g. Bluebonnet) */
  disclosed: boolean;
  /** Balance at period start (cents). For cards: negative = amount owed. */
  openingBalance: Cents;
  /** Date the account was opened, if within/near the period */
  opened?: ISODate;
}

// ---------------------------------------------------------------------------
// Transactions (the unified ledger)
// ---------------------------------------------------------------------------

export type Channel =
  | "ach"
  | "wire"
  | "check"
  | "cash"
  | "card"
  | "zelle"
  | "atm"
  | "fee"
  | "interest"
  | "transfer"
  | "payroll";

/**
 * Canonical spending/income categories. Lifestyle analysis groups on these.
 */
export type Category =
  // outflows
  | "Mortgage"
  | "Property Tax"
  | "Utilities"
  | "Insurance"
  | "Private School"
  | "Clubs & Memberships"
  | "Travel"
  | "Dining"
  | "Retail & Apparel"
  | "Groceries"
  | "Auto"
  | "Medical"
  | "Home Improvement"
  | "Entertainment"
  | "Charity"
  | "Professional Fees"
  | "Cash Withdrawal"
  | "Business Expense"
  | "Card Payment"
  | "Transfer"
  | "Real Estate Purchase"
  | "Taxes Paid"
  | "Fees & Interest"
  // inflows
  | "Salary"
  | "Distribution"
  | "Business Revenue"
  | "Cash Deposit"
  | "Check Deposit"
  | "Rental Income"
  | "Interest & Dividends"
  | "Inheritance"
  | "Refund"
  | "Other Deposit";

/**
 * Nature tags drive the forensic engines. A transaction can carry several.
 *  - "income-known":   reported/declared income (salary, declared distributions)
 *  - "income-hidden":  the planted unreported income (cash deposits, side jobs, rent)
 *  - "nontaxable":     inheritance, refunds, loan proceeds — excluded from income
 *  - "transfer":       inter-account movement (must carry transferGroup)
 *  - "cash-deposit":   currency deposit
 *  - "structuring-flag": sub-$10k pattern deposit
 *  - "separate-property": traced separate funds (inheritance corpus & mutations)
 *  - "living-expense": counts toward personal expenditures in NW/expenditure methods
 *  - "capital":        asset purchase / investment (application of funds, not living expense)
 *  - "loan-labeled":   disguised transfer labeled as loan repayment
 */
export type NatureTag =
  | "income-known"
  | "income-hidden"
  | "nontaxable"
  | "transfer"
  | "cash-deposit"
  | "structuring-flag"
  | "separate-property"
  | "living-expense"
  | "capital"
  | "loan-labeled";

export interface Provenance {
  /** Document id in CaseFile.documents */
  docId: string;
  /** 1-based page within that document */
  page: number;
  /** 1-based line within the statement's transaction table */
  line: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: ISODate;
  /** Statement-style description, uppercase-ish, e.g. "DEPOSIT CASH BRANCH 004 HOUSTON TX" */
  description: string;
  /** Signed cents. + inflow to account, − outflow. */
  amount: Cents;
  category: Category;
  channel: Channel;
  /** Counterparty entity, when known/resolved */
  counterpartyId?: string;
  /** Both legs of an inter-account transfer share this id */
  transferGroup?: string;
  tags: NatureTag[];
  /**
   * For deposits into the commingled account (frost-savings) only:
   * the true character of the funds, used to seed separate-property tracing.
   */
  fundSource?: "community" | "separate";
  /** Running balance after this transaction (cents) — statement-accurate */
  balanceAfter: Cents;
  /** Where this row was extracted from */
  doc: Provenance;
  /** Simulated OCR/extraction confidence, 0.62–1.0 */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Documents (evidence)
// ---------------------------------------------------------------------------

export type DocumentKind =
  | "bank-statement"
  | "card-statement"
  | "brokerage-statement"
  | "tax-return"
  | "formation" // TX SOS certificate of formation
  | "closing-statement" // real estate settlement
  | "letter" // executor letter etc.
  | "deed";

export interface CaseDocument {
  id: string; // e.g. "frost-checking-2022-01"
  kind: DocumentKind;
  title: string; // "Frost Bank Statement — Personal Checking ····4417 — Jan 2022"
  accountId?: string;
  periodStart?: ISODate;
  periodEnd?: ISODate;
  /** Path under /public, e.g. "/documents/frost-checking-2022-01.pdf" */
  file: string;
  pages: number;
  /** Rendered with a scanned-paper treatment */
  scanned: boolean;
  /** Exhibit number assigned in the demo, e.g. "Ex. 14" */
  exhibit: string;
}

// ---------------------------------------------------------------------------
// Net-worth schedule inputs (year-end asset/liability values)
// ---------------------------------------------------------------------------

export type AssetKind =
  | "real-property"
  | "vehicle"
  | "business-interest"
  | "bank"
  | "brokerage"
  | "other";

export interface ScheduleItem {
  id: string;
  name: string; // "Residence — 5614 Longmont Dr, Houston (Tanglewood)"
  kind: AssetKind | "liability";
  /** Values at 2021-12-31 .. 2024-12-31, keyed by year (2021 is the opening point). Cents. */
  valuesByYear: Record<string, Cents>;
  /** Acquisition date if acquired inside the period */
  acquired?: ISODate;
  /** Supporting document */
  docId?: string;
  /** For bank/brokerage items: the ledger account backing the balance */
  accountId?: string;
  note?: string;
}

// ---------------------------------------------------------------------------
// Reported income (per filed returns)
// ---------------------------------------------------------------------------

export interface ReportedYear {
  year: number; // 2022..2024
  /** Total income per return (cents) */
  reportedIncome: Cents;
  agi: Cents;
  filingStatus: string; // "Married filing jointly"
  federalTax: Cents;
  docId: string; // the 1040 summary document
}

// ---------------------------------------------------------------------------
// The case file
// ---------------------------------------------------------------------------

export interface CaseFile {
  matter: {
    number: string; // "2025-0147"
    caption: string; // "In re the Marriage of Delaney"
    court: string; // "311th Judicial District Court, Harris County, Texas"
    engagedBy: string; // "Counsel for Petitioner, Sarah W. Delaney"
    preparedFor: string; // "Masin Advisory Group — Risk & Resolution"
    subject: string; // "Marcus T. Delaney"
    spouse: string; // "Sarah W. Delaney"
    periodStart: ISODate; // "2022-01-01"
    periodEnd: ISODate; // "2024-12-31"
    summary: string; // one-paragraph engagement summary
  };
  entities: Entity[];
  accounts: Account[];
  transactions: Transaction[]; // sorted by date, then account
  documents: CaseDocument[];
  schedule: ScheduleItem[]; // assets & liabilities for net worth method
  reported: ReportedYear[];
  /**
   * The commingled account subject to separate-property tracing,
   * and the claimed separate corpus.
   */
  tracing: {
    accountId: string; // "frost-savings"
    claimant: string; // "Sarah W. Delaney"
    separateSource: string; // "Estate of Margaret H. Whitmore"
    separateAmount: Cents; // 25_000_000
    separateDate: ISODate; // "2022-06-15"
  };
}

// ---------------------------------------------------------------------------
// Engine result types (what the UI renders; what tests assert on)
// ---------------------------------------------------------------------------

/** One year-column of the classic net worth court schedule */
export interface NetWorthYear {
  year: number; // 2021 (opening) .. 2024
  assets: { itemId: string; name: string; value: Cents }[];
  totalAssets: Cents;
  liabilities: { itemId: string; name: string; value: Cents }[];
  totalLiabilities: Cents;
  netWorth: Cents;
}

export interface NetWorthMethodYear {
  year: number; // 2022..2024
  netWorthEnd: Cents;
  netWorthStart: Cents;
  increase: Cents;
  personalExpenditures: Cents;
  totalApplication: Cents; // increase + expenditures
  nontaxableSources: Cents; // inheritance etc.
  reportedIncome: Cents;
  understatement: Cents; // totalApplication − nontaxable − reported
}

export interface NetWorthResult {
  schedule: NetWorthYear[]; // 2021..2024 columns
  method: NetWorthMethodYear[]; // 2022..2024
  totalUnderstatement: Cents;
}

export interface ExpendituresYear {
  year: number;
  applications: { label: string; amount: Cents }[]; // expenditures + asset acquisitions + debt reduction
  totalApplications: Cents;
  knownSources: { label: string; amount: Cents }[]; // reported income + nontaxable + asset drawdowns + debt incurred
  totalKnownSources: Cents;
  understatement: Cents;
}

export interface ExpendituresResult {
  years: ExpendituresYear[];
  totalUnderstatement: Cents;
}

export interface BankDepositsYear {
  year: number;
  totalDeposits: Cents; // all deposits, all accounts
  interAccountTransfers: Cents; // stripped
  nonIncomeDeposits: Cents; // refunds, redeposits, nontaxable corpus
  netDeposits: Cents;
  cashExpenditures: Cents; // spending not flowing through deposits
  grossReceipts: Cents; // netDeposits + cashExpenditures
  nontaxableSources: Cents;
  reportedIncome: Cents;
  understatement: Cents;
}

export interface BankDepositsResult {
  years: BankDepositsYear[];
  totalUnderstatement: Cents;
}

export interface ConvergenceYear {
  year: number;
  netWorth: Cents;
  expenditures: Cents;
  bankDeposits: Cents;
  /** max pairwise divergence as a fraction of the mean, e.g. 0.034 */
  spread: number;
}

export interface LifestyleYear {
  year: number;
  byCategory: { category: Category; amount: Cents }[]; // living-expense outflows, deduped across card payments
  totalLifestyle: Cents;
  reportedIncome: Cents;
  gap: Cents;
}

// --- Asset tracing / flows ---

export interface FlowEdge {
  fromId: string; // account id or entity id
  toId: string;
  total: Cents;
  count: number;
  transactionIds: string[];
  /** e.g. "labeled 'LOAN REPAYMENT' — no note or loan documented" */
  flag?: string;
}

export interface FlowGraph {
  nodes: { id: string; label: string; type: "account" | "entity"; discovered?: boolean }[];
  edges: FlowEdge[];
}

// --- Separate property tracing ---

export interface TracingLedgerRow {
  transactionId: string;
  date: ISODate;
  description: string;
  amount: Cents;
  /** Running balances under community-out-first (Sibley) */
  communityBalance: Cents;
  separateBalance: Cents;
  totalBalance: Cents;
  /** How this row was characterized: e.g. "community deposit", "withdrawal — community out first" */
  characterization: string;
}

export interface SeparatePropertyResult {
  accountId: string;
  rows: TracingLedgerRow[];
  /** Minimum account balance between separate deposit and period end */
  minimumBalance: Cents;
  minimumBalanceDate: ISODate;
  /** Separate corpus claimed */
  separateContribution: Cents;
  /** Separate character sustained under minimum sum balance = min(corpus, minimumBalance) */
  minimumSumBalanceResult: Cents;
  /** Separate balance at period end under community-out-first */
  communityOutFirstResult: Cents;
  endingBalance: Cents;
  /** Clearinghouse scan: matched in/out pairs suggesting conduit use */
  clearinghouseMatches: { inId: string; outId: string; amount: Cents; daysApart: number }[];
}
