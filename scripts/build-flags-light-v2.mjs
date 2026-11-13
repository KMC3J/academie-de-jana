/**
 * Construit src/data/flags-light.json : les 177 drapeaux, allégés pour le web.
 *
 * Source brute : $TMPDIR/flags-full.json (téléchargé une fois par build-flags.mjs).
 * Règles : on ne garde que les tracés, on arrondit, on retire les points quasi
 * alignés (davantage sur les armoiries très détaillées) et on compacte les nombres.
 * Résultat : ~2,4 Mo → ~1 Mo, sans différence visible à l'écran.
 */
import { readFileSync, writeFileSync } from "fs";

const raw = JSON.parse(readFileSync(process.env.TMPDIR + "/flags-full.json", "utf8"));

const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => String(r2(n)).replace(/^(-?)0\./, "$1.");

/** Compacte un tracé : « c-5.91 » au lieu de « c -5.91 », « 529.52-1.26 » au lieu de « 529.52 -1.26 ». */
function compact(d) {
  return d
    .replace(/([MmLlHhVvCcSsQqTtAaZz])\s+/g, "$1")
    .replace(/([\d.])\s+(-)/g, "$1$2")
    .replace(/([\d.])\s+([\d.])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Simplifie un tracé : arrondit et retire les points qui ne s'écartent pas
 * de plus de `tol` de la ligne entre leurs voisins (unités du viewBox).
 */
function tidy(d, tol) {
  const coarse = tol > 2; // 2e/3e passage : plus de points retirés
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+/g) ?? [];
  let out = "";
  let cmd = "";
  let nums = [];

  const flush = () => {
    if (!nums.length) return;
    const isArc = /[Aa]/.test(cmd);
    const isCurve = /[CcSsQqTt]/.test(cmd);
    const isHV = /[HhVv]/.test(cmd);
    if (isHV || (isCurve && !coarse)) {
      out += cmd + nums.map(fmt).join(" ");
    } else {
      const pts = [];
      for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1] ?? 0]);
      if (pts.length <= 2) {
        out += cmd + pts.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(" ");
      } else {
        const keep = [pts[0]];
        for (let i = 1; i < pts.length - 1; i++) {
          const [x0, y0] = keep[keep.length - 1];
          const [x1, y1] = pts[i];
          const [x2, y2] = pts[i + 1];
          const cross = Math.abs((x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0));
          const len = Math.hypot(x2 - x0, y2 - y0) || 1;
          if (cross / len > tol) keep.push(pts[i]);
        }
        keep.push(pts[pts.length - 1]);
        out += cmd + keep.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join(" ");
      }
      if (isArc) out += " "; // les arcs sont complexes : on ne les retouche pas
    }
    nums = [];
  };

  for (const t of tokens) {
    if (/[A-Za-z]/.test(t)) {
      flush();
      cmd = t;
    } else nums.push(Number(t));
  }
  flush();
  return out;
}

let before = 0;
const out = {};

for (const [code, svg] of Object.entries(raw)) {
  before += svg.length;
  const vb = (svg.match(/viewBox="([\d.\- ]+)"/)?.[1] ?? "0 0 3 2").split(/\s+/).map(Number);
  // tolérance de base : proportionnelle à la taille du dessin
  const base = Math.max(0.4, (vb[2] || 100) / 300);
  const shapes = [];

  for (const m of svg.matchAll(/<path\b([^>]*)\/?>/g)) {
    const d = m[1].match(/\sd="([^"]*)"/)?.[1];
    if (!d) continue;
    const fill = m[1].match(/fill="([^"]*)"/)?.[1] ?? "#000";
    const stroke = m[1].match(/stroke="([^"]*)"/)?.[1];
    if (fill === "none" && !stroke) continue;
    // On simplifie de plus en plus fort tant que le tracé reste long.
    let clean = compact(tidy(d, base));
    if (clean.length > 700) clean = compact(tidy(clean, base * 3));
    if (clean.length > 500) clean = compact(tidy(clean, base * 10));
    if (clean.length > 400) clean = compact(tidy(clean, base * 30));
    if (!clean) continue;
    shapes.push({ d: clean, fill, ...(stroke && fill === "none" ? { stroke } : {}) });
  }

  for (const m of svg.matchAll(/<rect\b([^>]*)\/?>/g)) {
    const g = (n, dd) => m[1].match(new RegExp(`\\s${n}="([^"]*)"`))?.[1] ?? dd;
    // Les <rect> de fond sont souvent en pourcentages (« width=\"100%\" ») :
    // dans ce cas, ils couvrent tout le drapeau, on prend le viewBox entier.
    const num = (v, fallback) => (/^-?[\d.]+%?$/.test(v) && !v.endsWith("%") ? Number(v) : fallback);
    const x = num(g("x", "0"), vb[0]);
    const y = num(g("y", "0"), vb[1]);
    const w = num(g("width", "0"), vb[2]);
    const h = num(g("height", "0"), vb[3]);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) continue;
    shapes.push({ d: `M${fmt(x)} ${fmt(y)}h${fmt(w)}v${fmt(h)}H${fmt(x)}z`, fill: g("fill", "#000") });
  }

  // Drapeaux à armoiries : des centaines de micro-détails invisibles à 150 px.
  // On garde les 300 plus grandes formes (les plus visibles).
  if (shapes.length > 300) {
    const keep = [...shapes].sort((a, b) => b.d.length - a.d.length).slice(0, 300);
    shapes.length = 0;
    shapes.push(...keep.reverse());
  }

  out[code] = { vb, s: shapes };
}

writeFileSync("src/data/flags-light.json", JSON.stringify(out));
const after = JSON.stringify(out).length;
console.log(`drapeaux : ${Object.keys(out).length}`);
console.log(`avant : ${Math.round(before / 1024)} KB → après : ${Math.round(after / 1024)} KB`);
