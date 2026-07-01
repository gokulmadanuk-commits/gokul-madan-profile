/* ==========================================================================
   Apex AI Transformation Pitch — interactions, charts, demo engine
   Vanilla JS, no dependencies. Hand-rolled SVG charts for the editorial look.
   ========================================================================== */
(() => {
  "use strict";
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n, d = 0) => n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

  const CAT_COLORS = {
    "Board & Management Reporting": "#f6b717",
    "Excel/Workbook Automation":    "#0dc182",
    "Deck & Narrative Generation":  "#a145e4",
    "FP&A Analytics & Forecasting":  "#4e98f9",
    "Investor & Client Reporting":  "#dd7027",
    "Finance Ops & Assurance":      "#dd2748",
    "Knowledge & Enablement":       "#4c4c4c",
    "Meeting Prep":                 "#c98a2b",
  };
  const catColor = c => CAT_COLORS[c] || "#4c4c4c";
  const scoreOf = v => ({ Low: 1, Medium: 2, Med: 2, High: 3 }[v] || 2);

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(el => io.observe(el));
  }

  /* ---------- Animated number counters ---------- */
  function animateCount(el) {
    const raw = el.dataset.count;
    const suffix = el.dataset.suffix || "";
    const prefix = el.dataset.prefix || "";
    const dec = +(el.dataset.dec || 0);
    const target = parseFloat(raw);
    const dur = 1400; let start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + fmt(target * e, dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initCounters() {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    $$("[data-count]").forEach(el => io.observe(el));
  }

  /* ---------- Active nav on scroll ---------- */
  function initNavSpy() {
    const links = $$(".topnav a[href^='#']");
    const map = new Map(links.map(l => [l.getAttribute("href").slice(1), l]));
    const io = new IntersectionObserver((es) => {
      es.forEach(e => {
        const l = map.get(e.target.id);
        if (l && e.isIntersecting) { links.forEach(x => x.classList.remove("cur")); l.classList.add("cur"); }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("section[id]").forEach(s => io.observe(s));
  }

  /* ================= CAPABILITY MAP ================= */
  let UC = [];
  function initCapabilityMap(usecases) {
    UC = usecases;
    const list = $("#ucList");
    const plot = $("#matrixPlot");
    const legend = $("#matrixLegend");
    const toolbar = $("#capToolbar");
    if (!list || !plot) return;

    const cats = [...new Set(UC.map(u => u.category))];
    // legend
    legend.innerHTML = cats.map(c =>
      `<span class="li"><span class="swatch" style="background:${catColor(c)}"></span>${c}</span>`).join("");
    // toolbar chips
    toolbar.innerHTML = `<button class="chip active" data-f="all">All ${UC.length}</button>` +
      cats.map(c => `<button class="chip" data-f="${c}">${c}</button>`).join("");

    const render = (filter) => {
      const rows = filter === "all" ? UC : UC.filter(u => u.category === filter);
      // list
      list.innerHTML = rows.map((u, i) => {
        const hz = (u.horizon || "").toLowerCase().includes("now") ? "now"
                 : (u.horizon || "").toLowerCase().includes("next") ? "next" : "later";
        return `<article class="uc" data-id="${u._id}">
          <div class="horizon-bar" style="background:${catColor(u.category)}"></div>
          <div class="uc-top">
            <div><div class="cat">${u.category}</div><h4>${u.title}</h4></div>
            <span class="pill ${hz}">${u.horizon}</span>
          </div>
          <div class="uc-body">
            <p><b>The pain.</b> ${u.pain}</p>
            <p><b>What the AI does.</b> ${u.solution}</p>
            <p style="color:var(--muted);font-size:.82rem"><b>How:</b> ${u.how}</p>
            <div class="uc-meta">
              <span class="pill" style="color:${catColor(u.category)}">▲ ${u.impact_metric}</span>
              <span class="pill">Value: ${u.value}</span>
              <span class="pill">Effort: ${u.effort}</span>
            </div>
          </div>
        </article>`;
      }).join("");
      // plot
      plot.querySelectorAll(".dot-uc").forEach(d => d.remove());
      rows.forEach(u => {
        const x = (scoreOf(u.effort) - 1) / 2;         // effort → 0..1
        const y = (scoreOf(u.value) - 1) / 2;          // value  → 0..1
        // jitter deterministically to avoid overlap
        const jx = ((u._id * 37) % 13 - 6) / 90;
        const jy = ((u._id * 53) % 13 - 6) / 90;
        const dot = document.createElement("div");
        dot.className = "dot-uc";
        dot.dataset.id = u._id;
        dot.style.left = `${Math.min(0.96, Math.max(0.04, x + jx)) * 100}%`;
        dot.style.bottom = `${Math.min(0.96, Math.max(0.04, y + jy)) * 100}%`;
        dot.style.background = catColor(u.category);
        dot.title = `${u.title} — value ${u.value}, effort ${u.effort}`;
        plot.appendChild(dot);
      });
      bindHover();
    };

    const bindHover = () => {
      const hi = (id, on) => {
        $$(`.uc[data-id='${id}']`).forEach(e => e.classList.toggle("hot", on));
        $$(`.dot-uc[data-id='${id}']`).forEach(e => e.classList.toggle("hot", on));
      };
      $$(".uc", list).forEach(el => {
        el.onmouseenter = () => hi(el.dataset.id, true);
        el.onmouseleave = () => hi(el.dataset.id, false);
        el.onclick = () => el.classList.toggle("open");
      });
      $$(".dot-uc", plot).forEach(el => {
        el.onmouseenter = () => hi(el.dataset.id, true);
        el.onmouseleave = () => hi(el.dataset.id, false);
        el.onclick = () => {
          const card = $(`.uc[data-id='${el.dataset.id}']`, list);
          if (card) { $$(".uc.open", list).forEach(x => x !== card && x.classList.remove("open")); card.classList.add("open"); card.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
        };
      });
    };

    toolbar.onclick = (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      $$(".chip", toolbar).forEach(c => c.classList.remove("active"));
      b.classList.add("active");
      render(b.dataset.f);
    };
    render("all");
  }

  /* ================= DASHBOARD ================= */
  let DATA = null;
  function initDashboard(data) {
    DATA = data;
    renderKPIs(data.kpis);
    renderTrendChart(data.monthly);
    renderSegments(data.revenue_by_segment);
    renderAUM(data.aum_by_region);
    renderCommentary(data.variance_commentary);
    // period toggle just re-animates
    const seg = $("#dashSeg");
    if (seg) seg.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("button", seg).forEach(x => x.classList.remove("active")); b.classList.add("active");
      renderTrendChart(data.monthly, b.dataset.view);
      renderSegments(data.revenue_by_segment);
    };
  }

  function renderKPIs(kpis) {
    const el = $("#kpis"); if (!el) return;
    el.innerHTML = kpis.map(k => {
      const t = (k.trend || "flat").toLowerCase();
      const ar = t === "up" ? "▲" : t === "down" ? "▼" : "—";
      return `<div class="kpi"><div class="l">${k.label}</div><div class="v tnum">${k.value}</div>
        <div class="d ${t}">${ar} ${k.delta}</div></div>`;
    }).join("");
  }

  // Line/area chart: actual vs budget vs forecast
  function renderTrendChart(rows, view = "revenue") {
    const host = $("#trendChart"); if (!host) return;
    const W = 560, H = 240, pad = { l: 40, r: 14, t: 16, b: 26 };
    const months = rows.map(r => r.month);
    const series = [
      { key: "budget",   color: "#8c8474", dash: "4 4", label: "Budget",  fill: false },
      { key: "forecast", color: "#4e98f9", dash: "1 5", label: "Forecast", fill: false },
      { key: "actual",   color: "#f6b717", dash: null,  label: "Actual",   fill: true  },
    ];
    const all = rows.flatMap(r => [r.actual, r.budget, r.forecast].filter(v => v != null));
    const min = Math.min(...all) * 0.94, max = Math.max(...all) * 1.04;
    const X = i => pad.l + (i / (rows.length - 1)) * (W - pad.l - pad.r);
    const Y = v => pad.t + (1 - (v - min) / (max - min)) * (H - pad.t - pad.b);
    const path = (key) => rows.map((r, i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(r[key]).toFixed(1)}`).join(" ");
    const gridY = [0, .25, .5, .75, 1].map(f => { const v = min + f * (max - min); const y = Y(v);
      return `<line x1="${pad.l}" x2="${W-pad.r}" y1="${y}" y2="${y}" stroke="rgba(255,255,255,.07)"/>
              <text x="${pad.l-6}" y="${y+3}" fill="#8c8474" font-size="9" text-anchor="end" font-family="IBM Plex Mono">${Math.round(v)}</text>`; }).join("");
    const area = `${path("actual")} L${X(rows.length-1)} ${H-pad.b} L${X(0)} ${H-pad.b} Z`;
    const lines = series.map(s => {
      const stroke = `<path d="${path(s.key)}" fill="none" stroke="${s.color}" stroke-width="${s.key==='actual'?2.4:1.6}" ${s.dash?`stroke-dasharray="${s.dash}"`:""} stroke-linecap="round" stroke-linejoin="round" class="spark-line"/>`;
      return stroke;
    }).join("");
    const dots = rows.map((r, i) => `<circle cx="${X(i)}" cy="${Y(r.actual)}" r="2.4" fill="#f6b717"/>`).join("");
    const xlabels = months.map((m, i) => (i % 2 === 0) ? `<text x="${X(i)}" y="${H-8}" fill="#8c8474" font-size="9" text-anchor="middle" font-family="IBM Plex Mono">${m}</text>` : "").join("");
    host.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Revenue actual vs budget vs forecast">
      <defs><linearGradient id="areaG" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#f6b717" stop-opacity=".28"/><stop offset="1" stop-color="#f6b717" stop-opacity="0"/>
      </linearGradient></defs>
      ${gridY}<path d="${area}" fill="url(#areaG)"/>${lines}${dots}${xlabels}
    </svg>`;
    // animate stroke draw
    $$(".spark-line", host).forEach(p => { const len = p.getTotalLength(); p.style.strokeDasharrayBackup = p.getAttribute("stroke-dasharray");
      p.style.transition = "none"; p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      requestAnimationFrame(() => { p.style.transition = "stroke-dashoffset 1.3s cubic-bezier(.2,.7,.2,1)"; p.style.strokeDashoffset = 0;
        setTimeout(() => { if (p.style.strokeDasharrayBackup) p.style.strokeDasharray = p.style.strokeDasharrayBackup; else p.style.strokeDasharray = "none"; }, 1350); });
    });
    const lg = $("#trendLegend"); if (lg) lg.innerHTML = series.slice().reverse().map(s =>
      `<span class="li"><span class="sw" style="background:${s.color};${s.dash?'height:2px;border-radius:0':''}"></span>${s.label}</span>`).join("");
  }

  function renderSegments(segs) {
    const host = $("#segChart"); if (!host) return;
    const max = Math.max(...segs.map(s => s.revenue_musd));
    const pal = ["#f6b717", "#0dc182", "#4e98f9", "#a145e4", "#dd7027", "#dd2748"];
    host.innerHTML = segs.map((s, i) => {
      const w = (s.revenue_musd / max) * 100;
      const g = s.growth_pct >= 0 ? "+" : "";
      return `<div class="bar-row"><div class="lab">${s.segment}</div>
        <div class="track"><div class="fill" style="width:0;background:${pal[i % pal.length]}" data-w="${w}"></div></div>
        <div class="val">$${fmt(s.revenue_musd)}m <span style="color:${s.growth_pct>=0?'#0dc182':'#dd2748'};font-size:.68rem">${g}${s.growth_pct}%</span></div></div>`;
    }).join("");
    requestAnimationFrame(() => $$(".fill", host).forEach((f, i) => setTimeout(() => f.style.width = f.dataset.w + "%", 80 * i)));
  }

  // donut for AUM by region
  function renderAUM(regions) {
    const host = $("#aumChart"); if (!host) return;
    const total = regions.reduce((a, r) => a + r.aum_busd, 0);
    const pal = ["#f6b717", "#4e98f9", "#0dc182", "#a145e4"];
    const R = 52, C = 2 * Math.PI * R; let off = 0;
    const segs = regions.map((r, i) => {
      const frac = r.aum_busd / total; const len = frac * C;
      const seg = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${pal[i%pal.length]}" stroke-width="18"
        stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)" stroke-linecap="butt"/>`;
      off += len; return seg;
    }).join("");
    host.innerHTML = `<div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
      <svg viewBox="0 0 140 140" width="140" height="140" aria-label="AUM by region">
        ${segs}<text x="70" y="66" text-anchor="middle" fill="#fff" font-size="20" font-family="Fraunces">$${fmt(total/1000,1)}T</text>
        <text x="70" y="84" text-anchor="middle" fill="#b7afa0" font-size="8" font-family="IBM Plex Mono" letter-spacing="1">TOTAL AUM/AUA</text></svg>
      <div style="flex:1;min-width:150px">${regions.map((r, i) =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:.78rem;color:#cfc8ba">
          <span style="display:flex;align-items:center;gap:8px"><span style="width:9px;height:9px;border-radius:2px;background:${pal[i%pal.length]}"></span>${r.region}</span>
          <b style="color:#fff;font-family:IBM Plex Mono">$${fmt(r.aum_busd)}b</b></div>`).join("")}</div></div>`;
  }

  function renderCommentary(items) {
    const host = $("#commentary"); if (!host) return;
    host.innerHTML = items.map(c => {
      const neg = /(-|\bbelow\b|\bunfav)/i.test(c.variance) && !/\+/.test(c.variance);
      return `<div class="comment"><div class="li"><span>${c.line_item}</span>
        <span class="var ${neg?'neg':'pos'}">${c.variance}</span></div><p>${c.commentary}</p></div>`;
    }).join("");
  }

  /* ================= BOARD-PACK GENERATOR ================= */
  const GEN_TEMPLATES = {
    "Board Pack — CFO Summary": (o) => ([
      { h: "Executive summary", type: "p", body: `Group revenue of <b>$${o.rev}m</b> for ${o.period} landed <b>${o.varTxt}</b> against budget, driven by ${o.driver}. EBITDA margin held at <b>${o.margin}%</b>, ${o.marginNote}. Net new AUM of <b>$${o.nnaum}b</b> reflects continued momentum in ${o.region}.` },
      { h: "Performance vs plan", type: "ul", body: [
        `Fund Administration up ${o.g1}% YoY — the largest contributor to the favourable variance.`,
        `Corporate Services ${o.g2 >= 0 ? "grew" : "softened"} ${Math.abs(o.g2)}%, ${o.g2 >= 0 ? "supported by" : "impacted by"} ${o.driver2}.`,
        `Cost base tracking ${o.costTxt}; integration synergies from recent acquisitions ${o.synergy}.` ] },
      { h: "Outlook & risks", type: "p", body: `Full-year forecast reaffirmed. Key watch items: FX translation exposure across ${o.region}, timing of onboarding for the ${o.pipeline} pipeline, and DSO trending to ${o.dso} days. No change to guidance.` },
      { h: "Recommendation", type: "p", body: `The Board is asked to <b>note</b> the ${o.period} result and <b>approve</b> the reallocation of forecast investment toward client-onboarding automation.` },
    ]),
    "Variance Analysis Memo": (o) => ([
      { h: "Purpose", type: "p", body: `This memo explains material variances for ${o.period} at group and segment level, with root-cause commentary generated from the ledger and re-checked against management inputs.` },
      { h: "Material variances", type: "ul", body: [
        `Revenue: ${o.varTxt} vs budget ($${o.rev}m actual). Primary driver — ${o.driver}.`,
        `Direct costs: ${o.costTxt} — ${o.synergy}.`,
        `EBITDA margin: ${o.margin}%, ${o.marginNote}.` ] },
      { h: "Root-cause narrative", type: "p", body: `The favourable revenue variance is <b>${o.quality}</b> in nature: ${o.driver}. This is expected to ${o.persist}. Recommended action: reflect in the rolling reforecast and flag to the segment leads for Q-review.` },
    ]),
    "Investor / Client Reporting Note": (o) => ([
      { h: "Summary for investors", type: "p", body: `For ${o.period}, assets under administration reached <b>$${o.aum}T</b> across the platform. Service revenue of <b>$${o.rev}m</b> grew on the back of ${o.driver}, while operational KPIs remained within agreed SLAs.` },
      { h: "Key metrics", type: "ul", body: [
        `Net new AUM: $${o.nnaum}b`, `Client retention: ${o.retention}%`, `NAV delivery on-time: 99.4%`, `Revenue per FTE: $${o.rpf}k` ] },
      { h: "Forward view", type: "p", body: `We continue to invest in automation across reporting and onboarding to compress cycle times and enhance data quality — the benefits of which will accrue to clients through faster, richer reporting.` },
    ]),
  };

  function initGenerator(data) {
    const host = $("#genOutput"); if (!host) return;
    const typeSel = $("#genType");
    const periodChips = $("#genPeriod");
    const toneChips = $("#genTone");
    const btn = $("#genRun");

    // derive facts from data for internal consistency
    const kget = (needle) => { const k = data.kpis.find(x => x.label.toLowerCase().includes(needle)); return k ? k.value : ""; };
    const totalAum = (data.aum_by_region.reduce((a, r) => a + r.aum_busd, 0) / 1000).toFixed(1);
    const topSeg = [...data.revenue_by_segment].sort((a,b)=>b.revenue_musd-a.revenue_musd)[0];

    // map a period label to the right slice of monthly data
    const periodSlice = (period) => {
      const M = data.monthly;
      const find = (mm) => M.find(r => r.month.toLowerCase().startsWith(mm.toLowerCase()));
      if (/h1/i.test(period))  return M.slice(0, 6);                 // Jul–Dec
      if (/q3/i.test(period))  return [find("Jan"), find("Feb"), find("Mar")].filter(Boolean); // FY Q3 = Jan–Mar
      const single = find(period.split(" ")[0].slice(0,3));
      return single ? [single] : [M[M.length - 1]];
    };

    const buildFacts = (period, tone) => {
      const slice = periodSlice(period);
      const sum = (k) => slice.reduce((a, r) => a + r[k], 0);
      const agg = { actual: sum("actual"), budget: sum("budget"), forecast: sum("forecast") };
      const varPct = (((agg.actual - agg.budget) / agg.budget) * 100);
      const fav = varPct >= 0;
      return {
        period, rev: fmt(agg.actual), aum: totalAum,
        varTxt: `${fav ? "+" : ""}${varPct.toFixed(1)}% (${fav ? "favourable" : "adverse"})`,
        margin: (kget("margin") || "38%").replace(/[^\d.]/g, "") || "38",
        marginNote: fav ? "ahead of the prior period on operating leverage" : "broadly in line with plan",
        nnaum: fmt(Math.max(4, data.revenue_by_segment.length * 3)),
        region: data.aum_by_region.sort((a,b)=>b.aum_busd-a.aum_busd)[0].region,
        driver: `strength in ${topSeg.segment} (+${topSeg.growth_pct}% YoY)`,
        driver2: "phasing of project fees",
        g1: topSeg.growth_pct, g2: data.revenue_by_segment[2] ? data.revenue_by_segment[2].growth_pct : 4,
        costTxt: fav ? "0.8% below budget" : "1.2% above budget",
        synergy: "are being realised on schedule",
        pipeline: "H2", dso: kget("dso").replace(/[^\d]/g,"") || "47",
        retention: (kget("retention") || "96%").replace(/[^\d.]/g,"") || "96",
        rpf: "182",
        quality: tone === "Conservative" ? "partly timing-related" : "structural and recurring",
        persist: tone === "Conservative" ? "partially unwind next period" : "persist into the coming quarters",
      };
    };

    let curPeriod = "May FY26", curTone = "Balanced";
    periodChips.onclick = e => { const b = e.target.closest(".chip"); if (!b) return; $$(".chip",periodChips).forEach(c=>c.classList.remove("active")); b.classList.add("active"); curPeriod = b.textContent; };
    toneChips.onclick   = e => { const b = e.target.closest(".chip"); if (!b) return; $$(".chip",toneChips).forEach(c=>c.classList.remove("active")); b.classList.add("active"); curTone = b.textContent; };

    const run = () => {
      const tmpl = GEN_TEMPLATES[typeSel.value] || GEN_TEMPLATES["Board Pack — CFO Summary"];
      const facts = buildFacts(curPeriod, curTone);
      const blocks = tmpl(facts);
      host.innerHTML = `<div class="gen-output">
        <div class="doc-title">${typeSel.value}</div>
        <div class="doc-sub">APEX GROUP · ${curPeriod} · ${curTone.toUpperCase()} TONE · DRAFTED BY AI · FOR REVIEW</div>
        <div id="genStream"></div></div>`;
      streamBlocks($("#genStream"), blocks);
    };
    btn.onclick = run;
    // first render
    run();
  }

  // typewriter reveal of structured blocks
  function streamBlocks(host, blocks) {
    host.innerHTML = "";
    let bi = 0;
    const next = () => {
      if (bi >= blocks.length) return;
      const b = blocks[bi++];
      const wrap = document.createElement("div");
      wrap.innerHTML = `<h5>${b.h}</h5>` + (b.type === "ul"
        ? `<ul>${b.body.map(li => `<li>${li}</li>`).join("")}</ul>`
        : `<p>${b.body}</p>`);
      wrap.style.opacity = 0; wrap.style.transform = "translateY(8px)";
      wrap.style.transition = "opacity .5s, transform .5s";
      host.appendChild(wrap);
      requestAnimationFrame(() => { wrap.style.opacity = 1; wrap.style.transform = "none"; });
      setTimeout(next, 420);
    };
    next();
  }

  /* ================= ASK YOUR NUMBERS (NL query engine over the data) ================= */
  function initAskNumbers(data) {
    const log = $("#askLog"); const chipWrap = $("#askChips"); const form = $("#askForm"); const input = $("#askInput");
    if (!log) return;

    // ---- precompute the facts the engine can reason over ----
    const seg = [...data.revenue_by_segment].sort((a, b) => b.revenue_musd - a.revenue_musd);
    const byGrowth = [...data.revenue_by_segment].sort((a, b) => b.growth_pct - a.growth_pct);
    const top = seg[0], hi = byGrowth[0], lo = byGrowth[byGrowth.length - 1];
    const totalAua = data.aum_by_region.reduce((a, r) => a + r.aum_busd, 0);
    const region = [...data.aum_by_region].sort((a, b) => b.aum_busd - a.aum_busd);
    const M = data.monthly, last = M[M.length - 1], prev = M[M.length - 2];
    const kget = (n) => data.kpis.find(x => x.label.toLowerCase().includes(n)) || { value: "", delta: "" };
    const comm = (n) => data.variance_commentary.find(c => c.line_item.toLowerCase().includes(n));
    const juneVar = comm("june") || comm("total revenue");
    const b = (s) => `<b>${s}</b>`;
    const cite = (s) => `<span class="cite">↳ source · ${s}</span>`;

    // ---- intents: keyword score + answer generator ----
    const intents = [
      { keys: ["why","below","budget","miss","short","adverse","down","variance","june","lower"], a: () => ({
        html: `June revenue came in at ${b("$" + fmt(last.actual) + "m")} versus a ${b("$" + fmt(last.budget) + "m")} budget — a ${b(fmt(((last.actual-last.budget)/last.budget)*100,1) + "% adverse")} variance. It's <b>timing, not run-rate erosion</b>: ${juneVar ? juneVar.commentary : "two large private-markets onboardings slipped past the 30-June cut-off on client-side legal delays, and a NAV-strike timing shift deferred fees."} No mandates were lost.`,
        cite: "Group P&L → Jun FY26 close · variance bridge B24:B31" }) },
      { keys: ["best","top","strong","standout","fastest","grow","growth","winner","performer"], a: () => ({
        html: `Your standout is ${b(hi.segment)}, up ${b("+" + hi.growth_pct + "% YoY")} to ${b("$" + fmt(hi.revenue_musd) + "m")} — driven by strong fund launches and drawdown activity across anchor GP relationships. ${b(byGrowth[1].segment)} is next at +${byGrowth[1].growth_pct}%.`,
        cite: "Segment P&L → FY26 · revenue by service line" }) },
      { keys: ["worst","slow","weak","laggard","lowest","underperform"], a: () => ({
        html: `The slowest grower is ${b(lo.segment)} at ${b("+" + lo.growth_pct + "% YoY")} — steady and recurring, but below the group average. It's a mix effect, not a problem: faster-growing PE and ManCo/ESG lines are pulling the blended rate up.`,
        cite: "Segment P&L → FY26 · growth vs prior year" }) },
      { keys: ["margin","ebitda","profit","profitab"], a: () => ({
        html: `EBITDA margin is ${b(kget("margin").value)} (${kget("margin").delta}). Expansion despite headcount growth reflects <b>platform automation in fund accounting</b> and a favourable shift toward higher-margin ManCo/ESG and PE servicing; wage inflation was largely offset by improved offshore utilisation.`,
        cite: "Group P&L → FY26 · EBITDA bridge" }) },
      { keys: ["total revenue","how much revenue","group revenue","topline","top line","full year","fy26 revenue"], a: () => ({
        html: `Group revenue for FY26 is ${b(kget("total revenue").value)}, ${b(kget("total revenue").delta)}. The book is ~90% recurring — NAV/AUA-linked ad-valorem fees plus per-entity and project charges.`,
        cite: "Group P&L → FY26 consolidated" }) },
      { keys: ["aum","aua","assets","region","geography","emea","americas","apac","where"], a: () => ({
        html: `Platform assets total ${b("$" + fmt(totalAua/1000,2) + "T")} AUA (${kget("aua").delta}). Largest region is ${b(region[0].region)} at ${b("$" + fmt(region[0].aum_busd) + "b")}, then ${region[1].region} ($${fmt(region[1].aum_busd)}b). Net new AUA of ${b(kget("net new").value)} shows continued momentum.`,
        cite: "Asset servicing ledger → AUA by region" }) },
      { keys: ["dso","cash","working capital","receivable","collect","days sales"], a: () => ({
        html: `DSO is ${b(kget("dso").value)} (${kget("dso").delta}). Collections discipline and earlier invoicing on project work released roughly ${b("$21m")} of working capital in the quarter; aged receivables over 90 days fell to 4.1% from 5.3%.`,
        cite: "AR sub-ledger → DSO trend, aged debt" }) },
      { keys: ["headcount","fte","people","productiv","per fte","utilisation","utilization","staff"], a: () => ({
        html: `Headcount is ${b(kget("headcount").value)} FTE (${kget("headcount").delta}), yet revenue per FTE rose to ${b(kget("revenue per").value)} (${kget("revenue per").delta}) — productivity is outpacing hiring, exactly the operating-leverage story the sponsors want to see.`,
        cite: "HR + P&L → revenue per FTE" }) },
      { keys: ["forecast","outlook","rest of year","guidance","next","reforecast","expect","fy27"], a: () => ({
        html: `Full-year guidance is <b>reaffirmed</b>. The June slippage is a timing effect — roughly ${b("$14m")} is expected to recognise in July–August as the delayed closes complete. Watch items: FX translation across ${region[0].region}, H2 onboarding phasing, and DSO.`,
        cite: "Rolling reforecast → FY26 close + FY27 open" }) },
      { keys: ["esg","manco","sustainab","sfdr"], a: () => ({
        html: `${b("ManCo & ESG Solutions")} is the fastest-growing line at ${b("+" + (data.revenue_by_segment.find(s=>/ESG|ManCo/i.test(s.segment))||{growth_pct:22.8}).growth_pct + "% YoY")}, off a small base — driven by SFDR/ESG reporting mandates and third-party AIFM/ManCo appointments in Luxembourg and Ireland. Pipeline supports 20%+ growth into FY27.`,
        cite: "Segment P&L → ManCo/ESG detail" }) },
      { keys: ["retention","churn","client","lost","keep"], a: () => ({
        html: `Client retention by revenue is ${b(kget("retention").value)} (${kget("retention").delta}) — a sticky, recurring book. No material mandates lost this period.`,
        cite: "Revenue ledger → retention by value" }) },
    ];

    const suggestions = [
      "Why was June below budget?",
      "Which segment is performing best?",
      "What's driving EBITDA margin?",
      "Where is our AUA concentrated?",
      "How's DSO and working capital?",
      "Is the full-year forecast still on track?",
      "How is revenue per FTE trending?",
    ];

    const match = (q) => {
      const s = q.toLowerCase();
      let best = null, bestScore = 0;
      intents.forEach(it => {
        const score = it.keys.reduce((n, k) => n + (s.includes(k) ? (k.length > 5 ? 2 : 1) : 0), 0);
        if (score > bestScore) { bestScore = score; best = it; }
      });
      return bestScore > 0 ? best : null;
    };

    const scrollDown = () => { log.scrollTop = log.scrollHeight; };
    const addUser = (q) => { log.insertAdjacentHTML("beforeend", `<div class="msg user"><div class="bubble">${q}</div></div>`); scrollDown(); };
    const think = () => { const el = document.createElement("div"); el.className = "msg ai"; el.innerHTML = `<div class="ava">✦</div><div class="bubble thinking"><span></span><span></span><span></span></div>`; log.appendChild(el); scrollDown(); return el; };

    const answer = (q) => {
      addUser(q);
      const t = think();
      setTimeout(() => {
        const it = match(q);
        const res = it ? it.a() : {
          html: `I answer from the board numbers — try asking about <b>revenue variance</b>, <b>segment performance</b>, <b>margin</b>, <b>AUA by region</b>, <b>DSO</b>, <b>productivity</b> or the <b>forecast</b>. In production I'm grounded on your governed ledgers with a citation for every figure.`,
          cite: "grounded on Apex governed data (illustrative)" };
        t.querySelector(".bubble").className = "bubble";
        t.querySelector(".bubble").innerHTML = `${res.html}<div class="cite-row">${cite(res.cite)}<span class="verified">✓ traced &amp; reviewable</span></div>`;
        scrollDown();
      }, 620 + Math.random() * 380);
    };

    chipWrap.innerHTML = suggestions.map(q => `<button class="ask-chip">${q}</button>`).join("");
    chipWrap.onclick = (e) => { const bt = e.target.closest(".ask-chip"); if (bt) answer(bt.textContent); };
    form.onsubmit = (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { answer(q); input.value = ""; } };

    // opening message
    log.insertAdjacentHTML("beforeend", `<div class="msg ai"><div class="ava">✦</div><div class="bubble">Ask me anything about the June board pack — variances, segments, margin, assets, cash. I'll answer from the numbers and show you where each figure comes from.</div></div>`);
  }

  /* ================= ROI / VALUE CALCULATOR ================= */
  // Grounded in the research ROI model: model CAPACITY RETURNED (the metric a controls-
  // minded CFO deputy trusts), net of retained review time, with payback vs a lighthouse.
  const ROI_INPUTS = [
    { key: "packs",  label: "Board &amp; management packs / month", def: 60, min: 10, max: 200, step: 5, unit: "" },
    { key: "hours",  label: "Analyst hours per full pack cycle",   def: 20, min: 6,  max: 45,  step: 1, unit: "hrs" },
    { key: "auto",   label: "Drafting work AI can take on",        def: 60, min: 30, max: 80,  step: 5, unit: "%" },
    { key: "review", label: "Analyst review retained (we keep the human in)", def: 25, min: 10, max: 50, step: 5, unit: "%" },
    { key: "cost",   label: "Fully-loaded cost per finance FTE",   def: 95000, min: 45000, max: 180000, step: 5000, unit: "$/yr" },
    { key: "invest", label: "Lighthouse investment (year one)",    def: 180000, min: 100000, max: 500000, step: 10000, unit: "$" },
  ];
  const PROD_HRS = 1600, CYCLES = 12;

  function initROI() {
    const wrap = $("#roiInputs"); if (!wrap) return;
    const state = {}; ROI_INPUTS.forEach(i => state[i.key] = i.def);

    wrap.innerHTML = ROI_INPUTS.map(i => `
      <div class="roi-field">
        <div class="roi-lab"><span>${i.label}</span><span class="roi-val" id="rv_${i.key}"></span></div>
        <input type="range" id="ri_${i.key}" min="${i.min}" max="${i.max}" step="${i.step}" value="${i.def}" />
      </div>`).join("");

    const fmtInput = (i, v) => (i.unit === "$/yr" || i.unit === "$") ? "$" + fmt(v) : i.unit === "%" ? v + "%" : i.unit ? v + " " + i.unit : fmt(v);

    const compute = () => {
      const grossHours = state.packs * state.hours * CYCLES;
      const savedHours = grossHours * (state.auto / 100) * (1 - state.review / 100);
      const hourly = state.cost / PROD_HRS;
      const value = savedHours * hourly;                 // steady-state annual capacity value
      const fteEq = savedHours / PROD_HRS;
      const payback = state.invest / (value / 12);       // months
      return { savedHours, value, fteEq, payback };
    };

    const outputs = {
      value:      { el: "#roiDollars", fmt: v => "$" + fmt(Math.round(v / 1000)) + "k" },
      savedHours: { el: "#roiHours",   fmt: v => fmt(Math.round(v)) },
      fteEq:      { el: "#roiFte",     fmt: v => fmt(v, 1) },
      payback:    { el: "#roiWeeks",   fmt: v => (v < 1 ? "<1" : fmt(Math.round(v))) },
    };

    const render = () => {
      ROI_INPUTS.forEach(i => {
        $("#rv_" + i.key).textContent = fmtInput(i, state[i.key]);
        const pct = ((state[i.key] - i.min) / (i.max - i.min)) * 100;
        $("#ri_" + i.key).style.background = `linear-gradient(90deg, var(--gold) ${pct}%, var(--line) ${pct}%)`;
      });
      const r = compute();
      Object.entries(outputs).forEach(([k, o]) => { const el = $(o.el); if (el) el.textContent = o.fmt(r[k]); });
      const band = $("#roiBand");
      if (band) {
        const low = r.value * 0.7, high = r.value * 1.35;
        band.innerHTML = `Base case shown. Credible range: <b>$${fmt(Math.round(low/1000))}k</b> – <b>$${fmt(Math.round(high/1000))}k</b> per year — and it scales as we roll the pattern across more of your ${fmt(state.packs)} monthly packs.`;
      }
    };

    ROI_INPUTS.forEach(i => {
      $("#ri_" + i.key).addEventListener("input", (e) => { state[i.key] = +e.target.value; render(); });
    });
    render();
  }

  /* ================= BOOT ================= */
  /* ================= GOVERNANCE ================= */
  const GOV_ICONS = ["👤","🔒","🧾","🛡️","⚖️","🎯","🗂️","✅"];
  function initGovernance(gov) {
    const host = $("#govGrid"); if (!host || !gov) return;
    host.innerHTML = gov.pillars.map((p, i) => `
      <div class="gov-card reveal ${i%3===1?'d1':i%3===2?'d2':''}">
        <div class="g-ico">${GOV_ICONS[i % GOV_ICONS.length]}</div>
        <h4>${p.pillar}</h4>
        <p class="principle">${p.principle}</p>
        <ul>${p.controls.map(c => `<li>${c}</li>`).join("")}</ul>
        <p class="reassure">“${p.reassurance}”</p>
      </div>`).join("");
    // re-observe newly injected reveals
    reobserve(host);
  }

  /* ================= EVIDENCE / PROOF ================= */
  function initEvidence(data) {
    const host = $("#evGrid"); const bar = $("#evBar"); if (!host || !data) return;
    const rows = data.benchmarks;
    const areas = [...new Set(rows.map(b => (b.area || "").split("/")[0].trim()).filter(Boolean))];
    bar.innerHTML = `<button class="chip active" data-f="all">All evidence</button>` +
      areas.map(a => `<button class="chip" data-f="${a}">${a}</button>`).join("");
    const render = (f) => {
      const list = f === "all" ? rows : rows.filter(b => (b.area || "").split("/")[0].trim() === f);
      host.innerHTML = list.map(b => `
        <div class="ev">
          <span class="area-tab"></span>
          <div class="stat">${b.stat}</div>
          <div class="claim">${b.claim}</div>
          <div class="src">${(b.source_type || "").split("(")[0].trim()}</div>
        </div>`).join("");
    };
    bar.onclick = (e) => { const bt = e.target.closest(".chip"); if (!bt) return;
      $$(".chip", bar).forEach(c => c.classList.remove("active")); bt.classList.add("active"); render(bt.dataset.f); };
    render("all");
  }

  // helper: observe reveals inside a freshly-rendered container
  function reobserve(container) {
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal", container).forEach(el => io.observe(el));
  }

  // auto-number section eyebrows in DOM order (robust to inserting sections)
  function numberSections() {
    $$(".sec-num").forEach((el, i) => { el.textContent = String(i + 1).padStart(2, "0") + " —"; });
  }

  async function boot() {
    initReveal(); initCounters(); initNavSpy(); numberSections();
    try {
      const [uc, data, gov, bench] = await Promise.all([
        fetch("assets/data/usecases.json").then(r => r.json()),
        fetch("assets/data/demo.json").then(r => r.json()),
        fetch("assets/data/governance.json").then(r => r.json()).catch(() => null),
        fetch("assets/data/benchmarks.json").then(r => r.json()).catch(() => null),
      ]);
      uc.forEach((u, i) => u._id = i + 1);
      initCapabilityMap(uc);
      initDashboard(data);
      initAskNumbers(data);
      initGenerator(data);
      initROI();
      initGovernance(gov);
      initEvidence(bench);
      numberSections();
    } catch (err) {
      console.error("Data load failed (are you opening via file://? use a local server):", err);
      // graceful inline fallback if embedded
      if (window.__UC__ && window.__DATA__) {
        window.__UC__.forEach((u, i) => u._id = i + 1);
        initCapabilityMap(window.__UC__); initDashboard(window.__DATA__); initGenerator(window.__DATA__);
      }
    }
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", boot) : boot();
})();
