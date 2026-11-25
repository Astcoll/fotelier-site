# fotelier.app — design and build spec (v3, "Light table + gallery")

For Codex (GPT-6.2 Sol, High). Visual reference: Claude Design canvas "fotelier.app website design", artboards **"v3 · Light table + gallery"** (desktop) and **"v3 · phone 390"**: https://claude.ai/artifact/9G8FE938w2CEN1n7bzD7Li. Its markup and logic are in the canvas file `project/Gallery3.dc.html`; port its behaviour to vanilla JS. This file wins if they disagree. v1 and v2 on the canvas are history only.

## Concept
A dark gallery after hours. A warm lamp follows the visitor's mouse. In Hall 1 a glowing light table holds a contact sheet: one set of five photos. Change the look once and a yellow grease-pencil stroke sweeps across the sheet while every frame changes together — Fotelier's pitch, "one look for the whole set", acted out. Hall 2 hangs next week's set under picture lights with the same recipe. Hall 3 is a collage. The beta is the exhibition's opening, with an invitation card.

## Hard constraints
- Static GitHub Pages. Files: `index.html`, `privacy/index.html`, `support/index.html`, `assets/site.css`, `assets/site.js`; keep `CNAME` (`fotelier.app`) and `.nojekyll`.
- Vanilla HTML/CSS/JS. No framework, library, build step, analytics, cookies, localStorage/sessionStorage, or third-party scripts. Only network: fonts.googleapis.com / fonts.gstatic.com.
- `site.js` ≤ 12 kB unminified. Animate only `transform`, `opacity`, `filter`. No `scroll` listeners. No layout reads in pointer/input handlers. CLS 0 from any control.
- Works at 320 px with touch, by keyboard alone, with VoiceOver, with `prefers-reduced-motion: reduce`, and with JavaScript off.
- Privacy and Support policy text is copied **word for word** from the current pages (including the beta paragraph from commit 01f48ce). Only the surrounding layout changes.
- Photos are CSS-drawn placeholders for now (table below). Build them so each scene can later be swapped for a real `<img>` (WebP ≤ 70 kB, 600 px wide) of Jason's photos without changing the JS.

## Tokens
| Token | Value | Use |
|---|---|---|
| wall | #0F0F15 | page background |
| wall-2 | rgba(255,255,255,.025) | Hall 2 band (translucent so the lamp still shows) |
| panel | #1C1C23 | control console |
| raised | #24242C (hover #27272E) | unselected recipe buttons |
| line | #2A2A33 | decorative rules only |
| chip-border | #6E6E80 | control borders (3:1 non-text) |
| text | #F7F7FA | main text on dark |
| soft | #BBBBCC | secondary text |
| label | #9898AC | mono labels and nav |
| table | #FBF8F0 | light table / contact sheet |
| paper | #F4F1EA | collage mat, invitation card |
| mat / instant | #FFFFFF / #F6F2E9 | print frames |
| ink / ink-body / ink-muted | #121212 / #3A3A40 / #55555F | text on paper and yellow |
| yellow | #FFE14D | selected chips, "whole set.", grease pencil, focus ring on dark |
| blue | #2B3CFF | invitation button, focus ring on paper; never text on dark |
| accent | #ADB6FF | inline links on dark |
| pink | #FFB3D4 | "Free beta" seal only |
Contrast (computed): text/wall 17.9, soft/wall 10.1, label/wall 6.8, label/panel 6.0, ink/yellow 14.4, ink-muted/paper 6.5, white/blue 6.6, chip-border/wall 3.8. Keep the lamp BEHIND content (z-index below sections) so it never lowers text contrast.

