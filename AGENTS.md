# Agent Instructions for Portfolio Project

**Project**: Interactive French portfolio website for Londé Balossa Lotus Espoir (BTS SIO student), built as a component-based static site (no build step, no framework).

---

## Quick Start

- **No build step** — open `index.html` over **http(s)**, not `file://` (component loading uses `fetch`, which browsers block on `file://`). For local dev, serve the folder with any static server (e.g. VS Code "Live Server", `npx serve`, `python -m http.server`).
- **Entry point**: `index.html` is a thin shell — it only declares mount points and loads `js/main.js` as an ES module. All real markup lives in `components/*.html` and is injected at runtime.
- **Language**: French UI by default, with EN/中 switching via `js/language.js`.
- **Design**: Dark cyberpunk/network theme, teal accent `#00f5d4`, animated network-equipment canvas background.

---

## Architecture Overview

```
/index.html              shell: mount points + <link> stylesheets + js/main.js
/components/*.html       one HTML fragment per section (no <html>/<head>/<body>)
/css/*.css                one stylesheet per component + global.css (tokens/utilities, load first)
/js/*.js                  ES modules
/images/                  static assets (e.g. zerotrust-schema.jpg)
```

### Component loading (`js/main.js`)

- `COMPONENTS` is a `[name, mountId]` list. Each entry is fetched independently via `Promise.allSettled` — **one failing/missing component never blocks the others**.
- After all components settle, feature modules are initialised, each wrapped in its own `try/catch` (`safeInit`) — a bug in one module (e.g. the game) cannot break navigation or language switching.
- `initNetworkCanvas()` and `initNavigation()` (click delegation) run *immediately*, before components finish loading, since they don't depend on injected markup.

