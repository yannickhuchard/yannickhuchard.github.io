// The animated menu: each entry grows a black-and-white point cloud into its own form.
import * as THREE from "./vendor/three.module.min.js";

const ITEMS = [
  { shape: "organic",
    fr: { tag: "White paper · 2026", desc: "Comment la stratégie devient une forme cible, et comment l’entreprise la garde viable quand tout change.", cta: "Découvrir en 3 minutes" },
    en: { tag: "White paper · 2026", desc: "How strategy becomes a target form, and how the enterprise keeps it viable as everything changes.", cta: "Discover it in 3 minutes" } },
  { shape: "layers",
    fr: { tag: "Architecture · Python", desc: "Transformer une idée métier en architecture que l’on peut comprendre, vérifier et construire, avec votre assistant IA.", cta: "Voir AIR" },
    en: { tag: "Architecture · Python", desc: "Turn a business idea into an architecture people can understand, check and build, with your AI assistant.", cta: "See AIR" } },
  { shape: "knot",
    fr: { tag: "Workflows agentiques", desc: "Des processus où agents IA, humains, robots et systèmes travaillent ensemble, et où chaque étape reste observable.", cta: "Voir AWA" },
    en: { tag: "Agentic workflows", desc: "Processes where AI agents, humans, robots and systems work together, with every step observable.", cta: "See AWA" } },
  { shape: "wave",
    fr: { tag: "Agents · Rust", desc: "Vos agents se partagent les tâches et demandent votre accord avant toute action sensible. Tout reste sur votre machine.", cta: "Voir MellowMesh" },
    en: { tag: "Agents · Rust", desc: "Your agents share tasks and ask for your approval before anything sensitive. Everything stays on your machine.", cta: "See MellowMesh" } },
  { shape: "cube",
    fr: { tag: "Skill · Décision", desc: "Construire, acheter, louer ou s’associer ? Un modèle de décision multicritère que votre agent applique.", cta: "Voir le skill" },
    en: { tag: "Skill · Decision", desc: "Build, buy, rent or partner? A multi-criteria decision model your agent applies.", cta: "See the skill" } },
  { shape: "helix",
    fr: { tag: "npm · Node.js", desc: "Des identifiants lisibles par l’humain et compris par la machine, cohérents d’un système à l’autre.", cta: "Voir le paquet" },
    en: { tag: "npm · Node.js", desc: "Identifiers people can read and machines understand, consistent across systems.", cta: "See the package" } },
  { shape: "shield",
    fr: { tag: "Guide · IA responsable", desc: "Un cadre ouvert pour adopter l’IA de façon responsable, à adapter et à partager.", cta: "Lire le guide" },
    en: { tag: "Guide · Responsible AI", desc: "An open framework to adopt AI responsibly, to adapt and share.", cta: "Read the guide" } },
  { shape: "book",
    fr: { tag: "App · Lecture", desc: "Vos livres et documents lus à voix haute, avec la voix de votre choix. Tout se passe sur votre téléphone.", cta: "fluencereader.com" },
    en: { tag: "App · Reading", desc: "Your books and documents read aloud, in a voice you choose. Everything happens on your phone.", cta: "fluencereader.com" } },
  { shape: "rings",
    fr: { tag: "App · Écriture", desc: "Exprimer vos idées avec vos mots et votre style, et les publier dès qu’elles vous viennent.", cta: "eloquence.lu" },
    en: { tag: "App · Writing", desc: "Express your ideas in your own words and style, and publish them the moment they come to you.", cta: "eloquence.lu" } },
  { shape: "spiral",
    fr: { tag: "App · Séries", desc: "L’app qui retient où vous en êtes dans vos K-dramas, C-dramas et J-dramas, et l’heure exacte du prochain épisode.", cta: "celinesdramas.com" },
    en: { tag: "App · Series", desc: "The app that remembers where you are in your K-dramas, C-dramas and J-dramas, and when the next episode airs.", cta: "celinesdramas.com" } }
];

const TAU = Math.PI * 2;
const AUTO_MS = 6500;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const $ = (id) => document.getElementById(id);
const items = Array.from(document.querySelectorAll(".item[data-i]"));
const cap = $("cap");

function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ---- menu state -------------------------------------------------------------
let active = 0, run = 0, auto = true, lastSwitch = performance.now();

function lang() { return document.documentElement.getAttribute("data-lang") === "en" ? "en" : "fr"; }

