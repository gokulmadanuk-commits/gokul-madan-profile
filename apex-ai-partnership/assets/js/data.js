/* ============================================================
   Apex AI Partnership — illustrative dataset (single source of truth)
   FY2026, "Apex Group (illustrative)". June 2026 close complete (WD+8);
   board pack due WD+12. All figures fabricated, modelled on public
   benchmarks (Fitch ratings commentary, peer disclosures). No Apex
   Group data was used or accessed.

   Exposes:
     window.APEX_DATA  — the dataset (see SPEC.md §1 for shape)
     window.APEX_FMT   — formatting helpers: m, pct, delta, money
                         (+ extras: deltaM, pp, num, days)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- formatting helpers ---------- */

  function group3(s) {
    return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function fix1(v) {
    return group3(Math.abs(v).toFixed(1));
  }

  var FMT = {
    /* millions, one decimal: m(96.2) -> "$96.2m", m(-3.7) -> "($3.7m)" */
    m: function (v) {
      var s = "$" + fix1(v) + "m";
      return v < 0 ? "(" + s + ")" : s;
    },
    /* percent, one decimal: pct(30.9) -> "30.9%" */
    pct: function (v) {
      var s = fix1(v) + "%";
      return v < 0 ? "(" + s + ")" : s;
    },
    /* signed percent delta: delta(1.6) -> "+1.6%", delta(-1.3) -> "(1.3)%" */
    delta: function (v) {
      if (v < 0) return "(" + fix1(v) + ")%";
      return "+" + fix1(v) + "%";
    },
    /* magnitude-aware dollars: money(3.4e12) -> "$3.4T" */
    money: function (v) {
      var a = Math.abs(v), s;
      if (a >= 1e12)      s = "$" + fix1(v / 1e12) + "T";
      else if (a >= 1e9)  s = "$" + fix1(v / 1e9) + "bn";
      else if (a >= 1e6)  s = "$" + fix1(v / 1e6) + "m";
      else if (a >= 1e3)  s = "$" + group3(Math.round(Math.abs(v) / 1e3).toString()) + "k";
      else                s = "$" + group3(Math.round(Math.abs(v)).toString());
      return v < 0 ? "(" + s + ")" : s;
    },
    /* extras (documented, optional) */
    /* signed $m delta: deltaM(1.4) -> "+$1.4m", deltaM(-0.8) -> "($0.8m)" */
    deltaM: function (v) {
      if (v < 0) return "($" + fix1(v) + "m)";
      return "+$" + fix1(v) + "m";
    },
    /* signed percentage points: pp(-0.7) -> "(0.7)pp" */
    pp: function (v) {
      if (v < 0) return "(" + fix1(v) + ")pp";
      return "+" + fix1(v) + "pp";
    },
    /* integer with separators: num(13240) -> "13,240" */
    num: function (v) {
      var s = group3(Math.round(Math.abs(v)).toString());
      return v < 0 ? "(" + s + ")" : s;
    },
    /* days: days(63) -> "63 days" */
    days: function (v) {
      return Math.round(v) + " days";
    }
  };
  window.APEX_FMT = FMT;

  /* ---------- core monthly series (hand-shaped, $m, one decimal) ----------
     Trailing 12 months Jul-25..Jun-26. Jan-26..Jun-26 are FY26 H1 (indices
     6..11); the YTD block sums those. Seasonality: Q4/Q1 heavier billing
     (annual fees, year-end NAV work), summer softer; gentle upward trend;
     actual-vs-budget wiggle within roughly +/-0.5–2.5%. */

  var MONTHS = ["Jul-25", "Aug-25", "Sep-25", "Oct-25", "Nov-25", "Dec-25",
                "Jan-26", "Feb-26", "Mar-26", "Apr-26", "May-26", "Jun-26"];

  var REV_A = [124.6, 122.9, 127.8, 129.4, 128.7, 131.5,
               136.8, 129.4, 137.2, 132.6, 134.8, 135.6];
  var REV_B = [125.4, 123.6, 126.9, 128.8, 129.6, 130.9,
               135.2, 128.9, 135.8, 132.1, 133.4, 134.8];
  var REV_P = [116.8, 115.2, 119.6, 121.3, 120.8, 123.8,
               127.6, 120.8, 128.1, 123.7, 125.5, 126.4];

  var EB_A = [37.6, 36.9, 39.2, 40.1, 39.8, 41.2,
              42.9, 39.3, 43.1, 40.2, 41.9, 41.8];
  var EB_B = [38.2, 37.4, 38.8, 39.7, 40.3, 40.6,
              42.8, 40.5, 43.2, 41.6, 42.2, 42.6];
  var EB_P = [33.9, 33.4, 35.1, 35.8, 35.4, 36.9,
              38.3, 35.5, 38.4, 36.6, 37.4, 37.9];

  function round1(v) { return Math.round(v * 10) / 10; }
  function marginSeries(eb, rev) {
    var out = [];
    for (var i = 0; i < eb.length; i++) out.push(round1(eb[i] / rev[i] * 100));
    return out;
  }
  function sumFrom(arr, from) {
    var s = 0;
    for (var i = from; i < arr.length; i++) s += arr[i];
    return round1(s);
  }

  var MARGIN_A = marginSeries(EB_A, REV_A);
  var MARGIN_B = marginSeries(EB_B, REV_B);

  /* YTD = Jan-26..Jun-26 (indices 6..11) */
  var YTD_REV_A = sumFrom(REV_A, 6);   /* 806.4 */
  var YTD_REV_B = sumFrom(REV_B, 6);   /* 800.2 */
  var YTD_REV_P = sumFrom(REV_P, 6);   /* 752.1 */
  var YTD_EB_A  = sumFrom(EB_A, 6);    /* 249.2 */
  var YTD_EB_B  = sumFrom(EB_B, 6);    /* 252.9 */
  var YTD_EB_P  = sumFrom(EB_P, 6);    /* 224.1 */

  function varPct(a, b) { return round1((a - b) / b * 100); }

  var YTD = {
    revenue: {
      actual: YTD_REV_A, budget: YTD_REV_B, priorYear: YTD_REV_P,
      varBudgetPct: varPct(YTD_REV_A, YTD_REV_B),        /* +0.8 */
      varPriorYearPct: varPct(YTD_REV_A, YTD_REV_P)      /* +7.2 */
    },
    ebitda: {
      actual: YTD_EB_A, budget: YTD_EB_B, priorYear: YTD_EB_P,
      varBudgetPct: varPct(YTD_EB_A, YTD_EB_B),          /* (1.5) */
      varPriorYearPct: varPct(YTD_EB_A, YTD_EB_P)        /* +11.2 */
    },
    marginPct: {
      actual: round1(YTD_EB_A / YTD_REV_A * 100),        /* 30.9 */
      budget: round1(YTD_EB_B / YTD_REV_B * 100),        /* 31.6 */
      priorYear: round1(YTD_EB_P / YTD_REV_P * 100),     /* 29.8 */
      varBudgetPp: round1(YTD_EB_A / YTD_REV_A * 100 - YTD_EB_B / YTD_REV_B * 100),      /* (0.7) */
      varPriorYearPp: round1(YTD_EB_A / YTD_REV_A * 100 - YTD_EB_P / YTD_REV_P * 100)    /* +1.1 */
    }
  };

  /* ---------- service lines (YTD FY26; must foot to YTD revenue) ---------- */

  var SERVICE_LINES = [
    { key: "fund", name: "Fund Solutions", seriesVar: "--series-1",
      ytdRevenue: 419.5, budget: 414.2, junActual: 70.4, junBudget: 69.8,
      yoyPct: 7.8, note: "core engine; AuA-linked" },
    { key: "corp", name: "Corporate & Legal Solutions", seriesVar: "--series-2",
      ytdRevenue: 177.8, budget: 176.4, junActual: 29.9, junBudget: 29.7,
      yoyPct: 6.1, note: "SPV administration; entity count growing with sponsor activity" },
    { key: "custody", name: "Custody & Depositary", seriesVar: "--series-3",
      ytdRevenue: 136.6, budget: 139.8, junActual: 22.8, junBudget: 23.4,
      yoyPct: 1.9, note: "fee compression -40bps" },
    { key: "esg", name: "ESG & Regulatory Reporting", seriesVar: "--series-4",
      ytdRevenue: 40.9, budget: 38.3, junActual: 7.1, junBudget: 6.5,
      yoyPct: 26.3, note: "growth story (Holtara)" },
    { key: "digital", name: "Digital Banking & Other", seriesVar: "--series-5",
      ytdRevenue: 31.6, budget: 31.5, junActual: 5.4, junBudget: 5.4,
      yoyPct: 9.4, note: "small base; payments volumes ahead of plan" }
  ];

  var REGIONS = [
    { name: "EMEA", sharePct: 54, ytdRevenue: 435.5, yoyPct: 6.4,
      note: "Luxembourg, Ireland, Channel Islands, UK — depositary and ManCo concentration" },
    { name: "Americas", sharePct: 29, ytdRevenue: 233.9, yoyPct: 8.9,
      note: "US private credit and secondaries mandates driving growth" },
    { name: "APAC", sharePct: 17, ytdRevenue: 137.0, yoyPct: 7.1,
      note: "Australia superannuation book plus Singapore/Hong Kong fund services" }
  ];

  /* ---------- June EBITDA bridge: budget -> actual (must foot) ---------- */

  var BRIDGE = {
    startLabel: "Jun budget EBITDA",
    start: 42.6,
    steps: [
      { label: "AuA growth & markets", value: 1.4, side: "favourable",
        explain: "Average billable AuA ran 2.1% ahead of plan on market performance and net inflows into Fund Solutions; ad valorem fees follow with a one-month lag." },
      { label: "ESG mandate uptake", value: 0.5, side: "favourable",
        explain: "Fourteen Holtara reporting engagements signed in Q2 began billing in June, ahead of the September start assumed in budget." },
      { label: "Billing timing (WIP release)", value: 0.4, side: "favourable",
        explain: "Release of April–May unbilled WIP on three Corporate & Legal Solutions mandates. Timing, not performance — reverses in July." },
      { label: "Comp inflation — Luxembourg", value: -1.3, side: "adverse",
        explain: "Luxembourg wage indexation (+2.5%) applied from 1 June across LU entities, unbudgeted. Concentrated in GL 6100–6240 at entities LU-014 and LU-022." },
      { label: "Contractor backfill", value: -0.7, side: "adverse",
        explain: "Contractor cover for 41 open roles in fund accounting and transfer agency, at roughly 1.6x the loaded cost of the vacant positions." },
      { label: "Depositary fee compression", value: -0.6, side: "adverse",
        explain: "H1 renewals in Custody & Depositary repriced c.11% below prior fee schedules; volume growth is not yet offsetting rate." },
      { label: "FX translation", value: -0.5, side: "adverse",
        explain: "EUR and GBP weakened against USD versus budget rates; translation effect on the non-USD cost base. No cash impact." }
    ],
    endLabel: "Jun actual EBITDA",
    end: 41.8
  };

  /* ---------- operational metrics & reporting timeline ---------- */

  var OPS = {
    unbilledWipM: 52.3,
    wipMoMChangeM: 6.2,
    dsoDays: 63,
    dsoTarget: 55,
    billingLeakagePct: 1.8,
    attritionPct: 17.6,
    reportingTimeline: {
      current: [
        { day: "WD+1–8",   label: "Close & controls (untouched)", kind: "locked" },
        { day: "WD+8",     label: "Flash available",              kind: "manual" },
        { day: "WD+9–10",  label: "Variance analysis (manual)",   kind: "manual" },
        { day: "WD+11–12", label: "Commentary & pack assembly",   kind: "manual" }
      ],
      withAI: [
        { day: "WD+1–8", label: "Close & controls (untouched)",                    kind: "locked" },
        { day: "WD+8",   label: "Flash available — AI drafts variances & commentary by EOD", kind: "ai" },
        { day: "WD+9",   label: "Human review, edits & sign-off",                  kind: "manual" },
        { day: "WD+9",   label: "Pack out — three working days back",              kind: "ai" }
      ]
    }
  };

  /* ---------- command-centre KPI tiles ---------- */

  var KPIS = [
    { id: "revenue", label: "Revenue — YTD", value: YTD_REV_A, format: "m",
      deltaVsBudget: { value: YTD.revenue.varBudgetPct, text: FMT.delta(YTD.revenue.varBudgetPct) + " vs budget", direction: "favourable" },
      spark: REV_A, sparkColorVar: "--series-1" },
    { id: "ebitda", label: "EBITDA — YTD", value: YTD_EB_A, format: "m",
      deltaVsBudget: { value: YTD.ebitda.varBudgetPct, text: FMT.delta(YTD.ebitda.varBudgetPct) + " vs budget", direction: "adverse" },
      spark: EB_A, sparkColorVar: "--series-1" },
    { id: "margin", label: "EBITDA margin — YTD", value: YTD.marginPct.actual, format: "pct",
      deltaVsBudget: { value: YTD.marginPct.varBudgetPp, text: FMT.pp(YTD.marginPct.varBudgetPp) + " vs budget", direction: "adverse" },
      spark: MARGIN_A, sparkColorVar: "--series-1" },
    { id: "wip", label: "Unbilled WIP", value: OPS.unbilledWipM, format: "m",
      deltaVsBudget: { value: OPS.wipMoMChangeM, text: FMT.deltaM(OPS.wipMoMChangeM) + " MoM", direction: "adverse" },
      spark: [44.1, 45.3, 43.8, 46.2, 45.1, 47.9, 46.8, 48.4, 47.2, 49.6, 46.1, 52.3],
      sparkColorVar: "--series-5" },
    { id: "dso", label: "DSO", value: OPS.dsoDays, format: "days",
      deltaVsBudget: { value: OPS.dsoDays - OPS.dsoTarget, text: "+" + (OPS.dsoDays - OPS.dsoTarget) + " days vs 55-day target", direction: "adverse" },
      spark: [57, 58, 60, 59, 61, 60, 62, 61, 63, 62, 64, 63],
      sparkColorVar: "--series-5" },
    { id: "esg", label: "ESG revenue — YoY", value: 26.3, format: "pct",
      deltaVsBudget: { value: 6.8, text: "+6.8% vs budget", direction: "favourable" },
      spark: [5.6, 5.7, 5.9, 6.0, 6.1, 6.4, 6.5, 6.6, 6.8, 6.9, 7.0, 7.1],
      sparkColorVar: "--series-4" }
  ];

  /* ---------- ask-the-numbers: seven worked answers ---------- */

  var SL_NAMES  = SERVICE_LINES.map(function (s) { return s.name; });
  var SL_YTD    = SERVICE_LINES.map(function (s) { return s.ytdRevenue; });
  var SL_COLORS = SERVICE_LINES.map(function (s) { return s.seriesVar; });

  var ASK_QUESTIONS = [
    {
      id: "margin-miss",
      chip: "Why did June margin miss?",
      question: "Why did EBITDA margin miss budget in June?",
      answerBlocks: [
        { type: "p", text: "June EBITDA came in at $41.8m against a $42.6m budget — a ($0.8m) miss at a 30.8% margin versus 31.6% planned. It is a cost story, not a revenue story: revenue of $135.6m was actually $0.8m ahead of budget." },
        { type: "chart", spec: { kind: "bridge", title: "June 2026 EBITDA — budget to actual ($m)",
            start: { label: BRIDGE.startLabel, value: BRIDGE.start },
            steps: BRIDGE.steps, end: { label: BRIDGE.endLabel, value: BRIDGE.end },
            format: "m" } },
        { type: "p", text: "Favourable trading of +$2.3m — AuA growth (+$1.4m), earlier-than-planned ESG mandate billing (+$0.5m) and a WIP release (+$0.4m) — was more than offset by ($3.1m) of cost pressure: unbudgeted Luxembourg wage indexation ($1.3m), contractor backfill against 41 open roles ($0.7m), depositary fee compression ($0.6m) and adverse FX translation ($0.5m)." },
        { type: "p", text: "One reading note: the +$0.4m WIP release is timing, not performance — it reverses in July. Adjusting for it, the underlying June miss is closer to ($1.2m)." }
      ]
    },
    {
      id: "growth-driver",
      chip: "What is driving growth YTD?",
      question: "What is driving revenue growth year to date?",
      answerBlocks: [
        { type: "p", text: "YTD revenue of $806.4m is +7.2% on prior year and +0.8% ahead of budget. The growth is two-speed. Fund Solutions does the heavy lifting: $419.5m, 52% of the mix, +7.8% YoY, with average billable AuA running 2.1% ahead of plan. ESG & Regulatory Reporting is the standout rate of growth at +26.3% YoY ($40.9m) as Holtara mandates convert — small base, but $2.6m ahead of budget already." },
        { type: "chart", spec: { kind: "bars", title: "YTD revenue by service line ($m)",
            labels: SL_NAMES,
            series: [{ name: "YTD revenue ($m)", values: SL_YTD, colors: SL_COLORS }],
            format: "m", directLabel: true } },
        { type: "table",
          columns: ["Service line", "YTD actual", "vs budget", "YoY"],
          rows: [
            ["Fund Solutions", "$419.5m", "+$5.3m", "+7.8%"],
            ["Corporate & Legal Solutions", "$177.8m", "+$1.4m", "+6.1%"],
            ["Custody & Depositary", "$136.6m", "($3.2m)", "+1.9%"],
            ["ESG & Regulatory Reporting", "$40.9m", "+$2.6m", "+26.3%"],
            ["Digital Banking & Other", "$31.6m", "+$0.1m", "+9.4%"],
            ["Total", "$806.4m", "+$6.2m", "+7.2%"]
          ] },
        { type: "p", text: "The drag is Custody & Depositary: +1.9% YoY and ($3.2m) behind budget as H1 renewals repriced below prior schedules. Corporate & Legal Solutions (+6.1%) and Digital Banking & Other (+9.4%) are broadly in line." }
      ]
    },
    {
      id: "margin-march",
      chip: "Are we on track for 35%?",
      question: "How does the margin trajectory compare with the 35% FY26 ambition?",
      answerBlocks: [
        { type: "p", text: "YTD EBITDA margin is 30.9% against a 31.6% budget — (0.7)pp adrift of a plan that itself assumed H2 operating leverage to exit the year near the stated 35% ambition. At the current run-rate the full year lands nearer 31.2%." },
        { type: "chart", spec: { kind: "line", title: "EBITDA margin, trailing 12 months (%)",
            labels: MONTHS,
            series: [
              { name: "Actual", color: "--series-1", values: MARGIN_A },
              { name: "Budget", color: "--ink-3", values: MARGIN_B, dash: true }
            ],
            refLine: { value: 35, label: "FY26 ambition — 35%" },
            format: "pct" } },
        { type: "p", text: "The arithmetic is worth stating plainly: on FY26 budget revenue of roughly $1.62bn, every 10bps of margin is about $1.6m of EBITDA. The gap from 30.9% to 35% is c.410bps — roughly $66m annualised. That will not come from headcount growth; it has to come from capacity (hours returned from reporting and analysis to fee-earning work), pricing discipline and billing completeness. Which is the point of this proposal." }
      ]
    },
    {
      id: "wip-dso",
      chip: "What is happening with WIP and DSO?",
      question: "What is the unbilled WIP and DSO position, and should we worry?",
      answerBlocks: [
        { type: "p", text: "Unbilled WIP closed June at $52.3m, up $6.2m month on month and the highest level in the trailing twelve. DSO sits at 63 days against a 55-day target. Together they represent roughly $8m of cash conversion left on the table versus target, and estimated billing leakage of 1.8% of billable work — time recorded but never invoiced." },
        { type: "table",
          columns: ["Metric", "Jun-26", "May-26", "Target"],
          rows: [
            ["Unbilled WIP", "$52.3m", "$46.1m", "$44.0m"],
            ["DSO", "63 days", "64 days", "55 days"],
            ["Billing leakage (est.)", "1.8%", "1.7%", "under 1.0%"]
          ] },
        { type: "p", text: "The June jump is concentrated in Fund Solutions onboarding work (new mandates accrue fees before first invoice) and two Corporate & Legal Solutions projects billed quarterly in arrears. Structural, not credit risk — but every month WIP ages, realisation drops. The fee-schedule-versus-billed reconciliation on the capability map is aimed squarely at this." },
        { type: "caveat", text: "Data caveat: the transfer agency billing feed for two Jersey entities lags three business days. June WIP may be overstated by up to $1.1m pending the WD+11 refresh — treat the MoM move as directional until then." }
      ]
    },
    {
      id: "lux-comp",
      chip: "Luxembourg comp vs plan",
      question: "How is Luxembourg compensation tracking against plan?",
      answerBlocks: [
        { type: "p", text: "Luxembourg compensation ran ($1.3m) adverse to budget in June — the single largest item in the month's EBITDA bridge. The driver is the statutory wage indexation (+2.5%) triggered on 1 June and applied across all LU entities; the FY26 budget assumed no indexation event before Q4. The cost sits in GL 6100–6240 (compensation & benefits), concentrated in the two largest entities." },
        { type: "table",
          columns: ["Entity", "Jun actual", "Jun budget", "Variance"],
          rows: [
            ["LU-014 — Apex Fund Services (LUX)", "$9.8m", "$9.0m", "($0.8m)"],
            ["LU-022 — European Depositary Bank", "$5.7m", "$5.2m", "($0.5m)"],
            ["Luxembourg total", "$15.5m", "$14.2m", "($1.3m)"]
          ] },
        { type: "p", text: "Annualised, the indexation is worth roughly ($7.8m) if unmitigated. Two-thirds of Luxembourg-domiciled mandates carry indexation pass-through clauses in their fee schedules; the recovery cycle starts with July invoicing but historically captures only 60–70% in year one. Worth a standing line in the pack until it closes." },
        { type: "sources", items: ["GL 6100–6240 (compensation & benefits)", "Entity LU-014 — Apex Fund Services (LUX)", "Entity LU-022 — European Depositary Bank", "Consolidation v2026.06.03"] }
      ]
    },
    {
      id: "depositary-fees",
      chip: "Depositary fee exposure",
      question: "How exposed are we to depositary fee compression?",
      answerBlocks: [
        { type: "p", text: "Custody & Depositary is the softest line: $136.6m YTD, +1.9% YoY and ($3.2m) behind budget, costing ($0.6m) of EBITDA in June alone. H1 renewals repriced on average c.11% below prior fee schedules — about 0.4bps on a blended 3.5bps rate card, which is why the desk calls it the 40bps problem. AuA growth in the line (+5.2% YoY) is no longer covering the rate give-up." },
        { type: "table",
          columns: ["Renewal cohort", "Annualised fees", "Status"],
          rows: [
            ["H1-26 (repriced)", "$16.8m", "Closed at c.(11%) vs prior schedules"],
            ["H2-26 (upcoming)", "$21.4m", "Under negotiation — principal risk"],
            ["FY27 book", "$38.6m", "Not yet in cycle"]
          ] },
        { type: "p", text: "If the H2 cohort of $21.4m annualised fees reprices at the H1 rate, the incremental drag is roughly ($1.7m) of H2 revenue and ($1.4m) of EBITDA versus budget. The mitigations are mix (bundling depositary with ManCo and reporting, where attach rates are rising) and cost-to-serve — which is a capacity question, and capacity is what AI returns." }
      ]
    },
    {
      id: "board-paragraph",
      chip: "Draft the revenue paragraph",
      question: "Draft the revenue paragraph for the June board pack.",
      answerBlocks: [
        { type: "p", text: "Group revenue for June of $135.6m finished $0.8m (0.6%) ahead of budget and $9.2m (7.3%) ahead of June 2025, taking half-year revenue to $806.4m — $6.2m (0.8%) ahead of plan and +7.2% on prior year. Growth remains broad-based but increasingly two-speed. Fund Solutions ($70.4m in June; $419.5m YTD, +7.8% YoY) continues to compound, with average billable AuA running 2.1% ahead of plan and ad valorem fees following with the usual one-month lag. ESG & Regulatory Reporting is the standout at +26.3% YoY, as Holtara mandates signed in Q2 began billing ahead of the September assumption in budget. Against that, Custody & Depositary grew just +1.9% YoY and sits ($3.2m) behind budget year to date, with H1 renewals repricing c.11% below prior fee schedules; the H2 renewal cohort of roughly $21.4m annualised fees is the principal revenue risk to the full-year outlook. Corporate & Legal Solutions (+6.1% YoY) and Digital Banking & Other (+9.4% YoY) performed in line with plan. One timing note for readers: June benefits from a $0.4m release of April–May unbilled WIP on three Corporate & Legal Solutions mandates, which reverses in July and should be read as neutral to run-rate." },
        { type: "sources", items: ["Consolidation v2026.06.03", "Budget v3 (Dec-25 board approved)", "FY25 comparatives, as reported"] },
        { type: "caveat", text: "AI draft — grounded in the June consolidation extract. Requires human review and sign-off before circulation." }
      ]
    }
  ];

  /* ---------- board pack content ---------- */

  /* P&L summary table, built from the same numbers so it always foots.
     Convention: variance is signed favourable-positive (costs invert). */
  var JUN_REV_A = REV_A[11], JUN_REV_B = REV_B[11];
  var JUN_EB_A  = EB_A[11],  JUN_EB_B  = EB_B[11];
  var JUN_OPEX_A = round1(JUN_REV_A - JUN_EB_A);   /* 93.8 */
  var JUN_OPEX_B = round1(JUN_REV_B - JUN_EB_B);   /* 92.2 */
  var YTD_OPEX_A = round1(YTD_REV_A - YTD_EB_A);   /* 557.2 */
  var YTD_OPEX_B = round1(YTD_REV_B - YTD_EB_B);   /* 547.3 */
  var YTD_OPEX_P = round1(YTD_REV_P - YTD_EB_P);   /* 528.0 */

  var PL_ROWS = SERVICE_LINES.map(function (s) {
    return {
      label: s.name, kind: "line", format: "m",
      junActual: s.junActual, junBudget: s.junBudget,
      junVar: round1(s.junActual - s.junBudget),
      ytdActual: s.ytdRevenue, ytdBudget: s.budget,
      ytdVar: round1(s.ytdRevenue - s.budget),
      ytdPriorYear: round1(s.ytdRevenue / (1 + s.yoyPct / 100))
    };
  });
  PL_ROWS.push({
    label: "Total revenue", kind: "subtotal", format: "m",
    junActual: JUN_REV_A, junBudget: JUN_REV_B, junVar: round1(JUN_REV_A - JUN_REV_B),
    ytdActual: YTD_REV_A, ytdBudget: YTD_REV_B, ytdVar: round1(YTD_REV_A - YTD_REV_B),
    ytdPriorYear: YTD_REV_P
  });
  PL_ROWS.push({
    label: "Operating expenses", kind: "line", format: "m",
    junActual: -JUN_OPEX_A, junBudget: -JUN_OPEX_B, junVar: round1(JUN_OPEX_B - JUN_OPEX_A),
    ytdActual: -YTD_OPEX_A, ytdBudget: -YTD_OPEX_B, ytdVar: round1(YTD_OPEX_B - YTD_OPEX_A),
    ytdPriorYear: -YTD_OPEX_P
  });
  PL_ROWS.push({
    label: "EBITDA", kind: "total", format: "m",
    junActual: JUN_EB_A, junBudget: JUN_EB_B, junVar: round1(JUN_EB_A - JUN_EB_B),
    ytdActual: YTD_EB_A, ytdBudget: YTD_EB_B, ytdVar: round1(YTD_EB_A - YTD_EB_B),
    ytdPriorYear: YTD_EB_P
  });
  PL_ROWS.push({
    label: "EBITDA margin %", kind: "pct", format: "pct",
    junActual: round1(JUN_EB_A / JUN_REV_A * 100), junBudget: round1(JUN_EB_B / JUN_REV_B * 100),
    junVar: round1(JUN_EB_A / JUN_REV_A * 100 - JUN_EB_B / JUN_REV_B * 100),
    ytdActual: YTD.marginPct.actual, ytdBudget: YTD.marginPct.budget,
    ytdVar: YTD.marginPct.varBudgetPp, ytdPriorYear: YTD.marginPct.priorYear
  });

  var BOARD_PACK = {
    pipeline: [
      { label: "Pull June consolidation extract",        ms: 900 },
      { label: "Reconcile to trial balance",             ms: 1100 },
      { label: "Compute variances vs budget & PY",       ms: 700 },
      { label: "Draft commentary (grounded)",            ms: 1400 },
      { label: "Assemble pack for review",               ms: 800 }
    ],
    sections: [
      {
        id: "cover", type: "cover",
        title: "Group Board Pack",
        subtitle: "Monthly performance report — June 2026",
        meta: ["Period: June 2026 (close complete WD+8)",
               "Source: consolidation v2026.06.03",
               "Status: AI draft — for human review",
               "Illustrative data — modelled on public benchmarks"]
      },
      {
        id: "execSummary", type: "prose", title: "Executive summary",
        paragraphs: [
          "The Group closed June at WD+8. Revenue of $135.6m was $0.8m (0.6%) ahead of budget and 7.3% ahead of prior year, taking half-year revenue to $806.4m — $6.2m (0.8%) ahead of plan and +7.2% year on year. EBITDA of $41.8m fell ($0.8m) short of the June budget at a 30.8% margin, leaving H1 EBITDA at $249.2m, ($3.7m) (1.5%) behind plan at a 30.9% margin against 31.6% budgeted.",
          "The June margin shortfall is a cost story, not a revenue story. Favourable trading — AuA growth (+$1.4m), earlier-than-planned ESG mandate billing (+$0.5m) and a WIP release (+$0.4m) — was more than offset by unbudgeted Luxembourg wage indexation ($1.3m), contractor backfill against 41 open roles ($0.7m), depositary fee compression ($0.6m) and adverse FX translation ($0.5m). Adjusting for the WIP timing benefit, the underlying miss is closer to ($1.2m).",
          "Management attention for H2 sits in three places: converting the Luxembourg indexation into the July pricing cycle (pass-through clauses cover roughly two-thirds of the LU book), closing the contractor premium through direct hiring against 41 open roles, and the Custody & Depositary renewal cohort of c.$21.4m annualised fees currently in negotiation. Working capital also warrants a standing item: unbilled WIP of $52.3m (+$6.2m MoM) and DSO of 63 days against a 55-day target."
        ]
      },
      {
        id: "plSummary", type: "table", title: "Group P&L summary ($m)",
        columnGroups: [
          { label: "June 2026", cols: ["Actual", "Budget", "Var"] },
          { label: "Year to date", cols: ["Actual", "Budget", "Var", "PY"] }
        ],
        rows: PL_ROWS,
        footnote: "Variances shown favourable-positive; operating expenses presented as negative. PY restated on a like-for-like perimeter."
      },
      {
        id: "bridge", type: "figure", title: "June EBITDA bridge — budget to actual ($m)",
        figureRef: "bridge",
        caption: "Favourable +$2.3m more than offset by ($3.1m) of cost pressure; net ($0.8m) versus budget. WIP release of +$0.4m is timing and reverses in July."
      },
      {
        id: "serviceLines", type: "prose", title: "Service line performance",
        paragraphs: [
          "Fund Solutions — $70.4m in June ($419.5m YTD, +7.8% YoY, +$5.3m vs budget). Average billable AuA ran 2.1% ahead of plan on market performance and net inflows, with ad valorem fees following on the usual one-month lag. New-mandate onboarding is running ahead of plan, which flatters revenue but is the main driver of the June WIP build.",
          "Corporate & Legal Solutions — $29.9m in June ($177.8m YTD, +6.1% YoY). Entity counts continue to grow with sponsor activity; June includes a $0.4m release of April–May unbilled WIP on three mandates, which reverses in July. Underlying run-rate is in line with plan.",
          "Custody & Depositary — $22.8m in June ($136.6m YTD, +1.9% YoY, ($3.2m) behind budget). H1 renewals repriced c.11% below prior fee schedules and AuA growth in the line is no longer covering the rate give-up. The H2 renewal cohort of c.$21.4m annualised fees is the principal revenue risk to the full-year outlook; bundling with ManCo and reporting services is the primary mitigation.",
          "ESG & Regulatory Reporting — $7.1m in June ($40.9m YTD, +26.3% YoY, +$2.6m vs budget). Fourteen Holtara engagements signed in Q2 began billing in June, ahead of the September start assumed in budget. Drafting and data-collection capacity, not demand, is the current constraint on growth.",
          "Digital Banking & Other — $5.4m in June ($31.6m YTD, +9.4% YoY). Payment volumes ahead of plan on a small base; performing in line with budget."
        ]
      },
      {
        id: "outlook", type: "prose", title: "Outlook & risks",
        paragraphs: [
          "Full-year revenue is tracking toward c.$1.62bn, marginally ahead of budget. The margin path is the challenge: at the current 30.9% YTD run-rate the year lands nearer 31.2% than the budgeted glidepath toward the stated 35% ambition, and every 10bps of margin is worth c.$1.6m of EBITDA at budget revenue. H2 delivery therefore rests on indexation pass-through, direct hiring against the contractor premium, renewal pricing discipline and billing completeness — WIP and DSO remain the largest self-help levers."
        ],
        bullets: [
          "Depositary repricing: H2 renewal cohort of c.$21.4m annualised fees closes at H1 rates — c.($1.4m) EBITDA risk.",
          "Luxembourg indexation: a second statutory trigger before year-end would add c.($0.7m) per month unmitigated.",
          "Attrition at 17.6% keeps the contractor premium alive; 41 roles open at June.",
          "FX: continued USD strength versus budget rates carries translation drag on the non-USD cost base.",
          "Working capital: WIP $52.3m (+$6.2m MoM) and DSO 63 days vs 55-day target — realisation risk if aged WIP builds."
        ]
      }
    ],
    reviewNote: "Every figure traced to consolidation v2026.06.03 — click any number in a real deployment to see lineage. Draft requires human sign-off before circulation."
  };

  /* ---------- workbook risk scanner: the fee-revenue model pastiche ----------
     Grid rows: rows[0] is the header row (sheet row 1); data rows 2–13;
     row 14 totals. Cells: { v: display, f: formula (optional),
     risk: finding id (optional) }. Column I is hidden on the sheet. */

  var WORKBOOK = {
    name: "Group_Fee_Revenue_Model_v14_FINAL(3).xlsx",
    sheets: 31,
    links: 14,
    lastAudit: "never",
    riskScore: "High",
    grid: {
      cols: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      hiddenCols: ["I"],
      activeCell: "H7",
      rows: [
        [ { v: "Client / mandate" }, { v: "Domicile" }, { v: "Product" },
          { v: "AuA ($m)" }, { v: "Fee (bps)" }, { v: "Floor ($k)" },
          { v: "FX to USD" }, { v: "Gross fee ($k)" }, { v: "Adj %", risk: "WB-05" },
          { v: "Net revenue ($k)" } ],
        [ { v: "Meridian Capital Partners Fund IV" }, { v: "Cayman" }, { v: "Fund administration" },
          { v: "4,250" }, { v: "6.5" }, { v: "180" }, { v: "1.0000" },
          { v: "2,762.5", f: "=MAX(D2*E2/10,F2)" }, { v: "5.0%" },
          { v: "2,624.4", f: "=H2*(1-I2)*G2" } ],
        [ { v: "Northlake Private Credit II" }, { v: "Delaware" }, { v: "Fund administration" },
          { v: "2,870" }, { v: "5.8" }, { v: "150" }, { v: "1.0000" },
          { v: "1,664.6", f: "=MAX(D3*E3/10,F3)" }, { v: "0.0%" },
          { v: "1,664.6", f: "=H3*(1-I3)*G3" } ],
        [ { v: "Aldergate Real Assets SCSp" }, { v: "Luxembourg" }, { v: "ManCo + fund administration" },
          { v: "1,980" }, { v: "7.2" }, { v: "120" },
          { v: "1.0716", f: "='[FX_Rates_2026.xlsx]Rates'!$B$4" },
          { v: "1,425.6", f: "=MAX(D4*E4/10,F4)" }, { v: "3.0%" },
          { v: "1,481.8", f: "=H4*(1-I4)*G4" } ],
        [ { v: "Kestrel Global Equity UCITS" }, { v: "Ireland" }, { v: "Transfer agency & NAV delivery" },
          { v: "3,410" }, { v: "4.9" }, { v: "200" },
          { v: "1.0716", f: "='[FX_Rates_2026.xlsx]Rates'!$B$4" },
          { v: "1,670.9", f: "=MAX(D5*E5/10,F5)" }, { v: "4.0%" },
          { v: "1,719.1", f: "=H5*(1-I5)*G5" } ],
        [ { v: "Baltoro Infrastructure Partners III" }, { v: "Jersey" }, { v: "Fund administration" },
          { v: "2,140" }, { v: "6.8" }, { v: "140" },
          { v: "1.2680", f: "='[FX_Rates_2026.xlsx]Rates'!$B$7" },
          { v: "1,455.2", f: "=MAX(D6*E6/10,F6)" }, { v: "2.0%" },
          { v: "1,808.3", f: "=H6*(1-I6)*G6" } ],
        [ { v: "Hollis Street Secondaries III" }, { v: "Cayman" }, { v: "Fund administration" },
          { v: "3,660" }, { v: "5.2" }, { v: "160" }, { v: "1.0000" },
          { v: "2,050.0", f: "=2050", risk: "WB-01" }, { v: "3.0%" },
          { v: "1,988.5", f: "=H7*(1-I7)*G7" } ],
        [ { v: "Vantage Row Private Debt" }, { v: "Luxembourg" }, { v: "Depositary & custody" },
          { v: "5,230" }, { v: "3.1" }, { v: "220" },
          { v: "1.0716", f: "='[FX_Rates_2025.xlsx]Rates'!$B$4", risk: "WB-02" },
          { v: "1,621.3", f: "=MAX(D8*E8/10,F8)" }, { v: "0.0%" },
          { v: "1,737.4", f: "=H8*(1-I8)*G8" } ],
        [ { v: "Crescent Harbour Ventures II" }, { v: "Guernsey" }, { v: "Fund administration" },
          { v: "1,520" }, { v: "7.6" }, { v: "110" },
          { v: "1.2680", f: "='[FX_Rates_2026.xlsx]Rates'!$B$7" },
          { v: "1,155.2", f: "=MAX(D9*E9/10,F9)" }, { v: "0.0%" },
          { v: "1,464.8", f: "=H9*(1-I9)*G9" } ],
        [ { v: "Tarn Hill Credit Opportunities" }, { v: "Delaware" }, { v: "Fund & loan administration" },
          { v: "2,690" }, { v: "5.5" }, { v: "150" }, { v: "1.0000" },
          { v: "1,479.5", f: "=MAX(D10*E10/10,F10)" }, { v: "5.0%" },
          { v: "1,387.2", risk: "WB-03" } ],
        [ { v: "Osprey Point Real Estate IV" }, { v: "Luxembourg" }, { v: "ManCo + fund administration" },
          { v: "1,760" }, { v: "7.4" }, { v: "130" },
          { v: "1.0716", f: "='[FX_Rates_2026.xlsx]Rates'!$B$4" },
          { v: "1,302.4", f: "=MAX(D11*E11/10,F11)" }, { v: "2.0%" },
          { v: "1,367.9", f: "=H11*(1-I11)*G11" } ],
        [ { v: "Whitmore Holdings S.à r.l." }, { v: "Luxembourg" }, { v: "Corporate & legal solutions" },
          { v: "940" }, { v: "9.8" }, { v: "90" },
          { v: "1.0900", risk: "WB-04" },
          { v: "921.2", f: "=MAX(D12*E12/10,F12)" }, { v: "0.0%" },
          { v: "1,004.1", f: "=H12*(1-I12)*G12" } ],
        [ { v: "Crescent Harbour Ventures II", risk: "WB-06" }, { v: "Guernsey" }, { v: "Fund administration" },
          { v: "1,520" }, { v: "7.6" }, { v: "110" },
          { v: "1.2680", f: "='[FX_Rates_2026.xlsx]Rates'!$B$7" },
          { v: "1,155.2", f: "=MAX(D13*E13/10,F13)" }, { v: "0.0%" },
          { v: "1,464.8", f: "=H13*(1-I13)*G13" } ],
        [ { v: "Total (12 mandates)" }, { v: "" }, { v: "" },
          { v: "31,970", f: "=SUM(D2:D13)" }, { v: "" }, { v: "" }, { v: "" },
          { v: "18,663.6", f: "=SUM(H2:H13)" }, { v: "" },
          { v: "19,712.9", f: "=SUM(J2:J13)" } ]
      ]
    },
    findings: [
      { id: "WB-01", severity: "high", cell: "H7",
        title: "Hard-coded override in a formula column",
        detail: "H7 contains the constant 2,050.0 where the column formula =MAX(D7*E7/10,F7) computes 1,903.2. The override flows through to net revenue of 1,988.5 against a correct 1,846.1 — annual fees on this mandate are overstated by $142.4k, and the override survives every AuA update.",
        fix: "Restore the column formula. If a negotiated minimum applies, hold it in the fee-schedule column (F), never in the calculation cell — and add a formula-consistency check to the review pack." },
      { id: "WB-02", severity: "high", cell: "G8",
        title: "Broken external link — stale FX rate",
        detail: "G8 references [FX_Rates_2025.xlsx], which no longer resolves; the cell shows the last cached EUR/USD of 1.0716 against 1.0952 on the current rates sheet. Net revenue on this row is understated by c.$38.3k. The workbook carries 14 external links, of which 3 are unresolvable.",
        fix: "Repoint to the FX_Rates_2026 named range, then run a full link audit — every unresolvable link is a silently frozen number." },
      { id: "WB-03", severity: "medium", cell: "J10",
        title: "Pasted value over a live formula",
        detail: "J10 holds a pasted 1,387.2 where the column formula computes 1,405.5 — an ($18.3k) stale paste carried over from a prior AuA figure. Nothing marks the cell as manual, so it will sit unchanged through the next twelve updates.",
        fix: "Reinstate the formula and adopt a hard rule: manual values only in input columns, shaded and documented." },
      { id: "WB-04", severity: "medium", cell: "G12",
        title: "Typed FX rate inconsistent with the rates sheet",
        detail: "G12 is a typed 1.0900 while every other EUR row links to the rates sheet at 1.0716. The row overstates net revenue by c.$16.9k, and the model now quietly applies two different EUR/USD rates in the same column.",
        fix: "Link the cell to the rates sheet. One source for every rate; typed rates fail any consistency review." },
      { id: "WB-05", severity: "medium", cell: "I",
        title: "Hidden column of manual adjustments feeding the total",
        detail: "Column I is hidden and carries undocumented manual 'Adj %' overrides that feed every net-revenue formula — roughly $455.8k of discounts flow through the model with no owner, no rationale and no audit trail.",
        fix: "Unhide the column, document each adjustment against its fee schedule or side letter, and move discount governance to a visible, referenced input table." },
      { id: "WB-06", severity: "low", cell: "A13",
        title: "Possible duplicate client row",
        detail: "Crescent Harbour Ventures II appears on rows 9 and 13 with identical AuA, fee and FX; both rows feed the SUM in J14. If this is one mandate, fee revenue is double-counted by $1,464.8k; if these are master and feeder sleeves billed separately, the naming should distinguish them.",
        fix: "Confirm with the relationship team; either delete the duplicate or rename the rows to reflect the actual billing entities." }
    ],
    stats: { errorRatePct: 5.2, source: "Panko, U. Hawaii" }
  };

  /* ---------- capability map: twelve starting points ---------- */

  var CAPABILITIES = [
    { id: "boardpack", title: "Board pack automation", func: "Reporting", horizon: "Now",
      value: 5, readiness: 4,
      oneLiner: "From consolidation extract to reviewed board pack in one working day, not four.",
      detail: "The pack drafts itself from the June consolidation: variances computed, commentary grounded in the actual GL movements, tables and bridge figures assembled to the house template. Humans review and sign off; nothing circulates without a named approver.",
      impactStat: { text: "Board packs cost large organisations an average of £3m a year; one FTSE-100 financial-services board meeting can consume £250k and 100+ days of preparation.", source: "Board Intelligence / ICSA" },
      dataNeeded: "Read-only consolidation extract, budget and prior-year cubes, the existing pack template.",
      controlsPosture: "Post-close only. Drafts carry figure-level lineage to the consolidation version; a human sign-off gate precedes circulation.",
      demo: "dashboard.html#boardpack" },
    { id: "commentary", title: "Variance commentary drafting", func: "FP&A", horizon: "Now",
      value: 5, readiness: 4,
      oneLiner: "The EBITDA bridge explains itself — grounded in GL detail, cited, ready for review at WD+8.",
      detail: "Every bridge step is drafted from the underlying movements — which entities, which GL ranges, what changed against budget — with sources attached. Analysts edit and approve rather than assemble; the two days currently spent writing become a morning spent reviewing.",
      impactStat: { text: "Unilever's FP&A team publishes gen-AI-drafted performance commentary three times faster.", source: "Unilever / Microsoft case study" },
      dataNeeded: "Trial-balance-level actuals, budget and prior year by entity and GL range.",
      controlsPosture: "Reads the closed ledger; writes nothing back. Prompt and output logs retained for audit.",
      demo: "dashboard.html#command" },
    { id: "ask", title: "Ask the numbers (natural-language P&L)", func: "FP&A", horizon: "Now",
      value: 4, readiness: 3,
      oneLiner: "Plain-English questions against the consolidation layer, answered with figures, charts and citations.",
      detail: "Deputy-CFO questions — why did June miss, what is the Luxembourg comp position — answered in seconds from governed data, with every figure citing its source and known data caveats surfaced rather than hidden. No more two-day turnarounds on questions the data can already answer.",
      impactStat: { text: "75% of FP&A time goes to gathering and processing data; 25% to analysis.", source: "AFP / APQC benchmarking" },
      dataNeeded: "Governed semantic layer over consolidation, budget and operational metrics.",
      controlsPosture: "Read-only, role-based access mirroring existing entitlements; refuses questions the data cannot support.",
      demo: "dashboard.html#ask" },
    { id: "workbook", title: "Workbook risk scanner", func: "FP&A", horizon: "Now",
      value: 4, readiness: 4,
      oneLiner: "Every hardcode, broken link and pasted value in the fee models — found before they feed the P&L.",
      detail: "Points at the spreadsheet estate that feeds revenue — fee models, FX workings, allocation files — and flags formula overrides, stale external links, hidden columns and inconsistent rates with a suggested fix for each. The models keep working exactly as before; they just stop hiding things.",
      impactStat: { text: "More than 90% of spreadsheets contain errors; roughly 5.2% of cells in operational spreadsheets are wrong, and reviewers catch only 50–80%.", source: "EuSpRIG; Panko, U. Hawaii" },
      dataNeeded: "File-share access to the nominated workbook inventory; no changes written.",
      controlsPosture: "Scan-and-report only. Fixes are proposed, never applied; remediation stays with the model owner.",
      demo: "dashboard.html#workbook" },
    { id: "leakage", title: "Fee-schedule vs billed reconciliation", func: "Revenue & Billing", horizon: "Next",
      value: 5, readiness: 3,
      oneLiner: "Reads the fee schedules, reads the invoices, finds the gap — recovered basis points, not slideware.",
      detail: "AI extracts the commercial terms from fee schedules and side letters, recomputes expected fees from AuA and activity, and reconciles against what was actually billed. Missed escalations, unapplied floors and un-billed scope surface as a worked recovery list with entity and invoice references.",
      impactStat: { text: "Companies typically lose 1–5% of EBITDA to revenue leakage — unbilled scope, fee-schedule drift, missed escalations.", source: "EY revenue assurance studies" },
      dataNeeded: "Fee schedules and side letters, billing extracts, AuA and activity data by mandate.",
      controlsPosture: "Findings feed the existing billing-adjustment process; nothing is rebilled automatically.",
      demo: null },
    { id: "contracts", title: "Fee-terms extraction from LPAs & side letters", func: "Revenue & Billing", horizon: "Next",
      value: 4, readiness: 3,
      oneLiner: "Forty acquisitions' worth of fee terms, structured and queryable instead of buried in PDFs.",
      detail: "Every acquired book brought its own contract formats. AI reads LPAs, administration agreements and side letters into a structured terms database — rates, floors, escalators, notice periods — so billing, renewals and leakage work all start from the same verified source.",
      impactStat: { text: "JPMorgan's COiN platform reviews 12,000 credit agreements in seconds — work that previously consumed roughly 360,000 lawyer-hours a year.", source: "JPMorgan (COiN), 2017 disclosures" },
      dataNeeded: "Contract repository access; a sample set with known terms for validation.",
      controlsPosture: "Extraction confidence scores on every field; low-confidence terms route to human verification.",
      demo: null },
    { id: "decks", title: "Client & sponsor deck generation", func: "Reporting", horizon: "Now",
      value: 3, readiness: 4,
      oneLiner: "Quarterly sponsor and client decks drafted from governed numbers in the house template.",
      detail: "The same grounded-generation engine that drafts the board pack produces sponsor updates, covenant reporting decks and client quarterlies — figures from the consolidation layer, narrative drafted for a named audience, always through the human gate.",
      impactStat: { text: "Generative-AI assistance cuts deck creation time by roughly 75% — four hours of assembly to under one.", source: "Microsoft Copilot deployment studies" },
      dataNeeded: "Consolidation and KPI extracts, house templates, prior-quarter decks for tone.",
      controlsPosture: "Same lineage-and-sign-off gate as the board pack; audience-based redaction rules built in.",
      demo: null },
    { id: "flux", title: "Post-close flux analysis & drill-down", func: "FP&A", horizon: "Next",
      value: 4, readiness: 3,
      oneLiner: "Every month-on-month movement above threshold, explained to entity and GL level — after the close, never inside it.",
      detail: "Once the ledger is closed, AI sweeps the trial balance for movements beyond materiality, drills to entity and account, and drafts the explanation with links to the underlying postings. Analysts confirm or correct rather than dig. The close itself is untouched.",
      impactStat: { text: "Variance analysis is consistently rated the single most time-consuming month-end task in FP&A benchmarking.", source: "AFP FP&A surveys" },
      dataNeeded: "Closed trial balances by entity, materiality thresholds, mapping tables.",
      controlsPosture: "Strictly post-close and read-only; no journals, no adjustments, no exceptions.",
      demo: null },
    { id: "cash", title: "Cash & covenant forecast assistance", func: "Treasury", horizon: "Next",
      value: 4, readiness: 2,
      oneLiner: "Thirteen-week cash and covenant headroom forecasts with drivers made explicit.",
      detail: "With sponsor-visible deleveraging from 6.6x toward 5.8x, covenant headroom is board-page material. AI-assisted forecasting blends billing pipeline, WIP ageing and collections behaviour into a driver-based cash view, with every assumption stated and challengeable.",
      impactStat: { text: "Machine-learning-assisted forecasting reduces forecast error by 20–50% in finance deployments.", source: "McKinsey" },
      dataNeeded: "Bank feeds, AR ageing, billing pipeline, debt schedule and covenant definitions.",
      controlsPosture: "Decision-support only; treasury executes nothing on model output. Assumptions logged per run.",
      demo: null },
    { id: "esgnarr", title: "ESG & regulatory narrative drafting", func: "Reporting", horizon: "Next",
      value: 3, readiness: 3,
      oneLiner: "Holtara-side client reporting drafted from collected data — capacity for the fastest-growing line.",
      detail: "ESG & Regulatory Reporting is growing +26.3% YoY in this dataset and drafting capacity, not demand, is the constraint. Grounded generation turns collected portfolio data into first-draft client reports and regulatory narratives, reviewed by the same specialists who write them today.",
      impactStat: { text: "Commentary drafting time falls 30–50% and data preparation around 60% in generative-AI FP&A and reporting deployments.", source: "McKinsey / Hackett benchmarks" },
      dataNeeded: "Holtara data-collection outputs, reporting templates, prior-year reports.",
      controlsPosture: "Specialist review gate; regulatory filings always carry a named human owner.",
      demo: null },
    { id: "dso", title: "Collections prioritisation & DSO analytics", func: "Revenue & Billing", horizon: "Later",
      value: 3, readiness: 2,
      oneLiner: "Work the receivables book by predicted payment behaviour, not alphabetical order.",
      detail: "At 63 days against a 55-day target, DSO carries roughly $8m of trapped cash conversion. AI ranks the AR book by likelihood-to-slip, drafts chase correspondence in the right register for each relationship, and flags disputes early — collectors decide, AI sequences.",
      impactStat: { text: "Organisations report $3.70 of return per $1 invested in generative AI, with financial services the leading industry.", source: "IDC / Microsoft, 2024" },
      dataNeeded: "AR ledger with ageing, payment histories, dispute logs, contact records.",
      controlsPosture: "No automated dunning; every client contact is human-sent. Credit decisions stay with credit control.",
      demo: null },
    { id: "academy", title: "Finance AI academy & enablement", func: "Firmwide", horizon: "Later",
      value: 4, readiness: 5,
      oneLiner: "Role-based training, a champions cohort and certification — so capability stays when we leave.",
      detail: "Pilots prove value; adoption compounds it. A structured academy — role-based curricula for analysts, controllers and leadership, a champions cohort embedded in each service line, and certification tied to real workflow — turns two use cases into an operating capability.",
      impactStat: { text: "94% of workers say they want generative-AI skills, yet only 5% of organisations train at scale.", source: "BCG / LinkedIn workforce AI research, 2025" },
      dataNeeded: "Role inventory, existing L&D infrastructure, the pilots themselves as courseware.",
      controlsPosture: "Training environments use the illustrative dataset, never client or production data.",
      demo: null }
  ];

  /* SPEC names this field "function"; expose both keys for consumers. */
  for (var ci = 0; ci < CAPABILITIES.length; ci++) {
    CAPABILITIES[ci]["function"] = CAPABILITIES[ci].func;
  }

  /* ---------- sourced statistics for the pitch page ---------- */

  var STATS = {
    fpaTimePct75: { value: 75,
      text: "75% of FP&A time goes to gathering and processing data; only 25% to analysis.",
      source: "AFP / APQC FP&A benchmarking", url: "https://www.afponline.org/" },
    boardPackCostGBP3M: { value: 3,
      text: "Board packs cost large organisations an average of £3m a year to produce; a single FTSE-100 financial-services board meeting can consume £250k and 100+ days of preparation.",
      source: "Board Intelligence / ICSA", url: "https://www.boardintelligence.com/" },
    spreadsheetErrorPct90: { value: 90,
      text: "More than 90% of spreadsheets contain at least one error.",
      source: "EuSpRIG research compilation", url: "https://eusprig.org/research-info/horror-stories/" },
    panko5_2: { value: 5.2,
      text: "Roughly 5.2% of cells in operational spreadsheets contain errors; reviewers catch only 50–80% of them.",
      source: "Panko, University of Hawai'i", url: "https://eusprig.org/research-info/" },
    adoption2024_6: { value: 6,
      text: "FP&A teams using AI in production: 6% in 2024.",
      source: "AFP FP&A survey series", url: "https://www.afponline.org/" },
    adoption2025_41: { value: 41,
      text: "FP&A teams using AI in production: 41% in 2025 — a near-sevenfold jump in one year.",
      source: "AFP FP&A survey series", url: "https://www.afponline.org/" },
    gartner90by2026: { value: 90,
      text: "59% of finance functions used AI in 2025; Gartner predicts 90% by 2026.",
      source: "Gartner finance surveys", url: "https://www.gartner.com/en/newsroom" },
    unilever3x: { value: 3,
      text: "Unilever's FP&A team publishes gen-AI-drafted performance commentary three times faster.",
      source: "Unilever / Microsoft case study", url: "https://www.microsoft.com/en/customers" },
    coin360kHours: { value: 360000,
      text: "JPMorgan's COiN reviews 12,000 credit agreements in seconds — work that consumed roughly 360,000 lawyer-hours a year.",
      source: "JPMorgan (COiN), 2017 disclosures", url: "https://www.jpmorgan.com/" },
    idcRoi3_7: { value: 3.7,
      text: "$3.70 of return per $1 invested in generative AI, with financial services the leading industry.",
      source: "IDC / Microsoft, 2024", url: "https://news.microsoft.com/" },
    leakage1to5: { value: 5,
      text: "Companies typically lose 1–5% of EBITDA to revenue leakage — unbilled scope, fee-schedule drift, missed escalations.",
      source: "EY revenue assurance studies", url: "https://www.ey.com/" },
    cfoHallucination86: { value: 86,
      text: "86% of CFOs report having seen hallucinated or incorrect AI output.",
      source: "CFO surveys, 2025", url: "https://www.cfodive.com/" },
    humanOversight97: { value: 97,
      text: "97% of finance leaders say human oversight of AI output is critical.",
      source: "CFO surveys, 2025", url: "https://www.cfodive.com/" },
    wantSkills94: { value: 94,
      text: "94% of workers say they want generative-AI skills.",
      source: "BCG / LinkedIn workforce AI research, 2025", url: "https://www.bcg.com/" },
    trainAtScale5: { value: 5,
      text: "Only 5% of organisations train their workforce on AI at scale.",
      source: "BCG / LinkedIn workforce AI research, 2025", url: "https://www.bcg.com/" },
    forecastError20_50: { value: 50,
      text: "Machine-learning-assisted forecasting reduces forecast error by 20–50%.",
      source: "McKinsey", url: "https://www.mckinsey.com/" },
    commentary30_50: { value: 50,
      text: "Commentary drafting time falls 30–50%, and data preparation around 60%, in gen-AI FP&A deployments.",
      source: "McKinsey / Hackett benchmarks", url: "https://www.mckinsey.com/" },
    copilotDeck75: { value: 75,
      text: "Deck creation time cut by roughly 75% — four hours of assembly to under one.",
      source: "Microsoft Copilot deployment studies", url: "https://news.microsoft.com/" },
    pilotStall90: { value: 90,
      text: "Roughly 90% of function-specific AI use cases stall in pilot; centrally-run programmes reach production at 70% versus 30%.",
      source: "McKinsey State of AI", url: "https://www.mckinsey.com/" }
  };

  /* ---------- assemble & publish ---------- */

  window.APEX_DATA = {
    meta: {
      period: "June 2026",
      periodShort: "Jun-26",
      closeDay: "WD+8",
      boardPackDue: "WD+12",
      currency: "USD",
      preparedFor: "Apex Group",
      consolidationVersion: "v2026.06.03",
      disclaimer: "Illustrative dataset modelled on public benchmarks for global fund administrators (Fitch/peer disclosures). No Apex Group data was used or accessed.",
      benchmarkNote: "How this dataset was built: revenue scale, growth and margin trajectory follow Fitch's published rating commentary for Apex Group (c.$1.5bn pro-forma revenue, 6–7% annual growth, EBITDA margin moving from 27.5% in 2023 toward a c.35% ambition by 2026, net leverage 7.6x trending to 5.8x). Service-line mix, seasonality, WIP/DSO levels and fee mechanics are modelled on public disclosures of listed fund administrators and industry benchmarks. Every figure is fabricated to be plausible; none is real."
    },
    group: {
      aua: 3.4e12,
      employees: 13240,
      countries: 52,
      offices: 88,
      acquisitions: 40,
      founded: 2003,
      marginTarget2026: 0.35,
      leverage: { fy24: 7.6, fy25: 6.6, fy26e: 5.8 },
      /* Fitch-defined FY23/24; illustrative management basis thereafter */
      marginMarch: [
        { label: "FY23", pct: 27.5, kind: "actual" },
        { label: "FY24", pct: 31.0, kind: "actual" },
        { label: "FY25", pct: 30.3, kind: "actual" },
        { label: "FY26 YTD", pct: 30.9, kind: "actual" },
        { label: "FY26 target", pct: 35.0, kind: "target" }
      ]
    },
    months: MONTHS,
    monthly: {
      revenue: { actual: REV_A, budget: REV_B, priorYear: REV_P },
      ebitda: { actual: EB_A, budget: EB_B, priorYear: EB_P },
      ebitdaMarginPct: { actual: MARGIN_A, budget: MARGIN_B }
    },
    ytd: YTD,
    serviceLines: SERVICE_LINES,
    regions: REGIONS,
    bridge: BRIDGE,
    ops: OPS,
    kpis: KPIS,
    askQuestions: ASK_QUESTIONS,
    boardPack: BOARD_PACK,
    workbook: WORKBOOK,
    capabilities: CAPABILITIES,
    stats: STATS
  };
})();

