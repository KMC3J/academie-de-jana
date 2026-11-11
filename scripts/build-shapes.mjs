// Convertit les contours Natural Earth en chemins SVG projetés (équirectangulaire).
// Sortie : src/data/world-shapes.json  → [{ id, d }]  (d = attribut "path" SVG)
//
//   node scripts/build-shapes.mjs

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache");
const OUT = path.join(ROOT, "src", "data", "world-shapes.json");

const W = 1000;
const H = 500;

const geo = JSON.parse(fs.readFileSync(path.join(CACHE, "ne_110m.geojson"), "utf8"));
const countries = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "countries.json"), "utf8"));
const byId = new Map(countries.map((c) => [c.id, c]));

// Projection simple : lon -180..180 → 0..W, lat 90..-90 → 0..H
const px = (lon) => ((lon + 180) / 360) * W;
const py = (lat) => ((90 - lat) / 180) * H;

const rings = (geometry) => {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
};

// Sous-échantillonnage régulier : garde 1 point sur N, toujours le premier et le dernier.
const decimate = (ring, step) => {
  if (ring.length <= 6) return ring;
  const out = [];
  for (let i = 0; i < ring.length - 1; i += step) out.push(ring[i]);
  out.push(ring[ring.length - 1]);
  return out;
};

// Simplification douce par distance minimale au point précédent (en degrés).
const thin = (ring, minDeg) => {
  if (ring.length <= 6) return ring;
  const out = [ring[0]];
  let last = ring[0];
  for (let i = 1; i < ring.length - 1; i++) {
    const p = ring[i];
    if (Math.abs(p[0] - last[0]) + Math.abs(p[1] - last[1]) >= minDeg) {
      out.push(p);
      last = p;
    }
  }
  out.push(ring[ring.length - 1]);
  return out;
};

const out = [];
let totalPoints = 0;

for (const f of geo.features) {
  const p = f.properties;
  const iso2 = p.ISO_A2_EH && p.ISO_A2_EH !== "-99" ? p.ISO_A2_EH : null;
  const iso3 = p.ISO_A3_EH && p.ISO_A3_EH !== "-99" ? p.ISO_A3_EH : null;
  const id = iso2 || iso3 || null;
  if (!f.geometry) continue;

  const parts = [];
  for (const ring of rings(f.geometry)) {
    if (ring.length < 4) continue;
    const pts = thin(ring, 0.35);
    if (pts.length < 4) continue;
    let d = "";
    pts.forEach(([lon, lat], i) => {
      const x = Math.round(px(lon));
      const y = Math.round(py(lat));
      d += `${i === 0 ? "M" : "L"}${x} ${y}`;
    });
    d += "Z";
    parts.push(d);
    totalPoints += pts.length;
  }
  if (!parts.length) continue;

  const known = id ? byId.get(id) : null;
  out.push({
    id: id ?? p.ADMIN,
    name: known?.name ?? p.NAME_FR ?? p.ADMIN,
    d: parts.join(""),
  });
}

out.sort((a, b) => a.name.localeCompare(b.name, "fr"));

fs.writeFileSync(OUT, JSON.stringify({ width: W, height: H, countries: out }));
const size = fs.statSync(OUT).size;
console.log(`${out.length} pays, ${totalPoints} points, ${(size / 1024).toFixed(0)} Ko → ${path.relative(ROOT, OUT)}`);
