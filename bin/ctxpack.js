#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { parseArgs } = require("node:util");
const { execSync } = require("node:child_process");
const { collect, render, estimateTokens } = require("../src");
const { c, table, header, bytes, plural, bar } = require("../src/ui");
const pkg = require("../package.json");

const HELP = `${header("ctxpack", "pack a repo into one LLM-ready prompt")}

${c.bold("Usage")}
  ctxpack [dir] [options]

${c.bold("Options")}
  -o, --out <file>        write to a file (default: stdout)
  -f, --format <fmt>      markdown | xml            (default: markdown)
  -i, --include <glob>    only include matching paths (repeatable)
  -x, --exclude <glob>    exclude matching paths (repeatable)
  -m, --max-kb <n>        skip files larger than n KB (default: 200)
  -p, --prompt <text>     add instructions at the top
      --copy              copy result to the clipboard
      --stats             print a token breakdown instead of the pack
      --no-gitignore      don't respect .gitignore
  -v, --version           print version
  -h, --help              show help

${c.bold("Examples")}
  ctxpack . -o context.md
  ctxpack src -i "**/*.ts" --stats
  ctxpack . -x "test/**" -p "Find bugs in this code" --copy`;

let a;
try {
  a = parseArgs({ allowPositionals: true, options: { out: { type: "string", short: "o" }, format: { type: "string", short: "f", default: "markdown" }, include: { type: "string", short: "i", multiple: true, default: [] }, exclude: { type: "string", short: "x", multiple: true, default: [] }, "max-kb": { type: "string", short: "m", default: "200" }, prompt: { type: "string", short: "p", default: "" }, copy: { type: "boolean" }, stats: { type: "boolean" }, "no-gitignore": { type: "boolean" }, version: { type: "boolean", short: "v" }, help: { type: "boolean", short: "h" } } });
} catch (e) { console.error(c.red(`✖ ${e.message}`)); process.exit(2); }
const o = a.values;
if (o.help) { console.log(HELP); process.exit(0); }
if (o.version) { console.log(pkg.version); process.exit(0); }
if (!["markdown", "xml"].includes(o.format)) { console.error(c.red("✖ --format must be markdown or xml")); process.exit(2); }
const dir = path.resolve(a.positionals[0] || ".");
if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { console.error(c.red(`✖ Not a directory: ${dir}`)); process.exit(2); }

const res = collect(dir, { include: o.include, exclude: o.exclude, maxBytes: (+o["max-kb"] || 200) * 1024, gitignore: !o["no-gitignore"] });
const total = res.files.reduce((n, f) => n + f.tokens, 0);

if (o.stats) {
  console.log(header("ctxpack", path.basename(dir)) + "\n");
  const top = [...res.files].sort((x, y) => y.tokens - x.tokens).slice(0, 12);
  console.log(table(top.map((f) => [f.path, f.tokens.toLocaleString(), bar(f.tokens / (top[0]?.tokens || 1), 16), bytes(f.size)]), { head: ["File", "Tokens", "", "Size"], align: [, "right"] }));
  console.log(`\n${c.green("✔")} ${plural(res.files.length, "file")} · ${c.bold("~" + total.toLocaleString())} tokens · ${res.skipped.length} skipped`);
  const ctx = [["128k (GPT-4o)", 128e3], ["200k (Claude)", 200e3], ["1M (Gemini)", 1e6]];
  console.log(c.dim(ctx.map(([n, v]) => `${n}: ${total > v ? c.red("too big") : Math.round((total / v) * 100) + "%"}`).join("  ·  ")));
  process.exit(0);
}

const outText = render(res, { format: o.format, title: path.basename(dir), instructions: o.prompt });
if (o.out) { fs.writeFileSync(o.out, outText); console.error(`${c.green("✔")} Wrote ${c.bold(o.out)} · ${plural(res.files.length, "file")} · ~${estimateTokens(outText).toLocaleString()} tokens`); }
else if (!o.copy) process.stdout.write(outText);
if (o.copy) {
  const cmds = process.platform === "darwin" ? ["pbcopy"] : process.platform === "win32" ? ["clip"] : ["wl-copy", "xclip -selection clipboard", "xsel --clipboard --input"];
  const ok = cmds.some((cmd) => { try { execSync(cmd, { input: outText, stdio: ["pipe", "ignore", "ignore"] }); return true; } catch { return false; } });
  console.error(ok ? `${c.green("✔")} Copied ~${estimateTokens(outText).toLocaleString()} tokens to clipboard` : c.yellow("⚠ No clipboard tool found (pbcopy / wl-copy / xclip). Use -o instead."));
}
