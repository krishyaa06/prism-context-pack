const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { collect, render, tree } = require("../src");
const { parseIgnore, ignored } = require("../src/walk");

function fixture() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ctx-"));
  const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(d, p)), { recursive: true }); fs.writeFileSync(path.join(d, p), s); };
  w("src/a.js", "const a = 1;\n"); w("src/b.ts", "export const b = 2;\n"); w("README.md", "# hi\n```js\nx\n```\n");
  w("node_modules/x/index.js", "nope"); w("logs/app.log", "nope"); w(".gitignore", "logs/\n*.secret\n"); w("key.secret", "nope");
  w("package-lock.json", "{}"); w("img.png", "\x00\x01"); w("bin.dat", Buffer.from([0, 1, 2]));
  return d;
}
test("gitignore rules", () => {
  const r = parseIgnore("dist/\n*.log\n!keep.log\n/root.txt\nsrc/**/gen");
  assert.ok(ignored("dist", true, r)); assert.ok(!ignored("dist", false, r));
  assert.ok(ignored("a/b.log", false, r)); assert.ok(!ignored("keep.log", false, r));
  assert.ok(ignored("root.txt", false, r)); assert.ok(!ignored("x/root.txt", false, r));
  assert.ok(ignored("src/a/b/gen", true, r));
});
test("collect respects ignores and skips binaries/lockfiles", () => {
  const { files, skipped } = collect(fixture());
  assert.deepEqual(files.map((f) => f.path), [".gitignore", "README.md", "src/a.js", "src/b.ts"]);
  assert.ok(skipped.some((s) => s.path === "bin.dat" && s.reason === "binary"));
  assert.ok(skipped.some((s) => s.path === "package-lock.json"));
});
test("include/exclude", () => {
  const d = fixture();
  assert.deepEqual(collect(d, { include: ["src/**"] }).files.map((f) => f.path), ["src/a.js", "src/b.ts"]);
  assert.deepEqual(collect(d, { include: ["src/**"], exclude: ["*.ts"] }).files.map((f) => f.path), ["src/a.js"]);
});
test("render markdown uses safe fences + xml", () => {
  const res = collect(fixture(), { include: ["README.md", "src/a.js"] });
  const md = render(res, { title: "demo", instructions: "Review" });
  assert.match(md, /^# demo\n\n## Instructions\n\nReview/);
  assert.match(md, /### README\.md\n\n````markdown\n# hi/);
  assert.match(md, /### src\/a\.js\n\n```javascript\nconst a = 1;\n```/);
  assert.match(render(res, { format: "xml" }), /<file path="src\/a\.js">\nconst a = 1;\n<\/file>/);
});
test("tree", () => { assert.equal(tree(["a/b.js", "a/c/d.js", "z.md"]), "├── a/\n│   ├── c/\n│   │   └── d.js\n│   └── b.js\n└── z.md"); });
test("cli --stats and -o", () => {
  const d = fixture(), bin = path.join(__dirname, "../bin/ctxpack.js");
  assert.match(execFileSync("node", [bin, d, "--stats"], { encoding: "utf8" }), /4 files/);
  const out = path.join(d, "out.md"); execFileSync("node", [bin, d, "-o", out], { stdio: "ignore" });
  assert.match(fs.readFileSync(out, "utf8"), /## File tree/);
  assert.throws(() => execFileSync("node", [bin, d, "-f", "yaml"], { stdio: "ignore" }));
});