function paint() {
  const it = ITEMS[active], copy = it[lang()], link = items[active];
  items.forEach((el, i) => el.classList.toggle("on", i === active));
  $("ghost").textContent = link.querySelector(".n").textContent;
  $("cap-num").textContent = link.querySelector(".n").textContent;
  $("cap-tag").textContent = copy.tag;
  $("cap-name").textContent = link.querySelector(".t").textContent;
  $("cap-desc").textContent = copy.desc;
  $("cap-cta").textContent = copy.cta;
  $("cap-go").href = link.getAttribute("href");
  cap.className = "cap " + (run % 2 ? "a" : "b") + (auto && !reduce.matches ? " auto" : "");
}

function go(i, fromTimer) {
  auto = fromTimer;
  lastSwitch = performance.now();
  if (i !== active) { active = i; run++; morphTo(ITEMS[i].shape); }
  paint();
}

items.forEach((el, i) => {
  el.addEventListener("mouseenter", () => go(i, false));
  el.addEventListener("focus", () => go(i, false));
});
$("menu").addEventListener("mouseleave", () => { auto = true; lastSwitch = performance.now(); paint(); });
document.addEventListener("yh-lang", paint);
setInterval(() => {
  if (auto && !reduce.matches && !document.hidden && performance.now() - lastSwitch >= AUTO_MS - 50) go((active + 1) % ITEMS.length, true);
}, 250);

// ---- point clouds -------------------------------------------------------------
// Every form has the same number of points so any form can grow into any other.
function buildShape(kind, N) {
  const a = new Float32Array(N * 3), r = rng(kind.length * 7919 + 13);
  const g = Math.ceil(Math.sqrt(N));
  for (let i = 0; i < N; i++) {
    let x = 0, y = 0, z = 0;
    const u = r(), v = r(), w = r();
    if (kind === "organic") {
      const yy = 1 - 2 * (i + .5) / N, rr = Math.sqrt(1 - yy * yy), th = i * 2.399963;
      const px = Math.cos(th) * rr, pz = Math.sin(th) * rr;
      const lobe = 1 + .14 * Math.sin(5 * Math.atan2(pz, px) + yy * 3) * Math.cos(4 * yy) + .07 * Math.sin(9 * yy + 2 * Math.atan2(pz, px));
      const k = 1.5 * lobe; x = px * k; y = yy * k; z = pz * k;
    } else if (kind === "layers") {
      const L = i % 5, lr = 1.75 - L * .2, ang = u * TAU;
      const rad = w < .3 ? lr : (w < .45 ? lr * .55 : Math.sqrt(v) * lr);
      x = Math.cos(ang) * rad; z = Math.sin(ang) * rad; y = -1.3 + L * .65;
    } else if (kind === "knot") {
      const t = u * TAU, rr = .95 + .42 * Math.cos(3 * t);
      const cx = rr * Math.cos(2 * t), cy = .62 * Math.sin(3 * t), cz = rr * Math.sin(2 * t);
      const a2 = v * TAU, tr = .17 * Math.sqrt(w);
      x = cx * 1.15 + Math.cos(a2) * tr; y = cy + Math.sin(a2) * tr; z = cz * 1.15 + Math.cos(a2 + 1.3) * tr;
    } else if (kind === "wave") {
      const gx = (i % g) / g, gz = Math.floor(i / g) / g;
      x = (gx - .5) * 4.2; z = (gz - .5) * 4.2;
      y = .34 * Math.sin(x * 1.8) * Math.cos(z * 1.6) + .16 * Math.sin((x + z) * 2.6);
    } else if (kind === "cube") {
      const f = Math.floor(u * 6), s = 1.2;
      let p = v * 2 - 1, q = w * 2 - 1;
      if (r() < .4) { if (r() < .5) p = Math.sign(p); else q = Math.sign(q); }
      const c = [[s, p * s, q * s], [-s, p * s, q * s], [p * s, s, q * s], [p * s, -s, q * s], [p * s, q * s, s], [p * s, q * s, -s]][f];
      x = c[0]; y = c[1]; z = c[2];
    } else if (kind === "helix") {
      const strand = i % 3;
      if (strand < 2) {
        const ang = u * TAU * 2.2 + (strand ? Math.PI : 0);
        x = Math.cos(ang) * .85 + (v - .5) * .07; z = Math.sin(ang) * .85 + (w - .5) * .07; y = -2 + 4 * u;
      } else {
        const rung = Math.round(u * 44) / 44, a3 = rung * TAU * 2.2, m = v * 2 - 1;
        x = Math.cos(a3) * .85 * m; z = Math.sin(a3) * .85 * m; y = -2 + 4 * rung;
      }
    } else if (kind === "shield") {
      if (i % 5 < 2) {
        const yy = 1 - 2 * u, rr = Math.sqrt(1 - yy * yy), th = v * TAU, k = .55 * Math.cbrt(w);
        x = Math.cos(th) * rr * k; y = yy * k; z = Math.sin(th) * rr * k;
      } else {
        const R = 1.65, ph = u * TAU;
        if (r() < .5) { const m = Math.floor(v * 10) / 10 * Math.PI; x = Math.cos(m) * Math.sin(ph) * R; z = Math.sin(m) * Math.sin(ph) * R; y = Math.cos(ph) * R; }
        else { const lat = (Math.floor(v * 7) + .5) / 7 * Math.PI; y = Math.cos(lat) * R; x = Math.sin(lat) * Math.cos(ph) * R; z = Math.sin(lat) * Math.sin(ph) * R; }
      }
    } else if (kind === "book") {
      const side = i % 2 ? 1 : -1, page = Math.floor(u * 7), lift = page / 6, s = v * 1.75;
      const th = side > 0 ? .12 + lift * .55 : Math.PI - .12 - lift * .55;
      x = Math.cos(th) * s; z = Math.sin(th) * s - .5 + .12 * Math.sin(s * 1.8); y = (w * 2 - 1) * 1.2;
    } else if (kind === "rings") {
      const k = Math.floor(u * 11), rad = .18 + k * .18, ang = v * TAU;
      x = Math.cos(ang) * rad; z = Math.sin(ang) * rad; y = .24 * Math.sin(rad * 5.5) + (w - .5) * .03;
    } else if (kind === "spiral") {
      const arm = i % 3, t = Math.sqrt(u);
      const ang = t * TAU * 1.3 + arm * TAU / 3 + (v - .5) * .7 * (1 - t * .6), rad = .08 + t * 2.1;
      x = Math.cos(ang) * rad; z = Math.sin(ang) * rad; y = (w - .5) * .3 * (1 - t);
    }
    a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
  }
  return a;
}

