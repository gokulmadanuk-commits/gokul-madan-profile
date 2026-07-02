/**
 * LUCA — deterministic synthetic case generator.
 * Matter 2025-0147, In re the Marriage of Delaney.
 * Run: npm run gen:case   (writes src/data/case.json)
 *
 * All money in integer CENTS. Seeded PRNG only — output is identical every run.
 *
 * The books balance: every dollar of income (reported + hidden + nontaxable)
 * flows through the accounts and out to lifestyle, taxes, capital, or bank
 * growth, so the three indirect methods converge by construction — the same
 * property real records have.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RNG } from "./rng";
import type {
  Account, CaseDocument, CaseFile, Category, Cents, Channel, Entity,
  NatureTag, ReportedYear, ScheduleItem, Transaction,
} from "../src/lib/types";

const R = new RNG(20250147);
const __dirname2 = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname2, "../src/data/case.json");

// ---------------------------------------------------------------- helpers
const pad2 = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad2(m)}-${pad2(d)}`;
const lastDay = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const yearOf = (date: string) => Number(date.slice(0, 4));
const monthKey = (date: string) => date.slice(0, 7);
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const D = (dollars: number) => Math.round(dollars * 100); // dollars -> cents

const YEARS = [2022, 2023, 2024] as const;
const MONTHS: { y: number; m: number }[] = [];
for (const y of YEARS) for (let m = 1; m <= 12; m++) MONTHS.push({ y, m });

// ---------------------------------------------------------------- targets
// Reported per return = salary + declared dividends, cents-exact.
const REPORTED: Record<number, Cents> = { 2022: D(138500), 2023: D(141200), 2024: D(143800) };
const DIVIDENDS: Record<number, Cents[]> = {
  2022: [D(400), D(425), D(425), D(450)], // 1,700
  2023: [D(475), D(500), D(500), D(525)], // 2,000
  2024: [D(525), D(550), D(550), D(575)], // 2,200
};
const SALARY_YEAR: Record<number, Cents> = {
  2022: REPORTED[2022] - D(1700), // 136,800 -> 5,700 semi-monthly
  2023: REPORTED[2023] - D(2000), // 139,200 -> 5,800
  2024: REPORTED[2024] - D(2200), // 141,600 -> 5,900
};
// Hidden (unreported) income planted per year — the understatement the three
// methods must recover. 2023 spikes: the Galveston purchase year.
const HIDDEN_TARGET: Record<number, Cents> = { 2022: D(315000), 2023: D(420000), 2024: D(380000) };
const LIFESTYLE_TARGET: Record<number, Cents> = { 2022: D(385000), 2023: D(412000), 2024: D(438000) };
const SAVINGS_MIN = 18_734_000; // $187,340.00 exactly on 2023-11-17
const GALVESTON_WIRE = D(189200); // $185,000 down + $4,200 closing costs/prorations
const SELLER_NOTE = D(200000); // carry-back note, undisclosed; price $385,000
const TAXES_PAID: Record<number, Cents> = { 2022: D(23400), 2023: D(24100), 2024: D(24700) };
const FID_CONTRIB: Record<number, Cents> = { 2022: D(2500), 2023: D(1500), 2024: D(1000) }; // monthly
const SAVINGS_DEP: Record<number, Cents> = { 2022: D(1800), 2023: D(1200), 2024: D(2800) }; // monthly

// ---------------------------------------------------------------- entities
const entities: Entity[] = [
  { id: "delaney-mechanical", name: "Delaney Mechanical Services LLC", kind: "employer", note: "Commercial HVAC contractor, Houston. Respondent is sole member." },
  { id: "bluebonnet-holdings", name: "Bluebonnet Holdings LLC", kind: "llc", discovered: true, note: "Formed 2023-03-14, TX SOS #805221947. Not disclosed in Respondent's inventory." },
  { id: "whitmore-estate", name: "Estate of Margaret H. Whitmore", kind: "estate", note: "Petitioner's mother; estate distribution 2022-06-15." },
  { id: "gulf-coast-title", name: "Gulf Coast Title Co.", kind: "title-company", note: "Closing agent — 4210 Seawall Blvd Unit 502, Galveston." },
  { id: "shoreline-ventures", name: "Shoreline Ventures LLC", kind: "unknown", note: "Seller, 4210 Seawall Blvd #502; $200,000 carry-back note — undisclosed." },
  { id: "kinkaid", name: "The Kinkaid School", kind: "school" },
  { id: "bayou-oaks", name: "Bayou Oaks Country Club", kind: "club" },
  { id: "cadence-bank", name: "Cadence Bank", kind: "lender", note: "Residence note, interest-only jumbo — Tanglewood." },
  { id: "gulf-breeze-pm", name: "Gulf Breeze Property Management", kind: "vendor", note: "Remits rent — 4210 Seawall Blvd Unit 502." },
  { id: "irs", name: "Internal Revenue Service", kind: "government" },
  { id: "range-rover-finance", name: "Land Rover Financial Group", kind: "lender" },
  { id: "porsche-financial", name: "Porsche Financial Services", kind: "lender" },
  { id: "central-market", name: "Central Market", kind: "vendor" },
  { id: "tonys", name: "Tony's Restaurant", kind: "vendor" },
  { id: "pappas-bros", name: "Pappas Bros. Steakhouse", kind: "vendor" },
  { id: "uchi", name: "Uchi Houston", kind: "vendor" },
  { id: "steak-48", name: "Steak 48", kind: "vendor" },
  { id: "brennans", name: "Brennan's of Houston", kind: "vendor" },
  { id: "neiman-marcus", name: "Neiman Marcus", kind: "vendor" },
  { id: "nordstrom", name: "Nordstrom Galleria", kind: "vendor" },
  { id: "saks", name: "Saks Fifth Avenue", kind: "vendor" },
  { id: "river-oaks-landscaping", name: "River Oaks Landscaping", kind: "vendor" },
  { id: "reliant-energy", name: "Reliant Energy", kind: "vendor" },
  { id: "centerpoint", name: "CenterPoint Energy", kind: "vendor" },
  { id: "coh-water", name: "City of Houston Water Dept.", kind: "vendor" },
  { id: "att", name: "AT&T", kind: "vendor" },
  { id: "state-farm", name: "State Farm Insurance", kind: "vendor" },
  { id: "memorial-hermann", name: "Memorial Hermann Health", kind: "vendor" },
  { id: "houston-methodist", name: "Houston Methodist", kind: "vendor" },
  { id: "little-nell", name: "The Little Nell (Aspen)", kind: "vendor" },
  { id: "aspen-skiing", name: "Aspen Skiing Company", kind: "vendor" },
  { id: "united-airlines", name: "United Airlines", kind: "vendor" },
  { id: "esperanza", name: "Esperanza Resort (Cabo San Lucas)", kind: "vendor" },
  { id: "total-wine", name: "Total Wine & More", kind: "vendor" },
  { id: "adp", name: "ADP Payroll Services", kind: "vendor" },
  { id: "johnstone-supply", name: "Johnstone Supply Houston", kind: "vendor" },
  { id: "ferguson", name: "Ferguson Enterprises", kind: "vendor" },
  { id: "tmc-facilities", name: "Texas Medical Center Facilities", kind: "vendor" },
  { id: "houston-isd", name: "Houston ISD Facilities Maintenance", kind: "vendor" },
  { id: "greenway-plaza", name: "Greenway Plaza Management Co.", kind: "vendor" },
  { id: "memorial-villages-mep", name: "Memorial Villages MEP LLC", kind: "unknown", note: "Side-job payer — checks deposited outside the business account." },
  { id: "bayou-city-builders", name: "Bayou City Builders Inc.", kind: "unknown", note: "Side-job payer." },
  { id: "westchase-dev", name: "Westchase Commercial Development", kind: "unknown", note: "Side-job payer." },
];

// ---------------------------------------------------------------- accounts
// frost-checking / chase-biz opening balances get a solvency lift after assembly.
const accounts: Account[] = [
  { id: "frost-checking", institution: "Frost Bank", name: "Personal Checking", kind: "checking", last4: "4417", owner: "joint", disclosed: true, openingBalance: 2_850_000 },
  { id: "frost-savings", institution: "Frost Bank", name: "Premier Savings", kind: "savings", last4: "8823", owner: "joint", disclosed: true, openingBalance: 4_120_000 },
  { id: "chase-biz", institution: "Chase", name: "Business Complete Checking", kind: "checking", last4: "3301", owner: "entity", entityId: "delaney-mechanical", disclosed: true, openingBalance: 8_400_000 },
  { id: "amex", institution: "American Express", name: "Platinum Card", kind: "card", last4: "71002", owner: "subject", disclosed: true, openingBalance: -980_000 },
  { id: "sapphire", institution: "Chase", name: "Sapphire Reserve", kind: "card", last4: "5566", owner: "joint", disclosed: true, openingBalance: -560_000 },
  { id: "fidelity", institution: "Fidelity", name: "Brokerage Z40-118226", kind: "brokerage", last4: "8226", owner: "joint", disclosed: true, openingBalance: 6_840_000 },
  { id: "prosperity-bluebonnet", institution: "Prosperity Bank", name: "Business Checking", kind: "checking", last4: "9174", owner: "entity", entityId: "bluebonnet-holdings", disclosed: false, openingBalance: 0, opened: "2023-03-20" },
];

// ---------------------------------------------------------------- draft txns
interface Draft {
  accountId: string;
  date: string;
  description: string;
  amount: Cents;
  category: Category;
  channel: Channel;
  counterpartyId?: string;
  transferGroup?: string;
  tags: NatureTag[];
  fundSource?: "community" | "separate";
}
const drafts: Draft[] = [];
let tgCounter = 0;
const push = (d: Draft) => { drafts.push(d); return d; };

/** two-legged transfer; returns the group id */
function transfer(fromAcct: string, toAcct: string, date: string, amount: Cents,
  fromDesc: string, toDesc: string, opts?: { category?: Category; channel?: Channel; fundSource?: "community" | "separate" }) {
  const tg = `tg${String(++tgCounter).padStart(4, "0")}`;
  const category = opts?.category ?? "Transfer";
  const channel = opts?.channel ?? "transfer";
  push({ accountId: fromAcct, date, description: fromDesc, amount: -amount, category, channel, transferGroup: tg, tags: ["transfer"] });
  push({ accountId: toAcct, date, description: toDesc, amount, category, channel, transferGroup: tg, tags: ["transfer"], fundSource: opts?.fundSource });
  return tg;
}

