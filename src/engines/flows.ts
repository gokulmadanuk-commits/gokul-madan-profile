/**
 * Asset-tracing flow graph: accounts and money-moving entities as nodes,
 * aggregated fund movements as edges. Feeds the "Follow the Money" map —
 * the Bluebonnet funnel, the disguised "loan repayments", the undocumented
 * cash stream, and the Galveston cash purchase.
 */
import type { CaseFile, Cents, FlowEdge, FlowGraph, Transaction } from "../lib/types";

export const CASH_SOURCE_ID = "src-cash";
export const SIDE_JOB_SOURCE_ID = "src-side-jobs";
export const UNKNOWN_SOURCE_ID = "src-unknown";

export const LOAN_LABEL_FLAG = "Labeled 'loan repayment' — no note, no loan on the books";
export const GALVESTON_PURCHASE_FLAG =
  "4210 Seawall Blvd #502 — deed vested in Bluebonnet Holdings LLC; $200,000 seller carry-back note undisclosed";

const SYNTHETIC_LABELS: Record<string, string> = {
  [CASH_SOURCE_ID]: "Undocumented cash receipts",
  [SIDE_JOB_SOURCE_ID]: "Side-job receipts",
  [UNKNOWN_SOURCE_ID]: "Unidentified source",
  "estate-source": "Estate (bequest)",
  "gulf-coast-title": "Gulf Coast Title Co.",
};

interface EdgeAcc {
  fromId: string;
  toId: string;
  inflow: Cents; // sum of positive legs
  outflow: Cents; // sum of |negative legs|
  count: number;
  transactionIds: string[];
  flag?: string;
}

