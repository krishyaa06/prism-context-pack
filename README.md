<!-- ═════════════ HEADER ═════════════ -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:07060f,50:00D2FF,100:6C63FF&height=200&section=header&text=Prism%20Context%20Pack&fontSize=48&fontColor=ffffff&animation=fadeIn&fontAlignY=36&desc=Repo%20%E2%86%92%20one%20LLM-ready%20prompt&descAlignY=58&descSize=16" width="100%" alt="Prism Context Pack" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=800&color=00D2FF&center=true&vCenter=true&width=680&lines=ctxpack+.+--copy;~12%2C480+tokens+packed;Markdown+or+XML;Respects+.gitignore" alt="Typing SVG" />
</p>

<p align="center">
  <a href="https://github.com/krishyaa06/prism-context-pack/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/krishyaa06/prism-context-pack/ci.yml?branch=main&style=for-the-badge&label=CI&logo=githubactions&logoColor=white" alt="CI" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A518.17-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/dependencies-0-00D2FF?style=for-the-badge" alt="Zero dependencies" />
  <a href="LICENSE"><img src="https://img.shields.io/github/license/krishyaa06/prism-context-pack?style=for-the-badge&color=6C63FF" alt="License" /></a>
</p>

<p align="center">
  <img src="assets/screenshots/demo.png" width="90%" alt="Prism Context Pack screenshot" />
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/aqua.png" width="100%" />

## ⚡ Overview

**Prism Context Pack** (`ctxpack`) turns a project folder into one prompt you can paste into ChatGPT, Claude, Gemini or any agent. It walks the repo while respecting `.gitignore`, skips `node_modules`, build output, binaries, images and lockfiles, and writes a file tree followed by every file in a fenced block (or XML tags). `--stats` shows which files use the most tokens and how much of each model's context window the pack fills.

## ✨ Features

- **.gitignore-aware** walker with built-in ignores (`node_modules`, `dist`, `.next`, `.git`, venvs…)
- Skips **binaries, images, lockfiles, minified files** and files over `--max-kb`
- **Markdown** (safe nested fences + language tags) or **XML** output
- `--include` / `--exclude` globs, `--prompt` instructions at the top
- `--stats`: token breakdown per file + context-window fit
- `--copy` to clipboard (pbcopy / wl-copy / xclip / clip), zero dependencies

## 🚀 Quick Start

```bash
# run without installing
npx github:krishyaa06/prism-context-pack . --stats

# or install globally
npm install -g github:krishyaa06/prism-context-pack
ctxpack . -o context.md
```

Requires Node.js 18.17+. No dependencies.

## 🛠️ Usage

```text
ctxpack [dir] [options]

  -o, --out <file>        write to a file (default: stdout)
  -f, --format <fmt>      markdown | xml
  -i, --include <glob>    only include matching paths (repeatable)
  -x, --exclude <glob>    exclude matching paths (repeatable)
  -m, --max-kb <n>        skip files larger than n KB (default: 200)
  -p, --prompt <text>     add instructions at the top
      --copy              copy result to the clipboard
      --stats             token breakdown instead of the pack
      --no-gitignore      don't respect .gitignore
```

```bash
ctxpack . -o context.md
ctxpack src -i "**/*.ts" --stats
ctxpack . -x "test/**" -p "Find bugs in this code" --copy
```

## 📁 Project Structure

```
prism-context-pack/
├── assets/
│   ├── logo.png
│   └── logo.svg
├── bin/
│   └── ctxpack.js   # CLI entry
├── examples/
│   └── demo-app/
│       ├── src/
│       │   ├── router.js
│       │   └── server.js
│       ├── test/
│       │   └── router.test.js
│       ├── .gitignore
│       └── README.md
├── src/
│   ├── index.js   # collect + render
│   ├── ui.js   # colours, tables
│   └── walk.js   # gitignore-aware walker
├── test/
│   └── ctxpack.test.js
├── .gitignore
├── LICENSE
└── package.json
```

## 🧪 Tests

```bash
npm test
```

Tests use the built-in `node:test` runner, so there is nothing to install. CI runs them on Node 20 and 22.

## 🤝 Contributing

1. Fork the repo and create a branch: `git checkout -b feature/my-idea`
2. Make your change and add a test in `test/`
3. Run `npm test` and open a Pull Request

## 🔷 Part of Prism Protocol

Prism Context Pack is one of the open-source tools built by [Prism Protocol](https://dc.gg/prismprotocol), a tech community where young builders learn, ship and compete together.

## 👤 Author

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/krishyaa06"><img src="https://github.com/krishyaa06.png" width="90" style="border-radius:50%" /><br><b>Soumya Bhandare</b></a><br>
      <sub>Founder @ Prism Protocol</sub>
    </td>
    <td>
      <a href="https://dc.gg/prismprotocol"><img src="https://img.shields.io/badge/Discord-Prism%20Protocol-5865F2?style=for-the-badge&logo=discord&logoColor=white" /></a><br>
      <a href="https://instagram.com/prism_protocol_"><img src="https://img.shields.io/badge/Instagram-@prism__protocol__-E4405F?style=for-the-badge&logo=instagram&logoColor=white" /></a><br>
      <a href="https://x.com/krishyaa06"><img src="https://img.shields.io/badge/X-@krishyaa06-000000?style=for-the-badge&logo=x&logoColor=white" /></a>
    </td>
  </tr>
</table>

## 📄 License

Released under the [MIT License](LICENSE).

<p align="center">
  <b>If you like this project, consider giving it a ⭐</b><br>
  <sub>"Build. Create. Compete." · Made with ⚡ by Prism Protocol</sub>
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6C63FF,50:00D2FF,100:07060f&height=110&section=footer" width="100%" />
