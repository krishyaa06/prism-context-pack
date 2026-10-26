"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { walk, parseIgnore, ignored, isBinary } = require("./walk");

const LANG = { js: "javascript", mjs: "javascript", cjs: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx", py: "python", go: "go", rs: "rust", rb: "ruby", java: "java", kt: "kotlin", swift: "swift", c: "c", h: "c", cpp: "cpp", cs: "csharp", php: "php", sh: "bash", md: "markdown", json: "json", yml: "yaml", yaml: "yaml", toml: "toml", html: "html", css: "css", scss: "scss", sql: "sql", vue: "vue", svelte: "svelte" };
const SKIP_FILES = /(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb|Cargo\.lock|poetry\.lock|composer\.lock|.*\.min\.(js|css)|.*\.map)$/;
const SKIP_EXT = /\.(png|jpe?g|gif|webp|ico|svg|pdf|zip|gz|tgz|mp4|mp3|wav|woff2?|ttf|otf|eot|exe|dll|so|dylib|bin|wasm|lockb)$/i;
const estimateTokens = (s) => Math.ceil(s.length / 4);

function tree(files) {
  const root = {};
  for (const f of files) { let n = root; for (const part of f.split("/")) n = n[part] ??= {}; }
  const lines = [];
  (function rec(n, pre) {
    const ks = Object.keys(n).sort((a, b) => (Object.keys(n[b]).length > 0) - (Object.keys(n[a]).length > 0) || a.localeCompare(b));
    ks.forEach((k, i) => { const last = i === ks.length - 1, dir = Object.keys(n[k]).length > 0; lines.push(`${pre}${last ? "└── " : "├── "}${k}${dir ? "/" : ""}`); if (dir) rec(n[k], pre + (last ? "    " : "│   ")); });
  })(root, "");
  return lines.join("\n");
}

function collect(root, opts = {}) {
  const { include = [], exclude = [], maxBytes = 200 * 1024, gitignore = true } = opts;
  const inc = include.length ? parseIgnore(include.join("\n")) : null, exc = parseIgnore(exclude.join("\n"));
  const files = [], skipped = [];
  for (const rel of walk(root, { useGitignore: gitignore })) {
    if (inc && !ignored(rel, false, inc)) continue;
    if (ignored(rel, false, exc)) { skipped.push({ path: rel, reason: "excluded" }); continue; }
    if (SKIP_FILES.test(rel) || SKIP_EXT.test(rel)) { skipped.push({ path: rel, reason: "binary/lockfile" }); continue; }
    const abs = path.join(root, rel), size = fs.statSync(abs).size;
    if (size > maxBytes) { skipped.push({ path: rel, reason: `>${Math.round(maxBytes / 1024)} KB` }); continue; }
    const buf = fs.readFileSync(abs);
    if (isBinary(buf)) { skipped.push({ path: rel, reason: "binary" }); continue; }
    const content = buf.toString("utf8");
    files.push({ path: rel, content, size, tokens: estimateTokens(content) });
  }
  return { files, skipped };
}

function render({ files }, { format = "markdown", title = "Repository", instructions = "" } = {}) {
  const t = tree(files.map((f) => f.path));
  if (format === "xml") {
    return [`<repository name="${title}">`, instructions ? `<instructions>\n${instructions}\n</instructions>` : "", `<tree>\n${t}\n</tree>`, ...files.map((f) => `<file path="${f.path}">\n${f.content.replace(/\n$/, "")}\n</file>`), `</repository>`].filter(Boolean).join("\n\n") + "\n";
  }
  const fence = (s) => (s.includes("```") ? "````" : "```");
  return [`# ${title}`, instructions ? `## Instructions\n\n${instructions}` : "", `## File tree\n\n\`\`\`\n${t}\n\`\`\``, `## Files`, ...files.map((f) => { const ext = f.path.split(".").pop().toLowerCase(), F = fence(f.content); return `### ${f.path}\n\n${F}${LANG[ext] || ""}\n${f.content.replace(/\n$/, "")}\n${F}`; })].filter(Boolean).join("\n\n") + "\n";
}

module.exports = { collect, render, tree, estimateTokens };
