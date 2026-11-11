// Complète src/data/countries.json avec un court résumé d'histoire par pays.
// Source : API publique de Wikipédia en français (résumé d'article, CC BY-SA).
// Le texte est figé dans le fichier : l'app ne fait aucun appel réseau.

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const FILE = path.join(ROOT, "src", "data", "countries.json");
const countries = JSON.parse(fs.readFileSync(FILE, "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Quelques titres d'articles à préférer à l'ambassade ou à la page d'homonymie.
const TITLES = {
  FR: "France",
  GB: "Royaume-Uni",
  US: "États-Unis",
  DE: "Allemagne",
  IT: "Italie",
  ES: "Espagne",
  CN: "Chine",
  JP: "Japon",
  IN: "Inde",
  BR: "Brésil",
  RU: "Russie",
  EG: "Égypte",
  GR: "Grèce",
  MA: "Maroc",
  DZ: "Algérie",
  TN: "Tunisie",
  TR: "Turquie",
  CA: "Canada",
  MX: "Mexique",
  AU: "Australie",
  PT: "Portugal",
  BE: "Belgique",
  CH: "Suisse",
  NL: "Pays-Bas",
  PL: "Pologne",
  SN: "Sénégal",
  CI: "Côte d'Ivoire",
  ML: "Mali",
  CD: "République démocratique du Congo",
  ZA: "Afrique du Sud",
  KE: "Kenya",
  NG: "Nigeria",
  ID: "Indonésie",
  KR: "Corée du Sud",
  VN: "Viêt Nam",
  TH: "Thaïlande",
  AR: "Argentine",
  PE: "Pérou",
  CL: "Chili",
  CO: "Colombie",
};

async function summary(title) {
  const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true`;
  const res = await fetch(url, { headers: { "User-Agent": "academie-de-jana/1.0" } });
  if (!res.ok) return null;
  if (!String(res.headers.get("content-type") || "").includes("json")) return null; // quota dépassé
  const j = await res.json().catch(() => null);
  if (!j) return null;
  if (j.type === "disambiguation") return null;
  const text = (j.extract || "").trim();
  return text.length > 40 ? { text, title: j.titles?.canonical || title } : null;
}

let done = 0;
let found = 0;

for (const c of countries) {
  if (c.history) {
    done++;
    found++;
    continue;
  }
  const candidates = [TITLES[c.id], c.name].filter(Boolean);
  for (const t of candidates) {
    const s = await summary(t);
    if (s) {
      c.history = s;
      found++;
      break;
    }
    await sleep(250);
  }
  done++;
  if (done % 20 === 0) console.log(`  … ${done}/${countries.length} (${found} résumés)`);
  await sleep(450);
}

fs.writeFileSync(FILE, JSON.stringify(countries));
console.log(`Résumés d'histoire : ${found}/${countries.length}`);
