// Renders public/og.png: the tangle at scroll progress 0, 1200x630, with the
// name set in the display face. Uses the same nodePos() the page does, so the
// preview is the page's own opening frame rather than a hand-drawn imitation.
//
//   node scripts/og.mjs        (needs a chromium binary; see CHROME below)
import { writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { EDGES, NODE_RADIUS, edgeStyle, nodePos } from "../src/mesh.js";

const CHROME = process.env.CHROME || "/usr/bin/chromium";
const W = 1200;
const H = 630;
const ctx = { w: W, h: H, runway: H, targets: null };

const pos = Array.from({ length: NODE_RADIUS.length }, (_, i) => nodePos(i, 0, ctx, 0, null));
const lines = EDGES.map(([a, b]) => {
  const s = edgeStyle(a, b, 0, (pos[a].depth + pos[b].depth) / 2);
  return `<line x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" stroke-opacity="${(s.opacity * Math.min(pos[a].opacity, pos[b].opacity)).toFixed(3)}" stroke-width="${s.width.toFixed(2)}"/>`;
}).join("");
const dots = pos.map((q, i) => {
  const r = NODE_RADIUS[i] * (0.7 + 0.3 * q.depth);
  return `<circle cx="${q.x}" cy="${q.y}" r="${r}" fill="#2f6350" fill-opacity="${q.opacity.toFixed(3)}"/>`;
}).join("");

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&family=Newsreader:opsz,wght@6..72,400&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#101a18}
  .stage{position:relative;width:${W}px;height:${H}px}
  .stage::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 70% 62% at 50% 46%,transparent 0%,rgba(4,8,7,.35) 78%,rgba(4,8,7,.62) 100%)}
  svg{position:absolute;inset:0}
  line{stroke:#223b36;stroke-linecap:round}
  .copy{position:absolute;left:72px;top:60px}
  .name{margin:0;font-family:"Newsreader",Georgia,serif;font-optical-sizing:auto;font-size:44px;line-height:1.15;color:#d8e4de}
  .tag{margin:10px 0 0;font-family:"Inter",sans-serif;font-size:17px;letter-spacing:.04em;color:#8b9c97}
  .url{position:absolute;left:72px;bottom:52px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:13px;letter-spacing:.18em;color:#5a927e}
</style></head><body><div class="stage">
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${lines}${dots}</svg>
<div class="copy"><p class="name">Vinayak Tyagi</p><p class="tag">A handful of systems I’ve built and secured</p></div>
<div class="url">vtyagi.dev</div>
</div></body></html>`;

const dir = mkdtempSync(join(tmpdir(), "og-"));
const page = join(dir, "og.html");
writeFileSync(page, html);
const out = new URL("../public/og.png", import.meta.url).pathname;
execFileSync(CHROME, [
  "--headless=new", "--no-first-run", "--disable-gpu", "--hide-scrollbars",
  `--window-size=${W},${H}`, "--virtual-time-budget=8000", `--screenshot=${out}`, `file://${page}`,
], { stdio: "ignore" });
console.log("wrote", out);
