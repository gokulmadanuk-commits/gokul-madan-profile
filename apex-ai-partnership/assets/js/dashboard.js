/* ============================================================
   Apex AI Partnership — dashboard.js
   The working demo: hash-routed tabs (#command #ask #boardpack
   #workbook), command centre, ask-the-numbers, board-pack
   generator, workbook risk scanner.

   Classic script, file:// safe. Reads window.APEX_DATA and
   window.APEX_FMT (data.js) and window.Viz (charts.js) only.
   Every figure shown is drawn from the dataset — no literals.
   ============================================================ */
(function () {
  "use strict";

  var D = window.APEX_DATA;
  var FMT = window.APEX_FMT;
  var Viz = window.Viz;
  if (!D || !FMT || !Viz) return;

  /* ---------- tiny DOM helpers ---------- */

  function $(sel, scope) { return (scope || document).querySelector(sel); }

  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  function frag() { return document.createDocumentFragment(); }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function reduced() { return Viz.prefersReducedMotion(); }

  function wait(ms) {
    return new Promise(function (res) { setTimeout(res, reduced() ? 0 : ms); });
  }

  /* Signed-figure span: "(x)" or leading "-" renders adverse,
     leading "+" favourable — colour always paired with the sign. */
  function signSpan(str) {
    var s = String(str);
    var neg = s.indexOf("(") !== -1 || s.charAt(0) === "-";
    var pos = s.charAt(0) === "+";
    return el("span", neg ? "delta-neg num" : (pos ? "delta-pos num" : "num"), s);
  }

  function fmtFor(format) {
    if (format === "pct") return FMT.pct;
    if (format === "m") return FMT.m;
    if (format === "days") return FMT.days;
    return function (v) { return FMT.num(v); };
  }

  var NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
  function numberWord(n) { return NUMBER_WORDS[n] || FMT.num(n); }

  /* ============================================================
     Header & footer chrome
     ============================================================ */

  $("#periodPill").textContent = D.meta.period + " close · " + D.meta.closeDay;
  $("#illus-note").textContent = D.meta.benchmarkNote;
  $("#dashDisclaimer").textContent = D.meta.disclaimer +
    " Prepared as a working artifact for " + D.meta.preparedFor + ".";

  /* ============================================================
     Router — hash-deep-linkable tabs
     ============================================================ */

  var TAB_NAMES = ["command", "ask", "boardpack", "workbook"];

  function currentTab() {
    var h = (location.hash || "").replace("#", "");
    return TAB_NAMES.indexOf(h) >= 0 ? h : "command";
  }

  function activateTab(name) {
    TAB_NAMES.forEach(function (n) {
      var tab = $("#tab-" + n);
      var panel = $("#panel-" + n);
      var on = n === name;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
  }

  (function initRouter() {
    if (!location.hash && window.history && history.replaceState) {
      history.replaceState(null, "", "#command");
    }
    activateTab(currentTab());
    window.addEventListener("hashchange", function () {
      activateTab(currentTab());
      window.scrollTo(0, 0);
    });

    /* roving arrow-key navigation on the tablist */
    var tablist = $(".tabs[role='tablist']");
    tablist.addEventListener("keydown", function (ev) {
      var idx = TAB_NAMES.indexOf(currentTab());
      var next = null;
      if (ev.key === "ArrowRight") next = (idx + 1) % TAB_NAMES.length;
      else if (ev.key === "ArrowLeft") next = (idx + TAB_NAMES.length - 1) % TAB_NAMES.length;
      else if (ev.key === "Home") next = 0;
      else if (ev.key === "End") next = TAB_NAMES.length - 1;
      if (next === null) return;
      ev.preventDefault();
      location.hash = "#" + TAB_NAMES[next];
      $("#tab-" + TAB_NAMES[next]).focus();
    });
  })();

  /* ============================================================
     01 — Command centre
     ============================================================ */

  (function initCommand() {
    var ytd = D.ytd;
    var B = D.bridge;

    $("#commandLede").textContent =
      "The " + D.meta.period + " close completed on " + D.meta.closeDay + ". " +
      "Revenue of " + FMT.m(ytd.revenue.actual) + " year to date is " +
      FMT.delta(ytd.revenue.varBudgetPct) + " against budget and " +
      FMT.delta(ytd.revenue.varPriorYearPct) + " on prior year; EBITDA margin of " +
      FMT.pct(ytd.marginPct.actual) + " sits " + FMT.pp(ytd.marginPct.varBudgetPp) +
      " to plan. The bridge below shows exactly where June went.";

    /* --- KPI row --- */
    var kpiRow = $("#kpiRow");
    D.kpis.forEach(function (k) {
      var tile = el("div", "stat-tile");
      tile.appendChild(el("span", "stat-label", k.label));
      tile.appendChild(el("span", "stat-value", fmtFor(k.format)(k.value)));
      var deltaCls = k.deltaVsBudget.direction === "favourable" ? "delta-pos" :
        (k.deltaVsBudget.direction === "adverse" ? "delta-neg" : "delta-flat");
      tile.appendChild(el("span", "stat-delta " + deltaCls, k.deltaVsBudget.text));
      var sparkHost = el("span", "stat-spark");
      tile.appendChild(sparkHost);
      kpiRow.appendChild(tile);
      Viz.spark(sparkHost, k.spark, {
        color: k.sparkColorVar,
        ariaLabel: k.label + " trend over " + D.months.length + " months, latest " + fmtFor(k.format)(k.value)
      });
    });

    /* --- Revenue trailing-12 line --- */
    $("#revenueSub").textContent = D.months[0] + " to " + D.months[D.months.length - 1] +
      " — actual vs budget vs prior year";
    Viz.line($("#chartRevenue"), {
      labels: D.months,
      series: [
        { name: "Actual", color: "--series-1", values: D.monthly.revenue.actual },
        { name: "Budget", color: "--ink-3", values: D.monthly.revenue.budget, dash: true },
        { name: "Prior year", color: "--ink-3", values: D.monthly.revenue.priorYear, width: 1.25 }
      ],
      format: FMT.m,
      height: 280,
      ariaLabel: "Revenue trailing twelve months: actual, budget (dashed) and prior year, in millions of dollars."
    });

    /* --- EBITDA margin line vs budget + 35% ambition refLine --- */
    var target = D.group.marginTarget2026 * 100;
    $("#marginSub").textContent = "Trailing 12 months, with the FY26 ambition of " +
      FMT.pct(target) + " marked";
    Viz.line($("#chartMargin"), {
      labels: D.months,
      series: [
        { name: "Actual", color: "--series-1", values: D.monthly.ebitdaMarginPct.actual },
        { name: "Budget", color: "--ink-3", values: D.monthly.ebitdaMarginPct.budget, dash: true }
      ],
      refLine: { value: target, label: "FY26 ambition — " + FMT.pct(target) },
      format: FMT.pct,
      height: 280,
      ariaLabel: "EBITDA margin, actual versus budget, trailing twelve months, against the FY26 ambition of " + FMT.pct(target) + "."
    });

    /* --- Service-line YTD bars — per-line colours, YoY deltas --- */
    $("#serviceSub").textContent = "Direct-labelled; year-on-year growth at right";
    Viz.bars($("#chartServiceLines"), {
      labels: D.serviceLines.map(function (s) { return s.name; }),
      series: [{
        name: "YTD revenue",
        values: D.serviceLines.map(function (s) { return s.ytdRevenue; }),
        colors: D.serviceLines.map(function (s) { return s.seriesVar; })
      }],
      deltas: D.serviceLines.map(function (s) { return FMT.delta(s.yoyPct) + " YoY"; }),
      format: FMT.m,
      horizontal: true,
      ariaLabel: "Year-to-date revenue by service line in millions of dollars, with year-on-year growth."
    });
    var esgLine = D.serviceLines.filter(function (s) { return s.key === "esg"; })[0];
    var custodyLine = D.serviceLines.filter(function (s) { return s.key === "custody"; })[0];
    $("#serviceCaption").textContent =
      esgLine.name + " is the growth story at " + FMT.delta(esgLine.yoyPct) + " YoY; " +
      custodyLine.name + " is the soft line at " + FMT.delta(custodyLine.yoyPct) +
      " YoY under depositary fee compression.";

    /* --- Hero: June EBITDA bridge + synced AI commentary --- */
    $("#bridgeTitle").textContent = "June EBITDA bridge — budget to actual ($m)";
    $("#bridgeLede").textContent =
      "Budget expected " + FMT.m(B.start) + " of June EBITDA; the ledger delivered " +
      FMT.m(B.end) + ". " + numberWord(B.steps.length) +
      " variances explain the gap — and the commentary drafts itself from the same lines.";

    var bridgeHandle = Viz.bridge($("#chartBridge"), {
      start: { label: B.startLabel, value: B.start },
      steps: B.steps,
      end: { label: B.endLabel, value: B.end },
      format: FMT.m,
      ariaLabel: "June EBITDA bridge from " + B.startLabel + " of " + FMT.m(B.start) +
        " to " + B.endLabel + " of " + FMT.m(B.end) + "."
    });

    var commentaryBody = $("#commentaryBody");
    var runBtn = $("#runCommentary");
    var commentaryBusy = false;
    var scrollTimer = null;

    function pinScroll() {
      commentaryBody.scrollTop = commentaryBody.scrollHeight;
    }

    function stepParagraph(step) {
      var p = el("p", "commentary-step");
      var strong = el("strong");
      strong.appendChild(document.createTextNode(step.label + " "));
      strong.appendChild(signSpan(FMT.deltaM(step.value)));
      p.appendChild(strong);
      p.appendChild(document.createTextNode(" — " + step.explain));
      return p;
    }

    function runCommentary() {
      if (commentaryBusy) return;
      commentaryBusy = true;
      runBtn.disabled = true;
      bridgeHandle.reset();
      clear(commentaryBody);
      if (scrollTimer) clearInterval(scrollTimer);
      scrollTimer = setInterval(pinScroll, 150);

      var currentTw = null;
      function typeInto(node, cps) {
        if (currentTw) currentTw.skip();
        currentTw = Viz.typewriter(node, Array.prototype.slice.call(node.childNodes), { cps: cps });
        return currentTw;
      }

      var junMarginActual = D.monthly.ebitdaMarginPct.actual[D.months.length - 1];
      var junMarginBudget = D.monthly.ebitdaMarginPct.budget[D.months.length - 1];
      var fav = 0, adv = 0, wipStep = null;
      B.steps.forEach(function (s) {
        if (s.side === "favourable") fav += s.value; else adv += s.value;
        if (s.label.indexOf("WIP") !== -1) wipStep = s;
      });
      fav = Math.round(fav * 10) / 10;
      adv = Math.round(adv * 10) / 10;
      var underlying = Math.round((B.end - B.start - (wipStep ? wipStep.value : 0)) * 10) / 10;

      var intro = el("p", "commentary-intro",
        "June EBITDA closed at " + FMT.m(B.end) + " against " + FMT.m(B.start) +
        " budgeted — " + FMT.deltaM(B.end - B.start) + " to plan, a margin of " +
        FMT.pct(junMarginActual) + " against " + FMT.pct(junMarginBudget) + " budgeted.");
      commentaryBody.appendChild(intro);

      typeInto(intro, 70).done.then(function () {
        bridgeHandle.play({
          stepMs: 1500,
          onStep: function (i, step) {
            var p = stepParagraph(step);
            commentaryBody.appendChild(p);
            typeInto(p, 120);
          },
          onDone: function () {
            var closing = el("p", "commentary-closing");
            closing.appendChild(document.createTextNode("Net effect: "));
            closing.appendChild(signSpan(FMT.deltaM(fav)));
            closing.appendChild(document.createTextNode(" of favourable trading against "));
            closing.appendChild(signSpan(FMT.m(adv)));
            closing.appendChild(document.createTextNode(
              " of cost pressure. One reading note: the " + FMT.deltaM(wipStep.value) +
              " WIP release is timing, not performance — it reverses in July, so the underlying miss is nearer " +
              FMT.m(underlying) + "."));
            commentaryBody.appendChild(closing);
            typeInto(closing, 70).done.then(function () {
              var src = el("p", "commentary-sources",
                "Sources: consolidation " + D.meta.consolidationVersion +
                " · GL 6100–6240 · entities LU-014, LU-022 · budget v3 (Dec-25 board approved)");
              commentaryBody.appendChild(src);
              pinScroll();
              clearInterval(scrollTimer);
              scrollTimer = null;
              commentaryBusy = false;
              runBtn.disabled = false;
              runBtn.textContent = "Replay commentary";
            });
          }
        });
      });
    }

    runBtn.addEventListener("click", runCommentary);
  })();

  /* ============================================================
     02 — Ask the numbers
     ============================================================ */

  (function initAsk() {
    var log = $("#askLog");
    var live = $("#askLive");
    var form = $("#askForm");
    var input = $("#askInput");
    var submit = $("#askSubmit");
    var chipsHost = $("#askChips");
    var busy = false;

    $("#askLede").textContent =
      "Plain-English questions, answered from the " + D.meta.period +
      " consolidation with the working shown — charts, tables, sources, and the occasional caveat.";
    $("#askFootnote").textContent =
      "In deployment this connects to your consolidation layer and answers from governed, " +
      "row-level data. The demo carries " + D.askQuestions.length +
      " worked answers; free text is matched to the nearest one.";

    /* --- chips --- */
    D.askQuestions.forEach(function (q) {
      var chip = el("button", "chip", q.chip);
      chip.type = "button";
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", function () { ask(q, null); });
      chip.dataset.qid = q.id;
      chipsHost.appendChild(chip);
    });

    function setChipsPressed(qid) {
      Array.prototype.forEach.call(chipsHost.children, function (c) {
        c.setAttribute("aria-pressed", c.dataset.qid === qid ? "true" : "false");
      });
    }

    function setBusy(state) {
      busy = state;
      submit.disabled = state;
      input.disabled = state;
      Array.prototype.forEach.call(chipsHost.children, function (c) { c.disabled = state; });
    }

    /* --- fuzzy matcher for free text --- */
    var KEYWORDS = {
      "margin-miss": ["why", "miss", "missed", "shortfall", "variance", "bridge", "june", "ebitda", "margin", "budget", "behind"],
      "growth-driver": ["growth", "grow", "driving", "driver", "drivers", "revenue", "ytd", "top", "line", "service", "mix"],
      "margin-march": ["35", "target", "ambition", "track", "trajectory", "march", "path", "glidepath", "plan", "fy26", "gap"],
      "wip-dso": ["wip", "dso", "unbilled", "debtor", "collection", "collections", "cash", "working", "capital", "billing", "receivable", "receivables", "worry"],
      "lux-comp": ["luxembourg", "lux", "comp", "compensation", "wage", "wages", "salary", "salaries", "payroll", "indexation", "headcount", "staff"],
      "depositary-fees": ["depositary", "custody", "fee", "fees", "compression", "pricing", "reprice", "repricing", "renewal", "renewals", "bps", "exposed", "exposure"],
      "board-paragraph": ["draft", "write", "paragraph", "board", "pack", "commentary", "wording", "text"]
    };

    function tokenize(str) {
      return String(str).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/)
        .filter(function (t) { return t.length > 1 || /^\d$/.test(t); })
        .map(function (t) { return t.length > 3 && t.charAt(t.length - 1) === "s" ? t.slice(0, -1) : t; });
    }

    var STOP = { "the": 1, "and": 1, "for": 1, "with": 1, "what": 1, "how": 1, "are": 1, "our": 1, "your": 1, "this": 1, "that": 1, "was": 1, "did": 1, "does": 1, "is": 1, "we": 1, "in": 1, "on": 1, "of": 1, "to": 1, "me": 1, "about": 1, "should": 1 };

    function matchQuestion(text) {
      var tokens = tokenize(text).filter(function (t) { return !STOP[t]; });
      if (!tokens.length) return null;
      var best = null, bestScore = 0;
      D.askQuestions.forEach(function (q) {
        var kws = KEYWORDS[q.id] || [];
        var qTokens = tokenize(q.question + " " + q.chip);
        var score = 0;
        tokens.forEach(function (t) {
          if (kws.indexOf(t) !== -1) score += 2;
          if (qTokens.indexOf(t) !== -1) score += 1;
        });
        if (score > bestScore) { bestScore = score; best = q; }
      });
      return bestScore >= 3 ? best : null;
    }

    /* --- answer-block renderers --- */

    function renderChartBlock(block) {
      var spec = block.spec;
      var fig = el("figure", "figure ask-figure fade-in");
      fig.appendChild(el("figcaption", "figure-title", spec.title || ""));
      var host = el("div", "viz");
      fig.appendChild(host);
      /* charts must draw AFTER the node is attached — Viz resolves
         CSS custom properties via getComputedStyle at render time */
      fig._render = function () {
        if (spec.kind === "bridge") {
          Viz.bridge(host, {
            start: spec.start, steps: spec.steps, end: spec.end,
            format: fmtFor(spec.format), height: 300
          });
        } else if (spec.kind === "line") {
          Viz.line(host, {
            labels: spec.labels, series: spec.series,
            refLine: spec.refLine || undefined,
            format: fmtFor(spec.format), height: 260
          });
        } else {
          var longLabels = spec.labels.some(function (l) { return String(l).length > 14; });
          Viz.bars(host, {
            labels: spec.labels, series: spec.series,
            format: fmtFor(spec.format),
            horizontal: spec.horizontal || (spec.series.length === 1 && longLabels),
            deltas: spec.deltas || undefined
          });
        }
      };
      return fig;
    }

    function renderTableBlock(block) {
      var wrapDiv = el("div", "table-scroll fade-in");
      var table = el("table", "table-fin ask-table");
      var thead = el("thead");
      var hr = el("tr");
      (block.columns || []).forEach(function (c) { hr.appendChild(el("th", null, c)); });
      thead.appendChild(hr);
      table.appendChild(thead);
      var tbody = el("tbody");
      block.rows.forEach(function (row) {
        var tr = el("tr");
        row.forEach(function (cell, i) {
          var td = el("td", null, cell);
          var s = String(cell);
          if (i > 0) {
            if (s.indexOf("(") === 0 || s.indexOf("-") === 0) td.className = "neg";
            else if (s.indexOf("+") === 0) td.className = "pos";
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrapDiv.appendChild(table);
      return wrapDiv;
    }

    function renderSourcesBlock(block) {
      var div = el("div", "ask-sources fade-in");
      div.appendChild(el("span", "ask-sources-label", "Sources"));
      var row = el("span", "chip-row");
      block.items.forEach(function (it) {
        row.appendChild(el("span", "chip chip-static", it));
      });
      div.appendChild(row);
      return div;
    }

    function renderCaveatBlock(block) {
      var div = el("div", "caveat fade-in");
      div.appendChild(el("p", null, block.text));
      return div;
    }

    /* --- the ask flow --- */

    function newEntry(questionText) {
      var entry = el("article", "ask-entry");
      entry.appendChild(el("p", "ask-q-label", "You asked"));
      entry.appendChild(el("h3", "ask-q", questionText));
      var panel = el("div", "ai-panel ask-a");
      var head = el("div", "ask-a-head");
      head.appendChild(el("span", "ai-tag", "AI draft — for human review"));
      panel.appendChild(head);
      var body = el("div", "ask-a-body");
      panel.appendChild(body);
      entry.appendChild(panel);
      log.appendChild(entry);
      return { entry: entry, body: body };
    }

    function skeleton(body) {
      var sk = el("div", "ask-skeleton");
      sk.appendChild(el("p", "ask-status", "Reading " + D.meta.period + " consolidation " +
        D.meta.consolidationVersion + "…"));
      for (var i = 0; i < 3; i++) sk.appendChild(el("div", "skeleton skeleton-line"));
      body.appendChild(sk);
      return sk;
    }

    function keepInView(node) {
      if (node.scrollIntoView) node.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
    }

    function streamBlocks(body, blocks) {
      var chain = Promise.resolve();
      blocks.forEach(function (block) {
        chain = chain.then(function () {
          if (block.type === "p") {
            var p = el("p", "ask-p", block.text);
            body.appendChild(p);
            keepInView(p);
            return Viz.typewriter(p, block.text, { cps: 65 }).done;
          }
          var node;
          if (block.type === "chart") node = renderChartBlock(block);
          else if (block.type === "table") node = renderTableBlock(block);
          else if (block.type === "sources") node = renderSourcesBlock(block);
          else if (block.type === "caveat") node = renderCaveatBlock(block);
          else return undefined;
          body.appendChild(node);
          if (node._render) node._render();
          keepInView(node);
          return wait(420);
        });
      });
      return chain;
    }

    function ask(q, typedText) {
      if (busy) return;
      setBusy(true);
      setChipsPressed(q ? q.id : null);
      var heading = typedText || (q ? q.question : "");
      var parts = newEntry(heading);
      var body = parts.body;

      if (q && typedText && typedText.trim().toLowerCase() !== q.question.trim().toLowerCase()) {
        parts.entry.insertBefore(
          el("p", "ask-interp", "Nearest worked answer: “" + q.question + "”"),
          parts.entry.querySelector(".ai-panel"));
      }

      var sk = skeleton(body);
      keepInView(parts.entry);
      live.textContent = "Reading the June consolidation.";

      var latency = reduced() ? 0 : 1500 + Math.random() * 700;
      wait(latency).then(function () {
        body.removeChild(sk);
        var blocks = q ? q.answerBlocks : [{
          type: "p",
          text: "In deployment this connects to your consolidation layer and answers from " +
            "governed, row-level data — any question, any period, sources attached. This demo " +
            "carries " + D.askQuestions.length + " worked answers; the chips below are the ones " +
            "it knows cold. Try one."
        }];
        return streamBlocks(body, blocks);
      }).then(function () {
        if (!q) {
          var row = el("div", "chip-row ask-suggest fade-in");
          D.askQuestions.forEach(function (qq) {
            var c = el("button", "chip", qq.chip);
            c.type = "button";
            c.addEventListener("click", function () { ask(qq, null); });
            row.appendChild(c);
          });
          body.appendChild(row);
        }
        live.textContent = "Answer complete.";
        setBusy(false);
        setChipsPressed(null);
        input.value = "";
      });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var text = input.value.trim();
      if (!text || busy) return;
      ask(matchQuestion(text), text);
    });
  })();

  /* ============================================================
     03 — Board pack in minutes
     ============================================================ */

  (function initBoardpack() {
    var BP = D.boardPack;
    var pipelineHost = $("#bpPipeline");
    var generateBtn = $("#bpGenerate");
    var paper = $("#packPaper");
    var emptyNote = $("#bpEmpty");
    var toolbar = $("#bpToolbar");
    var review = $("#bpReview");
    var running = false;

    $("#bpLede").textContent =
      "The pack is due " + D.meta.boardPackDue + "; the close finished " + D.meta.closeDay +
      ". The draft below assembles itself from consolidation " + D.meta.consolidationVersion +
      " — humans review and sign off before anything circulates, and the close itself is untouched.";
    $("#bpPeriod").textContent = D.meta.period + " (fixed)";
    $("#bpSource").textContent = "Consolidation " + D.meta.consolidationVersion;
    $("#bpReviewNote").textContent = BP.reviewNote;

    /* --- section checklist --- */
    var sectionList = $("#bpSectionList");
    BP.sections.forEach(function (s) {
      var lbl = el("label", "bp-check");
      var cb = el("input");
      cb.type = "checkbox";
      cb.checked = true;
      cb.value = s.id;
      if (s.id === "cover") { cb.disabled = true; lbl.title = "The cover is always included"; }
      lbl.appendChild(cb);
      lbl.appendChild(el("span", null, s.type === "cover" ? "Cover" : s.title));
      sectionList.appendChild(lbl);
    });

    function selectedSections() {
      var ids = [];
      Array.prototype.forEach.call(sectionList.querySelectorAll("input"), function (cb) {
        if (cb.checked) ids.push(cb.value);
      });
      return ids;
    }

    /* --- pipeline --- */
    function buildPipeline() {
      clear(pipelineHost);
      BP.pipeline.forEach(function (step) {
        var li = el("li", "bp-step");
        li.dataset.state = "pending";
        li.appendChild(el("span", "bp-step-dot"));
        li.appendChild(el("span", "bp-step-label", step.label));
        li.appendChild(el("span", "bp-step-time num"));
        pipelineHost.appendChild(li);
      });
      pipelineHost.removeAttribute("hidden");
    }

    function runPipeline() {
      var items = pipelineHost.children;
      var chain = Promise.resolve();
      BP.pipeline.forEach(function (step, i) {
        chain = chain.then(function () {
          items[i].dataset.state = "running";
          return wait(step.ms).then(function () {
            items[i].dataset.state = "done";
            items[i].querySelector(".bp-step-time").textContent =
              (Math.round(step.ms / 100) / 10).toFixed(1) + "s";
          });
        });
      });
      return chain;
    }

    /* --- pack document rendering --- */

    function packPage(cls) {
      var page = el("div", "pack-page" + (cls ? " " + cls : ""));
      return page;
    }

    function pageFooter() {
      return el("p", "pack-page-foot",
        "Group Board Pack · " + D.meta.period + " · AI draft — for human review · Illustrative data");
    }

    function moneyCell(v, format) {
      var td = el("td", "num");
      if (format === "pct") td.textContent = FMT.pct(v);
      else td.textContent = FMT.m(v);
      if (v < 0) td.classList.add("neg");
      return td;
    }

    function varCell(v, format) {
      var td = el("td", "num");
      if (v === 0) {
        td.textContent = "—";
        td.classList.add("var-flat");
        return td;
      }
      td.textContent = format === "pct" ? FMT.pp(v) : FMT.deltaM(v);
      td.classList.add(v < 0 ? "neg" : "pos");
      return td;
    }

    function renderCover(s) {
      var page = packPage("pack-cover");
      page.appendChild(el("div", "pack-cover-rule"));
      page.appendChild(el("p", "pack-brand", D.meta.preparedFor + " — illustrative"));
      page.appendChild(el("h3", "pack-title", s.title));
      page.appendChild(el("p", "pack-subtitle", s.subtitle));
      var meta = el("ul", "pack-meta");
      s.meta.forEach(function (m) { meta.appendChild(el("li", null, m)); });
      page.appendChild(meta);
      page.appendChild(pageFooter());
      return page;
    }

    function renderProse(s) {
      var page = packPage();
      page.appendChild(el("h3", "pack-h", s.title));
      (s.paragraphs || []).forEach(function (p) {
        var node = el("p", "pack-p");
        var dash = p.indexOf(" — ");
        if (s.id === "serviceLines" && dash > 0 && dash < 40) {
          node.appendChild(el("strong", null, p.slice(0, dash)));
          node.appendChild(document.createTextNode(p.slice(dash)));
        } else {
          node.textContent = p;
        }
        page.appendChild(node);
      });
      if (s.bullets && s.bullets.length) {
        page.appendChild(el("h4", "pack-h4", "Principal risks"));
        var ul = el("ul", "pack-bullets");
        s.bullets.forEach(function (b) { ul.appendChild(el("li", null, b)); });
        page.appendChild(ul);
      }
      page.appendChild(pageFooter());
      return page;
    }

    function renderPnl(s) {
      var page = packPage("pack-pnl");
      page.appendChild(el("h3", "pack-h", s.title));
      var scroll = el("div", "table-scroll");
      var table = el("table", "table-fin pack-table");
      var thead = el("thead");

      var tr1 = el("tr", "pack-colgroups");
      tr1.appendChild(el("th", null, ""));
      s.columnGroups.forEach(function (g) {
        var th = el("th", "pack-colgroup", g.label);
        th.colSpan = g.cols.length;
        th.scope = "colgroup";
        tr1.appendChild(th);
      });
      thead.appendChild(tr1);

      var tr2 = el("tr");
      tr2.appendChild(el("th", null, "$m"));
      s.columnGroups.forEach(function (g) {
        g.cols.forEach(function (c) { tr2.appendChild(el("th", "num", c)); });
      });
      thead.appendChild(tr2);
      table.appendChild(thead);

      var tbody = el("tbody");
      s.rows.forEach(function (r) {
        var tr = el("tr");
        if (r.kind === "subtotal") tr.className = "row-subtotal";
        else if (r.kind === "total") tr.className = "row-total";
        else if (r.kind === "pct") tr.className = "row-pct";
        var th = el("td", null, r.label);
        tr.appendChild(th);
        tr.appendChild(moneyCell(r.junActual, r.format));
        tr.appendChild(moneyCell(r.junBudget, r.format));
        tr.appendChild(varCell(r.junVar, r.format));
        tr.appendChild(moneyCell(r.ytdActual, r.format));
        tr.appendChild(moneyCell(r.ytdBudget, r.format));
        tr.appendChild(varCell(r.ytdVar, r.format));
        tr.appendChild(moneyCell(r.ytdPriorYear, r.format));
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      scroll.appendChild(table);
      page.appendChild(scroll);
      page.appendChild(el("p", "footnote pack-footnote", s.footnote));
      page.appendChild(pageFooter());
      return page;
    }

    function renderFigure(s) {
      var page = packPage("pack-figure");
      page.appendChild(el("h3", "pack-h", s.title));
      var host = el("div", "viz pack-bridge");
      page.appendChild(host);
      /* drawn after attachment so CSS custom properties resolve */
      page._render = function () {
        Viz.bridge(host, {
          start: { label: D.bridge.startLabel, value: D.bridge.start },
          steps: D.bridge.steps,
          end: { label: D.bridge.endLabel, value: D.bridge.end },
          format: FMT.m,
          height: 320
        });
      };
      page.appendChild(el("p", "figure-caption", s.caption));
      page.appendChild(pageFooter());
      return page;
    }

    function renderPack(ids) {
      clear(paper);
      BP.sections.forEach(function (s) {
        if (ids.indexOf(s.id) === -1) return;
        var page = null;
        if (s.type === "cover") page = renderCover(s);
        else if (s.type === "prose") page = renderProse(s);
        else if (s.type === "table") page = renderPnl(s);
        else if (s.type === "figure") page = renderFigure(s);
        if (!page) return;
        paper.appendChild(page);
        if (page._render) page._render();
      });
      paper.removeAttribute("hidden");
    }

    function generate() {
      if (running) return;
      running = true;
      generateBtn.disabled = true;
      emptyNote.setAttribute("hidden", "");
      paper.setAttribute("hidden", "");
      toolbar.setAttribute("hidden", "");
      review.setAttribute("hidden", "");
      buildPipeline();
      runPipeline().then(function () {
        renderPack(selectedSections());
        toolbar.removeAttribute("hidden");
        review.removeAttribute("hidden");
        generateBtn.disabled = false;
        generateBtn.textContent = "Regenerate pack";
        running = false;
      });
    }

    generateBtn.addEventListener("click", generate);

    /* --- print only the pack --- */
    $("#bpPrint").addEventListener("click", function () {
      document.body.classList.add("print-pack-only");
      window.print();
    });
    window.addEventListener("afterprint", function () {
      document.body.classList.remove("print-pack-only");
    });

    /* --- before/after reporting timeline --- */
    var RT = D.ops.reportingTimeline;
    var closeSeg = RT.current[0];
    Viz.timeline($("#chartTimeline"), {
      tracks: [
        {
          name: "Today",
          segments: RT.current.filter(function (s) { return s.day !== "WD+8"; })
        },
        {
          name: "With AI",
          segments: [
            closeSeg,
            { day: "WD+9", label: "Drafted by AI overnight — humans review & send", kind: "ai" }
          ]
        }
      ],
      maxDay: 12,
      ariaLabel: "Reporting cycle comparison: today the pack goes out on working day twelve; with AI it goes out on working day nine. The close, working days one to eight, is unchanged in both."
    });
    var flashSeg = RT.current[1];
    var reviewSeg = RT.withAI[2];
    $("#timelineCaption").textContent =
      "Today the flash lands " + flashSeg.day + " and the pack goes out " + D.meta.boardPackDue +
      ". With AI, variance analysis and commentary draft themselves from the flash by end of day " +
      flashSeg.day + "; humans review, edit and sign off on " + reviewSeg.day +
      " and the pack goes out the same day — three working days earlier. The close (" +
      closeSeg.day + ") is identical in both worlds.";
  })();

  /* ============================================================
     04 — Workbook risk scanner
     ============================================================ */

  (function initWorkbook() {
    var WB = D.workbook;
    var GLYPH = { high: "▲", medium: "●", low: "■" };
    var SEV_LABEL = { high: "High", medium: "Medium", low: "Low" };
    var scanBtn = $("#wbScan");
    var progress = $("#wbProgress");
    var progressBar = $("#wbProgressBar");
    var progressFill = $("#wbProgressFill");
    var progressStatus = $("#wbProgressStatus");
    var results = $("#wbResults");
    var grid = $("#wbGrid");
    var findingsHost = $("#wbFindings");
    var cellRef = $("#wbCellRef");
    var formulaOut = $("#wbFormula");
    var scanned = false;
    var scanning = false;

    $("#wbLede").textContent =
      WB.sheets + " sheets, " + WB.links + " external links, last full audit: " + WB.lastAudit +
      ". This model feeds the fee-revenue line — the scanner reads every formula and shows " +
      "its findings on the sheet itself.";
    $("#wbFileName").textContent = WB.name;
    $("#wbFileMeta").textContent = WB.sheets + " sheets · " + WB.links +
      " external links · last full audit: " + WB.lastAudit;

    /* --- cell lookup helpers --- */

    function colIndex(letter) { return WB.grid.cols.indexOf(letter); }

    function parseRef(ref) {
      var m = String(ref).match(/^([A-J])(\d+)?$/);
      if (!m) return null;
      return { col: colIndex(m[1]), row: m[2] ? parseInt(m[2], 10) - 1 : null, letter: m[1] };
    }

    function cellAt(ref) {
      var p = parseRef(ref);
      if (!p || p.row === null) return null;
      return WB.grid.rows[p.row][p.col];
    }

    function findingFor(id) {
      return WB.findings.filter(function (f) { return f.id === id; })[0] || null;
    }

    /* --- formula bar --- */

    function showCell(ref) {
      var p = parseRef(ref);
      cellRef.textContent = ref;
      if (p && p.row === null) {
        formulaOut.textContent = "Hidden column — manual Adj % overrides feeding every net-revenue formula";
        return;
      }
      var c = cellAt(ref);
      formulaOut.textContent = c ? (c.f || c.v || "") : "";
    }

    /* --- grid --- */

    function buildGrid() {
      clear(grid);
      var thead = el("thead");
      var hr = el("tr");
      var corner = el("th", "wb-corner");
      corner.setAttribute("aria-label", "Cell grid");
      hr.appendChild(corner);
      WB.grid.cols.forEach(function (letter) {
        var th = el("th", "wb-colletter");
        th.appendChild(el("span", "wb-cellv", letter));
        th.scope = "col";
        if (WB.grid.hiddenCols.indexOf(letter) !== -1) th.classList.add("wb-col-i");
        /* header-row risks (e.g. WB-05 on hidden column I) live on sheet row 1 */
        var headerCell = WB.grid.rows[0][colIndex(letter)];
        if (headerCell && headerCell.risk) th.appendChild(marker(headerCell.risk));
        hr.appendChild(th);
      });
      thead.appendChild(hr);
      grid.appendChild(thead);

      var tbody = el("tbody");
      WB.grid.rows.forEach(function (row, ri) {
        var tr = el("tr");
        if (ri === 0) tr.className = "wb-row1";
        if (ri === WB.grid.rows.length - 1) tr.className = "wb-rowtotal";
        var rowNum = el("th", "wb-rownum num", String(ri + 1));
        rowNum.scope = "row";
        tr.appendChild(rowNum);
        row.forEach(function (cell, ci) {
          var letter = WB.grid.cols[ci];
          var ref = letter + (ri + 1);
          var td = el("td", "wb-cell");
          td.dataset.ref = ref;
          if (ci >= 3) td.classList.add("num");
          if (WB.grid.hiddenCols.indexOf(letter) !== -1) td.classList.add("wb-col-i");
          td.appendChild(el("span", "wb-cellv", cell.v));
          if (cell.risk && ri > 0) td.appendChild(marker(cell.risk));
          td.addEventListener("click", function () {
            if (cell.risk) { selectFinding(cell.risk); return; }
            /* clicking the collapsed hidden column surfaces its finding */
            if (td.classList.contains("wb-col-i") && grid.classList.contains("wb-i-hidden")) {
              selectFinding("WB-05");
              return;
            }
            setActiveCell(ref);
          });
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      grid.appendChild(tbody);
    }

    function marker(riskId) {
      var f = findingFor(riskId);
      var b = el("button", "wb-marker wb-sev-" + f.severity, GLYPH[f.severity]);
      b.type = "button";
      b.setAttribute("aria-label", "Finding " + f.id + " (" + SEV_LABEL[f.severity] +
        "): " + f.title);
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        selectFinding(riskId);
      });
      return b;
    }

    function clearHighlights() {
      Array.prototype.forEach.call(grid.querySelectorAll(".wb-cell-active, .wb-col-active"),
        function (n) { n.classList.remove("wb-cell-active"); n.classList.remove("wb-col-active"); });
    }

    function setActiveCell(ref) {
      clearHighlights();
      var td = grid.querySelector("[data-ref='" + ref + "']");
      if (td) td.classList.add("wb-cell-active");
      showCell(ref);
    }

    function highlightColumn(letter) {
      clearHighlights();
      grid.classList.remove("wb-i-hidden");
      Array.prototype.forEach.call(grid.querySelectorAll(".wb-col-i"), function (n) {
        n.classList.add("wb-col-active");
      });
      var first = grid.querySelector("td.wb-col-i");
      if (first && first.scrollIntoView) {
        first.scrollIntoView({ block: "nearest", inline: "center", behavior: reduced() ? "auto" : "smooth" });
      }
      showCell(letter);
    }

    /* --- findings panel --- */

    function buildSummary() {
      var host = $("#wbSummary");
      clear(host);

      var risk = el("div", "stat-tile wb-tile");
      risk.appendChild(el("span", "stat-label", "Workbook risk"));
      risk.appendChild(el("span", "stat-value wb-risk-" + WB.riskScore.toLowerCase(), WB.riskScore));
      risk.appendChild(el("span", "stat-delta", WB.links + " external links · last audit: " + WB.lastAudit));
      host.appendChild(risk);

      var counts = { high: 0, medium: 0, low: 0 };
      WB.findings.forEach(function (f) { counts[f.severity] += 1; });
      var found = el("div", "stat-tile wb-tile");
      found.appendChild(el("span", "stat-label", "Findings"));
      found.appendChild(el("span", "stat-value", FMT.num(WB.findings.length)));
      var breakdown = el("span", "stat-delta wb-breakdown");
      breakdown.appendChild(el("span", "wb-sev-high", GLYPH.high + " " + counts.high + " high"));
      breakdown.appendChild(document.createTextNode(" · "));
      breakdown.appendChild(el("span", "wb-sev-medium", GLYPH.medium + " " + counts.medium + " medium"));
      breakdown.appendChild(document.createTextNode(" · "));
      breakdown.appendChild(el("span", "wb-sev-low", GLYPH.low + " " + counts.low + " low"));
      found.appendChild(breakdown);
      host.appendChild(found);

      var stat = el("div", "stat-tile wb-tile wb-tile-research");
      stat.appendChild(el("span", "stat-label", "Why it matters"));
      stat.appendChild(el("span", "stat-value", "~" + FMT.pct(WB.stats.errorRatePct)));
      stat.appendChild(el("span", "stat-delta",
        "of spreadsheet cells contain errors (" + WB.stats.source + ")"));
      host.appendChild(stat);
    }

    function buildFindings() {
      clear(findingsHost);
      findingsHost.appendChild(el("h3", "h4 wb-findings-title", "Findings — click to locate"));
      WB.findings.forEach(function (f) {
        var card = el("div", "wb-finding wb-finding-" + f.severity);
        card.dataset.fid = f.id;
        var head = el("button", "wb-finding-head");
        head.type = "button";
        head.setAttribute("aria-expanded", "false");
        head.appendChild(el("span", "wb-marker-inline wb-sev-" + f.severity, GLYPH[f.severity]));
        var meta = el("span", "wb-finding-meta");
        meta.appendChild(el("span", "wb-finding-id num", f.id + " · " + SEV_LABEL[f.severity] +
          " · " + (parseRef(f.cell).row === null ? "column " + f.cell : f.cell)));
        meta.appendChild(el("span", "wb-finding-title", f.title));
        head.appendChild(meta);
        card.appendChild(head);
        var body = el("div", "wb-finding-body");
        body.hidden = true;
        body.appendChild(el("p", null, f.detail));
        var fix = el("p", "wb-finding-fix");
        fix.appendChild(el("strong", null, "Suggested fix: "));
        fix.appendChild(document.createTextNode(f.fix));
        body.appendChild(fix);
        card.appendChild(body);
        head.addEventListener("click", function () { selectFinding(f.id); });
        findingsHost.appendChild(card);
      });
    }

    function selectFinding(id) {
      var f = findingFor(id);
      if (!f) return;
      /* open its card, close the others */
      Array.prototype.forEach.call(findingsHost.querySelectorAll(".wb-finding"), function (card) {
        var on = card.dataset.fid === id;
        card.classList.toggle("is-open", on);
        card.querySelector(".wb-finding-head").setAttribute("aria-expanded", on ? "true" : "false");
        card.querySelector(".wb-finding-body").hidden = !on;
      });
      /* highlight the cell / column */
      var p = parseRef(f.cell);
      if (p.row === null) {
        highlightColumn(f.cell);
      } else {
        setActiveCell(f.cell);
        var td = grid.querySelector("[data-ref='" + f.cell + "']");
        if (td && td.scrollIntoView) td.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced() ? "auto" : "smooth" });
      }
    }

    /* --- scan sequence --- */

    var SCAN_STEPS = [
      "Parsing " + WB.sheets + " sheets…",
      "Tracing " + WB.links + " external links…",
      "Checking formula consistency by column…",
      "Cross-checking FX rates against the rates sheet…",
      "Scoring findings…"
    ];

    function scan() {
      if (scanning) return;
      scanning = true;
      scanBtn.disabled = true;
      results.setAttribute("hidden", "");
      progress.removeAttribute("hidden");

      var total = reduced() ? 0 : 2300;
      var t0 = null;
      function finish() {
        progress.setAttribute("hidden", "");
        buildSummary();
        if (!scanned) {
          buildGrid();
          buildFindings();
          scanned = true;
        }
        results.removeAttribute("hidden");
        setActiveCell(WB.grid.activeCell);
        scanBtn.disabled = false;
        scanBtn.textContent = "Rescan workbook";
        scanning = false;
      }
      if (total === 0) { finish(); return; }

      function tick(ts) {
        if (t0 === null) t0 = ts;
        var k = Math.min(1, (ts - t0) / total);
        var pct = Math.round(k * 100);
        progressFill.style.width = pct + "%";
        progressBar.setAttribute("aria-valuenow", String(pct));
        progressStatus.textContent = SCAN_STEPS[Math.min(SCAN_STEPS.length - 1,
          Math.floor(k * SCAN_STEPS.length))];
        if (k < 1) requestAnimationFrame(tick);
        else setTimeout(finish, 180);
      }
      requestAnimationFrame(tick);
    }

    scanBtn.addEventListener("click", scan);
  })();

})();