// ============================================================ 1. SALARY
for (const { y, m } of MONTHS) {
  const semi = SALARY_YEAR[y] / 24;
  for (const d of [15, lastDay(y, m)]) {
    push({ accountId: "frost-checking", date: iso(y, m, d), description: "ACH DEPOSIT DELANEY MECHANICAL SVCS PAYROLL", amount: semi, category: "Salary", channel: "payroll", counterpartyId: "delaney-mechanical", tags: ["income-known"] });
    // matching business-side payroll outflow (income to the person, not a transfer)
    push({ accountId: "chase-biz", date: iso(y, m, d), description: "ADP PAYROLL — M DELANEY OFFICER COMP", amount: -semi, category: "Business Expense", channel: "payroll", counterpartyId: "adp", tags: [] });
  }
}

// ============================================================ 2. FIXED LIFESTYLE (checking)
const utilities: { id: string; desc: string; lo: number; hi: number; seasonal?: "summer" | "winter" }[] = [
  { id: "reliant-energy", desc: "ACH RELIANT ENERGY", lo: 320, hi: 460, seasonal: "summer" },
  { id: "coh-water", desc: "ACH CITY OF HOUSTON WATER", lo: 120, hi: 200 },
  { id: "centerpoint", desc: "ACH CENTERPOINT ENERGY", lo: 60, hi: 120, seasonal: "winter" },
  { id: "att", desc: "ACH AT&T U-VERSE", lo: 118, hi: 128 },
];
let checkNo = 1101;
for (const { y, m } of MONTHS) {
  push({ accountId: "frost-checking", date: iso(y, m, 1), description: "ACH CADENCE BANK MORTGAGE PMT", amount: -D(6412), category: "Mortgage", channel: "ach", counterpartyId: "cadence-bank", tags: ["living-expense"] });
  push({ accountId: "frost-checking", date: iso(y, m, 3), description: "ACH KINKAID SCHOOL TUITION PLAN", amount: -D(2900), category: "Private School", channel: "ach", counterpartyId: "kinkaid", tags: ["living-expense"] });
  push({ accountId: "frost-checking", date: iso(y, m, 6), description: "ACH BAYOU OAKS CC MONTHLY DUES", amount: -D(950), category: "Clubs & Memberships", channel: "ach", counterpartyId: "bayou-oaks", tags: ["living-expense"] });
  if (m === 4) push({ accountId: "frost-checking", date: iso(y, m, 18), description: "CHECK " + checkNo++ + " BAYOU OAKS CC CAPITAL ASSESSMENT", amount: -D(2600), category: "Clubs & Memberships", channel: "check", counterpartyId: "bayou-oaks", tags: ["living-expense"] });
  push({ accountId: "frost-checking", date: iso(y, m, 12), description: "ACH LAND ROVER FIN GROUP LEASE", amount: -D(1680), category: "Auto", channel: "ach", counterpartyId: "range-rover-finance", tags: ["living-expense"] });
  push({ accountId: "frost-checking", date: iso(y, m, 15), description: "ACH PORSCHE FINANCIAL SVCS LEASE", amount: -D(1410), category: "Auto", channel: "ach", counterpartyId: "porsche-financial", tags: ["living-expense"] });
  push({ accountId: "frost-checking", date: iso(y, m, 10), description: "ACH STATE FARM INSURANCE", amount: -D(890), category: "Insurance", channel: "ach", counterpartyId: "state-farm", tags: ["living-expense"] });
  for (const u of utilities) {
    let amt = R.randInt(u.lo, u.hi);
    if (u.seasonal === "summer" && m >= 6 && m <= 9) amt = Math.round(amt * 1.8);
    if (u.seasonal === "winter" && (m <= 2 || m === 12)) amt = Math.round(amt * 1.7);
    push({ accountId: "frost-checking", date: iso(y, m, R.randInt(8, 20)), description: u.desc, amount: -D(amt), category: "Utilities", channel: "ach", counterpartyId: u.id, tags: ["living-expense"] });
  }
  push({ accountId: "frost-checking", date: iso(y, m, R.randInt(16, 22)), description: "ATM WITHDRAWAL FROST BR 004 HOUSTON TX", amount: -D(R.randInt(4, 8) * 100), category: "Cash Withdrawal", channel: "atm", tags: ["living-expense"] });
  if (m % 2 === 0) push({ accountId: "frost-checking", date: iso(y, m, R.randInt(9, 24)), description: "CHECK " + checkNo++ + " RIVER OAKS LANDSCAPING", amount: -D(R.randInt(380, 520)), category: "Home Improvement", channel: "check", counterpartyId: "river-oaks-landscaping", tags: ["living-expense"] });
}
// annual federal tax payment (per prior-year return)
for (const y of YEARS) {
  push({ accountId: "frost-checking", date: iso(y, 4, 14), description: "IRS USATAXPYMT PPD", amount: -TAXES_PAID[y], category: "Taxes Paid", channel: "ach", counterpartyId: "irs", tags: [] });
}
// small nontaxable refunds
push({ accountId: "frost-checking", date: "2022-08-09", description: "ACH REFUND RELIANT ENERGY", amount: D(240), category: "Refund", channel: "ach", counterpartyId: "reliant-energy", tags: ["nontaxable"] });
push({ accountId: "frost-checking", date: "2023-05-16", description: "ACH REFUND HARRIS COUNTY TAX OFFICE", amount: D(380), category: "Refund", channel: "ach", tags: ["nontaxable"] });
push({ accountId: "frost-checking", date: "2024-03-21", description: "ACH REFUND STATE FARM PREMIUM ADJ", amount: D(175), category: "Refund", channel: "ach", counterpartyId: "state-farm", tags: ["nontaxable"] });

