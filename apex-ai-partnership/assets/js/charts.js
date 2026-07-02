/* ============================================================
   Apex AI Partnership — hand-rolled SVG charts
   window.Viz — line, bars, bridge (waterfall), spark, timeline,
   typewriter. Classic script, no dependencies, file:// safe.

   Every colour is read from CSS custom properties at render time
   (getComputedStyle) — no colour literals live in this file.
   Charts are responsive via viewBox; text is real SVG text so it
   prints and copies. Tooltips work on hover AND keyboard focus.
   ============================================================ */
(function () {
  "use strict";

  var SVGNS = "http://www.w3.org/2000/svg";
  var docEl = document.documentElement;

  /* ---------- environment ---------- */

  function prefersReduced() {
    return !!(window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  /* ---------- colour resolution (CSS custom properties only) ---------- */

  function cssVar(name, scopeEl) {
    var probe = scopeEl && scopeEl.nodeType === 1 ? scopeEl : docEl;
    var v = getComputedStyle(probe).getPropertyValue(name);
    v = v ? v.trim() : "";
    return v || "currentColor";
  }

  /* Accepts "--series-1", "var(--series-1)", or an already-resolved
     colour string; returns a concrete colour. */
  function resolveColor(c, scopeEl) {
    if (!c) return cssVar("--ink-2", scopeEl);
    if (typeof c !== "string") return String(c);
    if (c.slice(0, 2) === "--") return cssVar(c, scopeEl);
    if (c.slice(0, 4) === "var(") {
      var m = c.match(/var\(\s*(--[^),\s]+)/);
      return m ? cssVar(m[1], scopeEl) : c;
    }
    return c;
  }

  /* One palette read per render — chart furniture tokens. */
  function furniture(scopeEl) {
    return {
      paper: cssVar("--paper", scopeEl),
      raise: cssVar("--paper-raise", scopeEl),
      recess: cssVar("--paper-recess", scopeEl),
      ink: cssVar("--ink", scopeEl),
      ink2: cssVar("--ink-2", scopeEl),
      ink3: cssVar("--ink-3", scopeEl),
      hairline: cssVar("--hairline", scopeEl),
      baseline: cssVar("--baseline", scopeEl),
      accent: cssVar("--accent", scopeEl),
      accentInk: cssVar("--accent-ink", scopeEl),
      accentWash: cssVar("--accent-wash", scopeEl),
      favourable: cssVar("--favourable", scopeEl),
      favourableText: cssVar("--favourable-text", scopeEl),
      adverse: cssVar("--adverse", scopeEl),
      adverseText: cssVar("--adverse-text", scopeEl),
      neutralBar: cssVar("--neutral-bar", scopeEl),
      fontText: cssVar("--font-text", scopeEl)
    };
  }

  /* ---------- SVG helpers ---------- */

  function svgEl(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k) &&
            attrs[k] !== null && attrs[k] !== undefined) {
          n.setAttribute(k, attrs[k]);
        }
      }
    }
    if (parent) parent.appendChild(n);
    return n;
  }

  function makeSvg(el, w, h, label, tone) {
    var svg = svgEl("svg", {
      viewBox: "0 0 " + w + " " + h,
      role: "img",
      "aria-label": label || "Chart"
    });
    svg.style.width = "100%";
    svg.style.height = "auto";
    svg.style.display = "block";
    svg.style.fontFamily = tone.fontText;
    el.appendChild(svg);
    return svg;
  }

  function text(parent, x, y, str, o) {
    o = o || {};
    var t = svgEl("text", {
      x: x, y: y,
      "text-anchor": o.anchor || "start",
      "font-size": o.size || 11,
      "font-weight": o.weight || 400,
      fill: o.fill
    }, parent);
    if (o.tabular !== false) t.style.fontVariantNumeric = "tabular-nums";
    t.textContent = str;
    return t;
  }

  /* Rough text-width estimate (Inter @ given px). Used for padding
     and collision decisions only — never for truth. */
  function estWidth(str, size) {
    return String(str).length * size * 0.6;
  }

  /* ---------- scales & ticks ---------- */

  function niceTicks(lo, hi, count) {
    if (lo === hi) { hi = lo + 1; lo = lo - 1; }
    var span = hi - lo;
    var step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10));
    var err = (span / count) / step;
    if (err >= 7.5) step *= 10;
    else if (err >= 3.5) step *= 5;
    else if (err >= 1.5) step *= 2;
    var ticks = [];
    var start = Math.ceil(lo / step) * step;
    for (var v = start; v <= hi + step * 1e-9; v += step) {
      ticks.push(Math.round(v * 1e6) / 1e6);
    }
    return ticks;
  }

  function extent(arrays) {
    var lo = Infinity, hi = -Infinity;
    arrays.forEach(function (arr) {
      arr.forEach(function (v) {
        if (v === null || v === undefined || isNaN(v)) return;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      });
    });
    if (lo === Infinity) { lo = 0; hi = 1; }
    return [lo, hi];
  }

  function defaultFormat(v) {
    if (v === null || v === undefined || isNaN(v)) return "—";
    var abs = Math.abs(v);
    var s = abs >= 100
      ? Math.round(v).toLocaleString("en-US")
      : (Math.round(v * 10) / 10).toLocaleString("en-US",
          { minimumFractionDigits: abs >= 100 ? 0 : 1, maximumFractionDigits: 1 });
    return s;
  }

  /* ---------- shared tooltip (one per document) ---------- */

  var tipNode = null;

  function tip() {
    if (!tipNode) {
      tipNode = document.createElement("div");
      tipNode.className = "viz-tip";
      tipNode.setAttribute("role", "status");
      tipNode.setAttribute("aria-hidden", "true");
      tipNode.hidden = true;
      document.body.appendChild(tipNode);
    }
    return tipNode;
  }

  /* rows: [{swatch, swatchType:'line'|'rect', name, value, muted}] —
     all strings inserted via textContent (labels are untrusted). */
  function tipContent(title, rows) {
    var t = tip();
    while (t.firstChild) t.removeChild(t.firstChild);
    if (title) {
      var h = document.createElement("div");
      h.className = "tip-title";
      h.textContent = title;
      t.appendChild(h);
    }
    (rows || []).forEach(function (r) {
      var row = document.createElement("div");
      row.className = "tip-row" + (r.muted ? " tip-muted" : "");
      if (r.swatch) {
        var key = document.createElement("i");
        key.className = "tip-key" + (r.swatchType === "rect" ? " tip-key-rect" : "");
        key.setAttribute("aria-hidden", "true");
        key.style.background = r.swatch;
        row.appendChild(key);
      }
      if (r.name) {
        var nm = document.createElement("span");
        nm.className = "tip-name";
        nm.textContent = r.name;
        row.appendChild(nm);
      }
      if (r.value !== undefined && r.value !== null) {
        var val = document.createElement("b");
        val.textContent = r.value;
        row.appendChild(val);
      }
      t.appendChild(row);
    });
  }

  /* Position near client coords, clamped inside the viewport. */
  function tipShow(cx, cy) {
    var t = tip();
    t.hidden = false;
    t.setAttribute("aria-hidden", "false");
    var pad = 12;
    var w = t.offsetWidth, h = t.offsetHeight;
    var x = cx + 14, y = cy + 14;
    if (x + w + pad > window.innerWidth) x = cx - w - 14;
    if (y + h + pad > window.innerHeight) y = cy - h - 14;
    if (x < pad) x = pad;
    if (y < pad) y = pad;
    t.style.left = x + "px";
    t.style.top = y + "px";
  }

  function tipHide() {
    if (!tipNode) return;
    tipNode.hidden = true;
    tipNode.setAttribute("aria-hidden", "true");
  }

  /* Anchor the tooltip to an SVG element (keyboard focus case). */
  function tipShowAt(el) {
    var r = el.getBoundingClientRect();
    tipShow(r.left + r.width / 2, r.top + r.height / 2);
  }

  /* ---------- legend (HTML, above the plot) ---------- */

  function legend(container, items, type) {
    var box = document.createElement("div");
    box.className = "viz-legend";
    items.forEach(function (it) {
      var k = document.createElement("span");
      k.className = "viz-key";
      var sw = document.createElement("i");
      sw.className = type === "rect" ? "viz-swatch-rect" : "viz-swatch-line";
      sw.setAttribute("aria-hidden", "true");
      sw.style.background = it.color;
      k.appendChild(sw);
      var nm = document.createElement("span");
      nm.textContent = it.name;
      k.appendChild(nm);
      box.appendChild(k);
    });
    container.appendChild(box);
    return box;
  }

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
    el.classList.add("viz");
  }

  /* Choose which x labels to draw so they never crowd. */
  function xLabelIndices(n, plotW) {
    var maxLabels = Math.max(2, Math.floor(plotW / 58));
    if (n <= maxLabels) {
      var all = []; for (var i = 0; i < n; i++) all.push(i);
      return all;
    }
    var step = Math.ceil((n - 1) / (maxLabels - 1));
    var idx = [];
    for (var j = 0; j < n; j += step) idx.push(j);
    if (idx[idx.length - 1] !== n - 1) {
      if (n - 1 - idx[idx.length - 1] < Math.ceil(step / 2)) idx.pop();
      idx.push(n - 1);
    }
    return idx;
  }

  /* ============================================================
     Viz.line — multi-series line chart
     opts: { labels:[...], series:[{name,color,values,dash?,width?}],
             format?, markers?, refLine:{value,label}?, annotate:[{index,label}]?,
             height?, yMin?, yMax? }
     ============================================================ */

  function line(el, opts) {
    clear(el);
    var tone = furniture(el);
    var labels = opts.labels || [];
    var series = (opts.series || []).map(function (s) {
      return {
        name: s.name || "",
        color: resolveColor(s.color, el),
        values: s.values || [],
        /* dash accepts a dasharray string or `true` for the house dash */
        dash: s.dash === true ? "5 4" : (s.dash || null),
        width: s.width || 2
      };
    });
    var fmt = opts.format || defaultFormat;
    var n = labels.length;
    if (!n || !series.length) return;

    if (series.length >= 2) {
      legend(el, series, "line");
    }

    var W = opts.width || 720;
    var H = opts.height || 300;

    /* y domain — data extent (+ refLine), padded; not forced to zero
       for time series (margin lines at 30–35% would flatten). */
    var arrays = series.map(function (s) { return s.values; });
    if (opts.refLine) arrays = arrays.concat([[opts.refLine.value]]);
    var ext = extent(arrays);
    var lo = opts.yMin !== undefined ? opts.yMin : ext[0];
    var hi = opts.yMax !== undefined ? opts.yMax : ext[1];
    var padV = (hi - lo) * 0.12 || Math.abs(hi) * 0.1 || 1;
    if (opts.yMin === undefined) lo -= padV;
    if (opts.yMax === undefined) hi += padV;
    var ticks = niceTicks(lo, hi, 5);
    if (ticks.length) { lo = Math.min(lo, ticks[0]); hi = Math.max(hi, ticks[ticks.length - 1]); }

    var tickLabels = ticks.map(fmt);
    var yLabelW = 0;
    tickLabels.forEach(function (s) { yLabelW = Math.max(yLabelW, estWidth(s, 11)); });

    /* right pad: room for endpoint value labels */
    var endLabelW = 0;
    series.forEach(function (s) {
      var last = s.values[s.values.length - 1];
      endLabelW = Math.max(endLabelW, estWidth(fmt(last), 11));
    });

    var pad = { t: 14, r: Math.ceil(endLabelW) + 14, b: 30, l: Math.ceil(yLabelW) + 12 };
    var plotW = W - pad.l - pad.r;
    var plotH = H - pad.t - pad.b;

    var ariaLabel = (opts.ariaLabel ||
      ("Line chart. " + series.map(function (s) { return s.name; }).filter(Boolean).join(", ") +
       " across " + labels[0] + " to " + labels[n - 1] + "."));
    var svg = makeSvg(el, W, H, ariaLabel, tone);

    function X(i) { return pad.l + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW); }
    function Y(v) { return pad.t + plotH - ((v - lo) / (hi - lo)) * plotH; }

    /* grid */
    var grid = svgEl("g", null, svg);
    ticks.forEach(function (tv) {
      svgEl("line", {
        x1: pad.l, x2: pad.l + plotW, y1: Y(tv), y2: Y(tv),
        stroke: tone.hairline, "stroke-width": 1
      }, grid);
      text(grid, pad.l - 7, Y(tv) + 3.5, fmt(tv),
        { anchor: "end", size: 11, fill: tone.ink3 });
    });
    /* baseline */
    svgEl("line", {
      x1: pad.l, x2: pad.l + plotW,
      y1: pad.t + plotH, y2: pad.t + plotH,
      stroke: tone.baseline, "stroke-width": 1
    }, svg);

    /* x labels */
    xLabelIndices(n, plotW).forEach(function (i) {
      text(svg, X(i), pad.t + plotH + 18, labels[i],
        { anchor: "middle", size: 11, fill: tone.ink3 });
    });

    /* reference line (target / budget threshold) */
    if (opts.refLine && opts.refLine.value !== undefined) {
      var ry = Y(opts.refLine.value);
      svgEl("line", {
        x1: pad.l, x2: pad.l + plotW, y1: ry, y2: ry,
        stroke: tone.baseline, "stroke-width": 1, "stroke-dasharray": "5 4"
      }, svg);
      if (opts.refLine.label) {
        text(svg, pad.l + plotW, ry - 6, opts.refLine.label,
          { anchor: "end", size: 11, weight: 500, fill: tone.ink2 });
      }
    }

    /* annotations: vertical hairline + small label */
    (opts.annotate || []).forEach(function (a) {
      if (a.index === undefined || a.index < 0 || a.index >= n) return;
      var ax = X(a.index);
      svgEl("line", {
        x1: ax, x2: ax, y1: pad.t + 2, y2: pad.t + plotH,
        stroke: tone.baseline, "stroke-width": 1, "stroke-dasharray": "2 3"
      }, svg);
      if (a.label) {
        var anchor = a.index > n * 0.66 ? "end" : (a.index < n * 0.33 ? "start" : "middle");
        text(svg, ax + (anchor === "start" ? 5 : anchor === "end" ? -5 : 0),
          pad.t + 10, a.label, { anchor: anchor, size: 10.5, fill: tone.ink2 });
      }
    });

    /* series paths */
    var reveal = !prefersReduced() && opts.draw !== false;
    series.forEach(function (s) {
      var d = "";
      s.values.forEach(function (v, i) {
        if (v === null || v === undefined || isNaN(v)) return;
        d += (d ? " L " : "M ") + X(i).toFixed(2) + " " + Y(v).toFixed(2);
      });
      var p = svgEl("path", {
        d: d, fill: "none", stroke: s.color,
        "stroke-width": s.width, "stroke-linejoin": "round", "stroke-linecap": "round"
      }, svg);
      if (s.dash) p.setAttribute("stroke-dasharray", s.dash);
      if (reveal && p.getTotalLength) {
        /* draw-in only for solid lines (dash-array conflicts) */
        if (!s.dash) {
          var len = p.getTotalLength();
          p.style.strokeDasharray = len + " " + len;
          p.style.strokeDashoffset = String(len);
          p.style.transition = "stroke-dashoffset 900ms ease-out";
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { p.style.strokeDashoffset = "0"; });
          });
          p.addEventListener("transitionend", function () {
            p.style.strokeDasharray = "";
            p.style.strokeDashoffset = "";
            p.style.transition = "";
          }, { once: true });
        }
      }
    });

    /* optional per-point markers */
    if (opts.markers) {
      series.forEach(function (s) {
        s.values.forEach(function (v, i) {
          if (v === null || v === undefined || isNaN(v)) return;
          svgEl("circle", {
            cx: X(i), cy: Y(v), r: 3,
            fill: s.color, stroke: tone.paper, "stroke-width": 2
          }, svg);
        });
      });
    }

    /* endpoint dots + selective direct labels (endpoint only),
       with simple vertical collision nudging */
    var ends = [];
    series.forEach(function (s) {
      var lastI = s.values.length - 1;
      var v = s.values[lastI];
      if (v === null || v === undefined || isNaN(v)) return;
      ends.push({ s: s, x: X(lastI), y: Y(v), v: v });
    });
    ends.sort(function (a, b) { return a.y - b.y; });
    for (var e = 1; e < ends.length; e++) {
      if (ends[e].ly === undefined) ends[e].ly = ends[e].y;
      if (ends[e - 1].ly === undefined) ends[e - 1].ly = ends[e - 1].y;
      if (ends[e].ly - ends[e - 1].ly < 13) ends[e].ly = ends[e - 1].ly + 13;
    }
    ends.forEach(function (eo) {
      svgEl("circle", {
        cx: eo.x, cy: eo.y, r: 4,
        fill: eo.s.color, stroke: tone.paper, "stroke-width": 2
      }, svg);
      text(svg, eo.x + 8, (eo.ly === undefined ? eo.y : eo.ly) + 4, fmt(eo.v),
        { size: 11, weight: 600, fill: tone.ink });
    });

    /* ---------- hover layer: crosshair + shared tooltip ---------- */
    var hoverG = svgEl("g", null, svg);
    var vline = svgEl("line", {
      y1: pad.t, y2: pad.t + plotH,
      stroke: tone.baseline, "stroke-width": 1, opacity: 0
    }, hoverG);
    var dots = series.map(function (s) {
      return svgEl("circle", {
        r: 4.5, fill: s.color, stroke: tone.paper, "stroke-width": 2, opacity: 0
      }, hoverG);
    });

    var overlay = svgEl("rect", {
      x: pad.l, y: pad.t, width: plotW, height: plotH,
      fill: "none", "pointer-events": "all", tabindex: 0
    }, svg);
    overlay.setAttribute("aria-label",
      "Interactive layer. Use left and right arrow keys to read values by period.");
    overlay.style.outline = "none";
    var focusIdx = -1;

    function showIndex(i, clientX, clientY) {
      var x = X(i);
      vline.setAttribute("x1", x); vline.setAttribute("x2", x);
      vline.setAttribute("opacity", 1);
      var rows = [];
      series.forEach(function (s, si) {
        var v = s.values[i];
        if (v === null || v === undefined || isNaN(v)) {
          dots[si].setAttribute("opacity", 0);
          return;
        }
        dots[si].setAttribute("cx", x);
        dots[si].setAttribute("cy", Y(v));
        dots[si].setAttribute("opacity", 1);
        rows.push({ swatch: s.color, swatchType: "line", name: s.name, value: fmt(v) });
      });
      tipContent(labels[i], rows);
      if (clientX !== undefined) {
        tipShow(clientX, clientY);
      } else {
        var r = overlay.getBoundingClientRect();
        tipShow(r.left + (r.width * (n === 1 ? 0.5 : i / (n - 1))), r.top + r.height * 0.4);
      }
    }

    function hideHover() {
      vline.setAttribute("opacity", 0);
      dots.forEach(function (d) { d.setAttribute("opacity", 0); });
      tipHide();
    }

    overlay.addEventListener("pointermove", function (ev) {
      var r = overlay.getBoundingClientRect();
      var fx = (ev.clientX - r.left) / r.width;
      var i = Math.round(fx * (n - 1));
      i = Math.max(0, Math.min(n - 1, i));
      showIndex(i, ev.clientX, ev.clientY);
    });
    overlay.addEventListener("pointerleave", hideHover);
    overlay.addEventListener("focus", function () {
      focusIdx = n - 1;
      showIndex(focusIdx);
    });
    overlay.addEventListener("blur", function () { focusIdx = -1; hideHover(); });
    overlay.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft" || ev.key === "ArrowRight") {
        ev.preventDefault();
        if (focusIdx < 0) focusIdx = n - 1;
        focusIdx += ev.key === "ArrowRight" ? 1 : -1;
        focusIdx = Math.max(0, Math.min(n - 1, focusIdx));
        showIndex(focusIdx);
      } else if (ev.key === "Escape") {
        hideHover();
      }
    });
  }

  /* ============================================================
     Viz.bars — grouped / single-series / horizontal bars
     opts: { labels:[...], series:[{name,color,colors?,values}],
             format?, horizontal?, height?, deltas?:[str] }
     Single series → direct label on every bar, no legend.
     Per-datum colors (series[0].colors) allowed when each bar IS
     its own identity (service lines).
     ============================================================ */

  function bars(el, opts) {
    clear(el);
    var tone = furniture(el);
    var labels = opts.labels || [];
    var series = (opts.series || []).map(function (s) {
      return {
        name: s.name || "",
        color: resolveColor(s.color, el),
        colors: (s.colors || null) && s.colors.map(function (c) { return resolveColor(c, el); }),
        values: s.values || []
      };
    });
    var fmt = opts.format || defaultFormat;
    var n = labels.length;
    var k = series.length;
    if (!n || !k) return;
    var single = (k === 1);

    if (!single) legend(el, series, "rect");

    var ext = extent(series.map(function (s) { return s.values; }));
    var lo = Math.min(0, ext[0]);
    var hi = Math.max(0, ext[1]);
    var headroom = (hi - lo) * (single ? 0.16 : 0.08) || 1;
    hi += headroom;
    if (lo < 0) lo -= (hi - lo) * 0.06;

    var ariaLabel = opts.ariaLabel || ("Bar chart of " +
      (single ? (series[0].name || "values") : series.map(function (s) { return s.name; }).join(", ")) +
      " by " + (opts.horizontal ? "category" : "period") + ".");

    if (opts.horizontal) {
      barsHorizontal(el, tone, labels, series, fmt, lo, hi, opts, ariaLabel);
      return;
    }

    var W = opts.width || 720;
    var H = opts.height || 300;
    var ticks = niceTicks(lo, hi, 5);
    var yLabelW = 0;
    ticks.forEach(function (t) { yLabelW = Math.max(yLabelW, estWidth(fmt(t), 11)); });
    var pad = { t: single ? 22 : 12, r: 8, b: 32, l: Math.ceil(yLabelW) + 12 };
    var plotW = W - pad.l - pad.r;
    var plotH = H - pad.t - pad.b;
    var svg = makeSvg(el, W, H, ariaLabel, tone);

    function Y(v) { return pad.t + plotH - ((v - lo) / (hi - lo)) * plotH; }
    var zeroY = Y(0);

    /* grid + y labels */
    ticks.forEach(function (tv) {
      if (Math.abs(Y(tv) - zeroY) < 0.5) return; /* baseline drawn separately */
      svgEl("line", {
        x1: pad.l, x2: pad.l + plotW, y1: Y(tv), y2: Y(tv),
        stroke: tone.hairline, "stroke-width": 1
      }, svg);
      text(svg, pad.l - 7, Y(tv) + 3.5, fmt(tv), { anchor: "end", size: 11, fill: tone.ink3 });
    });
    svgEl("line", {
      x1: pad.l, x2: pad.l + plotW, y1: zeroY, y2: zeroY,
      stroke: tone.baseline, "stroke-width": 1
    }, svg);
    text(svg, pad.l - 7, zeroY + 3.5, fmt(0), { anchor: "end", size: 11, fill: tone.ink3 });

    var band = plotW / n;
    var gap = 2; /* surface gap between bars in a group */
    var barW = Math.min(40, (band * 0.72 - gap * (k - 1)) / k);
    if (barW < 3) barW = 3;
    var groupW = barW * k + gap * (k - 1);

    /* category labels — width-aware: show all when they fit the band */
    var maxLabW = 0;
    labels.forEach(function (l) { maxLabW = Math.max(maxLabW, estWidth(l, 10.5) * 0.88); });
    var catIdx;
    if (band >= maxLabW + 6) {
      catIdx = labels.map(function (_, i) { return i; });
    } else {
      catIdx = xLabelIndices(n, plotW);
    }
    catIdx.forEach(function (i) {
      text(svg, pad.l + band * i + band / 2, pad.t + plotH + 19, labels[i],
        { anchor: "middle", size: 11, fill: tone.ink3 });
    });

    labels.forEach(function (lab, i) {
      series.forEach(function (s, si) {
        var v = s.values[i];
        if (v === null || v === undefined || isNaN(v)) return;
        var x = pad.l + band * i + (band - groupW) / 2 + si * (barW + gap);
        var y0 = zeroY, y1 = Y(v);
        var top = Math.min(y0, y1), hgt = Math.max(1, Math.abs(y1 - y0));
        var fill = s.colors ? (s.colors[i % s.colors.length]) : s.color;
        var r = Math.min(4, barW / 2, hgt);
        /* rounded at the VALUE end only, square at the baseline */
        var up = v >= 0;
        var d;
        if (up) {
          d = "M " + x + " " + (top + hgt) +
              " L " + x + " " + (top + r) +
              " Q " + x + " " + top + " " + (x + r) + " " + top +
              " L " + (x + barW - r) + " " + top +
              " Q " + (x + barW) + " " + top + " " + (x + barW) + " " + (top + r) +
              " L " + (x + barW) + " " + (top + hgt) + " Z";
        } else {
          d = "M " + x + " " + top +
              " L " + x + " " + (top + hgt - r) +
              " Q " + x + " " + (top + hgt) + " " + (x + r) + " " + (top + hgt) +
              " L " + (x + barW - r) + " " + (top + hgt) +
              " Q " + (x + barW) + " " + (top + hgt) + " " + (x + barW) + " " + (top + hgt - r) +
              " L " + (x + barW) + " " + top + " Z";
        }
        var bar = svgEl("path", { d: d, fill: fill, tabindex: 0 }, svg);
        bar.setAttribute("aria-label",
          lab + (s.name ? ", " + s.name : "") + ": " + fmt(v));
        bar.classList.add("viz-bar");

        /* direct labels only when single series */
        if (single) {
          text(svg, x + barW / 2, up ? top - 6 : top + hgt + 13, fmt(v),
            { anchor: "middle", size: 11, weight: 600, fill: tone.ink });
          if (opts.deltas && opts.deltas[i] !== undefined && opts.deltas[i] !== null) {
            var dv = String(opts.deltas[i]);
            var neg = dv.indexOf("(") !== -1 || dv.indexOf("-") === 0;
            text(svg, x + barW / 2, up ? top - 19 : top + hgt + 26, dv,
              { anchor: "middle", size: 10, weight: 500,
                fill: neg ? tone.adverseText : tone.favourableText });
          }
        }

        attachBarHover(bar, function () {
          return {
            title: lab,
            rows: [{ swatch: fill, swatchType: "rect",
                     name: single ? (series[0].name || "") : s.name, value: fmt(v) }]
          };
        });
      });
    });
  }

  function barsHorizontal(el, tone, labels, series, fmt, lo, hi, opts, ariaLabel) {
    var s = series[0]; /* horizontal is single-series by design here */
    var n = labels.length;
    var W = opts.width || 720;
    var rowH = Math.min(40, Math.max(26, Math.floor(240 / n) + 14));
    var barH = Math.min(24, rowH - 10);
    var labW = 0;
    labels.forEach(function (l) { labW = Math.max(labW, estWidth(l, 12)); });
    labW = Math.min(labW + 14, W * 0.38);
    var valW = 0;
    s.values.forEach(function (v) { valW = Math.max(valW, estWidth(fmt(v), 11)); });
    var pad = { t: 8, r: Math.ceil(valW) + 44, b: 8, l: Math.ceil(labW) };
    var H = opts.height || (pad.t + pad.b + rowH * n);
    var plotW = W - pad.l - pad.r;
    var svg = makeSvg(el, W, H, ariaLabel, tone);

    function X(v) { return pad.l + ((v - lo) / (hi - lo)) * plotW; }
    var zeroX = X(0);

    svgEl("line", {
      x1: zeroX, x2: zeroX, y1: pad.t, y2: H - pad.b,
      stroke: tone.baseline, "stroke-width": 1
    }, svg);

    labels.forEach(function (lab, i) {
      var v = s.values[i];
      if (v === null || v === undefined || isNaN(v)) return;
      var y = pad.t + rowH * i + (rowH - barH) / 2;
      var x1 = X(v);
      var left = Math.min(zeroX, x1), wdt = Math.max(1.5, Math.abs(x1 - zeroX));
      var fill = s.colors ? s.colors[i % s.colors.length] : s.color;
      var r = Math.min(4, barH / 2, wdt);
      var pos = v >= 0;
      var d;
      if (pos) {
        d = "M " + left + " " + y +
            " L " + (left + wdt - r) + " " + y +
            " Q " + (left + wdt) + " " + y + " " + (left + wdt) + " " + (y + r) +
            " L " + (left + wdt) + " " + (y + barH - r) +
            " Q " + (left + wdt) + " " + (y + barH) + " " + (left + wdt - r) + " " + (y + barH) +
            " L " + left + " " + (y + barH) + " Z";
      } else {
        d = "M " + (left + wdt) + " " + y +
            " L " + (left + r) + " " + y +
            " Q " + left + " " + y + " " + left + " " + (y + r) +
            " L " + left + " " + (y + barH - r) +
            " Q " + left + " " + (y + barH) + " " + (left + r) + " " + (y + barH) +
            " L " + (left + wdt) + " " + (y + barH) + " Z";
      }
      var bar = svgEl("path", { d: d, fill: fill, tabindex: 0 }, svg);
      bar.classList.add("viz-bar");
      bar.setAttribute("aria-label", lab + ": " + fmt(v));

      text(svg, pad.l - 10, y + barH / 2 + 4, lab,
        { anchor: "end", size: 12, fill: tone.ink2 });
      text(svg, (pos ? left + wdt : left) + (pos ? 8 : -8), y + barH / 2 + 4, fmt(v),
        { anchor: pos ? "start" : "end", size: 11, weight: 600, fill: tone.ink });
      if (opts.deltas && opts.deltas[i] !== undefined && opts.deltas[i] !== null) {
        var dv = String(opts.deltas[i]);
        var neg = dv.indexOf("(") !== -1 || dv.indexOf("-") === 0;
        text(svg, W - 2, y + barH / 2 + 4, dv,
          { anchor: "end", size: 10.5, weight: 500,
            fill: neg ? tone.adverseText : tone.favourableText });
      }

      attachBarHover(bar, function () {
        return { title: lab,
          rows: [{ swatch: fill, swatchType: "rect", name: s.name || "", value: fmt(v) }] };
      });
    });
  }

  /* Hover + keyboard focus for a single mark. */
  function attachBarHover(mark, getData) {
    mark.addEventListener("pointermove", function (ev) {
      var d = getData();
      tipContent(d.title, d.rows);
      tipShow(ev.clientX, ev.clientY);
      mark.style.opacity = "0.82";
    });
    mark.addEventListener("pointerleave", function () {
      tipHide();
      mark.style.opacity = "";
    });
    mark.addEventListener("focus", function () {
      var d = getData();
      tipContent(d.title, d.rows);
      tipShowAt(mark);
      mark.style.opacity = "0.82";
    });
    mark.addEventListener("blur", function () {
      tipHide();
      mark.style.opacity = "";
    });
    mark.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") tipHide();
    });
    mark.style.cursor = "default";
    mark.style.outline = "none";
    mark.style.transition = "opacity 120ms ease";
  }

  /* ============================================================
     Viz.bridge — EBITDA waterfall
     opts: { start:{label,value}, steps:[{label,value,side,explain?}],
             end:{label,value}, format?, height? }
     Returns { play(opts), reset() } — sequential reveal, instant
     under prefers-reduced-motion. Renders complete by default.
     ============================================================ */

  function bridge(el, opts) {
    clear(el);
    var tone = furniture(el);
    var fmt = opts.format || defaultFormat;
    var start = opts.start, end = opts.end, steps = opts.steps || [];

    /* cumulative levels */
    var cums = [start.value];
    steps.forEach(function (s) { cums.push(cums[cums.length - 1] + s.value); });
    var cats = [{ kind: "total", label: start.label, value: start.value, from: 0, to: start.value }];
    steps.forEach(function (s, i) {
      cats.push({ kind: "step", label: s.label, value: s.value,
        side: s.side || (s.value >= 0 ? "favourable" : "adverse"),
        explain: s.explain, from: cums[i], to: cums[i + 1] });
    });
    cats.push({ kind: "total", label: end.label, value: end.value, from: 0, to: end.value });

    var n = cats.length;
    var W = opts.width || 760;
    var H = opts.height || 340;

    /* windowed domain — deltas of ±0.4–1.4 on a 0–45 axis would be
       invisible; y ticks stay labelled so truncation is explicit */
    var levelLo = Infinity, levelHi = -Infinity;
    cums.forEach(function (c) {
      levelLo = Math.min(levelLo, c); levelHi = Math.max(levelHi, c);
    });
    var span = Math.max(levelHi - levelLo, 0.5);
    var lo = levelLo - span * 0.9;
    var hi = levelHi + span * 0.35;
    var ticks = niceTicks(lo, hi, 4);

    var yLabelW = 0;
    ticks.forEach(function (t) { yLabelW = Math.max(yLabelW, estWidth(fmt(t), 11)); });
    var pad = { t: 26, r: 10, b: 52, l: Math.ceil(yLabelW) + 12 };
    var plotW = W - pad.l - pad.r;
    var plotH = H - pad.t - pad.b;

    var ariaLabel = opts.ariaLabel || ("Waterfall bridge from " + start.label + " " +
      fmt(start.value) + " to " + end.label + " " + fmt(end.value) + " across " +
      steps.length + " variances.");
    var svg = makeSvg(el, W, H, ariaLabel, tone);

    function Y(v) { return pad.t + plotH - ((v - lo) / (hi - lo)) * plotH; }

    ticks.forEach(function (tv) {
      svgEl("line", {
        x1: pad.l, x2: pad.l + plotW, y1: Y(tv), y2: Y(tv),
        stroke: tone.hairline, "stroke-width": 1
      }, svg);
      text(svg, pad.l - 7, Y(tv) + 3.5, fmt(tv), { anchor: "end", size: 11, fill: tone.ink3 });
    });
    svgEl("line", {
      x1: pad.l, x2: pad.l + plotW, y1: pad.t + plotH, y2: pad.t + plotH,
      stroke: tone.baseline, "stroke-width": 1
    }, svg);

    var band = plotW / n;
    var barW = Math.min(40, band * 0.62);
    function cx(i) { return pad.l + band * i + band / 2; }

    var groups = []; /* animatable groups: steps then end */

    cats.forEach(function (c, i) {
      var g = svgEl("g", null, svg);
      var isTotal = c.kind === "total";
      var fill = isTotal ? tone.neutralBar
        : (c.side === "favourable" ? tone.favourable : tone.adverse);
      var yTop, yBot;
      if (isTotal) { yTop = Y(c.to); yBot = pad.t + plotH; }
      else { yTop = Y(Math.max(c.from, c.to)); yBot = Y(Math.min(c.from, c.to)); }
      var hgt = Math.max(2, yBot - yTop);
      var x = cx(i) - barW / 2;
      var r = Math.min(4, barW / 2, hgt);

      /* value end rounded: totals + favourable → top; adverse → bottom */
      var roundTop = isTotal || c.side === "favourable";
      var d;
      if (roundTop) {
        d = "M " + x + " " + yBot +
            " L " + x + " " + (yTop + r) +
            " Q " + x + " " + yTop + " " + (x + r) + " " + yTop +
            " L " + (x + barW - r) + " " + yTop +
            " Q " + (x + barW) + " " + yTop + " " + (x + barW) + " " + (yTop + r) +
            " L " + (x + barW) + " " + yBot + " Z";
      } else {
        d = "M " + x + " " + yTop +
            " L " + x + " " + (yBot - r) +
            " Q " + x + " " + yBot + " " + (x + r) + " " + yBot +
            " L " + (x + barW - r) + " " + yBot +
            " Q " + (x + barW) + " " + yBot + " " + (x + barW) + " " + (yBot - r) +
            " L " + (x + barW) + " " + yTop + " Z";
      }
      var bar = svgEl("path", { d: d, fill: fill, tabindex: 0 }, g);
      bar.classList.add("viz-bar");

      /* value label: totals absolute; steps signed, negatives in
         parentheses AND colour (never colour alone) */
      var valStr, valFill, valY;
      if (isTotal) {
        valStr = fmt(c.value); valFill = tone.ink; valY = yTop - 7;
      } else if (c.side === "favourable") {
        valStr = "+" + fmt(Math.abs(c.value)); valFill = tone.favourableText; valY = yTop - 7;
      } else {
        valStr = "(" + fmt(Math.abs(c.value)) + ")"; valFill = tone.adverseText; valY = yBot + 15;
      }
      text(g, cx(i), valY, valStr,
        { anchor: "middle", size: 11, weight: 600, fill: valFill });
      bar.setAttribute("aria-label", c.label + ": " +
        (isTotal ? fmt(c.value)
          : (c.side === "favourable" ? "favourable +" : "adverse minus ") + fmt(Math.abs(c.value))));

      /* connector to next bar (travels with this group) */
      if (i < n - 1) {
        var lvl = Y(c.to);
        svgEl("line", {
          x1: x + barW, x2: cx(i + 1) - barW / 2, y1: lvl, y2: lvl,
          stroke: tone.baseline, "stroke-width": 1
        }, g);
      }

      /* category label, word-wrapped, max 3 lines */
      var words = String(c.label).split(/\s+/);
      var lines = [], cur = "";
      words.forEach(function (w) {
        if ((cur + " " + w).trim().length > 13 && cur) { lines.push(cur); cur = w; }
        else cur = (cur + " " + w).trim();
      });
      if (cur) lines.push(cur);
      lines = lines.slice(0, 3);
      lines.forEach(function (ln, li) {
        text(g, cx(i), pad.t + plotH + 16 + li * 12, ln,
          { anchor: "middle", size: 10.5, fill: isTotal ? tone.ink2 : tone.ink3,
            weight: isTotal ? 600 : 400 });
      });

      attachBarHover(bar, function () {
        var rows = [{ swatch: fill, swatchType: "rect",
          name: isTotal ? "Level" : (c.side === "favourable" ? "Favourable" : "Adverse"),
          value: valStr }];
        if (c.explain) rows.push({ name: c.explain, muted: true });
        return { title: c.label, rows: rows };
      });

      if (!isTotal || i === n - 1) groups.push({ g: g, cat: c, stepIndex: isTotal ? -1 : i - 1 });
    });

    /* ---- sequential reveal ---- */
    var timers = [];
    function clearTimers() {
      timers.forEach(function (t) { clearTimeout(t); });
      timers = [];
    }
    function setHidden(hidden) {
      groups.forEach(function (o) {
        o.g.style.transition = hidden ? "none" : "";
        o.g.style.opacity = hidden ? "0" : "";
        o.g.style.transform = hidden ? "translateY(6px)" : "";
      });
    }

    var handle = {
      el: el,
      play: function (p) {
        p = p || {};
        var stepMs = p.stepMs || 650;
        var onStep = p.onStep || function () {};
        var onDone = p.onDone || function () {};
        clearTimers();
        if (prefersReduced()) {
          setHidden(false);
          groups.forEach(function (o) {
            if (o.stepIndex >= 0) onStep(o.stepIndex, steps[o.stepIndex]);
          });
          onDone();
          return handle;
        }
        setHidden(true);
        /* force style flush so the reveal transitions run */
        void el.offsetWidth; // eslint-disable-line no-void
        groups.forEach(function (o, gi) {
          timers.push(setTimeout(function () {
            o.g.style.transition = "opacity 380ms ease, transform 380ms ease";
            o.g.style.opacity = "1";
            o.g.style.transform = "translateY(0)";
            if (o.stepIndex >= 0) onStep(o.stepIndex, steps[o.stepIndex]);
            if (gi === groups.length - 1) {
              timers.push(setTimeout(onDone, 420));
            }
          }, 140 + gi * stepMs));
        });
        return handle;
      },
      reset: function () {
        clearTimers();
        setHidden(false);
        return handle;
      }
    };
    return handle;
  }

  /* ============================================================
     Viz.spark — 90×28 sparkline, no axes, endpoint dot
     ============================================================ */

  function spark(el, values, opts) {
    clear(el);
    opts = opts || {};
    var tone = furniture(el);
    var color = resolveColor(opts.color || "--ink-3", el);
    var W = 90, H = 28, p = 3;
    var vals = (values || []).filter(function (v) {
      return v !== null && v !== undefined && !isNaN(v);
    });
    if (vals.length < 2) return;
    var svg = svgEl("svg", {
      viewBox: "0 0 " + W + " " + H,
      width: W, height: H, role: "img",
      "aria-label": opts.ariaLabel || ("Trend over " + vals.length + " periods, latest " + vals[vals.length - 1])
    });
    svg.style.display = "block";
    svg.style.overflow = "visible";
    el.appendChild(svg);
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    if (lo === hi) { lo -= 1; hi += 1; }
    function X(i) { return p + (i / (vals.length - 1)) * (W - p * 2 - 3); }
    function Y(v) { return p + (1 - (v - lo) / (hi - lo)) * (H - p * 2); }
    var d = "";
    vals.forEach(function (v, i) {
      d += (d ? " L " : "M ") + X(i).toFixed(1) + " " + Y(v).toFixed(1);
    });
    svgEl("path", {
      d: d, fill: "none", stroke: color, "stroke-width": 1.75,
      "stroke-linejoin": "round", "stroke-linecap": "round"
    }, svg);
    svgEl("circle", {
      cx: X(vals.length - 1), cy: Y(vals[vals.length - 1]), r: 2.6,
      fill: color, stroke: tone.raise, "stroke-width": 1.5
    }, svg);
  }

  /* ============================================================
     Viz.timeline — before/after reporting cycle
     opts: { tracks:[{name, segments:[{day,label,kind}]}], maxDay? }
     kind: "locked" (hatched neutral — the untouched close),
           "manual", "ai"
     ============================================================ */

  var patternSeq = 0;

  function timeline(el, opts) {
    clear(el);
    var tone = furniture(el);
    var tracks = opts.tracks || [];
    if (!tracks.length) return;

    /* parse "WD+1..8" / "WD+9-10" / "WD+8" → [from, to] inclusive */
    function parseDays(s) {
      var nums = String(s).match(/\d+/g) || ["1"];
      var a = parseInt(nums[0], 10);
      var b = nums.length > 1 ? parseInt(nums[1], 10) : a;
      return [Math.min(a, b), Math.max(a, b)];
    }

    var maxDay = opts.maxDay || 0;
    tracks.forEach(function (tr) {
      tr.segments.forEach(function (sg) {
        maxDay = Math.max(maxDay, parseDays(sg.day)[1]);
      });
    });
    maxDay = Math.max(maxDay, 8);

    var W = opts.width || 760;
    var nameW = 0;
    tracks.forEach(function (tr) { nameW = Math.max(nameW, estWidth(tr.name, 12)); });
    var pad = { t: 8, r: 12, b: 26, l: Math.ceil(nameW) + 18 };
    var rowH = 46, blockH = 30;
    var H = pad.t + pad.b + rowH * tracks.length;
    var plotW = W - pad.l - pad.r;

    var svg = makeSvg(el, W, H,
      opts.ariaLabel || "Reporting timeline in working days, comparing " +
        tracks.map(function (t) { return t.name; }).join(" and ") + ".",
      tone);

    /* hatch pattern for the locked close — regenerated per render so
       colours track the current theme */
    patternSeq += 1;
    var patId = "viz-hatch-" + patternSeq;
    var defs = svgEl("defs", null, svg);
    var pat = svgEl("pattern", {
      id: patId, width: 7, height: 7, patternUnits: "userSpaceOnUse",
      patternTransform: "rotate(45)"
    }, defs);
    svgEl("rect", { width: 7, height: 7, fill: tone.recess }, pat);
    svgEl("line", { x1: 0, y1: 0, x2: 0, y2: 7, stroke: tone.baseline, "stroke-width": 1.4 }, pat);

    function X(day) { return pad.l + ((day - 1) / maxDay) * plotW; }

    /* day axis */
    for (var dday = 1; dday <= maxDay + 1; dday++) {
      var xx = X(dday);
      svgEl("line", {
        x1: xx, x2: xx, y1: pad.t, y2: pad.t + rowH * tracks.length,
        stroke: tone.hairline, "stroke-width": 1
      }, svg);
      if (dday <= maxDay) {
        text(svg, xx + (X(dday + 1) - xx) / 2, H - 8, "WD+" + dday,
          { anchor: "middle", size: 10, fill: tone.ink3 });
      }
    }

    tracks.forEach(function (tr, ti) {
      var yMid = pad.t + rowH * ti + rowH / 2;
      text(svg, pad.l - 12, yMid + 4, tr.name,
        { anchor: "end", size: 12, weight: 600, fill: tone.ink2 });

      tr.segments.forEach(function (sg) {
        var dd = parseDays(sg.day);
        var x0 = X(dd[0]), x1 = X(dd[1] + 1);
        var y = yMid - blockH / 2;
        var wdt = Math.max(4, x1 - x0 - 2); /* 2px surface gap between blocks */
        var kind = sg.kind || "manual";
        var fill, strokeC, txtFill;
        if (kind === "locked") { fill = "url(#" + patId + ")"; strokeC = tone.baseline; txtFill = tone.ink2; }
        else if (kind === "ai") { fill = tone.accentWash; strokeC = tone.accent; txtFill = tone.accentInk; }
        else { fill = tone.recess; strokeC = tone.hairline; txtFill = tone.ink2; }

        var block = svgEl("rect", {
          x: x0 + 1, y: y, width: wdt, height: blockH, rx: 4,
          fill: fill, stroke: strokeC, "stroke-width": 1, tabindex: 0
        }, svg);
        block.classList.add("viz-bar");
        var full = sg.day + " — " + sg.label +
          (kind === "locked" ? " (untouched)" : kind === "ai" ? " (AI-assisted)" : "");
        block.setAttribute("aria-label", tr.name + ": " + full);

        /* inline label only when it fits comfortably */
        var labelStr = sg.label;
        if (estWidth(labelStr, 10.5) < wdt - 14) {
          text(svg, x0 + 1 + wdt / 2, yMid + 3.5, labelStr,
            { anchor: "middle", size: 10.5, weight: 500, fill: txtFill, tabular: false });
        } else {
          /* shortened day tag so the block is never mute */
          var short = sg.day;
          if (estWidth(short, 10) < wdt - 8) {
            text(svg, x0 + 1 + wdt / 2, yMid + 3.5, short,
              { anchor: "middle", size: 10, weight: 500, fill: txtFill, tabular: false });
          }
        }

        attachBarHover(block, function () {
          return { title: tr.name + " · " + sg.day,
            rows: [{ name: sg.label +
              (kind === "locked" ? " — untouched" : kind === "ai" ? " — AI-assisted" : "") }] };
        });
      });
    });
  }

  /* ============================================================
     Viz.typewriter — AI output only
     content: string | Node | Node[] | DocumentFragment
     opts: { cps:55, skippable:true, caret:true }
     Returns { done:Promise, skip(), cancel() }
     Instant under prefers-reduced-motion; click to complete.
     ============================================================ */

  function typewriter(el, content, opts) {
    opts = opts || {};
    var cps = opts.cps || 55;
    var skippable = opts.skippable !== false;
    var useCaret = opts.caret !== false;

    /* Build the final DOM inside el, then hollow out its text nodes
       and refill them character by character. */
    while (el.firstChild) el.removeChild(el.firstChild);
    if (typeof content === "string") {
      el.appendChild(document.createTextNode(content));
    } else if (content && typeof content.length === "number" && !content.nodeType) {
      Array.prototype.forEach.call(content, function (nd) { el.appendChild(nd); });
    } else if (content && content.nodeType) {
      el.appendChild(content);
    }

    var textNodes = [];
    (function walk(node) {
      if (node.nodeType === 3) { textNodes.push({ node: node, full: node.nodeValue }); return; }
      var kids = node.childNodes;
      for (var i = 0; i < kids.length; i++) walk(kids[i]);
    })(el);

    var finished = false;
    var rafId = null;
    var resolveDone;
    var done = new Promise(function (res) { resolveDone = res; });

    var caret = null;
    if (useCaret) {
      caret = document.createElement("span");
      caret.className = "tw-caret";
      caret.setAttribute("aria-hidden", "true");
    }

    function finish() {
      if (finished) return;
      finished = true;
      if (rafId) cancelAnimationFrame(rafId);
      textNodes.forEach(function (tn) { tn.node.nodeValue = tn.full; });
      if (caret && caret.parentNode) caret.parentNode.removeChild(caret);
      if (skippable) el.removeEventListener("click", finish);
      resolveDone();
    }

    if (prefersReduced() || !textNodes.length) {
      finished = true;
      resolveDone();
      return { done: done, skip: function () {}, cancel: function () {} };
    }

    /* hollow out */
    textNodes.forEach(function (tn) { tn.node.nodeValue = ""; });

    if (skippable) {
      el.addEventListener("click", finish);
      el.style.cursor = "text";
    }

    var ni = 0, ci = 0;
    var last = null;
    function tick(ts) {
      if (finished) return;
      if (last === null) last = ts;
      var chars = Math.max(1, Math.round(((ts - last) / 1000) * cps));
      last = ts;
      while (chars-- > 0 && ni < textNodes.length) {
        var tn = textNodes[ni];
        ci += 1;
        tn.node.nodeValue = tn.full.slice(0, ci);
        if (caret) {
          var host = tn.node.parentNode;
          if (host && caret.parentNode !== host) host.appendChild(caret);
          else if (host && host.lastChild !== caret) host.appendChild(caret);
        }
        if (ci >= tn.full.length) { ni += 1; ci = 0; }
      }
      if (ni >= textNodes.length) { finish(); return; }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return {
      done: done,
      skip: finish,
      cancel: function () {
        finished = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (caret && caret.parentNode) caret.parentNode.removeChild(caret);
        if (skippable) el.removeEventListener("click", finish);
        resolveDone();
      }
    };
  }

  /* ---------- public API ---------- */

  window.Viz = {
    line: line,
    bars: bars,
    bridge: bridge,
    spark: spark,
    timeline: timeline,
    typewriter: typewriter,
    /* small utilities other page scripts may share */
    color: function (name, scopeEl) { return resolveColor(name, scopeEl); },
    prefersReducedMotion: prefersReduced
  };
})();
