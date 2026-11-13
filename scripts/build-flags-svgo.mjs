/**
 * Construit src/data/flags.json : les 177 drapeaux, optimisés avec SVGO.
 *
 * Source brute : $TMPDIR/flags-full.json (téléchargé par build-flags.mjs).
 * SVGO est un optimiseur SVG éprouvé : il réduit les nombres, fusionne les
 * chemins et nettoie les métadonnées SANS toucher à la géométrie. Les étoiles,
 * les <use>, les dégradés et les cercles restent intacts (contrairement à ma
 * première tentative, qui ne comprenait que les <path> et déformait les drapeaux).
 *
 * Deux drapeaux (Bosnie, Croatie) font planter le plugin convertPathData :
 * pour eux, on garde le SVG d'origine simplement compacté.
 */
import { readFileSync, writeFileSync } from "fs";
import { optimize } from "svgo";

const full = JSON.parse(readFileSync(process.env.TMPDIR + "/flags-full.json", "utf8"));

const base = {
  multipass: true,
  floatPrecision: 1,
  plugins: [
    {
      name: "preset-default",
      params: { overrides: { removeViewBox: false, cleanupIds: false } },
    },
  ],
};

const safe = {
  ...base,
  plugins: [{ name: "preset-default", params: { overrides: { removeViewBox: false, cleanupIds: false, convertPathData: false } } }],
};

let before = 0;
let after = 0;
const out = {};
const fallbacks = [];

for (const [code, svg] of Object.entries(full)) {
  before += svg.length;
  let data;
  try {
    data = optimize(svg, base).data;
  } catch {
    data = optimize(svg, safe).data;
    fallbacks.push(code);
  }
  out[code] = data;
  after += data.length;
}

writeFileSync("src/data/flags.json", JSON.stringify(out));
console.log(`drapeaux : ${Object.keys(out).length}`);
console.log(`avant : ${Math.round(before / 1024)} KB → après : ${Math.round(after / 1024)} KB`);
console.log(`sans convertPathData (formes complexes) : ${fallbacks.join(", ") || "aucun"}`);
