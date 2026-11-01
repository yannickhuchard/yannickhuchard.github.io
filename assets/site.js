// Language switch, copy button and the rotating project graph in the hero.
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---- language -------------------------------------------------------------
  function setLang(lang, save) {
    root.setAttribute("data-lang", lang);
    root.setAttribute("lang", lang);
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === lang));
    });
    if (save) { try { localStorage.setItem("yh-lang", lang); } catch (e) {} }
  }
  var asked = new URLSearchParams(location.search).get("lang");
  var saved = null;
  try { saved = localStorage.getItem("yh-lang"); } catch (e) {}
  var browser = (navigator.language || "fr").slice(0, 2) === "fr" ? "fr" : "en";
  setLang(asked === "en" || asked === "fr" ? asked : saved || browser, false);
  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-set-lang"), true); });
  });

  // ---- copy -----------------------------------------------------------------
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = document.querySelector(b.getAttribute("data-copy")).textContent;
      var done = function () {
        b.classList.add("done");
        setTimeout(function () { b.classList.remove("done"); }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () {});
    });
  });

  // ---- header border once scrolled -----------------------------------------
  var top = document.querySelector(".top");
  function onScroll() { top.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- hero graph -----------------------------------------------------------
  // Points on a sphere joined to their nearest neighbours. Six of them are the
  // projects; hovering a project card lights its hub.
  var svg = document.getElementById("graph");
  if (!svg) return;
  var NS = "http://www.w3.org/2000/svg";
  var R = 210, N = 54;
  var hubs = { em: "Morphogenesis", air: "AIR", awa: "AWA", mesh: "MellowMesh", sid: "Semantic ID", safe: "Safe AI" };
  var hubKeys = Object.keys(hubs);
  var pts = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
  }
  // Spread the hubs over the sphere.
  var hubIndex = {};
  hubKeys.forEach(function (k, j) { hubIndex[k] = Math.round(4 + j * (N - 8) / (hubKeys.length - 1)); });

  var edges = [], seen = {};
  pts.forEach(function (p, a) {
    var near = pts.map(function (q, b) {
      var dx = p.x - q.x, dy = p.y - q.y, dz = p.z - q.z;
      return { b: b, d: dx * dx + dy * dy + dz * dz };
    }).sort(function (u, v) { return u.d - v.d; }).slice(1, 4);
    near.forEach(function (n) {
      var key = Math.min(a, n.b) + "-" + Math.max(a, n.b);
      if (!seen[key]) { seen[key] = 1; edges.push([a, n.b]); }
    });
  });
  // The white paper connects to every project: the theory behind the tools.
  hubKeys.slice(1).forEach(function (k) { edges.push([hubIndex.em, hubIndex[k], true]); });

  var gLines = document.createElementNS(NS, "g"), gDots = document.createElementNS(NS, "g");
  svg.appendChild(gLines); svg.appendChild(gDots);
  var lineEls = edges.map(function () { var l = document.createElementNS(NS, "line"); gLines.appendChild(l); return l; });
  var hubOf = {};
  hubKeys.forEach(function (k) { hubOf[hubIndex[k]] = k; });
  var dotEls = pts.map(function (p, i) {
    var g = document.createElementNS(NS, "g");
    var c = document.createElementNS(NS, "circle");
    g.appendChild(c);
    if (hubOf[i]) {
      g.setAttribute("class", "hub");
      var ring = document.createElementNS(NS, "circle");
      ring.setAttribute("class", "ring");
      g.appendChild(ring);
      var t = document.createElementNS(NS, "text");
      t.textContent = hubs[hubOf[i]];
      g.appendChild(t);
    }
    gDots.appendChild(g);
    return g;
  });

  var active = null, angle = 0.6, tiltX = -0.32, tiltY = 0, aimX = -0.32, aimY = 0, last = 0;
  document.querySelectorAll("[data-node]").forEach(function (card) {
    card.addEventListener("mouseenter", function () { active = card.getAttribute("data-node"); if (reduce.matches) draw(); });
    card.addEventListener("mouseleave", function () { active = null; if (reduce.matches) draw(); });
  });
  var feature = document.getElementById("morphogenesis");
  feature.addEventListener("mouseenter", function () { active = "em"; });
  feature.addEventListener("mouseleave", function () { active = null; });
  var wrap = svg.parentNode;
  wrap.addEventListener("pointermove", function (e) {
    var b = wrap.getBoundingClientRect();
    aimY = ((e.clientX - b.left) / b.width - 0.5) * 0.8;
    aimX = -0.32 + ((e.clientY - b.top) / b.height - 0.5) * 0.6;
  });
  wrap.addEventListener("pointerleave", function () { aimX = -0.32; aimY = 0; });

  function project(p) {
    var a = angle + tiltY;
    var x = p.x * Math.cos(a) - p.z * Math.sin(a);
    var z = p.x * Math.sin(a) + p.z * Math.cos(a);
    var y = p.y * Math.cos(tiltX) - z * Math.sin(tiltX);
    z = p.y * Math.sin(tiltX) + z * Math.cos(tiltX);
    var s = 520 / (520 - z * R);
    return { x: x * R * s, y: y * R * s, z: z, s: s };
  }

  function draw() {
    var P = pts.map(project);
    var activeIndex = active ? hubIndex[active] : -1;
    edges.forEach(function (e, k) {
      var a = P[e[0]], b = P[e[1]], l = lineEls[k];
      var depth = (a.z + b.z + 2) / 4;
      var lit = activeIndex >= 0 && (e[0] === activeIndex || e[1] === activeIndex);
      l.setAttribute("x1", a.x.toFixed(1)); l.setAttribute("y1", a.y.toFixed(1));
      l.setAttribute("x2", b.x.toFixed(1)); l.setAttribute("y2", b.y.toFixed(1));
      l.setAttribute("stroke-opacity", (lit ? 0.9 : (e[2] ? 0.08 + depth * 0.35 : 0.05 + depth * 0.3)).toFixed(2));
      l.setAttribute("stroke-width", lit ? 1.8 : (e[2] ? 1.2 : 0.8));
      l.setAttribute("stroke-dasharray", e[2] && !lit ? "3 5" : "none");
    });
    var order = P.map(function (p, i) { return i; }).sort(function (a, b) { return P[a].z - P[b].z; });
    order.forEach(function (i) {
      var p = P[i], g = dotEls[i], depth = (p.z + 1) / 2, key = hubOf[i];
      gDots.appendChild(g);
      g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
      g.setAttribute("opacity", (0.25 + depth * 0.75).toFixed(2));
      var c = g.firstChild;
      if (key) {
        var on = key === active;
        g.setAttribute("class", "hub" + (on ? " on" : ""));
        c.setAttribute("r", ((on ? 7 : 5) * p.s).toFixed(1));
        g.childNodes[1].setAttribute("r", ((on ? 16 : 11) * p.s).toFixed(1));
        var t = g.childNodes[2];
        t.setAttribute("x", p.x >= 0 ? 20 : -20);
        t.setAttribute("y", 4);
        t.setAttribute("text-anchor", p.x >= 0 ? "start" : "end");
        t.setAttribute("opacity", on || (!active && depth > 0.55) ? 1 : 0);
        if (on) g.setAttribute("opacity", 1);
      } else {
        c.setAttribute("r", (2.2 * p.s).toFixed(1));
      }
    });
  }

  function tick(now) {
    var dt = Math.min(now - last, 50); last = now;
    angle += dt * (active ? 0.00005 : 0.00016);
    tiltX += (aimX - tiltX) * 0.05;
    tiltY += (aimY - tiltY) * 0.05;
    draw();
    if (!reduce.matches) requestAnimationFrame(tick);
  }
  draw();
  if (!reduce.matches) requestAnimationFrame(function (now) { last = now; tick(now); });
})();