// ============================================================ 3. VARIABLE LIFESTYLE (cards)
// Generated with base amounts, then scaled per-year so that
// (fixed living on checking) + (home improvement) + (card purchases) == LIFESTYLE_TARGET exactly.
interface CardSpec { vendor: string; desc: string; cat: Category; lo: number; hi: number }
const AMEX: CardSpec[] = [
  { vendor: "tonys", desc: "TONYS HOUSTON TX", cat: "Dining", lo: 240, hi: 520 },
  { vendor: "pappas-bros", desc: "PAPPAS BROS STEAKHOUSE HOUSTON", cat: "Dining", lo: 310, hi: 640 },
  { vendor: "uchi", desc: "UCHI HOUSTON TX", cat: "Dining", lo: 220, hi: 430 },
  { vendor: "steak-48", desc: "STEAK 48 HOUSTON TX", cat: "Dining", lo: 280, hi: 540 },
  { vendor: "brennans", desc: "BRENNANS OF HOUSTON", cat: "Dining", lo: 190, hi: 380 },
  { vendor: "neiman-marcus", desc: "NEIMAN MARCUS HOUSTON GALLERIA", cat: "Retail & Apparel", lo: 420, hi: 1600 },
  { vendor: "saks", desc: "SAKS FIFTH AVENUE HOUSTON", cat: "Retail & Apparel", lo: 350, hi: 1200 },
  { vendor: "central-market", desc: "CENTRAL MARKET HOUSTON TX", cat: "Groceries", lo: 180, hi: 340 },
  { vendor: "total-wine", desc: "TOTAL WINE AND MORE HOUSTON", cat: "Entertainment", lo: 140, hi: 380 },
  { vendor: "memorial-hermann", desc: "MEMORIAL HERMANN PHYS GROUP", cat: "Medical", lo: 90, hi: 420 },
];
const SAPPHIRE: CardSpec[] = [
  { vendor: "central-market", desc: "CENTRAL MARKET HOUSTON TX", cat: "Groceries", lo: 160, hi: 310 },
  { vendor: "nordstrom", desc: "NORDSTROM GALLERIA HOUSTON", cat: "Retail & Apparel", lo: 210, hi: 720 },
  { vendor: "tonys", desc: "SHELL OIL 5744 SAN FELIPE", cat: "Auto", lo: 62, hi: 98 },
  { vendor: "houston-methodist", desc: "HOUSTON METHODIST OUTPATIENT", cat: "Medical", lo: 60, hi: 240 },
  { vendor: "total-wine", desc: "ALAMO DRAFTHOUSE LP HOUSTON", cat: "Entertainment", lo: 55, hi: 130 },
];
// travel bursts: Aspen in Jan/Feb, Cabo in July, flights shoulder months
const TRAVEL: { m: number; card: "amex"; desc: string; vendor: string; lo: number; hi: number }[] = [
  { m: 1, card: "amex", desc: "THE LITTLE NELL ASPEN CO", vendor: "little-nell", lo: 3800, hi: 6200 },
  { m: 1, card: "amex", desc: "ASPEN SKIING CO LIFT TICKETS", vendor: "aspen-skiing", lo: 900, hi: 1600 },
  { m: 2, card: "amex", desc: "UNITED AIRLINES 0162447789", vendor: "united-airlines", lo: 1400, hi: 2400 },
  { m: 7, card: "amex", desc: "ESPERANZA RESORT CABO SAN LUCAS", vendor: "esperanza", lo: 4200, hi: 7100 },
  { m: 7, card: "amex", desc: "UNITED AIRLINES 0162551204", vendor: "united-airlines", lo: 1600, hi: 2800 },
  { m: 11, card: "amex", desc: "UNITED AIRLINES 0162688411", vendor: "united-airlines", lo: 800, hi: 1500 },
];
const cardDrafts: Draft[] = [];
for (const { y, m } of MONTHS) {
  const nAmex = R.randInt(9, 12);
  for (let i = 0; i < nAmex; i++) {
    const s = R.pick(AMEX);
    cardDrafts.push({ accountId: "amex", date: iso(y, m, R.randInt(1, lastDay(y, m))), description: s.desc, amount: -D(R.randInt(s.lo, s.hi)), category: s.cat, channel: "card", counterpartyId: s.vendor, tags: ["living-expense"] });
  }
  const nSap = R.randInt(6, 9);
  for (let i = 0; i < nSap; i++) {
    const s = R.pick(SAPPHIRE);
    cardDrafts.push({ accountId: "sapphire", date: iso(y, m, R.randInt(1, lastDay(y, m))), description: s.desc, amount: -D(R.randInt(s.lo, s.hi)), category: s.cat, channel: "card", counterpartyId: s.vendor, tags: ["living-expense"] });
  }
  for (const t of TRAVEL) if (t.m === m) {
    cardDrafts.push({ accountId: "amex", date: iso(y, m, R.randInt(4, 22)), description: t.desc, amount: -D(R.randInt(t.lo, t.hi)), category: "Travel", channel: "card", counterpartyId: t.vendor, tags: ["living-expense"] });
  }
}

