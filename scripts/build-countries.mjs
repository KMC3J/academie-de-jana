// Génère src/data/countries.json — version simple, sans simplification de contours.
//
//   node scripts/build-countries.mjs
//
// Lit les fichiers déjà téléchargés dans .cache/ (Natural Earth, mledoze/countries,
// population Banque mondiale) et écrit un fichier plat : un objet par pays.
// Aucun appel réseau au moment du build si le cache est présent.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const CACHE = path.join(ROOT, ".cache");
const OUT = path.join(ROOT, "src", "data", "countries.json");

const readCache = (name) => JSON.parse(fs.readFileSync(path.join(CACHE, name), "utf8"));

const geo = readCache("ne_110m.geojson");
const mledoze = readCache("countries.json");
const popList = readCache("population.json");

// --- index des fiches pays -------------------------------------------------
const byIso2 = new Map();
const byIso3 = new Map();
const byName = new Map();
for (const c of mledoze) {
  if (c.cca2) byIso2.set(c.cca2, c);
  if (c.cca3) byIso3.set(c.cca3, c);
  byName.set(c.name.common.toLowerCase(), c);
}

const popByName = new Map(popList.map((p) => [p.country.toLowerCase(), p.population]));

const REGION_FR = {
  Africa: "Afrique",
  Americas: "Amériques",
  Asia: "Asie",
  Europe: "Europe",
  Oceania: "Océanie",
  Antarctic: "Antarctique",
};

// --- moyenne des points d'un pays (centre du drapeau / marqueur) -----------
function center(points) {
  let lon = 0;
  let lat = 0;
  for (const [x, y] of points) {
    lon += x;
    lat += y;
  }
  return [lon / points.length, lat / points.length];
}

function flattenRings(geometry) {
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  const pts = [];
  for (const poly of polys) for (const ring of poly) for (const p of ring) pts.push(p);
  return pts;
}

const out = [];

for (const f of geo.features) {
  const p = f.properties;
  const iso2 = p.ISO_A2_EH && p.ISO_A2_EH !== "-99" ? p.ISO_A2_EH : null;
  const iso3 = p.ISO_A3_EH && p.ISO_A3_EH !== "-99" ? p.ISO_A3_EH : null;
  const meta = (iso2 && byIso2.get(iso2)) || (iso3 && byIso3.get(iso3)) || byName.get(String(p.ADMIN).toLowerCase()) || {};

  if (!f.geometry) continue;
  const pts = flattenRings(f.geometry);
  if (!pts.length) continue;
  const [lon, lat] = center(pts);

  const cur = meta.currencies ? Object.values(meta.currencies) : [];
  const curCodes = meta.currencies ? Object.keys(meta.currencies) : [];

  out.push({
    id: meta.cca2 || iso2 || p.ADMIN,
    name: meta.translations?.fra?.common || p.NAME_FR || p.ADMIN,
    official: meta.translations?.fra?.official || p.FORMAL_FR || p.NAME_LONG || p.ADMIN,
    lat: Math.round(lat * 100) / 100,
    lon: Math.round(lon * 100) / 100,
    capital: meta.capital && meta.capital.length ? meta.capital[0] : null,
    currency: curCodes.length ? { code: curCodes[0], name: cur[0].name, symbol: cur[0].symbol || null } : null,
    languages: meta.languages ? Object.values(meta.languages) : [],
    region: REGION_FR[meta.region] || REGION_FR[p.CONTINENT] || p.CONTINENT || null,
    subregion: meta.subregion || null,
    area: meta.area || null,
    population: popByName.get(String(meta.name?.common || p.ADMIN).toLowerCase()) || null,
    history: null,
  });
}

out.sort((a, b) => a.name.localeCompare(b.name, "fr"));

fs.writeFileSync(OUT, JSON.stringify(out));
console.log(`${out.length} pays → ${path.relative(ROOT, OUT)}`);
console.log(`capitales : ${out.filter((c) => c.capital).length}`);
console.log(`monnaies : ${out.filter((c) => c.currency).length}`);
console.log(`histoires : ${out.filter((c) => c.history).length}`);
