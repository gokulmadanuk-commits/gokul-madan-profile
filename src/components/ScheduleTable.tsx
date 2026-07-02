import { Fragment } from "react";
import clsx from "clsx";
import type { Cents } from "../lib/types";
import { usd } from "../lib/format";

export interface ScheduleColumn {
  key: string;
  label: string;
  /** Text columns default left; numeric cells default right. */
  align?: "left" | "right" | "center";
}

export interface ScheduleRow {
  id: string;
  /** One cell per column. Numbers are cents → formatted via `format` (usd by default). */
  cells: (string | number | null)[];
  /**
   * item     — ordinary line (default)
   * group    — small-caps group heading
   * subtotal — single rule above (`.rule-subtotal`)
   * total    — single rule above, double rule beneath (`.rule-total`)
   */
  kind?: "item" | "group" | "subtotal" | "total";
  /** Indent applied to the first cell: 0 | 1 | 2 */
  indent?: 0 | 1 | 2;
  /** Flagged: oxblood left rule + wash + superscript dagger on the amount */
  flag?: boolean;
  /** Marginalia note set beneath the first cell */
  note?: string;
}

export interface ScheduleTableProps {
  columns: ScheduleColumn[];
  rows: ScheduleRow[];
  /** Formatter for numeric cells (cents). Defaults to usd — whole dollars, accountant's parentheses. */
  format?: (cents: Cents) => string;
  /** Optional caption set beneath the schedule, report-figure style */
  caption?: string;
  className?: string;
}

const INDENT = ["", "pl-5", "pl-10"];

/**
 * A court-schedule table: right-aligned tabular mono figures, hairline under
 * the column heads, no vertical rules, single rule above subtotals, double
 * rule under grand totals, oxblood flags with superscript daggers.
 */
export default function ScheduleTable({
  columns,
  rows,
  format = usd,
  caption,
  className,
}: ScheduleTableProps) {
  // The dagger sits beside the amount: last numeric cell, else the first cell.
  const daggerIndex = (cells: ScheduleRow["cells"]): number => {
    for (let i = cells.length - 1; i >= 0; i--) {
      if (typeof cells[i] === "number") return i;
    }
    return 0;
  };

  return (
    <div className={clsx("w-full overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={clsx(
                  "label-caps whitespace-nowrap border-b border-[rgba(28,27,22,0.35)] px-3 pb-2 text-ink-secondary",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  (!col.align || col.align === "left") && "text-left",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const kind = row.kind ?? "item";
            const flagAt = row.flag ? daggerIndex(row.cells) : -1;
            return (
              <tr
                key={row.id}
                className={clsx(
                  "transition-ink",
                  kind === "item" && !row.flag && "hover:bg-paper-hover",
                  row.flag && "row-flagged",
                )}
              >
                {row.cells.map((cell, i) => {
                  const isNumber = typeof cell === "number";
                  const col = columns[i];
                  const align =
                    col?.align ?? (isNumber ? "right" : "left");
                  return (
                    <td
                      key={col?.key ?? i}
                      className={clsx(
                        "px-3 py-3 align-baseline",
                        align === "right" && "text-right",
                        align === "center" && "text-center",
                        kind === "subtotal" && "rule-subtotal font-medium",
                        kind === "total" && "rule-total font-medium",
                        kind === "group" && "pt-5",
                        i === 0 && INDENT[row.indent ?? 0],
                      )}
                    >
                      {cell === null ? null : isNumber ? (
                        <Fragment>
                          <span
                            className={clsx(
                              "figure",
                              (cell as number) < 0 && "figure-debit",
                              kind === "total" && "font-medium",
                            )}
                          >
                            {format(cell as number)}
                          </span>
                          {flagAt === i && (
                            <sup className="ml-0.5 select-none font-body text-oxblood">†</sup>
                          )}
                        </Fragment>
                      ) : (
                        <Fragment>
                          <span
                            className={clsx(
                              kind === "group"
                                ? "label-caps text-ink"
                                : "font-body text-table text-ink",
                              (kind === "subtotal" || kind === "total") && "font-medium",
                            )}
                          >
                            {cell}
                          </span>
                          {flagAt === i && !isNumber && (
                            <sup className="ml-0.5 select-none font-body text-oxblood">†</sup>
                          )}
                          {i === 0 && row.note && (
                            <span className="marginalia mt-0.5 block">{row.note}</span>
                          )}
                        </Fragment>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {caption && <p className="marginalia mt-2">{caption}</p>}
    </div>
  );
}
