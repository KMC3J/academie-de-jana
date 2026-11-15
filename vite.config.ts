import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { cpSync, existsSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      // pdf.js a besoin de ses polices de base pour lire les accents des PDF.
      // On les copie telles quelles dans dist/standard_fonts/.
      name: "copie-polices-pdf",
      closeBundle() {
        const from = path.resolve(__dirname, "node_modules/pdfjs-dist/standard_fonts");
        const to = path.resolve(__dirname, "dist/standard_fonts");
        if (existsSync(from)) cpSync(from, to, { recursive: true });
      },
    },
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: { port: 5173 },
  // base relative : le build fonctionne servi depuis n'importe quel dossier
  base: "./",
});