export function buildFlowGraph(cf: CaseFile): FlowGraph {
  const accountById = new Map(cf.accounts.map((a) => [a.id, a]));
  const entityById = new Map(cf.entities.map((e) => [e.id, e]));
  const accountByEntityId = new Map(
    cf.accounts.filter((a) => a.entityId).map((a) => [a.entityId as string, a]),
  );
  const byTransferGroup = new Map<string, Transaction[]>();
  for (const t of cf.transactions) {
    if (!t.transferGroup) continue;
    const list = byTransferGroup.get(t.transferGroup) ?? [];
    list.push(t);
    byTransferGroup.set(t.transferGroup, list);
  }

  const edges = new Map<string, EdgeAcc>();
  const touch = (fromId: string, toId: string, flag?: string): EdgeAcc => {
    const key = `${fromId}→${toId}→${flag ?? ""}`;
    let e = edges.get(key);
    if (!e) {
      e = { fromId, toId, inflow: 0, outflow: 0, count: 0, transactionIds: [], flag };
      edges.set(key, e);
    }
    return e;
  };

  const isLoanLabeled = (t: Transaction) => t.tags.includes("loan-labeled");
  const transferGroupHasLoanLabel = (group: string) =>
    (byTransferGroup.get(group) ?? []).some(isLoanLabeled);

  // (1) Aggregated inter-account transfers (both legs share a transferGroup).
  for (const [group, legs] of byTransferGroup) {
    if (transferGroupHasLoanLabel(group)) continue; // handled as flagged edge (3)
    const pos = legs.find((l) => l.amount > 0);
    const neg = legs.find((l) => l.amount < 0);
    if (!pos || !neg) continue;
    const e = touch(neg.accountId, pos.accountId);
    e.inflow += pos.amount;
    e.outflow += -neg.amount;
    e.count += 1;
    e.transactionIds.push(neg.id, pos.id);
  }

  // (2) Employer → personal checking salary deposits.
  const employer = cf.entities.find((en) => en.kind === "employer");
  for (const t of cf.transactions) {
    if (t.amount <= 0 || t.transferGroup || t.category !== "Salary") continue;
    const acct = accountById.get(t.accountId);
    if (!acct || acct.owner === "entity") continue;
    const fromId = t.counterpartyId ?? employer?.id;
    if (!fromId) continue;
    const e = touch(fromId, t.accountId);
    e.inflow += t.amount;
    e.count += 1;
    e.transactionIds.push(t.id);
  }

  // (3) Disguised "loan repayment" flows into the nominee entity account.
  for (const t of cf.transactions) {
    if (!isLoanLabeled(t)) continue;
    let fromId: string;
    let toId: string;
    if (t.amount > 0) {
      toId = t.accountId;
      const other = t.transferGroup
        ? (byTransferGroup.get(t.transferGroup) ?? []).find((l) => l.id !== t.id)
        : undefined;
      fromId =
        other?.accountId ??
        (t.counterpartyId
          ? accountByEntityId.get(t.counterpartyId)?.id ?? t.counterpartyId
          : UNKNOWN_SOURCE_ID);
    } else {
      fromId = t.accountId;
      const other = t.transferGroup
        ? (byTransferGroup.get(t.transferGroup) ?? []).find((l) => l.id !== t.id)
        : undefined;
      toId =
        other?.accountId ??
        (t.counterpartyId
          ? accountByEntityId.get(t.counterpartyId)?.id ?? t.counterpartyId
          : UNKNOWN_SOURCE_ID);
    }
    const e = touch(fromId, toId, LOAN_LABEL_FLAG);
    if (t.amount > 0) {
      e.inflow += t.amount;
      e.count += 1;
    } else {
      e.outflow += -t.amount;
    }
    e.transactionIds.push(t.id);
  }

  // (4) + (7) Hidden-income deposits grouped by class/payor: undocumented
  // cash, side-job checks, and the undeclared Gulf Breeze rent stream.
  for (const t of cf.transactions) {
    if (t.amount <= 0 || t.transferGroup) continue;
    if (!t.tags.includes("income-hidden") || isLoanLabeled(t)) continue;
    const isCash = t.channel === "cash" || t.tags.includes("cash-deposit");
    const fromId = t.counterpartyId ?? (isCash ? CASH_SOURCE_ID : SIDE_JOB_SOURCE_ID);
    const e = touch(fromId, t.accountId);
    e.inflow += t.amount;
    e.count += 1;
    e.transactionIds.push(t.id);
  }

  // (5) Estate → commingled savings: the inheritance corpus.
  const estate = cf.entities.find((en) => en.kind === "estate");
  for (const t of cf.transactions) {
    if (t.amount <= 0 || t.transferGroup || t.category !== "Inheritance") continue;
    const fromId = t.counterpartyId ?? estate?.id ?? "estate-source";
    const e = touch(fromId, t.accountId);
    e.inflow += t.amount;
    e.count += 1;
    e.transactionIds.push(t.id);
  }

  // (6) The capital wire: nominee LLC account → title company, cash purchase.
  const titleCo = cf.entities.find((en) => en.kind === "title-company");
  for (const t of cf.transactions) {
    if (t.amount >= 0 || t.transferGroup || t.category !== "Real Estate Purchase") continue;
    const toId = t.counterpartyId ?? titleCo?.id ?? "gulf-coast-title";
    const e = touch(t.accountId, toId, GALVESTON_PURCHASE_FLAG);
    e.outflow += -t.amount;
    e.count += 1;
    e.transactionIds.push(t.id);
  }

  const finalEdges: FlowEdge[] = [...edges.values()].map((e) => ({
    fromId: e.fromId,
    toId: e.toId,
    total: Math.max(e.inflow, e.outflow),
    count: e.count || e.transactionIds.length,
    transactionIds: e.transactionIds,
    ...(e.flag ? { flag: e.flag } : {}),
  }));

  // Nodes: every account, plus every non-account edge endpoint.
  const nodes: FlowGraph["nodes"] = cf.accounts.map((a) => ({
    id: a.id,
    label: `${a.institution} — ${a.name}`,
    type: "account" as const,
    ...(a.disclosed ? {} : { discovered: true }),
  }));
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const e of finalEdges) {
    for (const id of [e.fromId, e.toId]) {
      if (nodeIds.has(id)) continue;
      nodeIds.add(id);
      const entity = entityById.get(id);
      nodes.push({
        id,
        label: entity?.name ?? SYNTHETIC_LABELS[id] ?? id,
        type: "entity",
        ...(entity?.discovered || (!entity && id in SYNTHETIC_LABELS && id.startsWith("src-"))
          ? { discovered: true }
          : {}),
      });
    }
  }

  return { nodes, edges: finalEdges };
}