Fonts (one link): `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500;600&display=swap`
| Role | Font | Size | LH / tracking |
|---|---|---|---|
| H1 | Bricolage 800 | clamp(44px, 6vw, 88px) (keeps the light table above the fold at 1440×900) | .94 / -0.035em |
| H2 | Bricolage 800 | clamp(2.125rem, 1.429rem + 2.857vw, 4rem) | 1 / -0.03em |
| Rule statement | Bricolage 800 | clamp(1.5rem, 1.221rem + 1.143vw, 2.25rem) | 1.1 / -0.02em |
| Header wordmark | Bricolage 800, lowercase `fotelier` | 28px | -0.03em |
| Lead | Inter 400 | clamp(1.0625rem, 1.016rem + .19vw, 1.1875rem) | 1.55 |
| Body | Inter 400 | 1rem–1.0625rem | 1.6 |
| Eyebrows / hall labels | JetBrains Mono 600 uppercase | 12px everywhere | .12em |
| Placards | JetBrains Mono, 12px; line 1 600 ink, line 2 400 ink-muted | | .06em |
| Chips | Inter 600 15px, pill, min-height 44px | | |

## Lighting
- **Lamp**: one `position:fixed` 1120×1120 div, `pointer-events:none`, z-index under content, background `radial-gradient(circle 560px at 50% 50%, rgba(255,232,190,.085) 0, rgba(255,232,190,.035) 40%, transparent 72%)`. On `pointermove` with `pointerType==='mouse'`, store clientX/Y; in rAF ease `x += (tx-x)*.18` and set `transform: translate3d(x-560px, y-560px, 0)`. Default centre (70vw, 260px), the same in CSS and JS so it doesn't jump. Wrap it in a fixed `inset:0; overflow:hidden` layer. Attach only when `(hover: hover) and (pointer: fine)` and reduced motion is off; re-check both via `matchMedia` change events. Make the easing time-based (same feel at 60 and 120 Hz).
- **Wall texture**: `body::before` fixed full-screen, opacity .035, SVG fractal-noise data URI (feTurbulence baseFrequency .85, numOctaves 2, desaturated).
- **Print shadow**: `0 1px 1px rgba(0,0,0,.4), 0 6px 12px -2px rgba(0,0,0,.45), 0 22px 40px -10px rgba(0,0,0,.65)`; paper frames add `inset 0 0 0 1px rgba(0,0,0,.06)`; scenes `outline:1px solid rgba(0,0,0,.1); outline-offset:-1px`.
- **Light table glow**: `box-shadow: 0 0 0 1px rgba(255,240,200,.35), 0 0 90px rgba(255,236,190,.22), 0 40px 90px rgba(0,0,0,.6)`, radius 6px.
- **Picture lights (Hall 2)**: `.print` gets a 2px lamp arm, a 44%-wide lamp head (`::before`) and a warm pool (`::after`, radial ellipse rgba(255,226,170,.22)); exact CSS is in the canvas helmet. No text inside the pool.

