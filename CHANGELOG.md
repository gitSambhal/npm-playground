# Changelog

All notable changes to **NPM Package Playground** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.0] - 2026-09-04
### Added
- **Dynamic In-Browser ESM Dynamic Import Engine**: Test any npm package instantly without a backend or build step using modern ESM CDNs (`esm.sh`, `jsdelivr`, `unpkg`).
- **Live NPM Package Registry Search**: Instant search with suggestions, trending packages, keyword tags, and direct package name lookup.
- **Intelligent Auto-Suggest Code Functions**:
  - Live introspection of imported module exports (functions, classes, constants, helpers).
  - Auto-generated executable test snippets for any arbitrary npm package.
  - Curated high-quality functional templates for top popular npm packages (`lodash`, `date-fns`, `axios`, `zod`, `mathjs`, `nanoid`, `chroma-js`, `fuse.js`, `canvas-confetti`, `dayjs`, `uuid`, etc.).
- **Rich Sandboxed Interactive Console**:
  - Intercepts and colorizes `console.log`, `console.info`, `console.warn`, `console.error`, and structured `console.table`.
  - DOM mounting preview stage (`#preview-stage`) for libraries that render UI or Canvas (e.g., `canvas-confetti`, charts, graphics).
  - High-precision execution timer, micro-benchmark metrics, and memory snapshot.
- **Package Details & Metadata**:
  - Live version selector, bundle size estimates, license, dependency count, npm link, and GitHub repository links.
  - Integrated README viewer tab to read documentation alongside test scripts.
- **Developer Experience**:
  - Syntax-highlighted code editor with line numbers, template resets, snippet insertion, and auto-formatting.
  - Dark / Light mode toggle with smooth visual transitions and `localStorage` persistence.
  - Toast feedback system, destructive action confirmations, and PWA offline capability.
  - Mandatory developer attribution for **Suhail Akhtar** ([suhail.top](https://suhail.top)).
