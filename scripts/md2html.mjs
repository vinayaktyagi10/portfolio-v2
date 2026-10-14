// Converts the Markdown subset the write-ups use into HTML for a post page:
// h2, blockquote, paragraphs, bullet and ordered lists, pipe tables, inline
// code, bold and italics. No dependencies. Prints to stdout.
//
//   node scripts/md2html.mjs <file.md>
//
// The `# ` title line is skipped; the page carries its own <h1>.
import { readFileSync } from "node:fs";

const src = readFileSync(process.argv[2], "utf8").replace(/\r/g, "");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function inline(s) {
  // Code spans are swapped for placeholders first, so ** may wrap code and
  // ** inside code is left alone. A 64-hex SHA-256 gets class="hash" so the
  // page may break it anywhere.
  const codes = [];
  const text = s.replace(/`([^`]*)`/g, (_, c) => {
    codes.push(`<code${/^[0-9a-f]{64}$/.test(c) ? ' class="hash"' : ""}>${esc(c)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\s](?:[^*]*[^*\s])?)\*(?![*\w])/g, "$1<em>$2</em>")
    .replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
}

const slug = (h) =>
  h.toLowerCase().replace(/^\d+\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Split on pipes outside code spans only (`||` appears inside one).
const cells = (row) => {
  const inner = row.trim().replace(/^\|/, "").replace(/\|$/, "");
  const out = [""];
  let code = false;
  for (const ch of inner) {
    if (ch === "`") code = !code;
    if (ch === "|" && !code) out.push("");
    else out[out.length - 1] += ch;
  }
  return out.map((c) => c.trim());
};

const lines = src.split("\n");
const out = [];
let i = 0;
while (i < lines.length) {
  const l = lines[i];
  if (l.trim() === "") { i++; continue; }
  if (l.startsWith("# ")) { i++; continue; }
  if (l.startsWith("## ")) {
    const h = l.slice(3).trim();
    out.push(`<h2 id="${slug(h)}">${inline(h)}</h2>`);
    i++; continue;
  }
  if (l.startsWith("> ")) {
    const buf = [];
    while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
    out.push(`<blockquote><p>${inline(buf.join(" "))}</p></blockquote>`);
    continue;
  }
  if (l.startsWith("|")) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
    const head = cells(rows[0]);
    const body = rows.slice(2).map(cells);
    out.push(
      `<div class="table-wrap"><table>\n<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead>\n<tbody>\n` +
        body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("\n") +
        `\n</tbody>\n</table></div>`
    );
    continue;
  }
  if (/^- /.test(l) || /^\d+\. /.test(l)) {
    const ordered = /^\d+\. /.test(l);
    const re = ordered ? /^\d+\. / : /^- /;
    const items = [];
    while (i < lines.length && re.test(lines[i])) items.push(lines[i++].replace(re, ""));
    const tag = ordered ? "ol" : "ul";
    out.push(`<${tag}>\n${items.map((t) => `<li>${inline(t)}</li>`).join("\n")}\n</${tag}>`);
    continue;
  }
  // Paragraph: runs until a blank line or the start of another block.
  const buf = [];
  while (i < lines.length && lines[i].trim() !== "" && !/^(#|>|\||- |\d+\. )/.test(lines[i])) buf.push(lines[i++]);
  out.push(`<p>${inline(buf.join(" "))}</p>`);
}
process.stdout.write(out.join("\n\n") + "\n");
