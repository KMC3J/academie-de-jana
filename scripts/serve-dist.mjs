// Petit serveur statique avec repli SPA + lecture de dist/ à chaque requête.
// Lancement : node scripts/serve-dist.mjs [port]
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..", "dist");
const PORT = Number(process.argv[2] || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};

function send(res, code, file) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(code, { "Content-Type": TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    const target = path.join(ROOT, url === "/" ? "index.html" : url);

    // Fichier réel demandé
    if (target.startsWith(ROOT) && fs.existsSync(target) && fs.statSync(target).isFile()) {
      return send(res, 200, target);
    }
    // Route de l'application (pas d'extension) → index.html
    if (!path.extname(url)) {
      return send(res, 200, path.join(ROOT, "index.html"));
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`Académie de Jana → http://127.0.0.1:${PORT}`);
  });
