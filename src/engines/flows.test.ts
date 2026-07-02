import { describe, expect, it } from "vitest";
import {
  buildFlowGraph,
  CASH_SOURCE_ID,
  GALVESTON_PURCHASE_FLAG,
  LOAN_LABEL_FLAG,
  SIDE_JOB_SOURCE_ID,
} from "./flows";
import { fixtureCase as cf } from "./fixtures";

describe("flow graph (follow the money)", () => {
  const graph = buildFlowGraph(cf);
  const edge = (fromId: string, toId: string) =>
    graph.edges.find((e) => e.fromId === fromId && e.toId === toId);

  it("aggregates transferGroup pairs account→account", () => {
    const chkSav = edge("chk", "sav");
    expect(chkSav?.total).toBe(300_000);
    expect(chkSav?.count).toBe(1);
    expect(chkSav?.transactionIds.sort()).toEqual(["s1", "t3"]);
    const chkCard = edge("chk", "card");
    expect(chkCard?.total).toBe(170_000);
  });

  it("draws the employer salary edge into personal checking", () => {
    const salary = edge("emp", "chk");
    expect(salary?.total).toBe(800_000);
    expect(salary?.transactionIds).toEqual(["t1"]);
  });

  it("flags the disguised loan repayments biz→bluebonnet without double counting legs", () => {
    const loan = edge("biz", "blue");
    expect(loan?.total).toBe(200_000);
    expect(loan?.flag).toBe(LOAN_LABEL_FLAG);
    expect(loan?.transactionIds.sort()).toEqual(["b0", "b1"]);
  });

  it("routes hidden income by class: cash, side jobs, and the rent stream", () => {
    expect(edge(CASH_SOURCE_ID, "chk")?.total).toBe(950_000);
    expect(edge(SIDE_JOB_SOURCE_ID, "sav")?.total).toBe(500_000);
    expect(edge("mgmt", "blue")?.total).toBe(140_000); // Gulf Breeze rent
  });

  it("draws the estate corpus into the commingled savings account", () => {
    expect(edge("est", "sav")?.total).toBe(5_000_000);
  });

  it("flags the Galveston cash-purchase wire bluebonnet→title", () => {
    const wire = edge("blue", "title");
    expect(wire?.total).toBe(300_000);
    expect(wire?.flag).toBe(GALVESTON_PURCHASE_FLAG);
  });

  it("emits nodes for every account plus the money-moving entities", () => {
    const ids = new Set(graph.nodes.map((n) => n.id));
    for (const id of ["chk", "sav", "card", "biz", "blue", "emp", "est", "title", "mgmt", CASH_SOURCE_ID, SIDE_JOB_SOURCE_ID]) {
      expect(ids.has(id)).toBe(true);
    }
    const blue = graph.nodes.find((n) => n.id === "blue");
    expect(blue?.type).toBe("account");
    expect(blue?.discovered).toBe(true);
    expect(graph.nodes.find((n) => n.id === "emp")?.type).toBe("entity");
  });

  it("keeps hidden-income deposits out of the plain transfer edges", () => {
    // b1 must appear only in the flagged loan edge, not an unflagged edge.
    const unflagged = graph.edges.filter((e) => !e.flag && e.transactionIds.includes("b1"));
    expect(unflagged).toHaveLength(0);
  });
});
