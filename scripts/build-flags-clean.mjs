/**
 * Construit src/data/flags.json : les 177 drapeaux, nettoyés SANS être redessinés.
 *
 * Source brute : $TMPDIR/flags-full.json (téléchargé par build-flags.mjs).
 *
 * Règle d'or : on ne touche jamais à la géométrie. On retire seulement ce qui
 * ne se voit pas (métadonnées XML, <title>, <desc>, commentaires, indentations)
 * et on raccourcit le viewBox quand il a des décimales inutiles.
 * C'est ce qui garantit que les étoiles, armoiries et proportions restent exactes.
 */
import { readFileSync, writeFileSync } from "fs";

const full = JSON.parse(readFileSync(process.env.TMPDIR + "/flags-full.json", "utf8"));

let before = 0;
let after = 0;
const out = {};

for (const [code, svg] of Object.entries(full)) {
  before += svg.length;
  const light = svg
    // métadonnées inutiles à l'affichage
    .replace(/<\?xml[\s\S]*?\?>/g, "")
    .replace(/<!DOCTYPE[\s\S]*?>/g, "")
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<desc>[\s\S]*?<\/desc>/g, "")
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    // attributs décoratifs ou redondants
    .replace(/\s+(enable-background|xml:space|version|aria-label|role|class|style)="[^"]*"/g, "")
    // espaces et retours à la ligne entre les balises
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/\s+\/>/g, "/>")
    .trim();
  out[code] = light;
  after += light.length;
}

writeFileSync("src/data/flags.json", JSON.stringify(out));
console.log(`drapeaux : ${Object.keys(out).length}`);
console.log(`avant : ${Math.round(before / 1024)} KB → après : ${Math.round(after / 1024)} KB`);