// ============================================================ 4. SAVINGS (the commingled account)
for (const { y, m } of MONTHS) {
  transfer("frost-checking", "frost-savings", iso(y, m, 2), SAVINGS_DEP[y],
    "ONLINE XFER TO SAVINGS ...8823", "ONLINE XFER FROM CHECKING ...4417",
    { fundSource: "community" });
}
// the separate-property corpus
push({ accountId: "frost-savings", date: "2022-06-15", description: "DEPOSIT CHECK ESTATE OF MARGARET H WHITMORE", amount: D(250000), category: "Inheritance", channel: "check", counterpartyId: "whitmore-estate", tags: ["nontaxable", "separate-property"], fundSource: "separate" });
// withdrawals (home improvement paid straight from savings + transfers back)
push({ accountId: "frost-savings", date: "2022-09-10", description: "CHECK 1201 RIVER OAKS REMODELING CO", amount: -D(45000), category: "Home Improvement", channel: "check", counterpartyId: "river-oaks-landscaping", tags: ["living-expense"] });
transfer("frost-savings", "frost-checking", "2023-03-05", D(25000), "ONLINE XFER TO CHECKING ...4417", "ONLINE XFER FROM SAVINGS ...8823");
push({ accountId: "frost-savings", date: "2023-07-20", description: "CHECK 1245 MEMORIAL BUILDERS GROUP", amount: -D(38000), category: "Home Improvement", channel: "check", tags: ["living-expense"] });
// 2023-11-17 withdrawal solved below to land the balance at exactly $187,340.00

// ============================================================ 5. HIDDEN INCOME
// (a) cash deposits — 2/mo, 3/mo every third month (the structuring clusters)
const cashDrafts: Draft[] = [];
for (const { y, m } of MONTHS) {
  const three = m % 3 === 0; // Mar, Jun, Sep, Dec
  const days = three ? [4, 9, 12] : [7, 21];
  for (const d of days) {
    cashDrafts.push({ accountId: "frost-checking", date: iso(y, m, d), description: `DEPOSIT CASH BRANCH 00${R.randInt(2, 7)} HOUSTON TX`, amount: -1 /* solved */, category: "Cash Deposit", channel: "cash", tags: three ? ["cash-deposit", "income-hidden", "structuring-flag"] : ["cash-deposit", "income-hidden"] });
  }
}
// (b) side-job checks
const SIDE_PAYERS = [
  { id: "memorial-villages-mep", desc: "MEMORIAL VILLAGES MEP LLC" },
  { id: "bayou-city-builders", desc: "BAYOU CITY BUILDERS INC" },
  { id: "westchase-dev", desc: "WESTCHASE COMMERCIAL DEV" },
];
interface SideSpec { y: number; m: number; d: number; acct: string; amount: Cents }
const sideSpecs: SideSpec[] = [];
// 2022: ten checks into personal checking, $110,000 total
{
  const months22 = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
  const base = months22.map(() => R.randInt(80, 150) * 100); // relative weights
  const tot = base.reduce((a, b) => a + b, 0);
  let acc = 0;
  months22.forEach((m, i) => {
    let amt = Math.round((D(110000) * base[i]) / tot / 100) * 100;
    if (i === months22.length - 1) amt = D(110000) - acc;
    acc += amt;
    sideSpecs.push({ y: 2022, m, d: R.randInt(6, 24), acct: "frost-checking", amount: amt });
  });
}
// 2023: $18,000 to checking Jan–Mar; $22,000 to Bluebonnet Apr–Dec
sideSpecs.push({ y: 2023, m: 1, d: 19, acct: "frost-checking", amount: D(6500) });
sideSpecs.push({ y: 2023, m: 2, d: 9, acct: "frost-checking", amount: D(5500) });
sideSpecs.push({ y: 2023, m: 3, d: 14, acct: "frost-checking", amount: D(6000) });
sideSpecs.push({ y: 2023, m: 5, d: 11, acct: "prosperity-bluebonnet", amount: D(4500) });
sideSpecs.push({ y: 2023, m: 6, d: 22, acct: "prosperity-bluebonnet", amount: D(5000) });
sideSpecs.push({ y: 2023, m: 7, d: 13, acct: "prosperity-bluebonnet", amount: D(3500) });
sideSpecs.push({ y: 2023, m: 9, d: 8, acct: "prosperity-bluebonnet", amount: D(4500) });
sideSpecs.push({ y: 2023, m: 11, d: 16, acct: "prosperity-bluebonnet", amount: D(4500) });
// 2024: $30,000 to Bluebonnet
for (const [i, m] of [2, 4, 6, 9, 11].entries()) {
  sideSpecs.push({ y: 2024, m, d: R.randInt(6, 24), acct: "prosperity-bluebonnet", amount: i === 4 ? D(30000) - D(24400) : D(6100) });
}
let sideCheckNo = 2201;
for (const s of sideSpecs) {
  const payer = R.pick(SIDE_PAYERS);
  push({ accountId: s.acct, date: iso(s.y, s.m, s.d), description: `DEPOSIT CHECK ${sideCheckNo++} ${payer.desc}`, amount: s.amount, category: "Check Deposit", channel: "check", counterpartyId: payer.id, tags: ["income-hidden"] });
}
const sideTotal: Record<number, Cents> = { 2022: D(110000), 2023: D(40000), 2024: D(30000) };

// (c) "loan repayments" — chase-biz -> Bluebonnet, both legs loan-labeled, NO transferGroup
function loanRepayment(date: string, amount: Cents) {
  push({ accountId: "chase-biz", date, description: "ACH OUT LOAN REPAYMENT BLUEBONNET HOLDINGS", amount: -amount, category: "Business Expense", channel: "ach", counterpartyId: "bluebonnet-holdings", tags: ["loan-labeled"] });
  push({ accountId: "prosperity-bluebonnet", date, description: "ACH DELANEY MECHANICAL LOAN REPAYMENT", amount, category: "Other Deposit", channel: "ach", counterpartyId: "delaney-mechanical", tags: ["income-hidden", "loan-labeled"] });
}
for (let m = 4; m <= 8; m++) loanRepayment(iso(2023, m, 8), D(20000));
for (let m = 9; m <= 12; m++) loanRepayment(iso(2023, m, 8), D(4000));
// 2024: twelve payments totaling exactly $91,400
{
  const base = Array.from({ length: 12 }, () => R.randInt(6800, 8400) * 100);
  const tot = base.reduce((a, b) => a + b, 0);
  let acc = 0;
  base.forEach((b, i) => {
    let amt = Math.round((D(91400) * b) / tot / 100) * 100;
    if (i === 11) amt = D(91400) - acc;
    acc += amt;
    loanRepayment(iso(2024, i + 1, 8), amt);
  });
}
const loanBase2023 = D(20000) * 5 + D(4000) * 4; // 116,000 before the Aug top-up