const VERT = `
attribute vec3 aFrom; attribute vec3 aTo; attribute float aSeed;
uniform float uT; uniform float uTime; uniform float uSize; uniform float uPix; uniform float uScatter;
varying float vA;
vec3 field(vec3 p, float t){
  return vec3(sin(p.y*2.3+t*.9)+sin(p.z*3.1-t*.6), sin(p.z*2.1+t*.7)+sin(p.x*2.9+t*.5), sin(p.x*2.5-t*.8)+sin(p.y*3.3+t*.4))*.5;
}
void main(){
  float d = clamp((aTo.y+2.2)/4.4, 0., 1.)*.45 + aSeed*.25;
  float k = clamp((uT*1.7 - d), 0., 1.);
  k = k*k*(3.-2.*k);
  vec3 p = mix(aFrom, aTo, k);
  float bump = sin(3.14159*k);
  float c = cos(bump*(aSeed-.5)*1.6), s = sin(bump*(aSeed-.5)*1.6);
  p.xz = mat2(c,-s,s,c)*p.xz;
  p += field(p*1.1, uTime)*(.035 + bump*uScatter);
  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_Position = projectionMatrix*mv;
  gl_PointSize = uSize*uPix*(.55+aSeed*.9)/(-mv.z);
  vA = clamp(1. - (-mv.z - 5.4)/3.6, .16, 1.);
}`;
const FRAG = `
uniform vec3 uColor; varying float vA;
void main(){
  vec2 c = gl_PointCoord-.5; float d = length(c);
  if(d>.5) discard;
  gl_FragColor = vec4(uColor, smoothstep(.5,.28,d)*vA*.92);
}`;

// ---- scene ------------------------------------------------------------------
const canvas = $("gl");
const N = window.innerWidth < 700 ? 6000 : 10000;
let T = null;