/* ---------- self-check: internal consistency (warnings only) ---------- */
(function () {
  "use strict";
  var D = window.APEX_DATA;
  if (!D) return;
  function warn(msg) {
    if (window.console && console.warn) console.warn("[APEX_DATA self-check] " + msg);
  }
  function near(a, b, tol) { return Math.abs(a - b) <= tol; }
  function sum(arr, pick) {
    var s = 0;
    for (var i = 0; i < arr.length; i++) s += pick ? pick(arr[i]) : arr[i];
    return s;
  }

  /* 1. Series lengths align to months */
  var series = [
    D.monthly.revenue.actual, D.monthly.revenue.budget, D.monthly.revenue.priorYear,
    D.monthly.ebitda.actual, D.monthly.ebitda.budget, D.monthly.ebitda.priorYear,
    D.monthly.ebitdaMarginPct.actual, D.monthly.ebitdaMarginPct.budget
  ];
  if (D.months.length !== 12) warn("months should have 12 labels, has " + D.months.length);
  for (var i = 0; i < series.length; i++) {
    if (series[i].length !== D.months.length) warn("monthly series #" + i + " length " + series[i].length + " does not match months (" + D.months.length + ")");
  }
  for (var k = 0; k < D.kpis.length; k++) {
    if (D.kpis[k].spark.length !== 12) warn("kpi '" + D.kpis[k].id + "' spark has " + D.kpis[k].spark.length + " points, expected 12");
  }

  /* 2. YTD blocks re-sum from monthly (Jan-26..Jun-26 = indices 6..11) */
  function sumFrom6(arr) { return sum(arr.slice(6)); }
  if (!near(sumFrom6(D.monthly.revenue.actual), D.ytd.revenue.actual, 0.05)) warn("ytd.revenue.actual does not re-sum from monthly");
  if (!near(sumFrom6(D.monthly.ebitda.actual), D.ytd.ebitda.actual, 0.05)) warn("ytd.ebitda.actual does not re-sum from monthly");

  /* 3. Service lines foot to YTD revenue (+/-0.15) */
  var slYtd = sum(D.serviceLines, function (s) { return s.ytdRevenue; });
  if (!near(slYtd, D.ytd.revenue.actual, 0.15)) warn("service lines sum to " + slYtd.toFixed(1) + ", ytd.revenue.actual is " + D.ytd.revenue.actual.toFixed(1));
  var slBud = sum(D.serviceLines, function (s) { return s.budget; });
  if (!near(slBud, D.ytd.revenue.budget, 0.15)) warn("service line budgets sum to " + slBud.toFixed(1) + ", ytd.revenue.budget is " + D.ytd.revenue.budget.toFixed(1));
  var slJun = sum(D.serviceLines, function (s) { return s.junActual; });
  if (!near(slJun, D.monthly.revenue.actual[11], 0.15)) warn("service line June actuals sum to " + slJun.toFixed(1) + ", June revenue is " + D.monthly.revenue.actual[11].toFixed(1));
  var slJunB = sum(D.serviceLines, function (s) { return s.junBudget; });
  if (!near(slJunB, D.monthly.revenue.budget[11], 0.15)) warn("service line June budgets sum to " + slJunB.toFixed(1) + ", June budget revenue is " + D.monthly.revenue.budget[11].toFixed(1));

  /* 4. Regions foot to YTD revenue */
  var regSum = sum(D.regions, function (r) { return r.ytdRevenue; });
  if (!near(regSum, D.ytd.revenue.actual, 0.15)) warn("regions sum to " + regSum.toFixed(1) + ", ytd.revenue.actual is " + D.ytd.revenue.actual.toFixed(1));

  /* 5. Bridge foots exactly (+/-0.01) and lands on June actual EBITDA */
  var bridgeEnd = D.bridge.start + sum(D.bridge.steps, function (s) { return s.value; });
  if (!near(bridgeEnd, D.bridge.end, 0.01)) warn("bridge does not foot: start + steps = " + bridgeEnd.toFixed(2) + ", end = " + D.bridge.end.toFixed(2));
  if (!near(D.bridge.end, D.monthly.ebitda.actual[11], 0.05)) warn("bridge.end (" + D.bridge.end + ") does not match June actual EBITDA (" + D.monthly.ebitda.actual[11] + ")");
  if (!near(D.bridge.start, D.monthly.ebitda.budget[11], 0.05)) warn("bridge.start (" + D.bridge.start + ") does not match June budget EBITDA (" + D.monthly.ebitda.budget[11] + ")");

  /* 6. Margins recompute from EBITDA / revenue (1dp) */
  for (var m = 0; m < 12; m++) {
    var expA = Math.round(D.monthly.ebitda.actual[m] / D.monthly.revenue.actual[m] * 1000) / 10;
    if (!near(expA, D.monthly.ebitdaMarginPct.actual[m], 0.05)) warn("actual margin for " + D.months[m] + " does not recompute (" + D.monthly.ebitdaMarginPct.actual[m] + " vs " + expA + ")");
    var expB = Math.round(D.monthly.ebitda.budget[m] / D.monthly.revenue.budget[m] * 1000) / 10;
    if (!near(expB, D.monthly.ebitdaMarginPct.budget[m], 0.05)) warn("budget margin for " + D.months[m] + " does not recompute (" + D.monthly.ebitdaMarginPct.budget[m] + " vs " + expB + ")");
  }
  var ytdMargin = Math.round(D.ytd.ebitda.actual / D.ytd.revenue.actual * 1000) / 10;
  if (!near(ytdMargin, D.ytd.marginPct.actual, 0.05)) warn("ytd margin does not recompute");

  /* 7. Board-pack P&L table foots */
  var pl = null;
  for (var s2 = 0; s2 < D.boardPack.sections.length; s2++) {
    if (D.boardPack.sections[s2].id === "plSummary") pl = D.boardPack.sections[s2];
  }
  if (pl) {
    var revRows = pl.rows.filter(function (r) { return r.kind === "line" && r.label !== "Operating expenses"; });
    var revTotal = pl.rows.filter(function (r) { return r.kind === "subtotal"; })[0];
    var ebRow = pl.rows.filter(function (r) { return r.kind === "total"; })[0];
    var opexRow = pl.rows.filter(function (r) { return r.label === "Operating expenses"; })[0];
    if (revTotal && !near(sum(revRows, function (r) { return r.ytdActual; }), revTotal.ytdActual, 0.15)) warn("board pack P&L: service lines do not foot to total revenue");
    if (revTotal && ebRow && opexRow && !near(revTotal.ytdActual + opexRow.ytdActual, ebRow.ytdActual, 0.15)) warn("board pack P&L: revenue + opex does not equal EBITDA");
  }

  /* 8. Workbook total row equals sum of net-revenue cells */
  var g = D.workbook.grid.rows;
  function cellNum(cell) { return parseFloat(String(cell.v).replace(/,/g, "")) || 0; }
  var jSum = 0;
  for (var r2 = 1; r2 <= 12; r2++) jSum += cellNum(g[r2][9]);
  var jTotal = cellNum(g[13][9]);
  if (!near(jSum, jTotal, 0.15)) warn("workbook net revenue total " + jTotal.toFixed(1) + " does not equal sum of rows " + jSum.toFixed(1));
  if (D.workbook.findings.length !== 6) warn("workbook should carry 6 findings, has " + D.workbook.findings.length);
  if (D.askQuestions.length !== 7) warn("askQuestions should carry 7 entries, has " + D.askQuestions.length);
})();