// (d) rent into Bluebonnet from 2023-10
for (const { y, m } of MONTHS) {
  if (y < 2023 || (y === 2023 && m < 10)) continue;
  push({ accountId: "prosperity-bluebonnet", date: iso(y, m, 3), description: "ACH GULF BREEZE PROP MGMT NET RENT 4210 SEAWALL 502", amount: D(2800), category: "Rental Income", channel: "ach", counterpartyId: "gulf-breeze-pm", tags: ["income-hidden"] });
}
const rentTotal: Record<number, Cents> = { 2022: 0, 2023: D(8400), 2024: D(33600) };

// ============================================================ 6. GALVESTON PURCHASE
// $385,000 price; $200,000 seller carry-back (Shoreline Ventures LLC, undisclosed);
// $189,200 wired to close (down payment + costs + prorations).
transfer("frost-checking", "prosperity-bluebonnet", "2023-08-10", D(10000),
  "ONLINE XFER TO PROSPERITY ...9174", "XFER IN FROM FROST ...4417 M DELANEY");
push({ accountId: "prosperity-bluebonnet", date: "2023-08-18", description: "WIRE OUT GULF COAST TITLE CO CLOSING 4210 SEAWALL BLVD 502", amount: -GALVESTON_WIRE, category: "Real Estate Purchase", channel: "wire", counterpartyId: "gulf-coast-title", tags: ["capital"] });

// ============================================================ 7. BLUEBONNET -> CHECKING (2024)
for (let m = 1; m <= 12; m++) {
  transfer("prosperity-bluebonnet", "frost-checking", iso(2024, m, 20), D(12500),
    "ACH OUT BLUEBONNET HOLDINGS MGMT DRAW", "ACH IN BLUEBONNET HOLDINGS LLC");
}

// ============================================================ 8. FIDELITY
for (const { y, m } of MONTHS) {
  transfer("frost-checking", "fidelity", iso(y, m, 16), FID_CONTRIB[y],
    "ACH FIDELITY INVESTMENTS CONTRIBUTION", "EFT RECEIVED FROST BANK ...4417");
}
for (const y of YEARS) {
  DIVIDENDS[y].forEach((amt, q) => {
    push({ accountId: "fidelity", date: iso(y, (q + 1) * 3, 20), description: "DIVIDEND REINVEST FDRXX & EQUITY POSITIONS", amount: amt, category: "Interest & Dividends", channel: "interest", tags: ["income-known"] });
  });
}

// ============================================================ 9. CHASE-BIZ OPERATIONS
const BIZ_CLIENTS = [
  { id: "tmc-facilities", desc: "ACH TEXAS MEDICAL CENTER FACILITIES" },
  { id: "houston-isd", desc: "ACH HOUSTON ISD FACILITIES MAINT" },
  { id: "greenway-plaza", desc: "ACH GREENWAY PLAZA MGMT CO" },
];
const bizRevenueDrafts: { key: string; drafts: Draft[] }[] = [];
for (const { y, m } of MONTHS) {
  // operating outflows
  for (const d of [15, lastDay(y, m)]) {
    push({ accountId: "chase-biz", date: iso(y, m, d), description: "ADP PAYROLL — FIELD STAFF", amount: -D(R.randInt(6600, 7600)), category: "Business Expense", channel: "payroll", counterpartyId: "adp", tags: [] });
  }
  push({ accountId: "chase-biz", date: iso(y, m, 5), description: "ACH GREENWAY PLAZA SUITE 480 RENT", amount: -D(4800), category: "Business Expense", channel: "ach", counterpartyId: "greenway-plaza", tags: [] });
  push({ accountId: "chase-biz", date: iso(y, m, R.randInt(7, 12)), description: "CHECK " + checkNo++ + " JOHNSTONE SUPPLY HOUSTON", amount: -D(R.randInt(9500, 16800)), category: "Business Expense", channel: "check", counterpartyId: "johnstone-supply", tags: [] });
  push({ accountId: "chase-biz", date: iso(y, m, R.randInt(14, 22)), description: "CHECK " + checkNo++ + " FERGUSON ENTERPRISES", amount: -D(R.randInt(7800, 14200)), category: "Business Expense", channel: "check", counterpartyId: "ferguson", tags: [] });
  push({ accountId: "chase-biz", date: iso(y, m, 25), description: "ACH TX COMPTROLLER SALES TAX", amount: -D(R.randInt(2800, 4600)), category: "Taxes Paid", channel: "ach", tags: [] });
  push({ accountId: "chase-biz", date: iso(y, m, 9), description: "ACH HARTFORD COMMERCIAL INS", amount: -D(2140), category: "Insurance", channel: "ach", tags: [] });
}
// revenue solved per month after all outflows are known (keeps the balance plausible)

// ============================================================ SOLVERS
// -- lifestyle tuner: scale card purchases so living-expense total hits target
function draftLivingTotal(year: number, extra: Draft[]): Cents {
  let sum = 0;
  for (const t of [...drafts, ...extra]) {
    if (yearOf(t.date) !== year) continue;
    if (t.transferGroup) continue;
    if (t.amount >= 0) continue;
    if (!t.tags.includes("living-expense")) continue;
    if (t.accountId === "chase-biz" || t.accountId === "prosperity-bluebonnet") continue;
    sum += -t.amount;
  }
  return sum;
}
for (const y of YEARS) {
  const fixed = draftLivingTotal(y, []); // checking + savings HI, before cards
  const cardYear = cardDrafts.filter((c) => yearOf(c.date) === y);
  const cardBase = cardYear.reduce((a, c) => a + -c.amount, 0);
  const target = LIFESTYLE_TARGET[y] - fixed;
  if (target <= 0) throw new Error(`lifestyle target impossible for ${y}`);
  const scale = target / cardBase;
  let acc = 0;
  cardYear.forEach((c, i) => {
    let amt = Math.round(-c.amount * scale);
    if (i === cardYear.length - 1) amt = target - acc;
    acc += amt;
    c.amount = -amt;
  });
}
drafts.push(...cardDrafts);