try {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 50);
  camera.position.set(0, 0, 7.4);

  const shapes = {};
  ITEMS.forEach((it) => { if (!shapes[it.shape]) shapes[it.shape] = buildShape(it.shape, N); });
  const first = shapes[ITEMS[0].shape];
  const seeds = new Float32Array(N), sr = rng(42);
  for (let i = 0; i < N; i++) seeds[i] = sr();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(first.slice(), 3));
  geo.setAttribute("aFrom", new THREE.BufferAttribute(first.slice(), 3));
  geo.setAttribute("aTo", new THREE.BufferAttribute(first.slice(), 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
    uniforms: { uT: { value: 1 }, uTime: { value: 0 }, uSize: { value: 15 }, uPix: { value: renderer.getPixelRatio() }, uScatter: { value: .55 }, uColor: { value: new THREE.Color(0x171C21) } }
  });
  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));

  // Orbits and dust give depth without leaving black and white.
  const ringMat = new THREE.LineBasicMaterial({ color: 0x9AA5AD, transparent: true, opacity: .35 });
  const rings = [2.35, 2.75].map((R, k) => {
    const pts = [];
    for (let j = 0; j <= 180; j++) { const a = j / 180 * TAU; pts.push(new THREE.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R)); }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat);
    line.rotation.x = k ? 1.2 : 1.45; line.rotation.z = k ? -.35 : .25;
    group.add(line);
    return line;
  });
  const dustN = 900, dust = new Float32Array(dustN * 3), dr = rng(7);
  for (let i = 0; i < dustN; i++) {
    const yy = dr() * 2 - 1, rr = Math.sqrt(1 - yy * yy), th = dr() * TAU, R = 3 + dr() * 3.5;
    dust[i * 3] = Math.cos(th) * rr * R; dust[i * 3 + 1] = yy * R; dust[i * 3 + 2] = Math.sin(th) * rr * R;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
  const dustPts = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0x9AA5AD, size: .022, transparent: true, opacity: .7, depthWrite: false }));
  scene.add(dustPts, group);

  T = { renderer, scene, camera, geo, mat, group, rings, dustPts, shapes, seeds, t: 1, time: 0, last: performance.now(), mx: 0, my: 0, rx: -.22, ry: 0 };

  const box = canvas.parentNode;
  const resize = () => {
    const w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const wide = w > 900 && w / h > 1.05;
    const half = Math.tan(17 * Math.PI / 180) * 7.4 * camera.aspect;
    group.position.set(wide ? half * (w < 1300 ? .46 : .38) : 0, wide ? .1 : 0, 0);
    group.scale.setScalar(wide ? (w < 1300 ? .88 : 1) : .86);
  };
  new ResizeObserver(resize).observe(box);
  resize();
  window.addEventListener("pointermove", (e) => { T.mx = e.clientX / window.innerWidth - .5; T.my = e.clientY / window.innerHeight - .5; }, { passive: true });

  const tick = (now) => {
    const dt = Math.min((now - T.last) / 1000, .05); T.last = now;
    const moving = !reduce.matches;
    if (moving) { T.time += dt; T.t = Math.min(1, T.t + dt / 2.2); } else T.t = 1;
    mat.uniforms.uT.value = T.t; mat.uniforms.uTime.value = T.time;
    T.rx += ((moving ? T.my * .5 : 0) - .22 - T.rx) * .05;
    T.ry += ((moving ? T.mx * .9 : 0) - T.ry) * .05;
    group.rotation.x = T.rx;
    group.rotation.y = T.time * .16 + T.ry;
    rings[0].rotation.y = T.time * .12; rings[1].rotation.y = -T.time * .09;
    dustPts.rotation.y = T.time * .02; dustPts.rotation.x = T.time * .01;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
} catch (e) {
  // No WebGL: the menu and caption still work.
  canvas.remove();
}

// Start a growth from wherever each point is now towards the new form.
function morphTo(shape) {
  if (!T) return;
  const from = T.geo.attributes.aFrom.array, to = T.geo.attributes.aTo.array, next = T.shapes[shape];
  for (let i = 0; i < N; i++) {
    const j = i * 3;
    const d = Math.min(Math.max((to[j + 1] + 2.2) / 4.4, 0), 1) * .45 + T.seeds[i] * .25;
    let k = Math.min(Math.max(T.t * 1.7 - d, 0), 1); k = k * k * (3 - 2 * k);
    from[j] += (to[j] - from[j]) * k; from[j + 1] += (to[j + 1] - from[j + 1]) * k; from[j + 2] += (to[j + 2] - from[j + 2]) * k;
    to[j] = next[j]; to[j + 1] = next[j + 1]; to[j + 2] = next[j + 2];
  }
  T.geo.attributes.aFrom.needsUpdate = true; T.geo.attributes.aTo.needsUpdate = true;
  T.t = 0;
}

paint();
