# Agent Instructions for Portfolio Project

**Project**: Interactive French portfolio website with terminal-themed design for Londé Balossa Lotus Espoir (BTS SIO student).

---

## Quick Start

This is a **single-page application** with:
- **3 files**: `index.html` (structure), `script.js` (navigation + game), `style.css` (theming)
- **No build step** — open `index.html` in a browser to run
- **Navigation pattern**: Sidebar triggers `goTo(sectionId, subId)` which swaps visible sections
- **Language**: French UI throughout
- **Design**: Cyberpunk terminal aesthetic with cyan accent (#33e6cc)

---

## Architecture Overview

### HTML Structure
- **Sidebar** (`.sidebar`): Fixed navigation with tree items + collapsible groups
  - Data attributes drive navigation: `data-section`, `data-sub`
  - Icons use emoji (🏠, 👤, 🏢, 🛠️, etc.)
  
- **Main content** (`.terminal`): Terminal-styled container with sections
  - Each major section is a `<section id="...">` with class `.section`
  - Subsections use **subtabs pattern**: `.subtabs` (tab list) + `.subpanels` (content)
  - Only `.section.active` and `.subpanel.active` are visible

### Key Sections
1. **home**: Welcome message
2. **apropos**: About student, career goals, challenges
3. **alternance**: Internship at Transdev (4 subsections: Arrival, Team, Mentor, Company)
4. **projets**: Major project "Refresh Réseau Crystal" with nested subsections (overview, architecture, planning, risks, role)
5. **certifications**: 8 certification categories (networking, systems, cloud, security, DevOps, ITSM, tools, other)
6. **veille**: Technology watch with RSS carousel (feeds Hacker News & Transdev news)
7. **contact**: Contact section (template available)
8. **jeu**: Dino game ("ESPOIR RUN") — sprite-less canvas game using keyboard/pointer input

---

## JavaScript Conventions

### Core Navigation Functions

```javascript
// Navigate to a section with optional subsection
goTo(sectionId, subId = null)
  - Activates section, syncs sidebar highlight, applies background class
  - Pauses/resumes game automatically
  - Closes mobile menu on narrow screens

// Activate subtab within a section
activateSubtab(sectionEl, subId)
  - Removes active from all tabs/panels, adds to target

// Open/close tree group
setTreeOpen(parentLi, open)
  - Animates max-height from 0 to scrollHeight (0.25s transition)
  - Sets aria-expanded for accessibility

// Sync sidebar visual state
syncSidebarTree(sectionId, subId)
  - Highlights active menu items, opens parent groups
```

### Helper Selectors
```javascript
const $  = (s, r=document) => r.querySelector(s);        // Single element
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s)); // All elements
```

### Subtabs System
**Pattern**: Every expandable section has this structure:
```html
<nav class="subtabs"><ul><li data-sub="id1">Tab 1</li>...</ul></nav>
<div class="subpanels">
  <div id="id1" class="subpanel active">Content 1</div>
  ...
</div>
```
**Init**: Call `initSubtabs(sectionId)` for each section needing tabs (done at load: alternance, certifications, projets, veille)

### Game (`dinoGame` object)
- Canvas-based, no sprites
- Keyboard (Space/Arrow Up) or pointer input to jump
- Score progression: obstacles labeled with school grades (CP–Terminale)
- Difficulty modal for level selection
- Methods: `start()`, `pause()`, `resume()`, `reset()`

### RSS & Carousel
- **Feed sources**: Hacker News (security/tech) + Transdev news
- **API**: `api.rss2json.com` and `api.allorigins.win` (CORS proxy)
- **Function**: `loadTransdevRSS()` + `initCarousel(track, dotsContainer)`
- Elements: `#rss-carousel` (track), `#rss-dots` (indicators), `.carousel-btn` (prev/next)

---

## CSS Architecture

### CSS Custom Properties
```css
:root {
  --sidebar-w: 240px;      /* Sidebar width */
  --accent: #33e6cc;       /* Cyan highlights */
  --text: #e0fffb;         /* Light cyan text */
  --bg: #000;              /* Black background */
  --panel: #050608;        /* Slightly lighter bg for panels */
}
```

### Key Classes

| Class | Purpose |
|-------|---------|
| `.sidebar` | Fixed left nav (0–240px) |
| `.terminal` | Main content area (starts at 241px) |
| `.section` | Major content section; only `.active` shown |
| `.subtabs` | Tab navigation list |
| `.subpanel` | Subsection content; only `.active` shown |
| `.card` | Content wrapper with padding & border |
| `.tree-children` | Collapsible menu group (animated) |
| `.tree-item` | Individual menu item in tree |
| `.has-children` | Parent menu item (has caret icon) |
| `bg-home`, `bg-alternance`, etc. | Dynamic background image applied to `<body>` |

### Animations
- **Sidebar hover**: `translateX(5px)` + subtle highlight
- **Tree expand/collapse**: `max-height` 0.25s ease + opacity
- **Background switch**: `transition: background 0.6s ease`

### Responsive Design
- **Mobile breakpoint**: 600px (`.burger-btn` visible, sidebar slides out)
- **Sidebar**: `position: fixed` (always on desktop, overlay on mobile)
- **Burger menu**: Toggles `.sidebar.open` and `.mobile-overlay.active`

---

## How to Add Features

### Add a New Section
1. Create `<section id="new-section" class="section">` in HTML
2. Add sidebar menu item: `<li data-section="new-section">📌 Label</li>`
3. Add to `goTo()` body.classList background cleanup (optional background image)
4. Call `goTo("new-section")` from navigation events

### Add Subsections (Subtabs)
1. Create subtabs structure in section:
```html
<nav class="subtabs"><ul>
  <li class="active" data-sub="sub1">Tab 1</li>
  <li data-sub="sub2">Tab 2</li>
</ul></nav>
<div class="subpanels">
  <div id="sub1" class="subpanel active">Content 1</div>
  <div id="sub2" class="subpanel">Content 2</div>
</div>
```
2. Call `initSubtabs("section-id")` in DOMContentLoaded

### Add Tree Items (Collapsible Menu)
1. Create parent list item with `.has-children`:
```html
<li class="has-children" data-section="section-id" aria-expanded="false">
  <span class="caret"></span><span class="label">🏢 Menu Group</span>
  <ul class="tree-children">
    <li class="tree-item" data-section="..." data-sub="...">• Item</li>
  </ul>
</li>
```
2. Sidebar click handler auto-manages open/close + navigation

### Modify Content
- Edit section HTML directly in `<section>` blocks
- Use `.card` divs for consistent styling
- Add links with target="_blank" rel="noopener" for external URLs

---

## Common Patterns

### Data Attributes for Navigation
```html
<li data-section="alternance" data-sub="alt-tuteur">Mentor</li>
```
- `data-section`: Which main section to show
- `data-sub`: Which subsection (optional) to activate

### Accessibility
- `aria-expanded="true|false"` on collapsible groups
- `aria-disabled="true"` on non-clickable menu titles
- `aria-label="..."` on subtabs nav
- Links: `target="_blank" rel="noopener"` for external URLs

### Content Wrapping
```html
<div class="card">
  <h2>Title</h2>
  <p>Content</p>
  <ul><li>Items</li></ul>
</div>
```

---

## File Modification Notes

### HTML (`index.html`)
- Sections should remain within `<main class="terminal">`
- Add new sections before `</main>`
- Subtabs pattern is strict: `<nav class="subtabs">` must precede `<div class="subpanels">`

### CSS (`style.css`)
- Modify `--accent` or other CSS vars to change theme globally
- Mobile styles use media query (implicit from `.burger-btn` visibility)
- Background images would be applied via `body.bg-*` classes (currently not loaded)

### JavaScript (`script.js`)
- **Never remove**: `initSidebar()`, `initSubtabs()`, helper functions `$` and `$$`
- **Game**: `dinoGame` is auto-initialized; only call its methods from `goTo()`
- **RSS**: `loadTransdevRSS()` is optional; call on page load or in `veille` section
- **Event listeners**: All delegated through sidebar/subtabs init; add new nav via HTML data attributes

---

## Browser Compatibility
- **Required**: ES6 (arrow functions, const/let, template literals, optional chaining)
- **Canvas API**: For dino game
- **Fetch API**: For RSS feeds (with CORS proxies)
- **CSS**: CSS variables (custom properties), will-change, transitions

---

## Notes for AI Agents

1. **Navigation is data-driven**: Always use `data-section` and `data-sub` attributes; never hardcode section IDs in JS.
2. **Subtabs are context-local**: Changes in one section's tabs don't affect others; use `initSubtabs()` to add new tab groups.
3. **Game pauses on section change**: Don't manually pause—`goTo()` handles it.
4. **Mobile UX**: Always test burger menu logic at ≤600px viewport width.
5. **French content**: All UI labels are in French; maintain consistency with emoji icons and tone (professional but friendly).
6. **Links & citations**: External links are well-referenced; maintain this for credibility (especially Transdev content).
7. **Performance**: Sidebar tree animations use `will-change` for smoothness; don't add heavy effects to `.section` transitions.
8. **No build process**: This is vanilla JS/CSS/HTML; don't introduce bundlers unless explicitly requested.