// -- card payments: on the 5th, pay prior month's statement in full
const CARD_META: Record<string, { from: string; desc: string }> = {
  amex: { from: "frost-checking", desc: "ACH AMEX EPAYMENT" },
  sapphire: { from: "frost-checking", desc: "ACH CHASE CARD EPAYMENT" },
};
for (const cardId of ["amex", "sapphire"]) {
  const opening = -(accounts.find((a) => a.id === cardId)!.openingBalance);
  const purchasesByMonth = new Map<string, Cents>();
  for (const t of drafts) {
    if (t.accountId !== cardId || t.amount >= 0) continue;
    const k = monthKey(t.date);
    purchasesByMonth.set(k, (purchasesByMonth.get(k) ?? 0) + -t.amount);
  }
  for (const { y, m } of MONTHS) {
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${pad2(m - 1)}`;
    const due = y === 2022 && m === 1 ? opening : purchasesByMonth.get(prev) ?? 0;
    if (due <= 0) continue;
    transfer(CARD_META[cardId].from, cardId, iso(y, m, 5), due,
      CARD_META[cardId].desc, "PAYMENT RECEIVED — THANK YOU",
      { category: "Card Payment", channel: "ach" });
  }
}

// -- Bluebonnet top-up: one conspicuous "loan repayment" 4 days before closing,
//    sized so the account can fund the wire with a small cushion.
{
  let bal = 0;
  for (const t of drafts) {
    if (t.accountId !== "prosperity-bluebonnet") continue;
    if (t.date >= "2023-08-18") continue;
    bal += t.amount;
  }
  const topUp = GALVESTON_WIRE + D(1500) - bal;
  if (topUp <= 0) throw new Error("bluebonnet already funded — adjust plan");
  loanRepayment("2023-08-14", Math.round(topUp / 100) * 100);
}
const loanTotal: Record<number, Cents> = {
  2022: 0,
  2023: loanBase2023 + drafts
    .filter((t) => t.accountId === "prosperity-bluebonnet" && t.date === "2023-08-14" && t.tags.includes("loan-labeled"))
    .reduce((a, t) => a + t.amount, 0),
  2024: D(91400),
};

// -- cash-deposit tuner: hit the hidden-income target exactly
for (const y of YEARS) {
  const cashTarget = HIDDEN_TARGET[y] - sideTotal[y] - loanTotal[y] - rentTotal[y];
  const yearCash = cashDrafts.filter((c) => yearOf(c.date) === y);
  const weights = yearCash.map(() => R.randInt(6300, 9200));
  const wTot = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  yearCash.forEach((c, i) => {
    let amt = Math.round((cashTarget * weights[i]) / wTot / 100) * 100;
    if (i === yearCash.length - 1) amt = cashTarget - acc;
    if (amt >= D(9800)) throw new Error(`cash deposit ${amt} crosses CTR threshold`);
    if (amt <= 0) throw new Error("cash deposit went nonpositive");
    acc += amt;
    c.amount = amt;
  });
}
drafts.push(...cashDrafts);

// -- savings 2023-11-17 withdrawal: land the balance at exactly $187,340.00
{
  let bal = accounts.find((a) => a.id === "frost-savings")!.openingBalance;
  for (const t of drafts) {
    if (t.accountId !== "frost-savings") continue;
    if (t.date >= "2023-11-17") continue;
    bal += t.amount;
  }
  const w = bal - SAVINGS_MIN;
  if (w <= 0) throw new Error(`savings already below minimum anchor (${bal})`);
  transfer("frost-savings", "frost-checking", "2023-11-17", w,
    "ONLINE XFER TO CHECKING ...4417", "ONLINE XFER FROM SAVINGS ...8823");
}

// -- chase-biz revenue: per month, deposits covering that month's outflows ± drift
for (const { y, m } of MONTHS) {
  const k = `${y}-${pad2(m)}`;
  let out = 0;
  for (const t of drafts) {
    if (t.accountId !== "chase-biz" || monthKey(t.date) !== k || t.amount >= 0) continue;
    out += -t.amount;
  }
  const drift = D(R.randInt(-6000, 12000) / 10) * 10;
  const total = out + drift;
  const n = R.randInt(2, 4);
  const cuts = Array.from({ length: n }, () => R.rand());
  const cutTot = cuts.reduce((a, b) => a + b, 0);
  let acc = 0;
  cuts.forEach((c, i) => {
    let amt = Math.round((total * c) / cutTot / 100) * 100;
    if (i === n - 1) amt = total - acc;
    acc += amt;
    if (amt <= 0) return;
    const client = R.pick(BIZ_CLIENTS);
    push({ accountId: "chase-biz", date: iso(y, m, [4, 11, 18, 26][i]), description: `${client.desc} INV ${R.randInt(20000, 49999)}`, amount: amt, category: "Business Revenue", channel: "ach", counterpartyId: client.id, tags: [] });
  });
}

// ============================================================ ASSEMBLE LEDGER
// order per account by date; solvency-lift openings; compute running balances
function sortKey(t: Draft): string {
  // deposits before withdrawals on the same day keeps intraday balances sane
  return `${t.date}|${t.amount >= 0 ? 0 : 1}`;
}
const byAccount = new Map<string, Draft[]>();
for (const a of accounts) byAccount.set(a.id, []);
for (const t of drafts) {
  const list = byAccount.get(t.accountId);
  if (!list) throw new Error(`unknown account ${t.accountId}`);
  list.push(t);
}
for (const [id, list] of byAccount) {
  list.sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
  const acct = accounts.find((a) => a.id === id)!;
  if (acct.kind !== "card" && id !== "fidelity") {
    // lift opening balance so the running balance never dips under $1,500
    let bal = acct.openingBalance;
    let min = bal;
    for (const t of list) { bal += t.amount; if (bal < min) min = bal; }
    if (min < D(1500)) acct.openingBalance += D(1500) - min;
  }
}

// documents manifest (statements) + provenance
const documents: CaseDocument[] = [];
const transactions: Transaction[] = [];
const LINES_PER_PAGE = 22;
let txnSeq = 0;

function quarterOf(m: number): number { return Math.ceil(m / 3); }

for (const acct of accounts) {
  const list = byAccount.get(acct.id)!;
  const groups = new Map<string, Draft[]>();
  for (const t of list) {
    const key = acct.id === "fidelity"
      ? `${t.date.slice(0, 4)}-Q${quarterOf(Number(t.date.slice(5, 7)))}`
      : monthKey(t.date);
    const g = groups.get(key) ?? [];
    g.push(t);
    groups.set(key, g);
  }
  let bal = acct.openingBalance;
  let stmtIdx = 0;
  for (const [key, g] of groups) {
    const docId = `${acct.id}-${key}`;
    const isQuarterly = acct.id === "fidelity";
    let pStart: string, pEnd: string, title: string;
    if (isQuarterly) {
      const y = Number(key.slice(0, 4));
      const q = Number(key.slice(6));
      pStart = iso(y, q * 3 - 2, 1);
      pEnd = iso(y, q * 3, lastDay(y, q * 3));
      title = `Fidelity Investments Statement — Brokerage ····${acct.last4} — Q${q} ${y}`;
    } else {
      const y = Number(key.slice(0, 4));
      const m = Number(key.slice(5, 7));
      pStart = iso(y, m, 1);
      pEnd = iso(y, m, lastDay(y, m));
      title = `${acct.institution} Statement — ${acct.name} ····${acct.last4} — ${MONTH_NAMES[m - 1]} ${y}`;
    }
    const scanned = acct.id === "prosperity-bluebonnet" ||
      ((acct.id === "frost-checking" || acct.id === "frost-savings" || acct.id === "chase-biz") && stmtIdx % 5 === 0);
    const kind = acct.kind === "card" ? "card-statement" : acct.kind === "brokerage" ? "brokerage-statement" : "bank-statement";
    documents.push({
      id: docId, kind, title, accountId: acct.id, periodStart: pStart, periodEnd: pEnd,
      file: `/documents/${docId}.pdf`, pages: 1 + Math.ceil(g.length / LINES_PER_PAGE),
      scanned, exhibit: "", // exhibit numbers assigned below
    });
    g.forEach((t, i) => {
      bal += t.amount;
      transactions.push({
        id: `t${String(++txnSeq).padStart(5, "0")}`,
        accountId: t.accountId,
        date: t.date,
        description: t.description,
        amount: t.amount,
        category: t.category,
        channel: t.channel,
        ...(t.counterpartyId ? { counterpartyId: t.counterpartyId } : {}),
        ...(t.transferGroup ? { transferGroup: t.transferGroup } : {}),
        tags: t.tags,
        ...(t.fundSource ? { fundSource: t.fundSource } : {}),
        balanceAfter: bal,
        doc: { docId, page: 2 + Math.floor(i / LINES_PER_PAGE), line: (i % LINES_PER_PAGE) + 1 },
        confidence: scanned ? Math.round((0.62 + R.rand() * 0.35) * 100) / 100 : 1,
      });
    });
    stmtIdx++;
  }
}
transactions.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));

// special documents + exhibit numbering
const specials: CaseDocument[] = [
  { id: "1040-2022", kind: "tax-return", title: "Form 1040 (2022) — Marcus T. & Sarah W. Delaney", file: "/documents/1040-2022.pdf", pages: 2, scanned: false, exhibit: "" },
  { id: "1040-2023", kind: "tax-return", title: "Form 1040 (2023) — Marcus T. & Sarah W. Delaney", file: "/documents/1040-2023.pdf", pages: 2, scanned: false, exhibit: "" },
  { id: "1040-2024", kind: "tax-return", title: "Form 1040 (2024) — Marcus T. & Sarah W. Delaney", file: "/documents/1040-2024.pdf", pages: 2, scanned: false, exhibit: "" },
  { id: "whitmore-estate-letter", kind: "letter", title: "Executor's Letter — Estate of Margaret H. Whitmore ($250,000 distribution)", file: "/documents/whitmore-estate-letter.pdf", pages: 1, scanned: true, exhibit: "" },
  { id: "bluebonnet-formation", kind: "formation", title: "TX SOS Certificate of Formation — Bluebonnet Holdings LLC (#805221947)", file: "/documents/bluebonnet-formation.pdf", pages: 2, scanned: true, exhibit: "" },
  { id: "galveston-closing", kind: "closing-statement", title: "Settlement Statement — 4210 Seawall Blvd Unit 502, Galveston ($385,000)", file: "/documents/galveston-closing.pdf", pages: 3, scanned: false, exhibit: "" },
  { id: "galveston-deed", kind: "deed", title: "Warranty Deed — 4210 Seawall Blvd Unit 502 (Bluebonnet Holdings LLC)", file: "/documents/galveston-deed.pdf", pages: 2, scanned: true, exhibit: "" },
];
documents.sort((a, b) => (a.periodStart ?? "").localeCompare(b.periodStart ?? "") || a.id.localeCompare(b.id));
const allDocs = [...specials, ...documents];
allDocs.forEach((d, i) => { d.exhibit = `Ex. ${i + 1}`; });

// ============================================================ SCHEDULE (net worth inputs)
function balanceAtYearEnd(accountId: string, year: number): Cents {
  const acct = accounts.find((a) => a.id === accountId)!;
  let bal = acct.openingBalance;
  for (const t of transactions) {
    if (t.accountId !== accountId) continue;
    if (yearOf(t.date) > year) break;
    bal += t.amount;
  }
  return bal;
}
const YE = [2021, 2022, 2023, 2024];
const vals = (fn: (y: number) => Cents): Record<string, Cents> =>
  Object.fromEntries(YE.map((y) => [String(y), fn(y)]));

const schedule: ScheduleItem[] = [
  { id: "residence", name: "Residence — 5614 Longmont Dr, Houston (Tanglewood), at cost", kind: "real-property", valuesByYear: vals(() => D(1450000)), note: "Acquired 2019; carried at cost per the net worth method." },
  {
    id: "galveston", name: "4210 Seawall Blvd Unit 502, Galveston — net of $200,000 seller note", kind: "real-property",
    valuesByYear: vals((y) => (y >= 2023 ? GALVESTON_WIRE : 0)), acquired: "2023-08-18", docId: "galveston-deed",
    note: "Price $385,000; $200,000 undisclosed seller carry-back (Shoreline Ventures LLC); shown at cash invested.",
  },
  { id: "dm-interest", name: "Member interest — Delaney Mechanical Services LLC", kind: "business-interest", valuesByYear: vals(() => D(220000)), note: "Fixed at agreed value for the analysis period." },
  { id: "fidelity-acct", name: "Fidelity brokerage Z40-118226, at cost", kind: "brokerage", accountId: "fidelity", valuesByYear: vals((y) => (y === 2021 ? accounts.find((a) => a.id === "fidelity")!.openingBalance : balanceAtYearEnd("fidelity", y))), docId: "fidelity-2024-Q4" },
  { id: "frost-checking-bal", name: "Frost Bank checking ····4417", kind: "bank", accountId: "frost-checking", valuesByYear: vals((y) => (y === 2021 ? accounts.find((a) => a.id === "frost-checking")!.openingBalance : balanceAtYearEnd("frost-checking", y))) },
  { id: "frost-savings-bal", name: "Frost Bank savings ····8823", kind: "bank", accountId: "frost-savings", valuesByYear: vals((y) => (y === 2021 ? accounts.find((a) => a.id === "frost-savings")!.openingBalance : balanceAtYearEnd("frost-savings", y))) },
  { id: "bluebonnet-bal", name: "Prosperity Bank ····9174 — Bluebonnet Holdings LLC (nominee)", kind: "bank", accountId: "prosperity-bluebonnet", valuesByYear: vals((y) => (y <= 2022 ? 0 : balanceAtYearEnd("prosperity-bluebonnet", y))), note: "Undisclosed; surfaced by subpoena." },
  // liabilities (stored negative; engines normalize by |value|)
  { id: "mortgage", name: "Cadence Bank note — residence (interest-only)", kind: "liability", valuesByYear: vals(() => -D(980000)), note: "Interest-only jumbo at 7.85%; principal unchanged in period." },
  { id: "amex-bal", name: "American Express Platinum — balance", kind: "liability", valuesByYear: vals((y) => (y === 2021 ? accounts.find((a) => a.id === "amex")!.openingBalance : balanceAtYearEnd("amex", y))) },
  { id: "sapphire-bal", name: "Chase Sapphire Reserve — balance", kind: "liability", valuesByYear: vals((y) => (y === 2021 ? accounts.find((a) => a.id === "sapphire")!.openingBalance : balanceAtYearEnd("sapphire", y))) },
];

// ============================================================ REPORTED
const reported: ReportedYear[] = YEARS.map((y) => ({
  year: y,
  reportedIncome: REPORTED[y],
  agi: REPORTED[y] - D(2500),
  filingStatus: "Married filing jointly",
  federalTax: { 2022: D(23900), 2023: D(24600), 2024: D(25300) }[y]!,
  docId: `1040-${y}`,
}));

// ============================================================ CASE FILE
const caseFile: CaseFile = {
  matter: {
    number: "2025-0147",
    caption: "In re the Marriage of Delaney",
    court: "311th Judicial District Court, Harris County, Texas",
    engagedBy: "Counsel for Petitioner, Sarah W. Delaney",
    preparedFor: "Masin Advisory Group — Risk & Resolution",
    subject: "Marcus T. Delaney",
    spouse: "Sarah W. Delaney",
    periodStart: "2022-01-01",
    periodEnd: "2024-12-31",
    summary:
      "Masin Advisory Group was engaged by counsel for the Petitioner to determine the true income of the Respondent, sole member of Delaney Mechanical Services LLC, and to trace the Petitioner's claimed separate-property inheritance through a commingled savings account. Income is reconstructed by three independent, court-recognized indirect methods from the underlying bank, card, and brokerage records, and the tracing is performed under the accepted Texas methods at the clear-and-convincing standard. All findings are stated neutrally and tie, line by line, to the source documents.",
  },
  entities,
  accounts,
  transactions,
  documents: allDocs,
  schedule,
  reported,
  tracing: {
    accountId: "frost-savings",
    claimant: "Sarah W. Delaney",
    separateSource: "Estate of Margaret H. Whitmore",
    separateAmount: D(250000),
    separateDate: "2022-06-15",
  },
};

// ============================================================ SELF-CHECK
function fail(msg: string): never { throw new Error(`SELF-CHECK FAILED: ${msg}`); }

// balance continuity per account
for (const acct of accounts) {
  let bal = acct.openingBalance;
  for (const t of transactions) {
    if (t.accountId !== acct.id) continue;
    bal += t.amount;
    if (t.balanceAfter !== bal) fail(`balanceAfter mismatch on ${t.id}`);
  }
}
// transfer groups net to zero with exactly two legs
{
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) if (t.transferGroup) {
    const g = groups.get(t.transferGroup) ?? [];
    g.push(t);
    groups.set(t.transferGroup, g);
  }
  for (const [id, legs] of groups) {
    if (legs.length !== 2) fail(`transferGroup ${id} has ${legs.length} legs`);
    if (legs[0].amount + legs[1].amount !== 0) fail(`transferGroup ${id} does not net to zero`);
  }
}
// savings minimum anchor
{
  let bal = accounts.find((a) => a.id === "frost-savings")!.openingBalance;
  let min = Infinity;
  let minDate = "";
  let seen = false;
  for (const t of transactions) {
    if (t.accountId !== "frost-savings") continue;
    bal += t.amount;
    if (t.fundSource === "separate") seen = true;
    if (seen && bal < min) { min = bal; minDate = t.date; }
  }
  if (min !== SAVINGS_MIN) fail(`savings minimum ${min} !== ${SAVINGS_MIN}`);
  if (minDate !== "2023-11-17") fail(`savings minimum date ${minDate}`);
}
// lifestyle & hidden targets exact
for (const y of YEARS) {
  let lifestyle = 0, hidden = 0;
  for (const t of transactions) {
    if (yearOf(t.date) !== y) continue;
    if (!t.transferGroup && t.amount < 0 && t.tags.includes("living-expense") &&
        t.accountId !== "chase-biz" && t.accountId !== "prosperity-bluebonnet") lifestyle += -t.amount;
    if (t.amount > 0 && t.tags.includes("income-hidden")) hidden += t.amount;
  }
  if (Math.abs(lifestyle - LIFESTYLE_TARGET[y]) > D(200)) fail(`lifestyle ${y}: ${lifestyle} vs ${LIFESTYLE_TARGET[y]}`);
  if (Math.abs(hidden - HIDDEN_TARGET[y]) > D(200)) fail(`hidden ${y}: ${hidden} vs ${HIDDEN_TARGET[y]}`);
}
// provenance + confidence + fundSource discipline
for (const t of transactions) {
  if (!t.doc || !t.doc.docId || t.doc.page < 2 || t.doc.line < 1) fail(`bad provenance on ${t.id}`);
  if (t.accountId === "frost-savings" && t.amount > 0 && !t.fundSource) fail(`savings deposit ${t.id} lacks fundSource`);
}
// every doc referenced exists
{
  const ids = new Set(allDocs.map((d) => d.id));
  for (const t of transactions) if (!ids.has(t.doc.docId)) fail(`txn ${t.id} references missing doc ${t.doc.docId}`);
}

// ============================================================ WRITE + REPORT
fs.writeFileSync(OUT, JSON.stringify(caseFile));
const pages = allDocs.reduce((a, d) => a + d.pages, 0);
console.log(`case.json written: ${transactions.length} transactions, ${allDocs.length} documents, ${pages} statement pages`);
for (const y of YEARS) {
  let lifestyle = 0, hidden = 0;
  for (const t of transactions) {
    if (yearOf(t.date) !== y) continue;
    if (!t.transferGroup && t.amount < 0 && t.tags.includes("living-expense") &&
        t.accountId !== "chase-biz" && t.accountId !== "prosperity-bluebonnet") lifestyle += -t.amount;
    if (t.amount > 0 && t.tags.includes("income-hidden")) hidden += t.amount;
  }
  console.log(`${y}: reported $${REPORTED[y] / 100} · lifestyle $${lifestyle / 100} · hidden income planted $${hidden / 100}`);
}
console.log(`savings: min $${SAVINGS_MIN / 100} on 2023-11-17 · ending $${balanceAtYearEnd("frost-savings", 2024) / 100}`);
console.log(`bluebonnet YE23 $${balanceAtYearEnd("prosperity-bluebonnet", 2023) / 100} · YE24 $${balanceAtYearEnd("prosperity-bluebonnet", 2024) / 100}`);
console.log(`checking YE: ${YE.slice(1).map((y) => `$${balanceAtYearEnd("frost-checking", y) / 100}`).join(" · ")}`);
