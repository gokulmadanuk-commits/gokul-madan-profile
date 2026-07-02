/* ============================================================
   Apex AI Partnership — pitch page behaviour (index.html)
   Classic script, file:// safe. Reads window.APEX_DATA /
   window.APEX_FMT (data.js) and window.Viz (charts.js).

   Responsibilities:
   - data binding ([data-num] / [data-calc]) so no dataset figure
     lives as a literal in markup
   - margin-march figure
   - stat-tile band with count-up on first view
   - capability map: grid scatter + list views, filters, drawer
   - live demo preview (tiles, chart, AI panel)
   - footnotes: list render + hover popovers
   - section rail (active state + progress), print prep
   ============================================================ */
(function () {
  "use strict";

  var D = window.APEX_DATA;
  var F = window.APEX_FMT;
  var V = window.Viz;
  if (!D || !F || !V) return;

  var reduced = V.prefersReducedMotion();

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt !== undefined && txt !== null) n.textContent = txt;
    return n;
  }

  /* ---------- formatters ---------- */

  var FMTX = {
    m: F.m, pct: F.pct, delta: F.delta, money: F.money,
    num: F.num, days: F.days, pp: F.pp, deltaM: F.deltaM,
    raw: function (v) { return String(v); },
    int: function (v) { return String(Math.round(v)); },
    x1: function (v) { return v.toFixed(1) + "×"; },
    usd2: function (v) { return "$" + v.toFixed(2); },
    pct0: function (v) { return Math.round(v) + "%"; }
  };

  function resolvePath(obj, path) {
    var parts = path.split(".");
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur === undefined || cur === null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  /* ---------- data binding ---------- */

  function bindNumbers() {
    $$("[data-num]").forEach(function (node) {
      var spec = node.getAttribute("data-num").split("|");
      var value = resolvePath(D, spec[0]);
      if (value === undefined) return;
      var fmt = FMTX[spec[1] || "raw"] || FMTX.raw;
      node.textContent = fmt(value);
    });

    var calcs = {
      marginGapBps: String(Math.round(
        (D.group.marginTarget2026 * 100 - D.ytd.marginPct.actual) * 100)),
      t12Revenue: F.money(D.monthly.revenue.actual.reduce(function (a, b) {
        return a + b;
      }, 0) * 1e6)
    };
    $$("[data-calc]").forEach(function (node) {
      var key = node.getAttribute("data-calc");
      if (calcs[key] !== undefined) node.textContent = calcs[key];
    });
  }

  /* ---------- 01: margin-march figure ---------- */

  function renderMarginMarch() {
    var host = $("#fig-margin-march");
    if (!host) return;
    var march = D.group.marginMarch;
    var actuals = march.filter(function (p) { return p.kind === "actual"; });
    var target = null;
    march.forEach(function (p) { if (p.kind === "target") target = p; });

    V.line(host, {
      labels: actuals.map(function (p) { return p.label; }),
      series: [{
        name: "EBITDA margin",
        color: "--series-1",
        values: actuals.map(function (p) { return p.pct; })
      }],
      markers: true,
      format: F.pct,
      refLine: target ? {
        value: target.pct,
        label: "FY26 ambition — " + F.pct(target.pct)
      } : null,
      yMin: 26,
      yMax: 36.5,
      height: 270,
      ariaLabel: "EBITDA margin from " + F.pct(actuals[0].pct) + " in FY23 to " +
        F.pct(actuals[actuals.length - 1].pct) + " at the FY26 year-to-date mark, " +
        "against a dashed reference line at the " + F.pct(target.pct) + " FY26 ambition."
    });

    var cap = $("#margin-march-caption");
    if (cap) {
      var gapBps = Math.round((target.pct - D.ytd.marginPct.actual) * 100);
      cap.textContent = "The " + gapBps + "-basis-point question: FY26 stands at " +
        F.pct(D.ytd.marginPct.actual) + " year to date against the " +
        F.pct(target.pct) + " ambition. Hours returned to analysis are one of the " +
        "few levers that move this number without touching headcount or price.";
    }
  }

  /* ---------- 01: stat band with count-up ---------- */

  /* Every count-up registers a "jump to the end state" callback here so
     printing (or anything else) can force final values even if the tiles
     were never scrolled into view. */
  var pendingCountUps = [];

  function countUp(node, target, display) {
    if (reduced || !window.requestAnimationFrame) {
      node.textContent = display(target);
      return;
    }
    var t0 = null;
    var dur = 950;
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      node.textContent = display(target);
    }
    function tick(ts) {
      if (finished) return;
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = display(Math.round(target * eased));
      if (p < 1) window.requestAnimationFrame(tick);
      else finish();
    }
    window.requestAnimationFrame(tick);
  }

  function renderStatBand() {
    var band = $("#stat-band");
    if (!band) return;
    var tiles = [
      {
        stat: D.stats.fpaTimePct75, fn: 7,
        display: function (v) { return v + "%"; },
        label: "of FP&A time goes to gathering and processing data — not analysis"
      },
      {
        stat: D.stats.boardPackCostGBP3M, fn: 8,
        display: function (v) { return "£" + v + "m"; },
        label: "average annual cost of board-pack production in large organisations"
      },
      {
        stat: D.stats.spreadsheetErrorPct90, fn: 9,
        display: function (v) { return ">" + v + "%"; },
        label: "of spreadsheets contain at least one error"
      }
    ];

    var runners = [];
    var started = false;
    tiles.forEach(function (t) {
      var tile = el("div", "stat-tile");
      var value = el("span", "stat-value num", t.display(0));
      var label = el("span", "stat-label");
      label.appendChild(document.createTextNode(t.label));
      var sup = el("sup", "fn");
      var a = el("a", null, String(t.fn));
      a.setAttribute("href", "#fn-" + t.fn);
      sup.id = "fnref-" + t.fn;
      sup.appendChild(a);
      label.appendChild(sup);
      var src = el("span", "stat-src", "Source: " + t.stat.source);
      tile.appendChild(value);
      tile.appendChild(label);
      tile.appendChild(src);
      band.appendChild(tile);
      runners.push(function () { countUp(value, t.stat.value, t.display); });
      pendingCountUps.push(function () {
        started = true;
        value.textContent = t.display(t.stat.value);
      });
    });

    function start() {
      if (started) return;
      started = true;
      runners.forEach(function (r) { r(); });
    }

    if (!window.IntersectionObserver || reduced) {
      start();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { start(); io.disconnect(); }
      });
    }, { threshold: 0.35 });
    io.observe(band);
  }

  /* ============================================================
     03: capability map
     ============================================================ */

  var SHORT_LABELS = {
    boardpack: "Board pack", commentary: "Commentary", ask: "Ask the numbers",
    workbook: "Workbook scan", leakage: "Fee leakage", contracts: "Contract terms",
    decks: "Deck generation", flux: "Flux analysis", cash: "Cash & covenant",
    esgnarr: "ESG narrative", dso: "Collections", academy: "AI academy"
  };
  var HORIZONS = ["Now", "Next", "Later"];
  var HORIZON_SUB = {
    Now: "demo-backed or near-ready",
    Next: "one data agreement away",
    Later: "sequenced behind the first wins"
  };

  var mapState = { view: "grid", func: "All", horizon: "All" };
  var gridDots = {};   /* capability id -> button */
  var listRows = {};   /* capability id -> button */

  function capMatches(cap) {
    return (mapState.func === "All" || cap.func === mapState.func) &&
           (mapState.horizon === "All" || cap.horizon === mapState.horizon);
  }

  function meterText(n) {
    var s = "";
    for (var i = 1; i <= 5; i++) s += (i <= n ? "●" : "○");
    return s;
  }

  function buildChips(container, values, key) {
    var all = ["All"].concat(values);
    all.forEach(function (v) {
      var chip = el("button", "chip", v);
      chip.type = "button";
      chip.setAttribute("aria-pressed", v === mapState[key] ? "true" : "false");
      chip.addEventListener("click", function () {
        mapState[key] = v;
        $$(".chip", container).forEach(function (c) {
          c.setAttribute("aria-pressed", c.textContent === v ? "true" : "false");
        });
        applyFilters();
      });
      container.appendChild(chip);
    });
  }

  function buildGrid() {
    var plot = $("#map-grid");
    if (!plot) return;

    /* group markers that share a (value, readiness) cell so they nudge apart */
    var groups = {};
    D.capabilities.forEach(function (cap) {
      var key = cap.value + "/" + cap.readiness;
      (groups[key] = groups[key] || []).push(cap.id);
    });

    D.capabilities.forEach(function (cap) {
      var x = (cap.readiness - 0.5) * 20;
      var y = 100 - (cap.value - 0.5) * 20;
      var group = groups[cap.value + "/" + cap.readiness];
      var idx = group.indexOf(cap.id);
      var dy = (idx - (group.length - 1) / 2) * 30;

      var btn = el("button", "map-dot" + (cap.demo ? " has-demo" : ""));
      btn.type = "button";
      btn.style.left = x + "%";
      btn.style.top = "calc(" + y + "% + " + dy + "px)";
      if (cap.readiness >= 4.5) btn.classList.add("flip");
      btn.setAttribute("aria-haspopup", "dialog");
      btn.setAttribute("aria-label",
        cap.title + " — " + cap.func + ", horizon " + cap.horizon +
        ". Value " + cap.value + " of 5, readiness " + cap.readiness + " of 5." +
        (cap.demo ? " Working demo available." : "") + " Open details.");

      var dot = el("span", "dot");
      dot.setAttribute("aria-hidden", "true");
      var textWrap = el("span", "dot-text");
      textWrap.appendChild(el("span", "dot-label", SHORT_LABELS[cap.id] || cap.title));
      if (cap.demo) textWrap.appendChild(el("span", "dot-tag", "Working demo"));
      btn.appendChild(dot);
      btn.appendChild(textWrap);
      btn.addEventListener("click", function () { openCapability(cap.id, btn); });
      plot.appendChild(btn);
      gridDots[cap.id] = btn;
    });
  }

  function buildList() {
    var list = $("#map-list");
    if (!list) return;
    HORIZONS.forEach(function (h) {
      var caps = D.capabilities.filter(function (c) { return c.horizon === h; });
      if (!caps.length) return;
      caps.sort(function (a, b) {
        return (b.value - a.value) || (b.readiness - a.readiness);
      });
      list.appendChild(el("h4", "map-group-h", h + " — " + HORIZON_SUB[h]));
      caps.forEach(function (cap) {
        var row = el("button", "map-row");
        row.type = "button";
        row.setAttribute("aria-haspopup", "dialog");

        var main = el("span", "row-main");
        var head = el("span", "row-head");
        head.appendChild(el("strong", null, cap.title));
        if (cap.demo) head.appendChild(el("span", "tag-demo", "Working demo"));
        main.appendChild(head);
        main.appendChild(el("span", "row-one", cap.oneLiner));

        var meta = el("span", "row-meta");
        meta.appendChild(el("span", null, cap.func));
        meta.appendChild(el("span", null,
          "Value " + cap.value + "/5 · Readiness " + cap.readiness + "/5"));

        row.appendChild(main);
        row.appendChild(meta);
        row.addEventListener("click", function () { openCapability(cap.id, row); });
        list.appendChild(row);
        listRows[cap.id] = row;
      });
    });
  }

  function applyFilters() {
    var shown = 0;
    D.capabilities.forEach(function (cap) {
      var on = capMatches(cap);
      if (on) shown++;
      if (gridDots[cap.id]) gridDots[cap.id].classList.toggle("is-dim", !on);
      if (listRows[cap.id]) listRows[cap.id].classList.toggle("is-filtered-out", !on);
    });
    var count = $("#map-count");
    if (count) {
      count.textContent = shown === D.capabilities.length
        ? "Showing all " + shown + " capabilities."
        : "Showing " + shown + " of " + D.capabilities.length + " capabilities.";
    }
  }

  function setMapView(view) {
    mapState.view = view;
    var gridWrap = $("#map-grid-wrap");
    var list = $("#map-list");
    if (gridWrap) gridWrap.hidden = view !== "grid";
    if (list) list.hidden = view !== "list";
    $$(".view-toggle .chip").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-view") === view ? "true" : "false");
    });
  }

  /* ---------- drawer ---------- */

  var drawer = $("#drawer");
  var backdrop = $("#drawer-backdrop");
  var drawerClose = $("#drawer-close");
  var drawerOpener = null;

  function fillDrawer(cap) {
    var body = $("#drawer-content");
    while (body.firstChild) body.removeChild(body.firstChild);

    body.appendChild(el("span", "drawer-eyebrow", cap.func + " · " + cap.horizon));

    var h = el("h3", null, cap.title);
    h.id = "drawer-title";
    body.appendChild(h);
    if (cap.demo) body.appendChild(el("span", "tag-demo", "Working demo"));

    body.appendChild(el("p", "drawer-one", cap.oneLiner));
    body.appendChild(el("p", "drawer-detail", cap.detail));

    var meters = el("div", "drawer-meters");
    [["Value", cap.value], ["Readiness", cap.readiness]].forEach(function (m) {
      var span = el("span");
      span.appendChild(document.createTextNode(m[0] + " " + m[1] + "/5 "));
      var dots = el("span", "meter", meterText(m[1]));
      dots.setAttribute("aria-hidden", "true");
      span.appendChild(dots);
      meters.appendChild(span);
    });
    body.appendChild(meters);

    var impact = el("div", "drawer-impact");
    impact.appendChild(document.createTextNode(cap.impactStat.text));
    impact.appendChild(el("span", "impact-src", "Source: " + cap.impactStat.source));
    body.appendChild(impact);

    var dl = el("dl");
    dl.appendChild(el("dt", null, "Data we would need"));
    dl.appendChild(el("dd", null, cap.dataNeeded));
    dl.appendChild(el("dt", null, "Controls posture"));
    dl.appendChild(el("dd", null, cap.controlsPosture));
    body.appendChild(dl);

    if (cap.demo) {
      var cta = el("div", "drawer-cta");
      var a = el("a", "btn btn-accent", "Open this in the working demo");
      a.setAttribute("href", cap.demo);
      cta.appendChild(a);
      body.appendChild(cta);
    } else {
      body.appendChild(el("p", "small drawer-nodemo",
        "No demo module in this proposal — this one gets scoped live in the working session."));
    }
  }

  function drawerKeydown(e) {
    if (e.key === "Escape") { closeDrawer(); return; }
    if (e.key !== "Tab") return;
    var focusables = $$("a[href], button:not([disabled])", drawer)
      .filter(function (n) { return n.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }

  function openCapability(id, opener) {
    var cap = null;
    D.capabilities.forEach(function (c) { if (c.id === id) cap = c; });
    if (!cap || !drawer) return;
    fillDrawer(cap);
    drawerOpener = opener || null;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.classList.add("is-open");
    document.body.classList.add("drawer-open");
    document.addEventListener("keydown", drawerKeydown);
    drawerClose.focus();
  }

  function closeDrawer() {
    if (!drawer || !drawer.classList.contains("is-open")) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    document.removeEventListener("keydown", drawerKeydown);
    if (drawerOpener && drawerOpener.focus) drawerOpener.focus();
    drawerOpener = null;
  }

  function initMap() {
    var chipsFunc = $("#chips-func");
    var chipsHorizon = $("#chips-horizon");
    if (!chipsFunc) return;

    var funcs = [];
    D.capabilities.forEach(function (c) {
      if (funcs.indexOf(c.func) === -1) funcs.push(c.func);
    });
    buildChips(chipsFunc, funcs, "func");
    buildChips(chipsHorizon, HORIZONS, "horizon");
    buildGrid();
    buildList();
    applyFilters();
    setMapView("grid");

    $$(".view-toggle .chip").forEach(function (b) {
      b.addEventListener("click", function () {
        setMapView(b.getAttribute("data-view"));
      });
    });
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);
  }

  /* ============================================================
     04: live demo preview
     ============================================================ */

  var KPI_FMT = { m: F.m, pct: F.pct, days: F.days };

  function renderPreviewTiles() {
    var host = $("#frame-tiles");
    if (!host) return;
    ["revenue", "margin", "wip"].forEach(function (id) {
      var k = null;
      D.kpis.forEach(function (x) { if (x.id === id) k = x; });
      if (!k) return;
      var tile = el("div", "stat-tile");
      tile.appendChild(el("span", "stat-label", k.label));
      tile.appendChild(el("span", "stat-value num", (KPI_FMT[k.format] || F.m)(k.value)));
      var delta = el("span", "stat-delta " +
        (k.deltaVsBudget.direction === "favourable" ? "delta-pos" : "delta-neg"),
        k.deltaVsBudget.text);
      tile.appendChild(delta);
      var sparkHost = el("span", "stat-spark");
      tile.appendChild(sparkHost);
      V.spark(sparkHost, k.spark, {
        color: k.sparkColorVar,
        ariaLabel: k.label + ", trailing twelve months."
      });
      host.appendChild(tile);
    });
  }

  function renderPreviewChart() {
    var host = $("#frame-chart-viz");
    if (!host) return;
    V.line(host, {
      labels: D.months,
      series: [
        { name: "Actual", color: "--series-1", values: D.monthly.revenue.actual },
        { name: "Budget", color: "--ink-3", values: D.monthly.revenue.budget, dash: "5 4" }
      ],
      format: F.m,
      height: 216,
      width: 640,
      ariaLabel: "Revenue, trailing twelve months: actual versus budget, in millions of dollars."
    });
  }

  function renderPreviewAI() {
    var host = $("#frame-ai");
    if (!host) return;
    var b = D.bridge;
    var fav = 0, adv = 0;
    b.steps.forEach(function (s) {
      if (s.value >= 0) fav += s.value; else adv += s.value;
    });
    var junMargin = D.monthly.ebitdaMarginPct.actual[11];
    var junBudMargin = D.monthly.ebitdaMarginPct.budget[11];

    var panel = el("div", "ai-panel");
    panel.appendChild(el("span", "ai-tag", "AI draft — for human review"));
    panel.appendChild(el("p", null,
      "June EBITDA of " + F.m(b.end) + " closed " + F.deltaM(b.end - b.start) +
      " against a " + F.m(b.start) + " budget — a " + F.pct(junMargin) +
      " margin versus " + F.pct(junBudMargin) + " planned. Favourable trading of " +
      F.deltaM(fav) + " was more than offset by " + F.deltaM(adv) +
      " of cost pressure, led by unbudgeted Luxembourg wage indexation…"));
    var chips = el("div", "chip-row");
    ["GL 6100–6240", "Entities LU-014 · LU-022",
     "Consolidation " + D.meta.consolidationVersion].forEach(function (s) {
      chips.appendChild(el("span", "chip chip-static", s));
    });
    panel.appendChild(chips);
    host.appendChild(panel);
  }

  /* ============================================================
     Footnotes — list render + hover popovers
     ============================================================ */

  function footnoteData() {
    var S = D.stats;
    return [
      { text: "Kimberly DeTrask appointed Group Chief Financial Officer, effective October 2025; quoted mandate from Apex Group’s appointment announcement.",
        source: "Apex Group newsroom", url: "https://www.apexgroup.com/" },
      { text: "Fitch-defined EBITDA margin 27.5% (2023) → 31% (2024), with c.35% expected by 2026; net leverage 7.6x (end-2024) trending toward 5.8x (2026); revenue growth of 6–7% a year expected 2025–27.",
        source: "Fitch Ratings, rating action commentary on Apex Group, 2024–25", url: "https://www.fitchratings.com/" },
      { text: S.adoption2024_6.text + " " + S.adoption2025_41.text,
        source: S.adoption2025_41.source, url: S.adoption2025_41.url },
      { text: S.gartner90by2026.text, source: S.gartner90by2026.source, url: S.gartner90by2026.url },
      { text: "Citco has announced AI-driven document intelligence productised for fund-administration clients.",
        source: "Citco public announcements, 2024–25", url: "https://www.citco.com/" },
      { text: S.unilever3x.text, source: S.unilever3x.source, url: S.unilever3x.url },
      { text: S.fpaTimePct75.text, source: S.fpaTimePct75.source, url: S.fpaTimePct75.url },
      { text: S.boardPackCostGBP3M.text, source: S.boardPackCostGBP3M.source, url: S.boardPackCostGBP3M.url },
      { text: S.spreadsheetErrorPct90.text + " " + S.panko5_2.text,
        source: "EuSpRIG; Panko, University of Hawaiʻi", url: S.spreadsheetErrorPct90.url },
      { text: S.pilotStall90.text, source: S.pilotStall90.source, url: S.pilotStall90.url },
      { text: S.wantSkills94.text + " " + S.trainAtScale5.text,
        source: S.wantSkills94.source, url: S.wantSkills94.url },
      { text: S.idcRoi3_7.text, source: S.idcRoi3_7.source, url: S.idcRoi3_7.url },
      { text: S.leakage1to5.text, source: S.leakage1to5.source, url: S.leakage1to5.url },
      { text: S.cfoHallucination86.text + " " + S.humanOversight97.text,
        source: S.cfoHallucination86.source, url: S.cfoHallucination86.url }
    ];
  }

  var FOOTNOTES = footnoteData();

  function renderFootnotes() {
    var list = $("#footnote-list");
    if (!list) return;
    FOOTNOTES.forEach(function (fn, i) {
      var n = i + 1;
      var li = el("li");
      li.id = "fn-" + n;
      li.appendChild(document.createTextNode(fn.text + " — "));
      var src = el("a", null, fn.source);
      src.setAttribute("href", fn.url);
      src.setAttribute("target", "_blank");
      src.setAttribute("rel", "noopener");
      li.appendChild(src);
      var back = el("a", "fn-back", "↩");
      back.setAttribute("href", "#fnref-" + n);
      back.setAttribute("aria-label", "Back to reference " + n + " in the text");
      li.appendChild(document.createTextNode(" "));
      li.appendChild(back);
      list.appendChild(li);
    });
  }

  function attachFootnotePopovers() {
    $$("sup.fn").forEach(function (sup) {
      var a = $("a", sup);
      if (!a) return;
      var n = parseInt(a.textContent, 10);
      var fn = FOOTNOTES[n - 1];
      if (!fn) return;
      sup.classList.add("has-popover");
      var pop = el("span", "popover", n + ". " + fn.text + " — " + fn.source);
      pop.setAttribute("role", "note");
      sup.appendChild(pop);
      function place() {
        var rect = sup.getBoundingClientRect();
        pop.classList.toggle("popover-right", rect.left > window.innerWidth * 0.55);
        pop.classList.toggle("popover-up",
          rect.bottom > window.innerHeight - 220);
      }
      sup.addEventListener("mouseenter", place);
      sup.addEventListener("focusin", place);
    });
  }

  /* ---------- illustrative badges: click to pin ---------- */

  function initBadges() {
    $$(".badge-illustrative").forEach(function (badge) {
      var holder = badge.parentElement;
      if (!holder || !holder.classList.contains("has-popover")) return;
      badge.setAttribute("aria-expanded", "false");
      badge.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = holder.classList.toggle("is-open");
        badge.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
    document.addEventListener("click", function () {
      $$(".has-popover.is-open").forEach(function (h) {
        h.classList.remove("is-open");
        var b = $(".badge-illustrative", h);
        if (b) b.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ============================================================
     Section rail — active section + reading progress
     ============================================================ */

  function initRail() {
    var links = $$(".rail-link");
    var progress = $("#rail-progress");
    if (!links.length) return;
    var sections = links.map(function (l) {
      return document.getElementById(l.getAttribute("data-target"));
    });

    var ticking = false;
    function update() {
      ticking = false;
      var line = window.innerHeight * 0.35;
      var activeIdx = -1;
      sections.forEach(function (sec, i) {
        if (sec && sec.getBoundingClientRect().top <= line) activeIdx = i;
      });
      links.forEach(function (l, i) {
        l.classList.toggle("is-active", i === activeIdx);
      });
      if (progress) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
        progress.style.height = pct + "%";
      }
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- print prep: end states everywhere ---------- */

  function initPrint() {
    var reopened = [];
    window.addEventListener("beforeprint", function () {
      pendingCountUps.forEach(function (finish) { finish(); });
      reopened = [];
      $$("details.accordion").forEach(function (d) {
        if (!d.open) { d.open = true; reopened.push(d); }
      });
      closeDrawer();
    });
    window.addEventListener("afterprint", function () {
      reopened.forEach(function (d) { d.open = false; });
      reopened = [];
    });
  }

  /* ---------- init ---------- */

  bindNumbers();
  renderMarginMarch();
  renderStatBand();
  initMap();
  renderPreviewTiles();
  renderPreviewChart();
  renderPreviewAI();
  renderFootnotes();
  attachFootnotePopovers();
  initBadges();
  initRail();
  initPrint();

  /* Small public surface for debugging / cross-page checks. */
  window.PITCH = {
    openCapability: function (id) { openCapability(id, null); },
    closeDrawer: closeDrawer,
    setMapView: setMapView,
    getMapState: function () {
      return { view: mapState.view, func: mapState.func, horizon: mapState.horizon };
    }
  };
})();
