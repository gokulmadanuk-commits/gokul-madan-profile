/**
 * LUCA — evidence document tests.
 * Verifies the rendered PDF corpus in public/documents against the manifest
 * and the unified ledger in src/data/case.json.
 * Run: npx vitest run scripts/documents.test.ts   (after npm run gen:docs)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";
import type { CaseFile, Cents, Transaction } from "../src/lib/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const caseFile: CaseFile = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/case.json"), "utf8"),
);

const pdfPath = (docId: string) => path.join(ROOT, "public/documents", `${docId}.pdf`);

function fmt(cents: Cents): string {
  const v = Math.abs(cents);
  return `${Math.floor(v / 100).toLocaleString("en-US")}.${String(v % 100).padStart(2, "0")}`;
}

/** Decode the text shown on each page (pdf-lib hex-encoded WinAnsi Tj operands). */
const WINANSI: Record<string, string> = {
  "\x91": "‘", "\x92": "’", "\x93": "“", "\x94": "”", "\x95": "•", "\x96": "–", "\x97": "—",
};
async function pageTexts(file: string): Promise<{ pageCount: number; texts: string[] }> {
  const pdf = await PDFDocument.load(fs.readFileSync(file));
  const texts: string[] = [];
  for (const page of pdf.getPages()) {
    const ctx = page.node.context;
    const resolved = ctx.lookup(page.node.get(PDFName.of("Contents")));
    const streams: unknown[] = [];
    if (resolved instanceof PDFArray) {
      for (let i = 0; i < resolved.size(); i++) streams.push(ctx.lookup(resolved.get(i)));
    } else streams.push(resolved);
    let txt = "";
    for (const st of streams) {
      if (!(st instanceof PDFRawStream)) continue;
      const raw = Buffer.from(decodePDFRawStream(st).decode()).toString("latin1");
      for (const m of raw.matchAll(/<([0-9A-Fa-f]+)>\s*Tj/g)) {
        txt +=
          Buffer.from(m[1], "hex")
            .toString("latin1")
            .replace(/[\x91-\x97]/g, (ch) => WINANSI[ch] ?? ch) + "\n";
      }
    }
    texts.push(txt);
  }
  return { pageCount: pdf.getPageCount(), texts };
}

// ---------------------------------------------------------------------------
// Ledger-side statement reconstruction (same tie-out the renderer used)
// ---------------------------------------------------------------------------

const txnsByDoc = new Map<string, Transaction[]>();
for (const t of caseFile.transactions) {
  let arr = txnsByDoc.get(t.doc.docId);
  if (!arr) txnsByDoc.set(t.doc.docId, (arr = []));
  arr.push(t);
}
const beginByDoc = new Map<string, Cents>();
{
  const running = new Map<string, Cents>(
    caseFile.accounts.map((a) => [a.id, a.openingBalance]),
  );
  for (const t of caseFile.transactions) {
    if (!beginByDoc.has(t.doc.docId)) beginByDoc.set(t.doc.docId, running.get(t.accountId)!);
    running.set(t.accountId, t.balanceAfter);
  }
}
const accountById = new Map(caseFile.accounts.map((a) => [a.id, a]));

