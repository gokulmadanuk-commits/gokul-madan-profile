/**
 * LUCA — evidence document renderer.
 * Reads src/data/case.json (documents[] manifest + transactions[]) and renders
 * every document to public/documents/<id>.pdf with pdf-lib, then patches the
 * manifest's pages field to the true rendered page counts.
 *
 * Deterministic: all "randomness" (scan angle, speckle) is seeded per doc id.
 * Run: npm run gen:docs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
  degrees,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
} from "pdf-lib";
import { RNG } from "./rng";
import type {
  Account,
  CaseDocument,
  CaseFile,
  Cents,
  Transaction,
} from "../src/lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CASE_PATH = path.join(ROOT, "src/data/case.json");
const OUT_DIR = path.join(ROOT, "public/documents");

const caseFile: CaseFile = JSON.parse(fs.readFileSync(CASE_PATH, "utf8"));

// ---------------------------------------------------------------------------
// Geometry & shared constants
// ---------------------------------------------------------------------------

const W = 612; // US Letter
const H = 792;
const M = 48; // margin
const RIGHT = W - M;

/** Transaction-table grid (pages 2+): exactly 22 row slots per page. */
const ROWS_PER_PAGE = 22;
const ROW_H = 24;
const ROW0_Y = H - 148; // baseline of row slot 1
const TABLE_HEAD_Y = ROW0_Y + 26;

