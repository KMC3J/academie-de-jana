import { readFileSync, writeFileSync } from "fs";
const raw = JSON.parse(readFileSync(process.env.TMPDIR + "/flags-full.json", "utf8"));

const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => String(r2(n)).replace(/^(-?)0\./, "$1.");

/** Nettoie un tracé : arrondi, points alignés retirés (tolérance en unités viewBox). */
function tidy(d, tol) {
  const coarse = tol > 2; // 2e/3e passage : plus de points retirés
  const tokens = d.match(/[MmLlHhVvCcSsQqTtAaZz]|-?\d*\.?\d+/g) ?? [];
  let out = "";
  let cmd = "";
  let nums = [];
  const flush = () => {
    if (!nums.length) return;
    // les commandes H/V n'ont qu'un nombre : on les laisse telles quelles
    if (/[HhVv]/.test(cmd) || (/[CcSsQqTtAa]/.test(cmd) && !coarse)) {
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
    }
    nums = [];
  };
  for (const t of tokens) {
    if (/[A-Za-z]/.test(t)) { flush(); cmd = t; } else nums.push(Number(t));
  }
  flush();
  return out;
}

let before = 0, after = 0;
const out = {};
for (const [code, svg] of Object.entries(raw)) {
  before += svg.length;
  const vb = (svg.match(/viewBox="([\d.\- ]+)"/)?.[1] ?? "0 0 3 2").split(/\s+/).map(Number);
  // tolérance proportionnelle à la taille du dessin : ~0,6 px sur un drapeau de 120 px
  const base = Math.max(0.5, (vb[2] || 100) / 300);
  const shapes = [];
  for (const m of svg.matchAll(/<path\b([^>]*)\/?>/g)) {
    const d = m[1].match(/\sd="([^"]*)"/)?.[1];
    if (!d) continue;
    const fill = m[1].match(/fill="([^"]*)"/)?.[1] ?? "#000";
    const stroke = m[1].match(/stroke="([^"]*)"/)?.[1];
    if (fill === "none" && !stroke) continue;
    // 1er passage doux (formes nettes), 2e passage plus franc pour les drapeaux très lourds
    // 1er passage doux, puis de plus en plus franc selon la taille restante
    let clean = compact(tidy(d, base));
    if (clean.length > 700) clean = compact(tidy(d, base * 3));
    if (clean.length > 500) clean = compact(tidy(d, base * 10));
    if (clean.length > 400) clean = compact(tidy(d, base * 30));
    if (!clean) continue;
    shapes.push({ d: clean, fill, ...(stroke && fill === "none" ? { stroke } : {}) });
  }
  for (const m of svg.matchAll(/<rect\b([^>]*)\/?>/g)) {
    const g = (n, dd) => m[1].match(new RegExp(`\\s${n}="([^"]*)"`))?.[1] ?? dd;
    const x = Number(g("x", 0)), y = Number(g("y", 0)), w = Number(g("width", 0)), h = Number(g("height", 0));
    shapes.push({ d: `M${fmt(x)} ${fmt(y)}h${fmt(w)}v${fmt(h)}H${fmt(x)}z`, fill: g("fill", "#000") });
  }
  out[code] = { vb, s: shapes };
  after += JSON.stringify(out[code]).length;
}
/**
 * Compactage final : on supprime les espaces entre une commande et un nombre
 * (« c-5.91 »), et entre deux nombres dont le second commence par « - »
 * (« 529.52-1.26 »). Le SVG reste parfaitement valide, il est juste plus court.
 */
function compact(d) {
  return d
    .replace(/([MmLlHhVvCcSsQqTtAaZz])\s+/g, "$1")
    .replace(/([\d.])\s+(-)/g, "$1$2")
    .replace(/([\d.])\s+([\d.])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

let compacted = 0;
for (const f of Object.values(out)) {
  for (const shape of f.s) {
    const before = shape.d.length;
    shape.d = compact(shape.d);
    compacted += before - shape.d.length;
  }
}
// Drapeaux les plus lourds : on ne garde que les 400 plus grandes formes.
// Les armoiries comptent des centaines de micro-détails invisibles à 150 px.
for (const [code, f] of Object.entries(out)) {
  if (f.s.length > 300) {
    f.s = [...f.s].sort((a, b) => b.d.length - a.d.length).slice(0, 300).reverse();
  }
  // Une forme restée énorme : dernier passage très grossier.
  for (const shape of f.s) {
    if (shape.d.length > 1200) shape.d = tidy(shape.d, 40);
  }
}

writeFileSync("src/data/flags.json", JSON.stringify(out));
console.log(`compactage : ${Math.round(compacted / 1024)} KB gagnés`);
console.log("avant KB", Math.round(before / 1024), "→ après KB", Math.round(after / 1024));
console.log("SV:", Math.round(JSON.stringify(out.SV).length / 1024), "KB · formes", out.SV.s.length);
console.log("FR:", JSON.stringify(out.FR).slice(0, 200));