## Prints (placeholders)
Each scene: sky background, sun circle (left/top/size % of width, round), land band (height %), all `position:absolute` inside an `overflow:hidden` box.
| No. | Title | Sky | Sun | Land |
|---|---|---|---|---|
| 01 | Harbour | linear-gradient(180deg,#E07B5F,#F3A86B 55%,#FFD08A) | #FFE14D, 30/48/24, `box-shadow:0 0 0 6px rgba(255,241,168,.35)` | 34%, linear-gradient(180deg,#3C4A78,#1F2747) |
| 02 | Courtyard | linear-gradient(180deg,#9FB0FF,#DDE2FF) | #FFF6C7, 66/10/18 | 52%, radial-gradient(ellipse 20% 34% at 50% 100%,#6B3A4E 0 97%,transparent 100%),linear-gradient(180deg,#E9A3B8,#C97A93) |
| 03 | Field | linear-gradient(180deg,#C9DCCB,#F4ECC8) | #FFF2B0, 62/22/16 | 40%, linear-gradient(180deg,#8BA65A,#55702F); left/right -12%; border-radius 70% 50% 0 0 / 40% 30% 0 0 |
| 04 | Rooftop | linear-gradient(180deg,#2E3592,#7B63C9 55%,#FFB3D4) | #FFE9B8, 70/14/12 | 34%, #1B1B3A, clip-path polygon(0 45%,14% 45%,14% 18%,27% 18%,27% 52%,39% 52%,39% 0,51% 0,51% 34%,66% 34%,66% 14%,79% 14%,79% 48%,100% 48%,100% 100%,0 100%) |
| 05 | Coast | linear-gradient(180deg,#8EC9EC,#D4EEF8) | #FFE14D, 18/14/20 | 42%, linear-gradient(170deg,#2A7FA8,#1F6A8F 50%,#E9D3A3 50.5%) |

## State and looks
One object: `{ look:'warm', strength:70, frame:'mat', crop:'4:5', layout:'grid', comparing:false }`. `set(patch)` merges and schedules one rAF `render()` that writes only what changed: `body.dataset.frame/.crop/.layout`, `--look-filter`, `--tint`, `--r` on `body`, placard `textContent`, `aria-pressed` on `[data-set]` buttons, the sheet's `aria-label`, and a polite live region (debounced 400 ms). Event delegation: one `click` on `document` for `[data-set][data-value]` and `[data-recipe]`.

Looks use ONE filter chain so they animate (300 ms `filter` transition; none while dragging the slider or under reduced motion). k = strength/100 (0 for Original):
`sepia(S) grayscale(G) saturate(Sa) contrast(C) brightness(B) hue-rotate(H deg)`
| Look | S | G | Sa | C | B | H |
|---|---|---|---|---|---|---|
| Original | 0 | 0 | 1 | 1 | 1 | 0 |
| Warm | .6k | 0 | 1+.25k | 1+.05k | 1+.02k | -6k |
| Mono | 0 | k | 1 | 1+.2k | 1 | 0 |
| Fade | .08k | 0 | 1-.4k | 1-.3k | 1+.1k | 0 |
| Chrome | 0 | 0 | 1+.8k | 1+.22k | 1-.03k | 0 |
| Cool | 0 | 0 | 1-.12k | 1+.04k | 1+.02k | 0 |
Cool also shows a tint layer per scene: `background:#2B3CFF; mix-blend-mode:soft-light; opacity:.6k` (0 for other looks). Looks are website demos, not the app's look names — say so on the page.

Frames (wrapper around each scene): White `#FFF`, padding 10 10 34. Film strip `#121212`, padding 20 8, sprocket holes = two rows of ivory 5–6 px round holes on a 14 px repeat (`background-repeat: space no-repeat`) 6 px from top and bottom, so holes are always whole. Instant `#F6F2E9`, padding 10 10 48. No frame: no padding. Give the sheet a `min-height` for the tallest frame + crop so the console never moves.

Crops set `--r` (4:5 .8, 3:4 .75, 1:1 1, 1.91:1 1.91, 9:16 .5625). Scene: `width: calc(min(170px, 27vw) * min(1, var(--r))); aspect-ratio: var(--r)` (prints fit a fixed square, so landscape crops get shorter, not wider).

## Page, top to bottom (final copy)
- `<title>` `Fotelier — one look for the whole set`; meta description: `An iPhone photo editor for multi-photo posts. Put one frame and film look on a whole set, save it as a recipe, build collages. Free beta opens in December.`
1. **Header**: wordmark → `#top`. Below 640px hide the three hall links (keep the pill) so the header stays one row. Nav (mono 12px uppercase, soft): `Hall 1 · Batch` (#hall-1), `Hall 2 · Recipes` (#hall-2), `Hall 3 · Collage` (#hall-3), yellow pill `Join the beta` (#opening). Anchors get `scroll-margin-top: 24px`; smooth scroll only when reduced motion is off.
2. **Hero**: eyebrow `Opening December 2026 · an iPhone photo editor`; H1 `One look for the whole set.` ("whole set." yellow); lead `Pick a frame and a film look once. Fotelier puts it on every photo in the set, so your post reads as one series.`
3. **Hall 1** (`#hall-1`): one mono H2 only: `Hall 1 · The light table · change the look once, every print follows` (no big heading or intro here; the hero already says it).
   - Light table (table colour): top row mono `Contact sheet · set 01` left, live `Warm 70% · White · 4:5` right. Five prints in a grid of FIXED square cells so nothing reflows when controls change: `--cell: clamp(88px, 15vw, 170px)`, `grid-template-columns: repeat(auto-fit, calc(var(--cell) + 20px)); justify-content: center`, each cell `height: calc(var(--cell) + 96px)` with the framed print centred; the scene is `width: calc(var(--cell) * min(1, var(--r))); aspect-ratio: var(--r)`. Placard under each print is only `01 Harbour` (the look label lives in the sheet's top-right meta, which wraps on phones). Phones get a 3+2 sheet. Note under the prints: `Looks here are a demo. The app has 30 film looks in 6 groups. Press and hold the sheet to see the originals.`
   - **Grease-pencil sweep**: an SVG path (`M10 70 C 180 20, 320 110, 500 60 S 820 20, 990 66`, `pathLength="100"`, `vector-effect="non-scaling-stroke"`, stroke #FFE14D, width 9, round caps, dasharray 100, starts invisible) across the middle of the sheet; on each look change run keyframes over 1.1 s: 0% dashoffset 100 opacity .85 → 60% dashoffset 0 opacity .85 → 100% opacity 0. It must never stay on the prints. Restart reliably (remove the class, force reflow once, add it — this one reflow per click is fine). Not shown under reduced motion.
   - **Console** (panel, radius 24, max-width 960): rows `Look` (Original, Warm, Mono, Fade, Chrome, Cool), `Frame` (White, Film strip, Instant, No frame), `Crop` (4:5, 3:4, 1:1, 1.91:1, 9:16), `Strength` (labelled range 0–100, `input` event adds `.scrub` (no filter/tint transition), `change` and blur remove it; `<output>` min-width 9ch; `aria-valuetext="70%"`; set `el.disabled` as a property when look is Original, output shows `Original`) and a `Hold to compare` button. Each row is `role="group"` with `aria-labelledby` its label; lay rows out as `display:grid; grid-template-columns: 88px 1fr` so wrapped chips align. Console max-width matches the sheet.
   - **Hold to compare**: primary-button pointerdown (`e.button === 0`) on the button or the sheet starts a 200 ms timer, cancelled if the pointer moves > 8 px (so scrolling never flashes); when it fires add `body.comparing` (filters and tint off, no transition, meta says `Showing originals`). End on pointerup/pointercancel/pointerleave, blur and `visibilitychange`. Keyboard: Space/Enter keydown (ignore `repeat`) starts, keyup ends. A plain click/tap on the button (no hold) TOGGLES compare, so screen readers can use it. Sheet and button get `-webkit-touch-callout:none; user-select:none`; prevent `contextmenu` on them.
4. **Hall 2** (`#hall-2`, wall-2 band with a top line): label `Hall 2 · Recipes`; H2 `Save the look. Use it on the next set.`; body `A recipe is a saved frame and look. Apply it to one photo or a whole batch, and next week's post matches this week's.` Three recipe buttons (radius 14, min-height 56, name left, mono detail right, real space between): `Golden hour` `Instant · Warm 80%`; `Night walk` `Film strip · Mono 90%`; `Seaside` `White · Fade 60%`. A recipe sets look+strength+frame site-wide (intended: it overwrites the Hall 1 choices; crop stays) and is pressed only while the state matches exactly. Right: three prints hung under picture lights (use prints 04, 05, 01 for now; three new scenes later), gap clamp(12px, 2vw, 22px), with the current state; caption `Next week's set · same recipe`.
5. **Hall 3** (`#hall-3`, columns `align-items: flex-start` so the chips never move when the collage changes height): label `Hall 3 · Collage`; H2 `Up to 16 photos on one wall.`; body `Pick a shape and a layout, then pinch and drag each photo into place. The look you chose covers every tile.`; chips `2 × 2`, `Strip of 4`, `1 + 3`. Paper-matted collage (padding 14, width min(440px,100%)) of prints 01, 02, 03, 05; grid gap 8; apply the filter once to the grid: 2×2 = 2×2 tracks, aspect-ratio 5/4; Strip = 4 columns, aspect-ratio 2.4 (cells ≈ 9:16); 1+3 = 3×3 tracks, aspect-ratio 1.1, first cell spans 3 columns × 2 rows. Animate layout changes with a 250 ms FLIP on `transform` (skip under reduced motion).
6. **Museum rule** (lines above and below): mono `Museum rule`; statement `Your photos never leave the building.`; mono `Edits happen on your iPhone · nothing uploaded · no account · no ads · no tracking`.
7. **Opening** (`#opening`): paper invitation card (max 640px, padding 56 40 48, centred), pink round seal top-right rotated 12° `Free beta` (decorative, aria-hidden), eyebrow `You are invited · Beta opening · December 2026`, a visually hidden H2 `Join the beta`, then the wordmark `fotelier` as decorative text (aria-hidden, clamp 44–72px), seal at top -38px right 20px, card side padding clamp(24px, 6vw, 40px), text `The beta is free. Email us your iPhone model and we'll send an install link when invites go out in December.`, blue pill `Request an invitation`, note `Opens your email app. Or write to support@fotelier.app.` Focus rings on paper are blue.
   - Mailto: `mailto:support@fotelier.app?subject=Fotelier%20beta%20invitation&body=Please%20add%20me%20to%20the%20Fotelier%20beta.%0D%0A%0D%0AMy%20iPhone%20model%3A%20%0D%0A%0D%0AWhat%20I%20post%20(optional)%3A%20` (escape `&` as `&amp;` in HTML). Never use Apple's TestFlight name or logo as a badge.
8. **Footer**: `fotelier · an iPhone photo editor · © 2026 Jason Xian`; links `Privacy policy`, `Support`, `support@fotelier.app`.

## Privacy and Support pages
Same wall, header, footer, no lamp. Text in a 680px column on a `#16161A` panel (radius 24, padding 40). Privacy: eyebrow `Museum rule · Effective November 22, 2026`, H1 `Privacy policy`. Support: eyebrow `Front desk`, H1 `Support`. Then the existing text word for word (Inter 600 22px headings where the page has headings). Titles `Fotelier privacy policy`, `Fotelier support`.

## JavaScript off
All demo controls ship with `disabled` in HTML; `site.js` removes it at startup. `<noscript>` shows `The controls need JavaScript. The prints show Warm at 70%.` Defaults (Warm 70, White, 4:5, 2×2) are baked into CSS.

## Accessibility
Wrap hero-to-opening in `<main>`. Live region announces only Look/Frame/Crop/recipe changes, debounced 400 ms (never slider steps or compare). Real `<button>`s with `aria-pressed="true|false"` (always set, as strings). Sheet `role="img"` with a live `aria-label` (`Five demo photos, all with Warm 70% · White, cropped 4:5`). Focus ring 2px yellow on dark, blue on paper, offset 3px. Touch targets ≥ 44px. `<html lang="en">`. No hover-only features.

## Later, only if time allows
Eyedropper loupe: a `Pick from photo` toggle in the Frame row; drag a 96px loupe over a print (3× magnified clone), release to set a custom border colour from the touched area; Esc cancels; plus `<input type="color">` as the keyboard path. Cut it if the build runs long.

## Acceptance (report each)
1. Screenshots of all three pages at 390 and 1440 px; no horizontal scroll; matches the canvas.
2. Every control works by mouse, touch (iOS Safari) and keyboard; recipes update all three halls; Warm→Mono animates; no transition while scrubbing; console never moves when frame/crop change.
3. Reduced motion: no transitions, sweep, FLIP or smooth scroll; lamp fixed. JS off: defaults visible, controls disabled, note shown.
4. VoiceOver: chips read as toggle buttons with pressed state; slider reads "70%"; one status message per change.
5. Policy wording unchanged (`git diff --word-diff`).
6. Network tab: only Google Fonts. Application tab: no storage, no cookies. Performance: no forced reflow in pointermove/input handlers.
7. One commit `Redesign fotelier.app as the light-table gallery`. Do not push until Jason approves.
