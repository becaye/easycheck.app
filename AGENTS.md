# AGENTS.md – easychecks-app

## Project Overview

Vite + TypeScript application for accessibility evaluation ("easy checks"). The root-level CSV/Excel files (`grille-reduite.xlsx`) contain accessibility criteria data that is expected to drive the UI. Vue 3, Pinia, and Vue Router are installed but **not yet wired up** — the current entry point (`src/main.ts`) uses vanilla DOM manipulation.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 8 |
| Language | TypeScript 6 (`"moduleResolution": "bundler"`) |
| UI (planned) | Vue 3 |
| State (planned) | Pinia 3 |
| Routing (planned) | Vue Router 5 |
| Testing | Vitest + @vue/test-utils (no test files yet) |

## Developer Workflows

```bash
npm run dev       # start dev server (HMR)
npm run build     # tsc type-check + vite build
npm run preview   # preview production build locally
```

No lint or test script is defined yet in `package.json`.

## TypeScript Conventions

The `tsconfig.json` enforces strict settings — respect them:

- `noUnusedLocals` / `noUnusedParameters`: remove or prefix with `_` any unused symbol.
- `verbatimModuleSyntax`: always use `import type` for type-only imports.
- `allowImportingTsExtensions`: import `.ts` files with their explicit extension (e.g. `import { setupCounter } from './counter.ts'`).
- `erasableSyntaxOnly`: avoid TypeScript-specific runtime syntax (e.g. `enum`, `namespace`).

## CSS Conventions

CSS lives in `src/style.css` — **no preprocessor**, native CSS nesting is used throughout:

```css
.counter {
  &:hover { border-color: var(--accent-border); }
}
```

Design tokens are defined as CSS custom properties in `:root` (see `src/style.css` lines 1-17) and overridden under `@media (prefers-color-scheme: dark)`. Always use these variables (`--accent`, `--border`, `--text-h`, etc.) rather than hard-coded values.

## Icon System

Icons are served as an SVG sprite at `public/icons.svg`. Reference icons with:

```html
<svg class="icon" role="presentation" aria-hidden="true">
  <use href="/icons.svg#icon-name"></use>
</svg>
```

## Key Files

| File | Purpose |
|---|---|
| `src/main.ts` | App entry point (currently vanilla DOM) |
| `src/counter.ts` | Example pattern for exported setup functions |
| `src/style.css` | All global styles + design tokens |
| `public/icons.svg` | SVG sprite for UI icons |
| `grille-reduite.xlsx` | Reduced evaluation grid |

## Migration Path to Vue

When adding Vue components, follow the installed toolchain:
- Use `@vitejs/plugin-vue` (already in devDependencies) in `vite.config.ts` (not yet created).
- State → Pinia stores in `src/stores/`.
- Routes → Vue Router in `src/router/`.
- Components → `src/components/`.