describe("evidence documents", () => {
  it("has a rendered PDF for every manifest entry", () => {
    expect(caseFile.documents.length).toBeGreaterThan(0);
    for (const d of caseFile.documents) {
      expect(d.file, d.id).toBe(`/documents/${d.id}.pdf`);
      expect(fs.existsSync(pdfPath(d.id)), `${d.id} missing on disk`).toBe(true);
      expect(fs.statSync(pdfPath(d.id)).size, `${d.id} is empty`).toBeGreaterThan(1000);
    }
  });

  it("totals at least 300 pages across the corpus", () => {
    const total = caseFile.documents.reduce((s, d) => s + d.pages, 0);
    expect(total).toBeGreaterThanOrEqual(300);
  });

  it("keeps every transaction's provenance inside its document", () => {
    const docById = new Map(caseFile.documents.map((d) => [d.id, d]));
    for (const t of caseFile.transactions) {
      const d = docById.get(t.doc.docId);
      expect(d, `txn ${t.id} references unknown doc ${t.doc.docId}`).toBeDefined();
      expect(t.doc.page, `txn ${t.id} page beyond ${d!.id} (${d!.pages}p)`).toBeLessThanOrEqual(d!.pages);
      expect(t.doc.page).toBeGreaterThanOrEqual(2); // page 1 is the summary page
      expect(t.doc.line).toBeGreaterThanOrEqual(1);
      expect(t.doc.line).toBeLessThanOrEqual(22); // 22 rows per statement page
    }
  });

  it("manifest page counts match the rendered PDFs (sample)", async () => {
    const sample = caseFile.documents.filter((_, i) => i % 23 === 0);
    for (const d of sample) {
      const { pageCount } = await pageTexts(pdfPath(d.id));
      expect(pageCount, d.id).toBe(d.pages);
    }
  });

  it("sampled statement summary figures tie exactly to the ledger", async () => {
    const statements = caseFile.documents.filter((d) => d.accountId);
    // deterministic spread across institutions + the story-critical months
    const ids = new Set<string>([
      ...statements.filter((_, i) => i % 17 === 0).map((d) => d.id),
      "frost-savings-2022-06", // $250k inheritance lands
      "prosperity-bluebonnet-2023-08", // $385k wire to Gulf Coast Title
      "frost-checking-2024-12",
      "amex-2024-12",
      "sapphire-2023-06",
      "fidelity-2024-Q4",
      "chase-biz-2023-08",
    ]);
    for (const id of ids) {
      const d = caseFile.documents.find((x) => x.id === id)!;
      expect(d, id).toBeDefined();
      const txns = txnsByDoc.get(id)!;
      expect(txns?.length, `${id} has no ledger rows`).toBeGreaterThan(0);

      const begin = beginByDoc.get(id)!;
      const end = txns[txns.length - 1].balanceAfter;
      const credits = txns.filter((t) => t.amount >= 0).reduce((s, t) => s + t.amount, 0);
      const debits = txns.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
      // the statement equation must hold in the ledger itself
      expect(begin + credits - debits, `${id} does not foot`).toBe(end);

      const isCard = accountById.get(d.accountId!)!.kind === "card";
      const { pageCount, texts } = await pageTexts(pdfPath(id));
      expect(pageCount, id).toBe(d.pages);
      const p1 = texts[0];
      // page 1 summary box shows the exact tied figures (cards show owed balances positive)
      expect(p1, `${id} begin`).toContain(fmt(isCard ? -begin : begin));
      expect(p1, `${id} end`).toContain(fmt(isCard ? -end : end));
      expect(p1, `${id} credits`).toContain(fmt(credits));
      expect(p1, `${id} debits`).toContain(fmt(debits));
      // every row sits on its manifest page with its amount
      for (const t of txns) {
        const pg = texts[t.doc.page - 1];
        expect(pg, `${id} p${t.doc.page}`).toBeDefined();
        expect(pg, `${id} txn ${t.id} amount`).toContain(fmt(t.amount));
        expect(pg, `${id} txn ${t.id} desc`).toContain(t.description.slice(0, 14));
      }
    }
  });

  it("stamps subpoenaed Prosperity statements and renders the special exhibits", async () => {
    const prosperity = await pageTexts(pdfPath("prosperity-bluebonnet-2023-08"));
    expect(prosperity.texts[0]).toContain("SUBPOENA DUCES TECUM");
    expect(prosperity.texts[0]).toContain("PRODUCED BY PROSPERITY BANK N.A.");

    const formation = await pageTexts(pdfPath("bluebonnet-formation"));
    expect(formation.texts[0]).toContain("805221947");
    expect(formation.texts[0]).toContain("MAR 14 2023");
    expect(formation.texts.join("\n")).toContain("Marcus T. Delaney");

    const closing = await pageTexts(pdfPath("galveston-closing"));
    expect(closing.texts[0]).toContain("385,000.00");
    expect(closing.texts[0]).toContain("200,000.00");
    expect(closing.texts[0]).toContain("189,200.00");
    expect(closing.texts[0]).toContain("4210 Seawall Blvd Unit 502");

    const letter = await pageTexts(pdfPath("whitmore-estate-letter"));
    expect(letter.texts[0]).toContain("HARRELL & BONNER LLP");
    expect(letter.texts[0]).toContain("$250,000.00");

    const deed = await pageTexts(pdfPath("galveston-deed"));
    expect(deed.texts.join("\n")).toContain("WARRANTY DEED WITH VENDOR'S LIEN");
    expect(deed.texts.join("\n")).toContain("FILED AND RECORDED");

    for (const r of caseFile.reported) {
      const f = await pageTexts(pdfPath(r.docId));
      expect(f.texts[0], `${r.docId} total income`).toContain(fmt(r.reportedIncome));
      expect(f.texts[0], `${r.docId} AGI`).toContain(fmt(r.agi));
      expect(f.texts[1], `${r.docId} tax`).toContain(fmt(r.federalTax));
    }
  });
});
