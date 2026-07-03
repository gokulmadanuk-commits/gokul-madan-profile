/**
 * § VI — Separate Property Tracing (Texas).
 * Frost Premier Savings ····8823: Sarah Delaney's $250,000 inheritance,
 * commingled with community deposits, resegregated under Sibley
 * (community-out-first) and Snider (minimum sum balance).
 */
import {
  Area,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHeader from "../components/PageHeader";
import StatTile from "../components/StatTile";
import TickFigure from "../components/TickFigure";
import MarginNote from "../components/MarginNote";
import {
  areaPrimaryProps,
  chartColors,
  fontBody,
  fontMono,
  referenceLineProps,
  tooltipProps,
  xAxisProps,
  yAxisProps,
} from "../components/chartTheme";
import { caseFile } from "../lib/caseData";
import { buildSeparateProperty } from "../engines";
import { fmtDate, fmtDateShort, usd, usdCompact, usdExact } from "../lib/format";

// ---------------------------------------------------------------------------
// Engine results — pure functions over static data; computed once.
// ---------------------------------------------------------------------------

const sp = buildSeparateProperty(caseFile);
const account = caseFile.accounts.find((a) => a.id === sp.accountId)!;
const letterDoc = caseFile.documents.find((d) => d.kind === "letter");
const communityRemainder = sp.endingBalance - sp.communityOutFirstResult;

const openingBalance = account.openingBalance;
const totalDeposits = sp.rows.reduce((s, r) => s + (r.amount > 0 ? r.amount : 0), 0);
const totalWithdrawals = sp.rows.reduce((s, r) => s + (r.amount < 0 ? -r.amount : 0), 0);

/** Rows where a withdrawal invaded the separate layer (separate balance fell). */
const invasionIds = new Set<string>();
{
  let prevSeparate = 0;
  for (const r of sp.rows) {
    if (r.amount < 0 && r.separateBalance < prevSeparate) invasionIds.add(r.transactionId);
    prevSeparate = r.separateBalance;
  }
}

const ts = (iso: string) => Date.parse(iso);

const chartData = [
  { t: ts(caseFile.matter.periodStart), balance: openingBalance },
  ...sp.rows.map((r) => ({ t: ts(r.date), balance: r.totalBalance })),
  { t: ts(caseFile.matter.periodEnd), balance: sp.endingBalance },
];

const chartTicks = [
  "2022-01-01", "2022-07-01", "2023-01-01", "2023-07-01",
  "2024-01-01", "2024-07-01", "2025-01-01",
].map(ts);

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtTick(t: number): string {
  const d = new Date(t);
  return `${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "Withdrawal — community out first ($45,000.00 community, $0.00 separate)" → tidy. */
function tidyCharacterization(c: string): string {
  return c.replace(/\(\$[\d,]+\.\d{2} community, \$0\.00 separate\)/, "(all community)");
}

// ---------------------------------------------------------------------------
// Low-water-mark annotation: dot + leader note, drawn in the chart's SVG.
// ---------------------------------------------------------------------------

function LowWaterNote(props: {
  viewBox?: { x?: number; y?: number; width?: number; height?: number };
}) {
  // ReferenceDot hands the label a viewBox of the dot's bounding box.
  const x = (props.viewBox?.x ?? 0) + (props.viewBox?.width ?? 0) / 2;
  const y = (props.viewBox?.y ?? 0) + (props.viewBox?.height ?? 0) / 2;
  const tx = x - 14; // text block sits below-left of the dot, in the empty band
  const ty = y + 34;
  const lines = [
    "The balance never again falls below this line; under the",
    "minimum sum balance rule the separate estate survives to",
    "exactly this amount. — Snider v. Snider, 613 S.W.2d 8.",
  ];
  return (
    <g pointerEvents="none">
      <path
        d={`M ${x - 3} ${y + 5} L ${tx + 4} ${ty - 14}`}
        stroke={chartColors.brassLight}
        strokeWidth={1}
        fill="none"
      />
      <text x={tx} y={ty} textAnchor="end" fontFamily={fontMono} fontSize={11.5} fill={chartColors.ink}>
        Nov 17, 2023 — $187,340
      </text>
      {lines.map((l, i) => (
        <text
          key={i}
          x={tx}
          y={ty + 16 + i * 15}
          textAnchor="end"
          fontFamily={fontBody}
          fontStyle="italic"
          fontSize={11}
          fill={chartColors.inkSecondary}
        >
          {l}
        </text>
      ))}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Section heading in the folio register.
// ---------------------------------------------------------------------------

function SectionHead({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-5">
      <p className="label-caps text-brass">{kicker}</p>
      <h2 className="mt-1 font-display text-section text-ink" style={{ fontWeight: 400 }}>
        {title}
      </h2>
      <div className="rule-hairline mt-3" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Separate() {
  return (
    <>
      <PageHeader
        kicker="Section VI · Separate Estate"
        title="Separate Property Tracing (Texas)"
        exhibit={`${account.institution} ····${account.last4}`}
        lede={`On June 15, 2022, Sarah W. Delaney deposited a $250,000 distribution from the Estate of Margaret H. Whitmore into ${account.institution} ${account.name} ····${account.last4} — an account that already held, and kept receiving, community funds. That is the classic commingling problem. What follows is the accepted Texas answer.`}
      />

      {/* (a) Framing — the statute and the burden */}
      <section className="animate-settle">
        <div className="sheet max-w-[72ch] px-6 py-5">
          <p className="label-caps text-ink-secondary">Tex. Fam. Code § 3.003</p>
          <blockquote className="mt-2 font-body text-body italic text-ink">
            Property possessed by either spouse during or on dissolution of marriage is
            presumed to be community property&hellip; The degree of proof necessary to
            establish that property is separate property is clear and convincing evidence.
          </blockquote>
        </div>
        <p className="mt-5 max-w-[72ch] font-body text-body text-ink-secondary">
          The presumption cuts against the claimant: every dollar in the account is community
          until traced. The corpus itself is documented — the executor&rsquo;s distribution
          letter{" "}
          {letterDoc ? (
            <a
              href={letterDoc.file}
              target="_blank"
              rel="noreferrer"
              className="transition-ink border-b border-brass font-mono text-table text-brass hover:text-ink"
            >
              {letterDoc.exhibit} — Executor&rsquo;s Letter, Estate of Margaret H. Whitmore
            </a>
          ) : (
            "(Ex. 4)"
          )}{" "}
          establishes acquisition by devise, which is separate property under § 3.001(2). The
          question is not the origin of the $250,000 but its survival: once separate and
          community funds share an account, the claim survives only to the extent the
          movement of every dollar can be resegregated on the records. Commingling alone does
          not destroy separate character — failure of proof does
          <span className="marginalia"> (Tarver v. Tarver, 394 S.W.2d 780)</span>.
        </p>
      </section>

      {/* (b) The Minimum Balance Exhibit */}
      <section className="mt-14">
        <SectionHead kicker="Exhibit VI-A" title="The Minimum Balance Exhibit" />

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <StatTile
            label="Separate corpus"
            value={<TickFigure cents={sp.separateContribution} />}
            note={`Deposited ${fmtDate(caseFile.tracing.separateDate)} by devise.`}
          />
          <StatTile
            label="Minimum intermediate balance"
            value={<TickFigure cents={sp.minimumBalance} />}
            note={`${fmtDate(sp.minimumBalanceDate)} — the low-water mark.`}
          />
          <StatTile
            label="Separate property established"
            value={<TickFigure cents={sp.minimumSumBalanceResult} />}
            note="The lesser of corpus and low-water mark."
            tone="credit"
          />
          <StatTile
            label="Community remainder"
            value={<TickFigure cents={communityRemainder} />}
            note={`Of ${usd(sp.endingBalance)} on deposit at 12/31/2024.`}
          />
        </div>

        <figure className="mt-8">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 18, right: 24, bottom: 4, left: 8 }}>
                <XAxis
                  {...xAxisProps}
                  dataKey="t"
                  type="number"
                  domain={[ts(caseFile.matter.periodStart), ts(caseFile.matter.periodEnd)]}
                  ticks={chartTicks}
                  tickFormatter={fmtTick}
                />
                <YAxis
                  {...yAxisProps}
                  domain={[0, 33_000_000]}
                  ticks={[0, 10_000_000, 20_000_000, 30_000_000]}
                  tickFormatter={(v: number) => usdCompact(v)}
                />
                <Tooltip
                  {...tooltipProps}
                  labelFormatter={(t) => fmtDate(new Date(t as number).toISOString().slice(0, 10))}
                  formatter={(v) => [usdExact(v as number), "balance"]}
                />
                {/* Brass dashed line: the separate corpus */}
                <ReferenceLine
                  y={sp.separateContribution}
                  stroke={chartColors.brass}
                  strokeDasharray="5 4"
                  strokeWidth={1}
                  label={{
                    value: "separate corpus deposited — $250,000",
                    position: "insideRight",
                    dy: -9,
                    fill: chartColors.brass,
                    fontSize: 11,
                    fontFamily: fontBody,
                    fontStyle: "italic",
                  }}
                />
                {/* The separate-property floor */}
                <ReferenceLine
                  y={sp.minimumBalance}
                  {...referenceLineProps}
                  label={{
                    value: "minimum intermediate balance — the separate floor",
                    position: "insideLeft",
                    dy: -9,
                    fill: chartColors.inkSecondary,
                    fontSize: 11,
                    fontFamily: fontBody,
                    fontStyle: "italic",
                  }}
                />
                <Area type="stepAfter" {...areaPrimaryProps} dataKey="balance" name="balance" />
                <ReferenceDot
                  x={ts(sp.minimumBalanceDate)}
                  y={sp.minimumBalance}
                  r={4}
                  fill={chartColors.ink}
                  stroke={chartColors.paperRaised}
                  strokeWidth={1.5}
                  label={<LowWaterNote />}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <figcaption className="mt-2">
            <MarginNote>
              Running balance of {account.institution} {account.name} ····{account.last4},
              built transaction-by-transaction from the statements and footed to each
              period-end. After the corpus arrived, the balance dipped three times; it
              bottomed at {usd(sp.minimumBalance)} on {fmtDate(sp.minimumBalanceDate)} and
              never returned below that line. Under the minimum sum balance rule the
              separate estate is impaired to the low-water mark — permanently — and can be
              replenished only by new, provably separate deposits. None followed.
            </MarginNote>
          </figcaption>
        </figure>
      </section>

      {/* (c) Schedule 4 — the tracing ledger */}
      <section className="mt-14">
        <SectionHead kicker="Schedule 4" title="Community-Out-First Tracing Ledger" />
        <p className="mb-5 max-w-[72ch] font-body text-body text-ink-secondary">
          Sibley v. Sibley treats the spouse holding mixed funds as a trustee: community
          dollars are presumed withdrawn first, and separate dollars sink to the bottom of
          the account. Each withdrawal below is applied against the community layer until it
          is exhausted; the total column ties to the bank statement at every line.
        </p>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse">
            <thead>
              <tr>
                {[
                  ["date", "Date", "left"],
                  ["desc", "Description", "left"],
                  ["dep", "Deposit ($)", "right"],
                  ["wd", "Withdrawal ($)", "right"],
                  ["cp", "Community ($)", "right"],
                  ["sep", "Separate ($)", "right"],
                  ["tot", "Total ($)", "right"],
                  ["char", "Characterization", "left"],
                ].map(([key, label, align]) => (
                  <th
                    key={key}
                    scope="col"
                    className={`label-caps whitespace-nowrap border-b border-[rgba(28,27,22,0.35)] px-3 pb-2 text-ink-secondary ${
                      align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Opening balance — predates the corpus, community by presumption */}
              <tr>
                <td className="whitespace-nowrap px-3 py-3 align-baseline">
                  <span className="figure">{fmtDateShort(caseFile.matter.periodStart)}</span>
                </td>
                <td className="px-3 py-3 align-baseline">
                  <span className="font-mono text-caption text-ink">OPENING BALANCE</span>
                </td>
                <td />
                <td />
                <td className="px-3 py-3 text-right align-baseline">
                  <span className="figure">{usdExact(openingBalance)}</span>
                </td>
                <td className="px-3 py-3 text-right align-baseline">
                  <span className="figure">{usdExact(0)}</span>
                </td>
                <td className="px-3 py-3 text-right align-baseline">
                  <span className="figure">{usdExact(openingBalance)}</span>
                </td>
                <td className="px-3 py-3 align-baseline">
                  <span className="marginalia">Community by presumption — § 3.003(a)</span>
                </td>
              </tr>

              {sp.rows.map((r) => {
                const isCorpus = r.amount > 0 && r.characterization.startsWith("Separate deposit");
                const invades = invasionIds.has(r.transactionId);
                return (
                  <tr
                    key={r.transactionId}
                    className={`transition-ink ${invades ? "row-flagged" : "hover:bg-paper-hover"}`}
                    style={
                      isCorpus
                        ? { background: "rgba(196,169,107,0.12)", boxShadow: "inset 2px 0 0 #9C7C46" }
                        : undefined
                    }
                  >
                    <td className="whitespace-nowrap px-3 py-3 align-baseline">
                      <span className="figure">{fmtDateShort(r.date)}</span>
                    </td>
                    <td className="px-3 py-3 align-baseline">
                      <span className="font-mono text-caption text-ink">{r.description}</span>
                    </td>
                    <td className="px-3 py-3 text-right align-baseline">
                      {r.amount > 0 && (
                        <span className={`figure ${isCorpus ? "text-brass" : ""}`}>
                          {usdExact(r.amount)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right align-baseline">
                      {r.amount < 0 && (
                        <>
                          <span className="figure figure-debit">{usdExact(-r.amount)}</span>
                          {invades && (
                            <sup className="ml-0.5 select-none font-body text-oxblood">†</sup>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right align-baseline">
                      <span className="figure">{usdExact(r.communityBalance)}</span>
                    </td>
                    <td className="px-3 py-3 text-right align-baseline">
                      <span className="figure">{usdExact(r.separateBalance)}</span>
                    </td>
                    <td className="px-3 py-3 text-right align-baseline">
                      <span className="figure">{usdExact(r.totalBalance)}</span>
                    </td>
                    <td className="min-w-[220px] px-3 py-3 align-baseline">
                      <span className="marginalia">{tidyCharacterization(r.characterization)}</span>
                    </td>
                  </tr>
                );
              })}

              {/* Foot & tie-out */}
              <tr>
                <td className="rule-total px-3 py-3 align-baseline" colSpan={2}>
                  <span className="font-body text-table font-medium text-ink">
                    Balance at {fmtDate(caseFile.matter.periodEnd)}
                  </span>
                </td>
                <td className="rule-total px-3 py-3 text-right align-baseline">
                  <span className="figure font-medium">{usdExact(totalDeposits)}</span>
                </td>
                <td className="rule-total px-3 py-3 text-right align-baseline">
                  <span className="figure font-medium">{usdExact(totalWithdrawals)}</span>
                </td>
                <td className="rule-total px-3 py-3 text-right align-baseline">
                  <span className="figure font-medium">{usdExact(communityRemainder)}</span>
                </td>
                <td className="rule-total px-3 py-3 text-right align-baseline">
                  <span className="figure figure-credit font-medium">
                    {usdExact(sp.communityOutFirstResult)}
                  </span>
                </td>
                <td className="rule-total px-3 py-3 text-right align-baseline">
                  <span className="figure font-medium">{usdExact(sp.endingBalance)}</span>
                </td>
                <td className="rule-total px-3 py-3 align-baseline">
                  <span className="marginalia">F — footed; ties to Frost statement</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <MarginNote className="mt-3">
          Withdrawals marked † invaded the separate layer after the community layer was
          exhausted; each invasion permanently reduced the separate estate. Deposit of the
          corpus is ruled in brass. Unexplained deposits, had there been any, would default
          to community — the presumption cuts against the claimant.
        </MarginNote>
      </section>

      {/* (d) Methods agreement + verdict */}
      <section className="mt-14">
        <SectionHead kicker="Cross-Check" title="Three Methods, One Answer" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="border border-[rgba(28,27,22,0.15)] bg-paper-raised px-5 py-4">
            <p className="label-caps text-ink-secondary">Minimum sum balance</p>
            <p className="mt-2 font-mono text-[1.75rem] leading-none tabular-nums text-ink">
              {usd(sp.minimumSumBalanceResult)}
            </p>
            <p className="marginalia mt-2.5">
              Lesser of the {usd(sp.separateContribution)} corpus and the{" "}
              {usd(sp.minimumBalance)} low-water mark of {fmtDate(sp.minimumBalanceDate)}.
              Snider v. Snider, 613 S.W.2d 8.
            </p>
          </div>
          <div className="border border-[rgba(28,27,22,0.15)] bg-paper-raised px-5 py-4">
            <p className="label-caps text-ink-secondary">Community out first</p>
            <p className="mt-2 font-mono text-[1.75rem] leading-none tabular-nums text-ink">
              {usd(sp.communityOutFirstResult)}
            </p>
            <p className="marginalia mt-2.5">
              Ending separate balance of Schedule 4. Agrees with the minimum-balance result
              by construction: at the {fmtDate(sp.minimumBalanceDate)} low-water mark the
              community layer stood at zero, so the account&rsquo;s minimum balance was
              exactly the surviving separate layer. Sibley v. Sibley, 286 S.W.2d 657.
            </p>
          </div>
          <div className="border border-[rgba(28,27,22,0.15)] bg-paper-raised px-5 py-4">
            <p className="label-caps text-ink-secondary">Clearinghouse scan</p>
            <p className="mt-2 font-mono text-[1.75rem] leading-none tabular-nums text-ink">
              {sp.clearinghouseMatches.length === 0
                ? "No matches"
                : `${sp.clearinghouseMatches.length} pair${sp.clearinghouseMatches.length === 1 ? "" : "s"}`}
            </p>
            <p className="marginalia mt-2.5">
              {sp.clearinghouseMatches.length === 0
                ? "No deposit was matched by an identical withdrawal within five days: this was a working savings account, not a conduit. The clearinghouse method does not apply here — and is not needed."
                : `Matched in/out pairs of identical amount within five days, totaling ${usd(
                    sp.clearinghouseMatches.reduce((s, m) => s + m.amount, 0),
                  )} — the McKinley identical-sum inference.`}
            </p>
          </div>
        </div>

        {/* Verdict */}
        <div className="rule-oxford-brass mt-10 max-w-[76ch] pt-5">
          <p className="label-caps text-ink-secondary">Conclusion — § 3.003(b) standard</p>
          <p className="mt-3 font-body text-section leading-snug text-ink">
            Of the <span className="figure text-[0.95em]">{usd(sp.endingBalance)}</span> on
            deposit at 12/31/2024,{" "}
            <span className="figure text-[0.95em] font-medium text-credit">
              {usdExact(sp.minimumSumBalanceResult)}
            </span>{" "}
            is Sarah&rsquo;s separate property by clear and convincing tracing;{" "}
            <span className="figure text-[0.95em]">{usdExact(communityRemainder)}</span> is
            community.
          </p>
          <p className="marginalia mt-3">
            Two independent conventions resegregate the account to the same dollar; the
            schedule ties to the bank statements at every line, and the corpus is documented
            by the executor&rsquo;s letter ({letterDoc?.exhibit ?? "Ex. 4"}).
          </p>
        </div>
      </section>

      {/* (e) Authorities */}
      <section className="mt-14 mb-4">
        <SectionHead kicker="Marginalia" title="Authorities" />
        <div className="grid max-w-[88ch] grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
          <MarginNote>
            Sibley v. Sibley, 286 S.W.2d 657 (Tex. Civ. App.&mdash;Dallas 1955, writ
            dism&rsquo;d) &mdash; the trustee analogy: community funds are presumed
            withdrawn first; separate dollars sink to the bottom.
          </MarginNote>
          <MarginNote>
            Snider v. Snider, 613 S.W.2d 8 (Tex. Civ. App.&mdash;Dallas 1981) &mdash;
            minimum sum balance: separate character survives to the lowest intermediate
            balance, and no further.
          </MarginNote>
          <MarginNote>
            McKinley v. McKinley, 496 S.W.2d 540 (Tex. 1973) &mdash; identical-sum
            inference; and interest earned during marriage, even on separate principal, is
            community.
          </MarginNote>
          <MarginNote>
            Tarver v. Tarver, 394 S.W.2d 780 (Tex. 1965) &mdash; funds so commingled as to
            defy resegregation are community: commingling defeats untraced claims.
          </MarginNote>
          <MarginNote>
            Farrow v. Farrow, 238 S.W.2d 255 (Tex. Civ. App.&mdash;Austin 1951) &mdash;
            &ldquo;a dollar is a dollar&rdquo;: money is fungible, traced by amount and
            character rather than by serial number &mdash; which is what makes a schedule
            like Schedule 4 legally sufficient.
          </MarginNote>
          <MarginNote>
            Tex. Fam. Code §§ 3.001&ndash;3.003 &mdash; separate property defined;
            community presumption; clear and convincing evidence required to rebut.
          </MarginNote>
        </div>
      </section>
    </>
  );
}
