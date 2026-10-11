// Renders the tab icon from the mesh itself: MIRAGE, the other two project
// nodes and the two decoys that close loops with them (nodes 0, 1, 2, 5, 7),
// at scroll progress 0, the same frame scripts/og.mjs uses for the preview.
// A closed loop is the point: three dots on a line is the stock "share" glyph.
//
// Writes public/favicon.svg (tile with rounded corners, for browser tabs) and
// public/apple-touch-icon.png (180x180, square: iOS applies its own mask).
//
//   node scripts/favicon.mjs        (needs a chromium binary; see CHROME below)
import { writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { EDGES, NODE_RADIUS, nodePos } from "../src/mesh.js";

const CHROME = process.env.CHROME || "/usr/bin/chromium";
const NODES = [0, 1, 2, 5, 7];
const MARGIN = 2.2; // tile units of 32, from a dot's edge to the tile's
const STROKE = 2.3;
// Mesh radii are tuned for a 1200px stage; at 16px they need a floor.
const radius = (i) => Math.max(2.3, NODE_RADIUS[i] * 0.6);

const ctx = { w: 1000, h: 1000, runway: 1000, targets: null };
const pos = Object.fromEntries(NODES.map((i) => [i, nodePos(i, 0, ctx, 0, null)]));
const xs = NODES.map((i) => pos[i].x);
const ys = NODES.map((i) => pos[i].y);
const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
// Largest scale at which every dot, radius included, stays MARGIN inside the tile.
const k = Math.min(...NODES.flatMap((i) => [
  (16 - MARGIN - radius(i)) / Math.max(Math.abs(pos[i].x - cx), 1e-9),
  (16 - MARGIN - radius(i)) / Math.max(Math.abs(pos[i].y - cy), 1e-9),
]));
const at = (i) => [16 + (pos[i].x - cx) * k, 16 + (pos[i].y - cy) * k].map((v) => +v.toFixed(2));

// Guard: no dot may touch the tile edge, or the corner rounding clips it.
for (const i of NODES) {
  const [x, y] = at(i);
  const r = radius(i);
  if (x - r < 2 || y - r < 2 || x + r > 30 || y + r > 30) throw new Error(`node ${i} clips the tile`);
}

const inSet = new Set(NODES);
const lines = EDGES.filter(([a, b]) => inSet.has(a) && inSet.has(b))
  .map(([a, b]) => { const [x1, y1] = at(a); const [x2, y2] = at(b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; })
  .join("");
// Project nodes in the accent; decoys a step dimmer, as on the page.
const dots = NODES.map((i) => { const [x, y] = at(i); return `<circle cx="${x}" cy="${y}" r="${radius(i).toFixed(2)}" fill="${i < 3 ? "#5dcaa5" : "#3f7f69"}"/>`; }).join("");
const svg = (rx) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${rx}" fill="#101a18"/>` +
  `<g stroke="#5a927e" stroke-width="${STROKE}" stroke-linecap="round" stroke-opacity="0.85">${lines}</g>${dots}</svg>\n`;

const pub = (f) => new URL(`../public/${f}`, import.meta.url).pathname;
writeFileSync(pub("favicon.svg"), svg(7));

const dir = mkdtempSync(join(tmpdir(), "favicon-"));
const page = join(dir, "icon.html");
writeFileSync(page, `<!doctype html><html><body style="margin:0;width:180px;height:180px;overflow:hidden">${svg(0).replace("<svg ", '<svg width="180" height="180" ')}</body></html>`);
execFileSync(CHROME, [
  "--headless=new", "--no-first-run", "--disable-gpu", "--hide-scrollbars",
  "--window-size=180,180", "--force-device-scale-factor=1", `--screenshot=${pub("apple-touch-icon.png")}`, `file://${page}`,
], { stdio: "ignore" });
console.log("wrote", pub("favicon.svg"), "and", pub("apple-touch-icon.png"));