### Adding a new section
1. Create `components/<name>.html` with just the `<section id="...">...</section>` markup (no wrapper tags).
2. Add `['<name>', '<name>-mount']` to `COMPONENTS` in `js/main.js`.
3. Add `<div id="<name>-mount"></div>` in `index.html` at the right place (inside `<main>` if it's a scrolling section).
4. Add a matching `css/<name>.css` and `<link>` it in `index.html`'s `<head>`.
5. If the section has nav entries, add buttons with `data-nav="<name>"` in `components/header.html` / `components/navigation.html` (no `onclick` — see below).

---

## JavaScript Conventions

### No inline `onclick` — event delegation only
All interactivity is wired through **data attributes** + delegated `click` listeners attached once on `document` (in `js/navigation.js` / `js/projects.js`). This is required because markup is injected asynchronously — a listener attached to `document` works regardless of when its target appears.

| Attribute | Handled in | Effect |
|---|---|---|
| `data-nav="home"` | navigation.js | Smooth-scrolls to `#home`, closes mobile menu |
| `data-action="toggle-menu"` | navigation.js | Toggles `.mobile-menu.open` |
| `data-tab-group="alt"` `data-tab-id="arrivee"` | navigation.js | Generic tab switch: shows `#alt-arrivee` / `#alt-tab-arrivee` |
| `data-veille-panel="zt-news"` `data-veille-rss="true"` | navigation.js | Veille tab switch; the `rss` flag triggers `loadVeilleRSS()` |
| `data-blog-id="3"` | projects.js | Opens the blog modal for that article |
| `data-action="close-modal"` | projects.js | Closes the blog modal |

Never reintroduce `onclick="..."` in component HTML — add a `data-*` attribute and a case in the relevant delegated handler instead.

### Module responsibilities
- **`utils.js`** — `$` / `$$` query helpers (replaces the old `window.$` globals).
- **`language.js`** — `translations` object (fr/en/cn) + `initLanguage()`/`setLanguage()`. Must run *after* all components are in the DOM (it walks every `[data-i18n]` element).
- **`navigation.js`** — navbar, mobile menu, generic tab switching, scroll-spy, reveal-on-scroll. Imports `loadVeilleRSS` from `ui.js`.
- **`projects.js`** — `BLOGS` data array, blog grid rendering, blog article modal.
- **`ui.js`** — lightbox (schema gallery), RSS feed loading (with localStorage cache + dual CORS-proxy fallback), and the animated network-equipment background canvas.
- **`game.js`** — Dino SIO canvas game, exports `initGame()`. Already null-safe: if `#dino-canvas` isn't found (e.g. `components/game.html` failed to load), it returns no-op stubs instead of throwing.
- **`main.js`** — the only module loaded by `index.html`; orchestrates component loading + module init, owns the global Escape-key handler (closes whichever modal is open).

### Adding a new feature module
1. Export an `initX()` function — never auto-run side effects at module load time (everything is sequenced explicitly from `main.js`).
2. If it touches injected markup, call it from inside `bootstrap()` in `main.js`, after `Promise.allSettled(...)`, wrapped in `safeInit('label', initX)`.
3. If it works on always-present elements (like `#bg-canvas`), it can run immediately, before component loading.

---

## CSS Architecture

### Load order matters
`global.css` is linked first — it defines the `:root` custom properties (`--c`, `--bg`, `--border`, etc.) and shared utility classes (`.card`, `.grid-2/3`, `.tab-bar`, `.sec-title`, animations) that every other stylesheet depends on.

### Per-component responsive rules
Each component's stylesheet owns its **own** `@media` blocks for its own selectors (no single giant responsive.css) — when you touch a component's layout, its breakpoints are right there in the same file. `global.css` keeps the cross-cutting responsive rules (typography scale, tab-bar scroll behavior, table overflow, etc.).

### Key custom properties
```css
:root {
  --c: #00f5d4;        /* teal accent */
  --purple: #7b61ff;   /* secondary accent */
  --bg: #050b14;        /* page background */
  --card: rgba(10,17,34,.88);
  --border: rgba(0,245,212,.1);
  --nav-h: 64px;         /* navbar height, also overridden per breakpoint */
}
```

---

## Common Patterns

### i18n
```html
<p data-i18n="home.welcome">Fallback text shown until JS runs</p>
<p data-i18n-html="home.welcome">Use -html when the string contains markup (e.g. &lt;strong&gt;)</p>
```
Keys live in `translations.fr / .en / .cn` inside `js/language.js`.

### Tabs
```html
<div class="tab-bar">
  <button class="tab-btn active" id="alt-tab-arrivee" data-tab-group="alt" data-tab-id="arrivee">Tab 1</button>
</div>
<div class="tab-panel active" id="alt-arrivee">Content 1</div>
```
`switchTabs()` in `navigation.js` derives the panel/button id prefixes from `data-tab-group` automatically — no per-section JS needed.

---

## Browser Compatibility
- **Required**: ES modules (`<script type="module">`), `fetch`, `IntersectionObserver`, CSS custom properties.
- **Local testing must use http(s)** — `fetch()` of `components/*.html` is blocked by CORS when opening `index.html` via `file://`.
- GitHub Pages (`.github/workflows/static.yml`) deploys the repo root as-is — this works out of the box since GitHub Pages serves over https.
- All file paths are **case-sensitive** (GitHub Pages runs on Linux) — keep filenames/imports exactly matching the casing used in `components/`, `css/`, `js/`.

---

## Notes for AI Agents

1. **Never add `onclick="..."` to component HTML** — use `data-*` attributes and extend the delegated handler in `navigation.js` or `projects.js` instead.
2. **A missing/broken component must not break the rest of the page.** Keep `loadComponent()`'s try/catch and `safeInit()` wrapping intact when editing `main.js`.
3. **`language.js`, scroll-spy and reveal-on-scroll must run after components are injected** — don't move their init calls before `Promise.allSettled` in `main.js`.
4. **CSS lives next to the component it styles.** If you add a selector used only by `projects.html`, put it in `css/projects.css`, not `global.css`.
5. **No bundler, no transpiler.** Don't introduce build tooling unless explicitly requested — this project intentionally has zero install step.
