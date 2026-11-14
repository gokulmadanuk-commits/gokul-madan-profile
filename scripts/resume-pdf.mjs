// Builds the site, serves it locally and prints /resume to public/resume.pdf.
// Run after editing src/data/profile.ts:  npm run resume:pdf
// Needs Playwright with Chromium on the machine (not run on Vercel).
import { spawn, execSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const PORT = 4179;
const out = resolve("public/resume.pdf");

execSync("npx vite build", { stdio: "inherit" });
const server = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", String(PORT), "--strictPort"], { stdio: "ignore" });

try {
  const url = `http://127.0.0.1:${PORT}/resume`;
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(url)).ok) break; } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });
  await page.pdf({ path: out, format: "A4", printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log(`Wrote ${out}`);
} finally {
  server.kill();
}
