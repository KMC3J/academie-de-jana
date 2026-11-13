import https from "https";
import { readFileSync, writeFileSync } from "fs";
const countries = JSON.parse(readFileSync("src/data/countries.json", "utf8"));
const out = {};
const missing = [];
function get(code) {
  return new Promise((res) => {
    const req = https.request({ hostname: "raw.githubusercontent.com", path: `/hjnilsson/country-flags/master/svg/${code.toLowerCase()}.svg`, method: "GET" }, (r) => {
      let d = ""; r.on("data", (c) => (d += c)); r.on("end", () => res(r.statusCode === 200 ? d : null));
    });
    req.on("error", () => res(null)); req.setTimeout(15000, () => { req.destroy(); res(null); }); req.end();
  });
}
const alias = { "Northern Cyprus": "cy", Somaliland: "so" };
for (const c of countries) {
  const svg = await get(alias[c.id] ?? c.id);
  if (svg) out[c.id] = svg.replace(/\s+/g, " ").trim();
  else missing.push(c.id);
}
writeFileSync("src/data/flags.json", JSON.stringify(out));
console.log("drapeaux:", Object.keys(out).length, "/", countries.length);
console.log("manquants:", missing.join(","));
console.log("taille KB:", Math.round(JSON.stringify(out).length / 1024));