const SCAN_BG = rgb(0xf4 / 255, 0xf1 / 255, 0xe8 / 255);

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** cents -> "1,234.56" (absolute value; sign handled by caller) */
function fmt(cents: Cents): string {
  const v = Math.abs(cents);
  const d = Math.floor(v / 100);
  const c = String(v % 100).padStart(2, "0");
  return `${d.toLocaleString("en-US")}.${c}`;
}
function usd(cents: Cents): string {
  return (cents < 0 ? "-$" : "$") + fmt(cents);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
function slashDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y.slice(2)}`;
}

/** Keep only WinAnsi-safe characters. */
function safe(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[^\x20-\x7e—–·©®’‘“”•]/g, "-");
}

interface Fonts {
  helv: PDFFont;
  helvB: PDFFont;
  times: PDFFont;
  timesB: PDFFont;
  timesI: PDFFont;
  cour: PDFFont;
  courB: PDFFont;
}

// ---------------------------------------------------------------------------
// Sheet: one page with optional scanned treatment
// ---------------------------------------------------------------------------

class Sheet {
  readonly page: PDFPage;
  private scanned: boolean;

  constructor(pdf: PDFDocument, scanned: boolean, angleDeg: number) {
    this.page = pdf.addPage([W, H]);
    this.scanned = scanned;
    if (scanned) {
      // toned paper background, unrotated
      this.page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: SCAN_BG });
      // rotate all subsequent content about the page center
      const th = (angleDeg * Math.PI) / 180;
      const cos = Math.cos(th);
      const sin = Math.sin(th);
      const cx = W / 2;
      const cy = H / 2;
      const e = cx - cx * cos + cy * sin;
      const f = cy - cx * sin - cy * cos;
      this.page.pushOperators(
        pushGraphicsState(),
        concatTransformationMatrix(cos, sin, -sin, cos, e, f),
      );
    }
  }

  /** Institution color, degraded to photocopier gray on scanned docs. */
  ink(r: number, g: number, b: number) {
    if (!this.scanned) return rgb(r, g, b);
    const l = 0.3 * r + 0.59 * g + 0.11 * b;
    // near-white fills disappear into the toned paper; dark content goes dark gray
    const v = l > 0.85 ? 0.955 : l < 0.5 ? Math.min(0.4, l * 0.55 + 0.2) : 0.5 + l * 0.35;
    return rgb(v, v, v);
  }
  get black() {
    return this.scanned ? rgb(0.22, 0.22, 0.22) : rgb(0.08, 0.08, 0.08);
  }
  get gray() {
    return this.scanned ? rgb(0.38, 0.38, 0.38) : rgb(0.35, 0.35, 0.35);
  }

  text(s: string, x: number, y: number, font: PDFFont, size: number, color = this.black) {
    this.page.drawText(safe(s), { x, y, font, size, color });
  }
  textRight(s: string, xr: number, y: number, font: PDFFont, size: number, color = this.black) {
    const t = safe(s);
    this.page.drawText(t, { x: xr - font.widthOfTextAtSize(t, size), y, font, size, color });
  }
  textCenter(s: string, cx: number, y: number, font: PDFFont, size: number, color = this.black) {
    const t = safe(s);
    this.page.drawText(t, { x: cx - font.widthOfTextAtSize(t, size) / 2, y, font, size, color });
  }
  /** Truncate to fit maxWidth. */
  clip(s: string, font: PDFFont, size: number, maxWidth: number): string {
    let t = safe(s);
    if (font.widthOfTextAtSize(t, size) <= maxWidth) return t;
    while (t.length > 1 && font.widthOfTextAtSize(t + "...", size) > maxWidth) t = t.slice(0, -1);
    return t + "...";
  }
  rect(x: number, y: number, w: number, h: number, opts: {
    color?: ReturnType<typeof rgb>; border?: ReturnType<typeof rgb>; bw?: number; opacity?: number;
  }) {
    this.page.drawRectangle({
      x, y, width: w, height: h,
      color: opts.color, borderColor: opts.border, borderWidth: opts.bw,
      opacity: opts.opacity,
    });
  }
  hline(x1: number, x2: number, y: number, w = 0.7, color = this.black) {
    this.page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness: w, color });
  }

  /** Pop the rotation, then lay unrotated scan artifacts on top. */
  finish(rng: RNG) {
    if (!this.scanned) return;
    this.page.pushOperators(popGraphicsState());
    // sparse speckle dots
    const n = rng.randInt(45, 85);
    for (let i = 0; i < n; i++) {
      const g = 0.35 + rng.rand() * 0.3;
      this.page.drawCircle({
        x: rng.rand() * W,
        y: rng.rand() * H,
        size: 0.3 + rng.rand() * 0.6,
        color: rgb(g, g, g),
        opacity: 0.35 + rng.rand() * 0.3,
      });
    }
    // one faint vertical streak
    const sx = 40 + rng.rand() * (W - 80);
    this.page.drawRectangle({
      x: sx, y: 0, width: 1.4 + rng.rand() * 1.6, height: H,
      color: rgb(0.45, 0.45, 0.45), opacity: 0.07,
    });
  }
}

// ---------------------------------------------------------------------------
// Case data prep: group transactions per document, compute begin balances
// ---------------------------------------------------------------------------

const accountById = new Map<string, Account>(caseFile.accounts.map((a) => [a.id, a]));
const docById = new Map<string, CaseDocument>(caseFile.documents.map((d) => [d.id, d]));

interface StmtData {
  doc: CaseDocument;
  account: Account;
  txns: Transaction[];
  begin: Cents;
  end: Cents;
  credits: Cents;
  creditCount: number;
  debits: Cents; // positive number: total of outflows
  debitCount: number;
  tablePages: number; // pages 2..N carrying rows
}

const stmtByDoc = new Map<string, StmtData>();
{
  const txnsByDoc = new Map<string, Transaction[]>();
  for (const t of caseFile.transactions) {
    let arr = txnsByDoc.get(t.doc.docId);
    if (!arr) txnsByDoc.set(t.doc.docId, (arr = []));
    arr.push(t);
  }
  // running balance per account, in ledger order (chronological per account)
  const running = new Map<string, Cents>(
    caseFile.accounts.map((a) => [a.id, a.openingBalance]),
  );
  const beginByDoc = new Map<string, Cents>();
  for (const t of caseFile.transactions) {
    if (!beginByDoc.has(t.doc.docId)) beginByDoc.set(t.doc.docId, running.get(t.accountId)!);
    running.set(t.accountId, t.balanceAfter);
  }
  for (const [docId, txns] of txnsByDoc) {
    const doc = docById.get(docId);
    if (!doc || !doc.accountId) continue;
    const account = accountById.get(doc.accountId)!;
    txns.sort((a, b) => a.doc.page - b.doc.page || a.doc.line - b.doc.line);
    const begin = beginByDoc.get(docId)!;
    const end = txns[txns.length - 1].balanceAfter;
    let credits = 0, creditCount = 0, debits = 0, debitCount = 0;
    for (const t of txns) {
      if (t.amount >= 0) { credits += t.amount; creditCount++; }
      else { debits += -t.amount; debitCount++; }
    }
    const maxPage = Math.max(...txns.map((t) => t.doc.page));
    stmtByDoc.set(docId, {
      doc, account, txns, begin, end, credits, creditCount, debits, debitCount,
      tablePages: maxPage - 1,
    });
  }
}

// ---------------------------------------------------------------------------
// Branding
// ---------------------------------------------------------------------------

interface Brand {
  band: [number, number, number];
  wordmark: string;
  legal: string;
  addr: string[];
  fdic?: string;
  centered?: boolean;
}
const BRANDS: Record<string, Brand> = {
  "Frost Bank": {
    band: [0x00 / 255, 0x2f / 255, 0x5f / 255], // navy
    wordmark: "FROST",
    legal: "Frost Bank",
    addr: ["P.O. Box 1600", "San Antonio, TX 78296-1600"],
    fdic: "Member FDIC",
  },
  Chase: {
    band: [0x10 / 255, 0x1a / 255, 0x24 / 255], // dark band
    wordmark: "CHASE",
    legal: "JPMorgan Chase Bank, N.A.",
    addr: ["P.O. Box 659754", "San Antonio, TX 78265-9754"],
    fdic: "Member FDIC",
  },
  "American Express": {
    band: [1, 1, 1],
    wordmark: "AMERICAN EXPRESS",
    legal: "American Express National Bank",
    addr: ["P.O. Box 650448", "Dallas, TX 75265-0448"],
    centered: true,
  },
  "Prosperity Bank": {
    band: [0x00 / 255, 0x63 / 255, 0x41 / 255], // green
    wordmark: "PROSPERITY BANK",
    legal: "Prosperity Bank, N.A.",
    addr: ["P.O. Box 3096", "Houston, TX 77253-3096"],
    fdic: "Member FDIC",
  },
  Fidelity: {
    band: [0x36 / 255, 0x77 / 255, 0x35 / 255], // green/white
    wordmark: "FIDELITY INVESTMENTS",
    legal: "Fidelity Brokerage Services LLC",
    addr: ["P.O. Box 770001", "Cincinnati, OH 45277-0002"],
  },
};

function customerBlock(account: Account): string[] {
  switch (account.id) {
    case "chase-biz":
      return ["DELANEY MECHANICAL SERVICES LLC", "8834 KEMPWOOD DR STE 200", "HOUSTON TX 77080-2214"];
    case "prosperity-bluebonnet":
      return ["BLUEBONNET HOLDINGS LLC", "5614 LONGMONT DR", "HOUSTON TX 77056-1214"];
    case "amex":
      return ["MARCUS T. DELANEY", "5614 LONGMONT DR", "HOUSTON TX 77056-1214"];
    default:
      return ["MARCUS T. & SARAH W. DELANEY", "5614 LONGMONT DR", "HOUSTON TX 77056-1214"];
  }
}

// ---------------------------------------------------------------------------
// Shared statement chrome
// ---------------------------------------------------------------------------

function masthead(sh: Sheet, F: Fonts, brand: Brand, sub: string) {
  if (brand.centered) {
    // Amex: centered wordmark, no band
    sh.textCenter(brand.wordmark, W / 2, H - 58, F.helvB, 19, sh.ink(0, 0.22, 0.42));
    sh.hline(M, RIGHT, H - 68, 1.4, sh.ink(0, 0.22, 0.42));
    sh.textCenter(sub, W / 2, H - 82, F.helv, 8.5, sh.gray);
    return;
  }
  const [r, g, b] = brand.band;
  sh.rect(0, H - 74, W, 74, { color: sh.ink(r, g, b) });
  sh.text(brand.wordmark, M, H - 46, F.helvB, 21, sh.ink(1, 1, 1));
  sh.text(sub, M, H - 62, F.helv, 8.5, sh.ink(0.85, 0.88, 0.9));
  sh.textRight("STATEMENT OF ACCOUNT", RIGHT, H - 40, F.helvB, 9, sh.ink(1, 1, 1));
  sh.textRight(`${brand.legal}  ·  ${brand.addr.join(", ")}`, RIGHT, H - 56, F.helv, 7, sh.ink(0.85, 0.88, 0.9));
  if (brand.fdic) sh.textRight(brand.fdic, RIGHT, H - 66, F.helv, 6.5, sh.ink(0.85, 0.88, 0.9));
}

function addressAndPeriod(sh: Sheet, F: Fonts, d: StmtData, pageCount: number, topY: number) {
  const lines = customerBlock(d.account);
  let y = topY;
  for (const ln of lines) {
    sh.text(ln, M, y, F.helv, 9.5);
    y -= 12.5;
  }
  const rx = 340;
  const rows: [string, string][] = [
    ["Statement Period", `${slashDate(d.doc.periodStart!)} - ${slashDate(d.doc.periodEnd!)}`],
    ["Account Number", `XXXX-XXXX-${d.account.last4}`],
    ["Pages", `1 of ${pageCount}`],
  ];
  let ry = topY;
  for (const [k, v] of rows) {
    sh.text(k, rx, ry, F.helv, 8, sh.gray);
    sh.textRight(v, RIGHT, ry, F.cour, 8.5);
    ry -= 12.5;
  }
}

function statementFooter(sh: Sheet, F: Fonts, d: StmtData, pageNo: number, pageCount: number, brand: Brand) {
  sh.hline(M, RIGHT, 54, 0.5, sh.gray);
  sh.text(`${brand.legal}${brand.fdic ? " · " + brand.fdic : ""}`, M, 42, F.helv, 6.5, sh.gray);
  sh.textRight(`Account ····${d.account.last4}  ·  Page ${pageNo} of ${pageCount}`, RIGHT, 42, F.helv, 6.5, sh.gray);
}

function subpoenaStamp(sh: Sheet, F: Fonts, doc: CaseDocument, seq: number) {
  // exemption from rotation: drawn after finish would miss scan tone; draw inside content
  const x = 322, y = 636, w = 246, h = 44, rot = degrees(-3);
  const red = sh.ink(0.55, 0.12, 0.12);
  sh.page.drawRectangle({ x, y, width: w, height: h, borderColor: red, borderWidth: 1.6, rotate: rot });
  sh.page.drawRectangle({ x: x + 3, y: y + 1.8, width: w - 6, height: h - 6, borderColor: red, borderWidth: 0.6, rotate: rot });
  sh.page.drawText("SUBPOENA DUCES TECUM", { x: x + 34, y: y + 26, font: F.helvB, size: 10.5, color: red, rotate: rot });
  sh.page.drawText("PRODUCED BY PROSPERITY BANK N.A.", { x: x + 18, y: y + 14, font: F.helvB, size: 9, color: red, rotate: rot });
  sh.page.drawText(`PB-2025-0147-${String(seq).padStart(4, "0")}`, { x: x + 74, y: y + 4.5, font: F.cour, size: 7, color: red, rotate: rot });
}

// ---------------------------------------------------------------------------
// Transaction table pages (pages 2+) — 22 fixed row slots per page
// ---------------------------------------------------------------------------

type RowStyle = "bank" | "card" | "brokerage";

function tablePage(
  sh: Sheet, F: Fonts, d: StmtData, brand: Brand,
  pageIndex: number, // 2-based statement page number
  pageCount: number, rows: Transaction[], style: RowStyle,
) {
  // slim continuation header
  const [r, g, b] = brand.band;
  const bandColor = brand.centered ? sh.ink(0, 0.22, 0.42) : sh.ink(r, g, b);
  if (!brand.centered) sh.rect(0, H - 34, W, 34, { color: bandColor });
  if (brand.centered) {
    sh.text(brand.wordmark, M, H - 24, F.helvB, 10, bandColor);
    sh.hline(M, RIGHT, H - 32, 1, bandColor);
  } else {
    sh.text(brand.wordmark, M, H - 24, F.helvB, 10, sh.ink(1, 1, 1));
  }
  const hdrInk = brand.centered ? sh.gray : sh.ink(0.88, 0.9, 0.92);
  sh.textRight(
    `Account ····${d.account.last4}   ·   ${slashDate(d.doc.periodStart!)} - ${slashDate(d.doc.periodEnd!)}   ·   Page ${pageIndex} of ${pageCount}`,
    RIGHT, H - 24, F.helv, 7.5, brand.centered ? sh.gray : hdrInk,
  );

  const title =
    style === "card" ? "ACCOUNT ACTIVITY  —  PAYMENTS, CREDITS AND NEW CHARGES"
    : style === "brokerage" ? "ACTIVITY DETAIL"
    : "TRANSACTION DETAIL";
  sh.text(title + (pageIndex > 2 ? " (CONTINUED)" : ""), M, H - 108, F.helvB, 9);
  sh.hline(M, RIGHT, H - 114, 1);

  // column heads
  const y0 = TABLE_HEAD_Y;
  sh.text("DATE", M, y0, F.helvB, 7, sh.gray);
  sh.text("DESCRIPTION", M + 62, y0, F.helvB, 7, sh.gray);
  if (style === "bank") {
    sh.textRight("WITHDRAWALS ($)", 420, y0, F.helvB, 7, sh.gray);
    sh.textRight("DEPOSITS ($)", 492, y0, F.helvB, 7, sh.gray);
    sh.textRight("BALANCE ($)", RIGHT, y0, F.helvB, 7, sh.gray);
  } else if (style === "card") {
    sh.textRight("AMOUNT ($)", RIGHT, y0, F.helvB, 7, sh.gray);
  } else {
    sh.textRight("AMOUNT ($)", 492, y0, F.helvB, 7, sh.gray);
    sh.textRight("BALANCE ($)", RIGHT, y0, F.helvB, 7, sh.gray);
  }
  sh.hline(M, RIGHT, y0 - 5, 0.6, sh.gray);

  const descMax = style === "bank" ? 250 : style === "card" ? 360 : 300;
  for (const t of rows) {
    const y = ROW0_Y - (t.doc.line - 1) * ROW_H;
    sh.text(slashDate(t.date), M, y, F.cour, 7.5);
    sh.text(sh.clip(t.description, F.helv, 8, descMax), M + 62, y, F.helv, 8);
    if (style === "bank") {
      if (t.amount < 0) sh.textRight(fmt(t.amount), 420, y, F.cour, 7.5);
      else sh.textRight(fmt(t.amount), 492, y, F.cour, 7.5);
      sh.textRight(fmt(t.balanceAfter) + (t.balanceAfter < 0 ? "-" : ""), RIGHT, y, F.cour, 7.5);
    } else if (style === "card") {
      // card: charges shown positive, payments/credits with CR
      if (t.amount < 0) sh.textRight(fmt(t.amount), RIGHT, y, F.cour, 7.5);
      else sh.textRight(fmt(t.amount) + " CR", RIGHT, y, F.cour, 7.5);
    } else {
      sh.textRight((t.amount < 0 ? "-" : "") + fmt(t.amount), 492, y, F.cour, 7.5);
      sh.textRight(fmt(t.balanceAfter), RIGHT, y, F.cour, 7.5);
    }
    // faint slot rule every row group of 22 stays clean: hairline under each row
    sh.hline(M, RIGHT, y - 7, 0.25, sh.ink(0.8, 0.78, 0.72));
  }
}

// ---------------------------------------------------------------------------
// Bank statement (Frost / Chase business / Prosperity)
// ---------------------------------------------------------------------------

function renderBankStatement(pdf: PDFDocument, F: Fonts, d: StmtData, rng: RNG, angle: number, prosperitySeq: number): number {
  const brand = BRANDS[d.account.institution];
  const pageCount = 1 + d.tablePages;
  const scanned = d.doc.scanned;

  // ---- page 1 ----
  const p1 = new Sheet(pdf, scanned, angle);
  masthead(p1, F, brand, `${d.account.name} Statement`);
  addressAndPeriod(p1, F, d, pageCount, H - 118);

  // account summary box
  const bx = M, by = 470, bw = RIGHT - M, bh = 130;
  p1.rect(bx, by, bw, bh, { border: p1.black, bw: 1 });
  p1.rect(bx, by + bh - 22, bw, 22, { color: p1.ink(0.92, 0.9, 0.85) });
  p1.text("ACCOUNT SUMMARY", bx + 10, by + bh - 15.5, F.helvB, 9);
  p1.textRight(`${d.account.name}  ····${d.account.last4}`, bx + bw - 10, by + bh - 15.5, F.helv, 8, p1.gray);
  const rows: [string, string, string][] = [
    ["Beginning Balance", slashDate(d.doc.periodStart!), fmt(d.begin)],
    [`Deposits & Other Credits (${d.creditCount})`, "", fmt(d.credits)],
    [`Withdrawals & Other Debits (${d.debitCount})`, "", "-" + fmt(d.debits)],
    ["Ending Balance", slashDate(d.doc.periodEnd!), fmt(d.end)],
  ];
  let ry = by + bh - 42;
  for (let i = 0; i < rows.length; i++) {
    const [k, dt, v] = rows[i];
    const bold = i === 0 || i === 3;
    p1.text(k, bx + 10, ry, bold ? F.helvB : F.helv, 9);
    if (dt) p1.text(dt, bx + 220, ry, F.cour, 8, p1.gray);
    p1.textRight("$ " + v, bx + bw - 10, ry, bold ? F.courB : F.cour, 9.5);
    if (i === 2) p1.hline(bx + 10, bx + bw - 10, ry - 8, 0.6, p1.gray);
    ry -= 24;
  }

  // deposits/withdrawals recap strip
  p1.text("SUMMARY OF ACCOUNT ACTIVITY", M, 430, F.helvB, 8.5);
  p1.hline(M, RIGHT, 424, 0.7);
  p1.text(`Number of deposits/credits: ${d.creditCount}`, M, 408, F.helv, 8.5);
  p1.text(`Number of withdrawals/debits: ${d.debitCount}`, M, 394, F.helv, 8.5);
  p1.text(`Number of days in statement period: ${daysBetween(d.doc.periodStart!, d.doc.periodEnd!)}`, M, 380, F.helv, 8.5);
  p1.textRight(`Total credits:  $ ${fmt(d.credits)}`, RIGHT, 408, F.cour, 8.5);
  p1.textRight(`Total debits:   $ ${fmt(d.debits)}`, RIGHT, 394, F.cour, 8.5);
  p1.textRight(`Transactions continue on page 2`, RIGHT, 380, F.helv, 8, p1.gray);

  // small print
  const smallY = 320;
  p1.text("IN CASE OF ERRORS OR QUESTIONS ABOUT YOUR STATEMENT", M, smallY, F.helvB, 7, p1.gray);
  const para =
    "Please examine this statement upon receipt. If you believe there is an error or unauthorized transaction, " +
    "contact us within 60 days of the date the statement was made available. Telephone banking is available 24 hours " +
    "a day. Deposit products offered by " + brand.legal + ".";
  wrapText(p1, F.helv, 7, para, M, smallY - 12, RIGHT - M, 9.5, p1.gray);

  if (d.account.id === "prosperity-bluebonnet") subpoenaStamp(p1, F, d.doc, prosperitySeq);
  statementFooter(p1, F, d, 1, pageCount, brand);
  p1.finish(rng);

  // ---- pages 2+ ----
  for (let pg = 2; pg <= pageCount; pg++) {
    const sh = new Sheet(pdf, scanned, angle);
    const rows = d.txns.filter((t) => t.doc.page === pg);
    tablePage(sh, F, d, brand, pg, pageCount, rows, "bank");
    if (pg === pageCount) {
      const lastY = ROW0_Y - Math.max(...rows.map((t) => t.doc.line)) * ROW_H;
      sh.hline(M, RIGHT, lastY + 10, 0.6);
      sh.text("ENDING BALANCE", M + 62, lastY - 4, F.helvB, 8);
      sh.textRight("$ " + fmt(d.end), RIGHT, lastY - 4, F.courB, 8.5);
    }
    statementFooter(sh, F, d, pg, pageCount, brand);
    sh.finish(rng);
  }
  return pageCount;
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1;
}

function wrapText(sh: Sheet, font: PDFFont, size: number, text: string, x: number, y: number, maxW: number, lh: number, color?: ReturnType<typeof rgb>) {
  const words = safe(text).split(/\s+/);
  let line = "";
  let yy = y;
  for (const w of words) {
    const probe = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(probe, size) > maxW && line) {
      sh.text(line, x, yy, font, size, color);
      yy -= lh;
      line = w;
    } else line = probe;
  }
  if (line) sh.text(line, x, yy, font, size, color);
  return yy - lh;
}

// ---------------------------------------------------------------------------
// Card statement (Amex Platinum / Chase Sapphire)
// ---------------------------------------------------------------------------

function renderCardStatement(pdf: PDFDocument, F: Fonts, d: StmtData, rng: RNG, angle: number): number {
  const brand = BRANDS[d.account.institution];
  const isAmex = d.account.id === "amex";
  const pageCount = 1 + d.tablePages;
  const scanned = d.doc.scanned;

  const prevBal = -d.begin; // card owed shown positive
  const newBal = -d.end;
  const payments = d.credits;
  const newCharges = d.debits;
  const minDue = Math.max(3500, Math.round(newBal * 0.02 / 100) * 100);
  const dueDate = d.doc.periodEnd!.slice(0, 8) + "25"; // synthetic due date next cycle

  const p1 = new Sheet(pdf, scanned, angle);
  if (isAmex) {
    masthead(p1, F, brand, "Platinum Card®  ·  Prepared for MARCUS T DELANEY  ·  Account Ending 7-1002");
  } else {
    masthead(p1, F, brand, "Sapphire Reserve  ·  Cardmember Service");
  }
  addressAndPeriod(p1, F, d, pageCount, H - (isAmex ? 128 : 118));

  // boxed account summary (Amex style: centered box)
  const bw = isAmex ? 300 : RIGHT - M;
  const bx = isAmex ? (W - bw) / 2 : M;
  const bh = 168;
  const by = 420;
  p1.rect(bx, by, bw, bh, { border: p1.black, bw: 1.1 });
  p1.rect(bx, by + bh - 22, bw, 22, { color: isAmex ? p1.ink(0.9, 0.9, 0.9) : p1.ink(0.12, 0.16, 0.22) });
  p1.text("ACCOUNT SUMMARY", bx + 10, by + bh - 15.5, F.helvB, 9, isAmex ? p1.black : p1.ink(1, 1, 1));
  const rows: [string, Cents | null, string][] = [
    ["Previous Balance", prevBal, ""],
    ["Payments/Credits", payments, "-"],
    ["New Charges", newCharges, "+"],
    ["Fees Charged", 0, "+"],
    ["Interest Charged", 0, "+"],
    ["New Balance", newBal, ""],
  ];
  let ry = by + bh - 42;
  for (let i = 0; i < rows.length; i++) {
    const [k, v, sign] = rows[i];
    const bold = i === 0 || i === rows.length - 1;
    p1.text(k, bx + 12, ry, bold ? F.helvB : F.helv, 9);
    p1.textRight(`${sign}$${fmt(v!)}`, bx + bw - 12, ry, bold ? F.courB : F.cour, 9.5);
    if (i === rows.length - 2) p1.hline(bx + 12, bx + bw - 12, ry - 7, 0.6, p1.gray);
    ry -= 21;
  }
  // minimum payment strip
  p1.text(`Minimum Payment Due:  $${fmt(minDue)}`, bx, by - 20, F.helvB, 9);
  p1.textRight(`Payment Due Date:  ${slashDate(dueDate)}`, bx + bw, by - 20, F.helvB, 9);

  // payments / new charges section recap (Amex/Chase style)
  const secY = 350;
  p1.text("PAYMENTS AND CREDITS", M, secY, F.helvB, 8.5);
  p1.hline(M, RIGHT, secY - 5, 0.8);
  p1.text(`Total Payments and Credits (${d.creditCount})`, M, secY - 20, F.helv, 8.5);
  p1.textRight(`-$${fmt(payments)}`, RIGHT, secY - 20, F.cour, 8.5);
  p1.text("NEW CHARGES", M, secY - 46, F.helvB, 8.5);
  p1.hline(M, RIGHT, secY - 51, 0.8);
  p1.text(`Total New Charges (${d.debitCount}) — detail begins on page 2`, M, secY - 66, F.helv, 8.5);
  p1.textRight(`$${fmt(newCharges)}`, RIGHT, secY - 66, F.cour, 8.5);

  const legal = isAmex
    ? "Pay by computer at americanexpress.com/pbc. Please refer to the important notices section. " +
      "The Platinum Card® from American Express. Account terms subject to the Cardmember Agreement."
    : "Chase Sapphire Reserve®. For questions call the number on the back of your card. " +
      "See your Cardmember Agreement for terms. Purchase APR and fees disclosed at account opening.";
  wrapText(p1, F.helv, 7, legal, M, 226, RIGHT - M, 9.5, p1.gray);
  statementFooter(p1, F, d, 1, pageCount, brand);
  p1.finish(rng);

  for (let pg = 2; pg <= pageCount; pg++) {
    const sh = new Sheet(pdf, scanned, angle);
    const rows = d.txns.filter((t) => t.doc.page === pg);
    tablePage(sh, F, d, brand, pg, pageCount, rows, "card");
    if (pg === pageCount) {
      const lastY = ROW0_Y - Math.max(...rows.map((t) => t.doc.line)) * ROW_H;
      sh.hline(M, RIGHT, lastY + 10, 0.6);
      sh.text("NEW BALANCE", M + 62, lastY - 4, F.helvB, 8);
      sh.textRight("$" + fmt(newBal), RIGHT, lastY - 4, F.courB, 8.5);
    }
    statementFooter(sh, F, d, pg, pageCount, brand);
    sh.finish(rng);
  }
  return pageCount;
}

// ---------------------------------------------------------------------------
// Brokerage quarterly (Fidelity)
// ---------------------------------------------------------------------------

const HOLDINGS: [string, string, number, number][] = [
  // [symbol, description, weight (bp of ending value), unit price cents]
  ["FXAIX", "FIDELITY 500 INDEX FUND", 3600, 18642],
  ["FCNTX", "FIDELITY CONTRAFUND", 2200, 1571],
  ["VTI", "VANGUARD TOTAL STOCK MARKET ETF", 1500, 24810],
  ["91282CGH8", "US TREASURY NOTE 4.125% 2028", 1200, 9931],
  ["AAPL", "APPLE INC COM", 700, 18915],
];

function renderBrokerage(pdf: PDFDocument, F: Fonts, d: StmtData, rng: RNG, angle: number): number {
  const brand = BRANDS[d.account.institution];
  const pageCount = 1 + d.tablePages;
  const p1 = new Sheet(pdf, false, 0);

  masthead(p1, F, brand, "Brokerage Account  ·  INVESTMENT REPORT");
  addressAndPeriod(p1, F, d, pageCount, H - 118);
  p1.text(`Account Z40-118226  ·  ${longDate(d.doc.periodStart!)} - ${longDate(d.doc.periodEnd!)}`, M, H - 168, F.helvB, 10);

  // account value box
  const by = 540, bh = 96, bw = RIGHT - M;
  p1.rect(M, by, bw, bh, { border: p1.black, bw: 1 });
  p1.rect(M, by + bh - 20, bw, 20, { color: p1.ink(0.85, 0.91, 0.85) });
  p1.text("ACCOUNT VALUE SUMMARY", M + 10, by + bh - 14, F.helvB, 8.5);
  const net = d.credits - d.debits;
  const vals: [string, string][] = [
    ["Beginning Account Value", "$ " + fmt(d.begin)],
    [`Additions (${d.creditCount})`, "$ " + fmt(d.credits)],
    [`Subtractions (${d.debitCount})`, "-$ " + fmt(d.debits)],
    ["Ending Account Value", "$ " + fmt(d.end)],
  ];
  let ry = by + bh - 36;
  for (let i = 0; i < vals.length; i++) {
    p1.text(vals[i][0], M + 10, ry, i === 3 ? F.helvB : F.helv, 8.5);
    p1.textRight(vals[i][1], RIGHT - 10, ry, i === 3 ? F.courB : F.cour, 9);
    if (i === 2) p1.hline(M + 10, RIGHT - 10, ry - 6, 0.6, p1.gray);
    ry -= 18;
  }
  void net;

  // holdings
  p1.text("HOLDINGS AS OF " + slashDate(d.doc.periodEnd!), M, 486, F.helvB, 8.5);
  p1.hline(M, RIGHT, 480, 0.8);
  p1.text("SYMBOL / CUSIP", M, 468, F.helvB, 7, p1.gray);
  p1.text("DESCRIPTION", M + 110, 468, F.helvB, 7, p1.gray);
  p1.textRight("QUANTITY", 430, 468, F.helvB, 7, p1.gray);
  p1.textRight("PRICE ($)", 496, 468, F.helvB, 7, p1.gray);
  p1.textRight("MKT VALUE ($)", RIGHT, 468, F.helvB, 7, p1.gray);
  p1.hline(M, RIGHT, 463, 0.5, p1.gray);
  let hy = 448;
  let allocated = 0;
  for (const [sym, desc, bp, price] of HOLDINGS) {
    const value = Math.round((d.end * bp) / 10000 / 100) * 100;
    allocated += value;
    const qty = (value / price).toFixed(3);
    p1.text(sym, M, hy, F.cour, 8);
    p1.text(desc, M + 110, hy, F.helv, 8);
    p1.textRight(qty, 430, hy, F.cour, 8);
    p1.textRight(fmt(price), 496, hy, F.cour, 8);
    p1.textRight(fmt(value), RIGHT, hy, F.cour, 8);
    hy -= 16;
  }
  const cash = d.end - allocated;
  p1.text("FDRXX", M, hy, F.cour, 8);
  p1.text("FIDELITY GOVT CASH RESERVES (CORE)", M + 110, hy, F.helv, 8);
  p1.textRight((cash / 100).toFixed(3), 430, hy, F.cour, 8);
  p1.textRight("1.00", 496, hy, F.cour, 8);
  p1.textRight(fmt(cash), RIGHT, hy, F.cour, 8);
  hy -= 10;
  p1.hline(M, RIGHT, hy, 0.6);
  hy -= 14;
  p1.text("TOTAL ACCOUNT VALUE", M + 110, hy, F.helvB, 8);
  p1.textRight(fmt(d.end), RIGHT, hy, F.courB, 8.5);

  wrapText(
    p1, F.helv, 7,
    "Brokerage services provided by Fidelity Brokerage Services LLC, Member NYSE, SIPC. Investment products: " +
    "Not FDIC insured, no bank guarantee, may lose value. Please review this statement and report any inaccuracy promptly.",
    M, 130, RIGHT - M, 9.5, p1.gray,
  );
  statementFooter(p1, F, d, 1, pageCount, brand);
  p1.finish(rng);

  for (let pg = 2; pg <= pageCount; pg++) {
    const sh = new Sheet(pdf, false, 0);
    const rows = d.txns.filter((t) => t.doc.page === pg);
    tablePage(sh, F, d, brand, pg, pageCount, rows, "brokerage");
    statementFooter(sh, F, d, pg, pageCount, brand);
    sh.finish(rng);
  }
  return pageCount;
}

// ---------------------------------------------------------------------------
// Form 1040 summary (2 pages)
// ---------------------------------------------------------------------------

const STD_DEDUCTION: Record<number, Cents> = { 2022: 2590000, 2023: 2770000, 2024: 2920000 };
const INTEREST_1040: Record<number, Cents> = { 2022: 184200, 2023: 221500, 2024: 264000 };
const DIVIDENDS_1040: Record<number, Cents> = { 2022: 618000, 2023: 690500, 2024: 741000 };

function lineRow(sh: Sheet, F: Fonts, no: string, label: string, y: number, value: Cents | null, bold = false) {
  sh.text(no, M + 4, y, F.helvB, 8);
  sh.text(label, M + 30, y, bold ? F.helvB : F.helv, 8.5);
  // dotted leader
  sh.hline(M + 30 + F.helv.widthOfTextAtSize(safe(label), 8.5) + 8, 440, y + 2, 0.4, sh.ink(0.65, 0.63, 0.58));
  sh.rect(448, y - 4, RIGHT - 448, 14, { border: sh.black, bw: 0.7 });
  if (value !== null) sh.textRight(fmt(value), RIGHT - 6, y, bold ? F.courB : F.cour, 8.5);
}

function render1040(pdf: PDFDocument, F: Fonts, doc: CaseDocument): number {
  const year = Number(doc.id.slice(-4));
  const rep = caseFile.reported.find((r) => r.year === year)!;
  const interest = INTEREST_1040[year];
  const dividends = DIVIDENDS_1040[year];
  const wages = rep.reportedIncome - interest - dividends;
  const adjustments = rep.reportedIncome - rep.agi;
  const std = STD_DEDUCTION[year];
  const taxable = rep.agi - std;

  // ---- page 1 ----
  const p1 = new Sheet(pdf, false, 0);
  p1.rect(M, H - 92, RIGHT - M, 44, { border: p1.black, bw: 1.2 });
  p1.text("Form", M + 6, H - 62, F.helv, 7);
  p1.text("1040", M + 6, H - 82, F.helvB, 20);
  p1.text("Department of the Treasury — Internal Revenue Service", M + 84, H - 58, F.helv, 6.5);
  p1.text("U.S. Individual Income Tax Return", M + 84, H - 72, F.helvB, 11);
  p1.text(String(year), M + 84, H - 86, F.helvB, 12);
  p1.textRight("OMB No. 1545-0074  ·  IRS Use Only", RIGHT - 6, H - 62, F.helv, 6.5, p1.gray);

  // filing status
  let y = H - 112;
  p1.text("Filing Status:", M, y, F.helvB, 8.5);
  const statuses = ["Single", "Married filing jointly", "Married filing separately", "Head of household"];
  let sx = M + 70;
  for (const s of statuses) {
    p1.rect(sx, y - 2, 8, 8, { border: p1.black, bw: 0.8 });
    if (s === rep.filingStatus) p1.text("X", sx + 1.5, y - 0.5, F.helvB, 7.5);
    p1.text(s, sx + 12, y, F.helv, 8);
    sx += 12 + F.helv.widthOfTextAtSize(s, 8) + 22;
  }

  // name / ssn grid
  y -= 26;
  p1.rect(M, y - 34, RIGHT - M, 34, { border: p1.black, bw: 0.8 });
  p1.hline(M, RIGHT, y - 17, 0.5, p1.gray);
  p1.text("Your first name and middle initial / Last name", M + 4, y - 8, F.helv, 6, p1.gray);
  p1.text("Marcus T.  Delaney", M + 8, y - 14.5, F.helvB, 9);
  p1.text("Your social security number", 436, y - 8, F.helv, 6, p1.gray);
  p1.text("XXX-XX-4471", 440, y - 14.5, F.cour, 8.5);
  p1.text("Spouse's first name and middle initial / Last name", M + 4, y - 25, F.helv, 6, p1.gray);
  p1.text("Sarah W.  Delaney", M + 8, y - 31.5, F.helvB, 9);
  p1.text("Spouse's social security number", 436, y - 25, F.helv, 6, p1.gray);
  p1.text("XXX-XX-8836", 440, y - 31.5, F.cour, 8.5);
  y -= 48;
  p1.text("Home address:  5614 Longmont Dr, Houston, TX 77056", M, y, F.helv, 8.5);
  y -= 14;
  p1.text("Dependents:  (2)  W. Delaney, minor child  ·  H. Delaney, minor child", M, y, F.helv, 8, p1.gray);

  // income section
  y -= 28;
  p1.rect(M, y - 2, RIGHT - M, 16, { color: p1.ink(0.9, 0.88, 0.83) });
  p1.text("INCOME", M + 6, y + 2, F.helvB, 9);
  y -= 24;
  const lines: [string, string, Cents | null, boolean][] = [
    ["1a", "Total amount from Form(s) W-2, box 1 (wages, salaries, tips)", wages, false],
    ["2b", "Taxable interest", interest, false],
    ["3b", "Ordinary dividends", dividends, false],
    ["4b", "IRA distributions — taxable amount", 0, false],
    ["7", "Capital gain or (loss)", 0, false],
    ["8", "Additional income from Schedule 1, line 10", 0, false],
    ["9", "Total income. Add lines 1a through 8", rep.reportedIncome, true],
    ["10", "Adjustments to income from Schedule 1, line 26", adjustments, false],
    ["11", "Adjusted gross income. Subtract line 10 from line 9", rep.agi, true],
  ];
  for (const [no, label, v, bold] of lines) {
    lineRow(p1, F, no, label, y, v, bold);
    y -= 22;
  }
  y -= 8;
  p1.hline(M, RIGHT, y, 0.7);
  p1.text("For Disclosure, Privacy Act, and Paperwork Reduction Act Notice, see separate instructions.", M, 64, F.helv, 6.5, p1.gray);
  p1.textRight(`Form 1040 (${year})  ·  Page 1`, RIGHT, 64, F.helv, 6.5, p1.gray);

  // ---- page 2 ----
  const p2 = new Sheet(pdf, false, 0);
  p2.text(`Form 1040 (${year})`, M, H - 56, F.helvB, 9);
  p2.textRight("Marcus T. & Sarah W. Delaney   ·   XXX-XX-4471", RIGHT, H - 56, F.helv, 8);
  p2.hline(M, RIGHT, H - 62, 1);
  let y2 = H - 92;
  p2.rect(M, y2 - 2, RIGHT - M, 16, { color: p2.ink(0.9, 0.88, 0.83) });
  p2.text("TAX AND CREDITS", M + 6, y2 + 2, F.helvB, 9);
  y2 -= 24;
  const withheld = Math.round(rep.federalTax * 0.94 / 100) * 100;
  const owed = rep.federalTax - withheld;
  const lines2: [string, string, Cents, boolean][] = [
    ["12", "Standard deduction or itemized deductions (from Schedule A)", std, false],
    ["13", "Qualified business income deduction", 0, false],
    ["14", "Add lines 12 and 13", std, false],
    ["15", "Taxable income. Subtract line 14 from line 11", taxable, true],
    ["16", "Tax (see instructions)", rep.federalTax, true],
    ["22", "Subtract Schedule 3 credits from line 16", rep.federalTax, false],
    ["24", "Total tax", rep.federalTax, true],
    ["25", "Federal income tax withheld", withheld, false],
    ["33", "Total payments", withheld, false],
    ["37", "Amount you owe", owed, true],
  ];
  for (const [no, label, v, bold] of lines2) {
    lineRow(p2, F, no, label, y2, v, bold);
    y2 -= 22;
  }
  y2 -= 20;
  p2.rect(M, y2 - 2, RIGHT - M, 16, { color: p2.ink(0.9, 0.88, 0.83) });
  p2.text("SIGN HERE", M + 6, y2 + 2, F.helvB, 9);
  y2 -= 34;
  p2.text("Marcus T. Delaney", M + 10, y2, F.timesI, 15);
  p2.hline(M, 280, y2 - 4, 0.7);
  p2.text("Your signature", M, y2 - 14, F.helv, 6.5, p2.gray);
  p2.text(`Date: 04/${year === 2022 ? "12" : year === 2023 ? "09" : "11"}/${year + 1}`, 300, y2, F.helv, 8);
  p2.text("Occupation: HVAC Contractor", 400, y2, F.helv, 8);
  y2 -= 34;
  p2.text("Sarah W. Delaney", M + 10, y2, F.timesI, 15);
  p2.hline(M, 280, y2 - 4, 0.7);
  p2.text("Spouse's signature", M, y2 - 14, F.helv, 6.5, p2.gray);
  p2.text("Occupation: Homemaker", 400, y2, F.helv, 8);
  y2 -= 40;
  p2.text("Paid Preparer:  R. Okafor CPA, Bellaire TX  ·  PTIN PXXXXXX41", M, y2, F.helv, 8, p2.gray);
  p2.textRight(`Form 1040 (${year})  ·  Page 2`, RIGHT, 64, F.helv, 6.5, p2.gray);

  return 2;
}

// ---------------------------------------------------------------------------
// TX SOS Certificate of Formation — Bluebonnet Holdings LLC
// ---------------------------------------------------------------------------

function drawStateSeal(sh: Sheet, cx: number, cy: number, F: Fonts) {
  const c = sh.black;
  sh.page.drawCircle({ x: cx, y: cy, size: 34, borderColor: c, borderWidth: 1.6 });
  sh.page.drawCircle({ x: cx, y: cy, size: 27, borderColor: c, borderWidth: 0.8 });
  // five-pointed star
  const R = 15, r = 6;
  let d = "";
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + rad * Math.cos(a);
    const py = cy + rad * Math.sin(a);
    d += (i === 0 ? "M" : "L") + px.toFixed(1) + " " + (H - py).toFixed(1) + " ";
  }
  d += "Z";
  sh.page.drawSvgPath(d, { x: 0, y: H, borderColor: c, borderWidth: 1, color: undefined });
  sh.textCenter("THE STATE", cx, cy + 40, F.timesB, 5.5);
  sh.textCenter("OF TEXAS", cx, cy - 46, F.timesB, 5.5);
}

function renderFormation(pdf: PDFDocument, F: Fonts, rng: RNG, angle: number): number {
  // ---- page 1: Certificate of Filing ----
  const p1 = new Sheet(pdf, true, angle);
  p1.text("Corporations Section", M, H - 60, F.timesB, 10);
  p1.text("P.O. Box 13697", M, H - 73, F.times, 9);
  p1.text("Austin, Texas 78711-3697", M, H - 85, F.times, 9);
  drawStateSeal(p1, W - 110, H - 92, F);
  p1.textCenter("Office of the Secretary of State", W / 2, H - 150, F.timesB, 13);
  p1.hline(M, RIGHT, H - 162, 1);

  // file stamp
  const stampX = 396, stampY = H - 250;
  p1.rect(stampX, stampY, 168, 58, { border: p1.black, bw: 1.2 });
  p1.textCenter("FILED", stampX + 84, stampY + 44, F.timesB, 10);
  p1.textCenter("In the Office of the", stampX + 84, stampY + 33, F.times, 7);
  p1.textCenter("Secretary of State of Texas", stampX + 84, stampY + 24, F.times, 7);
  p1.textCenter("MAR 14 2023", stampX + 84, stampY + 10, F.timesB, 11);

  let y = H - 210;
  p1.textCenter("CERTIFICATE OF FILING", W / 2, y, F.timesB, 13);
  y -= 16;
  p1.textCenter("OF", W / 2, y, F.times, 10);
  y -= 20;
  p1.textCenter("BLUEBONNET HOLDINGS LLC", W / 2, y, F.timesB, 12);
  y -= 16;
  p1.textCenter("Filing Number: 805221947", W / 2, y, F.times, 10);
  y -= 36;
  y = wrapText(
    p1, F.times, 10,
    "The undersigned, as Secretary of State of Texas, hereby certifies that a Certificate of Formation for the " +
    "above named Domestic Limited Liability Company (LLC) has been received in this office and has been found to " +
    "conform to the applicable provisions of law.",
    M + 20, y, RIGHT - M - 40, 14,
  );
  y -= 8;
  y = wrapText(
    p1, F.times, 10,
    "ACCORDINGLY, the undersigned, as Secretary of State, and by virtue of the authority vested in the secretary by " +
    "law, hereby issues this certificate evidencing filing effective on the date shown below. The issuance of this " +
    "certificate does not authorize the use of a name in this state in violation of the rights of another under the " +
    "federal Trademark Act of 1946, the Texas trademark law, the Assumed Business or Professional Name Act, or the " +
    "common law.",
    M + 20, y, RIGHT - M - 40, 14,
  );
  y -= 24;
  p1.text("Dated:  03/14/2023", M + 20, y, F.times, 10);
  y -= 14;
  p1.text("Effective:  03/14/2023", M + 20, y, F.times, 10);
  y -= 60;
  p1.text("Jane Nelson", 380, y + 22, F.timesI, 17);
  p1.hline(360, 540, y + 14, 0.7);
  p1.textCenter("Jane Nelson", 450, y + 2, F.times, 9);
  p1.textCenter("Secretary of State", 450, y - 9, F.times, 9);
  p1.text("Phone: (512) 463-5555   Fax: (512) 463-5709   Dial: 7-1-1 for Relay Services", M, 72, F.times, 7.5, p1.gray);
  p1.text("Document: 471002980002  ·  Prepared by: SOS-DIRECT", M, 60, F.times, 7.5, p1.gray);
  p1.finish(rng);

  // ---- page 2: Form 205 summary ----
  const p2 = new Sheet(pdf, true, angle);
  p2.text("Form 205 — Certificate of Formation, Limited Liability Company", M, H - 60, F.timesB, 11);
  p2.text("Filing Number: 805221947    ·    Filed: MAR 14 2023", M, H - 76, F.times, 9);
  p2.hline(M, RIGHT, H - 84, 1);
  let y2 = H - 112;
  const items: [string, string][] = [
    ["Article 1 — Entity Name and Type",
      "The filing entity being formed is a limited liability company. The name of the entity is: BLUEBONNET HOLDINGS LLC."],
    ["Article 2 — Registered Agent and Registered Office",
      "The initial registered agent is an individual resident of the state whose name is: Marcus T. Delaney. " +
      "The business address of the registered agent and the registered office address is: 5614 Longmont Dr, Houston, TX 77056."],
    ["Article 3 — Governing Authority",
      "The limited liability company will not have managers. The company will be governed by its members, and the name " +
      "and address of the initial member is: Marcus T. Delaney, 5614 Longmont Dr, Houston, TX 77056."],
    ["Article 4 — Purpose",
      "The purpose for which the company is organized is for the transaction of any and all lawful business for which " +
      "limited liability companies may be organized under the Texas Business Organizations Code."],
    ["Effectiveness of Filing",
      "This document becomes effective when the document is filed by the secretary of state."],
    ["Execution",
      "The undersigned affirms that the person designated as registered agent has consented to the appointment. The " +
      "undersigned signs this document subject to the penalties imposed by law for the submission of a materially false " +
      "or fraudulent instrument. Signature of organizer: Marcus T. Delaney — Date: March 13, 2023."],
  ];
  for (const [head, body] of items) {
    p2.text(head, M, y2, F.timesB, 10);
    y2 -= 15;
    y2 = wrapText(p2, F.times, 9.5, body, M + 14, y2, RIGHT - M - 24, 13);
    y2 -= 10;
  }
  p2.text("Marcus T. Delaney", M + 20, y2 - 8, F.timesI, 15);
  p2.hline(M + 10, 260, y2 - 14, 0.7);
  p2.text("Signature of Organizer", M + 10, y2 - 24, F.times, 8, p2.gray);
  p2.text("FILED — Office of the Secretary of State of Texas — Filing #805221947", M, 60, F.times, 7.5, p2.gray);
  p2.finish(rng);
  return 2;
}

// ---------------------------------------------------------------------------
// ALTA settlement statement — Galveston closing
// ---------------------------------------------------------------------------

const CLOSING_CHARGES: [string, Cents][] = [
  ["Owner's Title Insurance Policy (Gulf Coast Title Co.)", 241200],
  ["Escrow / Settlement Fee", 95000],
  ["Recording Fees — Galveston County Clerk", 18600],
  ["HOA Transfer & Resale Certificate — Seawall Crest COA", 35000],
  ["Tax Proration (01/01/2023 - 08/18/2023, credit to seller)", 30200],
];

function renderClosing(pdf: PDFDocument, F: Fonts, rng: RNG, angle: number): number {
  const scanned = docById.get("galveston-closing")!.scanned;
  const p1 = new Sheet(pdf, scanned, angle);
  // header
  p1.rect(0, H - 66, W, 66, { color: p1.ink(0.13, 0.3, 0.45) });
  p1.text("GULF COAST TITLE CO.", M, H - 40, F.timesB, 17, p1.ink(1, 1, 1));
  p1.text("2402 Strand St, Suite 300, Galveston, Texas 77550  ·  (409) 555-0144", M, H - 56, F.times, 8, p1.ink(0.88, 0.9, 0.92));
  p1.textRight("ALTA SETTLEMENT STATEMENT", RIGHT, H - 40, F.timesB, 10, p1.ink(1, 1, 1));
  p1.textRight("Borrower / Buyer — Final", RIGHT, H - 54, F.times, 8, p1.ink(0.88, 0.9, 0.92));

  let y = H - 92;
  const meta: [string, string][] = [
    ["File No. / Escrow No.", "GCT-2023-08412"],
    ["Settlement Date", "August 18, 2023"],
    ["Disbursement Date", "August 18, 2023"],
    ["Property", "4210 Seawall Blvd Unit 502, Galveston, TX 77550"],
    ["Buyer", "Bluebonnet Holdings LLC, 5614 Longmont Dr, Houston, TX 77056"],
    ["Seller", "Shoreline Ventures LLC, 1800 Harborside Dr, Galveston, TX 77550"],
    ["Settlement Agent", "Gulf Coast Title Co.  ·  Escrow Officer: D. Marchetti"],
  ];
  for (const [k, v] of meta) {
    p1.text(k, M, y, F.timesB, 9);
    p1.text(v, M + 150, y, F.times, 9);
    y -= 14;
  }
  y -= 10;
  p1.hline(M, RIGHT, y + 4, 1.2);

  // two-column table: Description | Debit | Credit (borrower)
  y -= 14;
  p1.text("DESCRIPTION", M, y, F.timesB, 8.5);
  p1.textRight("BORROWER DEBIT ($)", 470, y, F.timesB, 8.5);
  p1.textRight("BORROWER CREDIT ($)", RIGHT, y, F.timesB, 8.5);
  y -= 6;
  p1.hline(M, RIGHT, y, 0.7);
  y -= 18;

  const row = (label: string, debit: Cents | null, credit: Cents | null, bold = false) => {
    p1.text(label, M, y, bold ? F.timesB : F.times, 9.5);
    if (debit !== null) p1.textRight(fmt(debit), 470, y, bold ? F.courB : F.cour, 9);
    if (credit !== null) p1.textRight(fmt(credit), RIGHT, y, bold ? F.courB : F.cour, 9);
    y -= 18;
  };

  p1.text("FINANCIAL", M, y, F.timesB, 9, p1.gray); y -= 16;
  row("Sales / Contract Price", 38500000, null);
  row("Seller Financing — Carry-Back Note to Shoreline Ventures LLC", null, 20000000);
  row("   (Promissory note dated 08/18/2023, secured by vendor's lien)", null, null);
  y -= 4;
  p1.text("TITLE & SETTLEMENT CHARGES", M, y, F.timesB, 9, p1.gray); y -= 16;
  let charges = 0;
  for (const [label, amt] of CLOSING_CHARGES) {
    row(label, amt, null);
    charges += amt;
  }
  y -= 2;
  p1.hline(M, RIGHT, y + 10, 0.6);
  row("Subtotal — Settlement Charges & Prorations", charges, null);
  y -= 4;
  p1.hline(M, RIGHT, y + 10, 0.8);
  row("Subtotals", 38500000 + charges, 20000000, true);
  row("Cash Due FROM Borrower at Closing", null, 18920000, true);
  p1.hline(M, RIGHT, y + 10, 0.8);
  row("TOTALS", 38500000 + charges, 20000000 + 18920000, true);

  y -= 12;
  wrapText(
    p1, F.times, 8,
    "Funds received: incoming federal wire in the amount of $385,000.00 received 08/18/2023 from PROSPERITY BANK N.A. " +
    "for the account of BLUEBONNET HOLDINGS LLC ····9174, applied $185,000.00 to down payment and $4,200.00 to settlement " +
    "charges and prorations; the balance of the purchase price is carried by the seller note described above. Down payment " +
    "plus settlement charges equals cash due from borrower of $189,200.00.",
    M, y, RIGHT - M, 11, p1.gray,
  );
  p1.text("Page 1 of 2  ·  File GCT-2023-08412", M, 54, F.times, 7.5, p1.gray);
  p1.finish(rng);

  // page 2 — acknowledgment & signatures
  const p2 = new Sheet(pdf, scanned, angle);
  p2.text("GULF COAST TITLE CO.  ·  ALTA SETTLEMENT STATEMENT  ·  File GCT-2023-08412", M, H - 56, F.timesB, 10);
  p2.hline(M, RIGHT, H - 64, 1);
  let y2 = H - 96;
  y2 = wrapText(
    p2, F.times, 10,
    "Acknowledgment. We/I have carefully reviewed the ALTA Settlement Statement and find it to be a true and accurate " +
    "statement of all receipts and disbursements made on my account or by me in this transaction and further certify " +
    "that I have received a copy of the ALTA Settlement Statement. We/I authorize Gulf Coast Title Co. to cause the " +
    "funds to be disbursed in accordance with this statement.",
    M, y2, RIGHT - M, 14,
  );
  y2 -= 40;
  p2.text("BUYER:  BLUEBONNET HOLDINGS LLC", M, y2, F.timesB, 10);
  y2 -= 36;
  p2.text("Marcus T. Delaney", M + 12, y2, F.timesI, 16);
  p2.hline(M, 300, y2 - 5, 0.7);
  p2.text("By: Marcus T. Delaney, Sole Member  ·  Date: 08/18/2023", M, y2 - 16, F.times, 8.5, p2.gray);
  y2 -= 52;
  p2.text("SELLER:  SHORELINE VENTURES LLC", M, y2, F.timesB, 10);
  y2 -= 36;
  p2.text("A. Reyes", M + 12, y2, F.timesI, 16);
  p2.hline(M, 300, y2 - 5, 0.7);
  p2.text("By: Antonio Reyes, Manager  ·  Date: 08/18/2023", M, y2 - 16, F.times, 8.5, p2.gray);
  y2 -= 52;
  p2.text("SETTLEMENT AGENT:  GULF COAST TITLE CO.", M, y2, F.timesB, 10);
  y2 -= 36;
  p2.text("D. Marchetti", M + 12, y2, F.timesI, 16);
  p2.hline(M, 300, y2 - 5, 0.7);
  p2.text("Escrow Officer  ·  TDI License #1180244  ·  Date: 08/18/2023", M, y2 - 16, F.times, 8.5, p2.gray);
  p2.text("Page 2 of 2  ·  File GCT-2023-08412", M, 54, F.times, 7.5, p2.gray);
  p2.finish(rng);
  return 2;
}

// ---------------------------------------------------------------------------
// Executor letter — Harrell & Bonner LLP
// ---------------------------------------------------------------------------

function renderExecutorLetter(pdf: PDFDocument, F: Fonts, rng: RNG, angle: number): number {
  const p = new Sheet(pdf, true, angle);
  // engraved letterhead
  p.textCenter("L A W   O F F I C E S   O F", W / 2, H - 64, F.times, 8);
  p.textCenter("HARRELL & BONNER LLP", W / 2, H - 84, F.timesB, 17);
  p.textCenter("Attorneys and Counselors at Law", W / 2, H - 100, F.timesI, 9);
  p.textCenter("900 Congress Avenue, Suite 400  ·  Austin, Texas 78701  ·  (512) 555-0187", W / 2, H - 114, F.times, 8);
  p.hline(150, W - 150, H - 124, 0.8);
  p.hline(180, W - 180, H - 127, 0.4);

  let y = H - 160;
  p.text("June 10, 2022", M + 12, y, F.times, 10);
  y -= 30;
  p.text("Mrs. Sarah Whitmore Delaney", M + 12, y, F.times, 10); y -= 13;
  p.text("5614 Longmont Drive", M + 12, y, F.times, 10); y -= 13;
  p.text("Houston, Texas 77056", M + 12, y, F.times, 10); y -= 28;
  p.text("Re:  Estate of Margaret H. Whitmore, Deceased", M + 12, y, F.timesB, 10); y -= 13;
  p.text("      Cause No. PR-41,882 — Probate Court No. 1, Travis County, Texas", M + 12, y, F.times, 10); y -= 26;
  p.text("Dear Mrs. Delaney:", M + 12, y, F.times, 10.5); y -= 20;

  const paras = [
    "This firm represents the Independent Executor of the Estate of Margaret H. Whitmore, your late mother. " +
    "The Court admitted the decedent's Last Will and Testament to probate on March 22, 2022, and the period for " +
    "the presentment of claims has now closed.",
    "In accordance with Article IV of the Will, the Executor has authorized a partial distribution to you, as " +
    "beneficiary, in the amount of TWO HUNDRED FIFTY THOUSAND AND NO/100 DOLLARS ($250,000.00). These funds " +
    "constitute a distribution of your inheritance from the Estate and are your sole and separate property under " +
    "Texas Family Code § 3.001.",
    "The distribution will be remitted by wire transfer on or about June 15, 2022 to the account you have designated " +
    "at Frost Bank. Please retain this letter with your records; we recommend that inherited funds be maintained in a " +
    "segregated account to preserve their separate character.",
    "Should you have any questions concerning the administration of the Estate, or the final distribution which we " +
    "anticipate before year end, please do not hesitate to contact the undersigned.",
  ];
  for (const para of paras) {
    y = wrapText(p, F.times, 10, para, M + 12, y, RIGHT - M - 24, 14);
    y -= 8;
  }
  y -= 14;
  p.text("Very truly yours,", M + 12, y, F.times, 10);
  y -= 44;
  p.text("R. Clayton Bonner", M + 24, y + 10, F.timesI, 21);
  p.hline(M + 12, 280, y, 0.7);
  p.text("R. Clayton Bonner", M + 12, y - 12, F.times, 9.5);
  p.text("Harrell & Bonner LLP — Counsel for the Independent Executor", M + 12, y - 24, F.times, 8.5, p.gray);
  p.text("RCB/lm  ·  Enclosure: Distribution Statement", M + 12, 72, F.times, 8, p.gray);
  p.finish(rng);
  return 1;
}

// ---------------------------------------------------------------------------
// Warranty deed — Galveston
// ---------------------------------------------------------------------------

function renderDeed(pdf: PDFDocument, F: Fonts, rng: RNG, angle: number): number {
  const p1 = new Sheet(pdf, true, angle);
  p1.text("NOTICE OF CONFIDENTIALITY RIGHTS: IF YOU ARE A NATURAL PERSON, YOU MAY REMOVE OR STRIKE", M, H - 52, F.times, 7);
  p1.text("ANY OR ALL OF THE FOLLOWING INFORMATION FROM ANY INSTRUMENT THAT TRANSFERS AN INTEREST IN", M, H - 61, F.times, 7);
  p1.text("REAL PROPERTY BEFORE IT IS FILED FOR RECORD IN THE PUBLIC RECORDS: YOUR SOCIAL SECURITY", M, H - 70, F.times, 7);
  p1.text("NUMBER OR YOUR DRIVER'S LICENSE NUMBER.", M, H - 79, F.times, 7);
  p1.textCenter("WARRANTY DEED WITH VENDOR'S LIEN", W / 2, H - 112, F.timesB, 14);
  p1.hline(180, W - 180, H - 120, 0.8);

  let y = H - 148;
  const kv: [string, string][] = [
    ["Date:", "August 18, 2023"],
    ["Grantor:", "SHORELINE VENTURES LLC, a Texas limited liability company"],
    ["Grantee:", "BLUEBONNET HOLDINGS LLC, a Texas limited liability company"],
    ["Grantee's Mailing Address:", "5614 Longmont Dr, Houston, Harris County, Texas 77056"],
  ];
  for (const [k, v] of kv) {
    p1.text(k, M, y, F.timesB, 10);
    y = wrapText(p1, F.times, 10, v, M + 150, y, RIGHT - M - 160, 13);
    y -= 4;
  }
  y -= 6;
  p1.text("Consideration:", M, y, F.timesB, 10);
  y = wrapText(
    p1, F.times, 10,
    "TEN AND NO/100 DOLLARS ($10.00) cash and other good and valuable consideration, and a note of even date " +
    "executed by Grantee and payable to the order of Grantor in the principal amount of TWO HUNDRED THOUSAND AND " +
    "NO/100 DOLLARS ($200,000.00). The note is secured by a vendor's lien retained in this deed and by a deed of " +
    "trust of even date from Grantee to Rebecca L. Salinas, trustee.",
    M + 150, y, RIGHT - M - 160, 13,
  );
  y -= 10;
  p1.text("Property (including any improvements):", M, y, F.timesB, 10);
  y -= 15;
  y = wrapText(
    p1, F.times, 10,
    "Unit 502, Building A, of SEAWALL CREST CONDOMINIUMS, a condominium project in Galveston County, Texas, " +
    "together with the undivided interest in the common elements appurtenant thereto, according to the Condominium " +
    "Declaration recorded in Volume 2018-14, Page 221 et seq., Official Public Records of Galveston County, Texas; " +
    "commonly known as 4210 Seawall Blvd Unit 502, Galveston, Texas 77550.",
    M + 14, y, RIGHT - M - 28, 13,
  );
  y -= 10;
  y = wrapText(
    p1, F.times, 10,
    "Grantor, for the consideration and subject to the reservations from conveyance and the exceptions to conveyance " +
    "and warranty, grants, sells, and conveys to Grantee the property, together with all and singular the rights and " +
    "appurtenances thereto in any way belonging, to have and to hold it to Grantee and Grantee's successors and " +
    "assigns forever. Grantor binds Grantor and Grantor's successors to warrant and forever defend all and singular " +
    "the property to Grantee and Grantee's successors and assigns against every person whomsoever lawfully claiming " +
    "or to claim the same or any part thereof, except as to the reservations from conveyance and the exceptions to " +
    "conveyance and warranty.",
    M, y, RIGHT - M, 13,
  );
  y -= 10;
  wrapText(
    p1, F.times, 10,
    "The vendor's lien against and superior title to the property are retained until each note described is fully paid " +
    "according to its terms, at which time this deed will become absolute.",
    M, y, RIGHT - M, 13,
  );
  p1.text("Page 1 of 2", M, 54, F.times, 7.5, p1.gray);
  p1.finish(rng);

  // page 2 — execution, notary, recording stamp
  const p2 = new Sheet(pdf, true, angle);
  let y2 = H - 70;
  p2.text("EXECUTED as of the date first written above.", M, y2, F.times, 10);
  y2 -= 44;
  p2.text("SHORELINE VENTURES LLC", M, y2, F.timesB, 10);
  y2 -= 40;
  p2.text("A. Reyes", M + 16, y2 + 10, F.timesI, 17);
  p2.hline(M, 300, y2, 0.7);
  p2.text("By: Antonio Reyes, Manager", M, y2 - 13, F.times, 9);
  y2 -= 52;
  p2.text("THE STATE OF TEXAS  §", M, y2, F.times, 10); y2 -= 13;
  p2.text("COUNTY OF GALVESTON  §", M, y2, F.times, 10); y2 -= 20;
  y2 = wrapText(
    p2, F.times, 10,
    "This instrument was acknowledged before me on August 18, 2023, by Antonio Reyes, Manager of Shoreline Ventures " +
    "LLC, a Texas limited liability company, on behalf of said company.",
    M, y2, RIGHT - M, 13,
  );
  y2 -= 36;
  p2.text("M. Gutierrez", M + 16, y2 + 10, F.timesI, 15);
  p2.hline(M, 280, y2, 0.7);
  p2.text("Notary Public, State of Texas  ·  Commission expires 04/2026", M, y2 - 13, F.times, 8.5, p2.gray);
  y2 -= 46;
  p2.text("AFTER RECORDING RETURN TO:", M, y2, F.timesB, 9); y2 -= 13;
  p2.text("Bluebonnet Holdings LLC, 5614 Longmont Dr, Houston, TX 77056", M, y2, F.times, 9);

  // recording stamp
  const sx = 330, sy = 120, sw = 234, sh2 = 118;
  p2.rect(sx, sy, sw, sh2, { border: p2.black, bw: 1.4 });
  p2.rect(sx + 4, sy + 4, sw - 8, sh2 - 8, { border: p2.black, bw: 0.5 });
  p2.textCenter("FILED AND RECORDED", sx + sw / 2, sy + sh2 - 22, F.timesB, 10);
  p2.textCenter("OFFICIAL PUBLIC RECORDS", sx + sw / 2, sy + sh2 - 36, F.times, 8);
  p2.textCenter("Instrument No. 2023045217", sx + sw / 2, sy + sh2 - 52, F.cour, 8.5);
  p2.textCenter("08/21/2023  10:42:18 AM", sx + sw / 2, sy + sh2 - 66, F.cour, 8.5);
  p2.textCenter("Fees: $34.00  Pages: 2", sx + sw / 2, sy + sh2 - 80, F.cour, 8);
  p2.textCenter("Dwight D. Sullivan, County Clerk", sx + sw / 2, sy + 24, F.timesB, 8.5);
  p2.textCenter("Galveston County, TEXAS", sx + sw / 2, sy + 12, F.timesB, 8.5);
  p2.text("Page 2 of 2", M, 54, F.times, 7.5, p2.gray);
  p2.finish(rng);
  return 2;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const t0 = Date.now();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const renderedPages = new Map<string, number>();
  let totalBytes = 0;
  let prosperitySeq = 0;

  for (const doc of caseFile.documents) {
    const pdf = await PDFDocument.create();
    pdf.setTitle(doc.title);
    pdf.setAuthor("LUCA — synthetic evidence for Matter 2025-0147 (demonstration data)");
    // fixed timestamps keep the corpus byte-for-byte reproducible
    pdf.setCreationDate(new Date("2025-06-02T09:00:00Z"));
    pdf.setModificationDate(new Date("2025-06-02T09:00:00Z"));
    const F: Fonts = {
      helv: await pdf.embedFont(StandardFonts.Helvetica),
      helvB: await pdf.embedFont(StandardFonts.HelveticaBold),
      times: await pdf.embedFont(StandardFonts.TimesRoman),
      timesB: await pdf.embedFont(StandardFonts.TimesRomanBold),
      timesI: await pdf.embedFont(StandardFonts.TimesRomanItalic),
      cour: await pdf.embedFont(StandardFonts.Courier),
      courB: await pdf.embedFont(StandardFonts.CourierBold),
    };
    const rng = new RNG(fnv1a("luca-doc-" + doc.id));
    // per-doc deterministic scan angle: 0.3–0.9 deg, alternating sign
    const angle = (0.3 + rng.rand() * 0.6) * (rng.rand() < 0.5 ? -1 : 1);

    let pages: number;
    const stmt = stmtByDoc.get(doc.id);
    if (stmt) {
      if (doc.kind === "card-statement") pages = renderCardStatement(pdf, F, stmt, rng, angle);
      else if (doc.kind === "brokerage-statement") pages = renderBrokerage(pdf, F, stmt, rng, angle);
      else {
        if (stmt.account.id === "prosperity-bluebonnet") prosperitySeq++;
        pages = renderBankStatement(pdf, F, stmt, rng, angle, prosperitySeq);
      }
    } else {
      switch (doc.kind) {
        case "tax-return": pages = render1040(pdf, F, doc); break;
        case "formation": pages = renderFormation(pdf, F, rng, angle); break;
        case "closing-statement": pages = renderClosing(pdf, F, rng, angle); break;
        case "letter": pages = renderExecutorLetter(pdf, F, rng, angle); break;
        case "deed": pages = renderDeed(pdf, F, rng, angle); break;
        default: throw new Error(`No renderer for document ${doc.id} (${doc.kind})`);
      }
    }

    const bytes = await pdf.save({ useObjectStreams: false });
    fs.writeFileSync(path.join(OUT_DIR, `${doc.id}.pdf`), bytes);
    totalBytes += bytes.length;
    renderedPages.set(doc.id, pages);
  }

  // Patch manifest pages to true rendered page counts. Touch nothing else.
  for (const doc of caseFile.documents) {
    doc.pages = renderedPages.get(doc.id)!;
  }
  fs.writeFileSync(CASE_PATH, JSON.stringify(caseFile));

  const totalPages = [...renderedPages.values()].reduce((a, b) => a + b, 0);
  console.log(
    `gen:docs — rendered ${renderedPages.size} PDFs, ${totalPages} pages, ` +
    `${(totalBytes / 1024 / 1024).toFixed(1)} MB in ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
