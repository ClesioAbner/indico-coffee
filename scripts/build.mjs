// Gera dist/ com os ficheiros publicados e falha se alguma página referir um ficheiro inexistente.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const pages = ["index.html", "menu.html", "404.html"];
const out = "dist";

// Recolhe os caminhos locais usados em src, href e srcset (o \s evita apanhar data-site-href)
const references = new Set();
for (const page of pages) {
  const html = readFileSync(page, "utf8");
  for (const match of html.matchAll(/\s(?:src|href|srcset)="([^"#?]+)"/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(target)) continue;
    references.add(target);
  }
}

const missing = [...references].filter((target) => !existsSync(target));
if (missing.length) {
  console.error("Ficheiros em falta:\n  " + missing.join("\n  "));
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const page of pages) cpSync(page, join(out, page));
cpSync("assets", join(out, "assets"), { recursive: true });

console.log(`dist/ pronto: ${pages.length} páginas, ${references.size} referências verificadas.`);
