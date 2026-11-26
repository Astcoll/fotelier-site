# fotelier.app — design and build spec (v4, "The Developing Room")

For the builder (Claude Code, Opus 5.5). Visual and behavioural reference: `design/Darkroom.dc.html` in this repo (a design-canvas component: HTML with `{{holes}}` filled by `renderVals()` in the class at the bottom; port it to plain HTML/CSS/JS, never ship its template syntax). Live canvas: https://claude.ai/artifact/9G8FE938w2CEN1n7bzD7Li (artboard "v4 · The Developing Room"). This file wins if they disagree. v1–v3 are superseded.

## Concept
The site is a darkroom and **scrolling is development time**. No buttons or chips anywhere: every interaction is a darkroom action that maps to a real app feature, and everything you can drag also advances by scrolling alone, so a visitor who only scrolls still sees the whole story.
| Darkroom action | App feature |
|---|---|
| A tray of prints develops at once | Batch editing: one look for the whole set |
| A film strip of looks pulled across the tray | 30 film looks in 6 groups (site shows 6 demo looks) |
| Press and hold a print | Hold to compare with the original |
| Enlarger easel blades | Instagram crops 4:5, 3:4, 1:1, 1.91:1, 9:16 |
| Matting room + loupe | Borders: white, film strip, instant, any colour, eyedropper from the photo |
| Wall label typing out | Camera info borders |
| Contact sheet | Collage up to 16 photos |
| The door closes | Privacy: edits on the iPhone, nothing uploaded, no account, no ads, no tracking |

## Hard constraints
- Static GitHub Pages: `index.html`, `privacy/index.html`, `support/index.html`, `assets/site.css`, `assets/site.js`, `assets/img/…`; keep `CNAME` (`fotelier.app`) and `.nojekyll`.
- Vanilla HTML/CSS/JS. **No libraries** (no GSAP, no Lenis: Lenis does nothing on iOS by default and caps Safari at 60/30 fps; GSAP runs on the main thread). No analytics, cookies or storage. Only network: Google Fonts.
- Do not invent prices, stats, testimonials or features. Pricing is undecided.
- Privacy and Support policy text copied **word for word** from the current pages (including the beta paragraph from commit 01f48ce).
- Budgets: own JS ≤ 12 kB gzipped; CSS ≤ 25 kB; above the fold ≤ 500 kB; LCP < 2.5 s; CLS < 0.05; ≤ 3 full-viewport animated layers at once; no permanent `will-change`; no `scroll` listeners.

## Identity ("Darkroom"; deliberately not the app's colours)
| Token | Hex | Role |
|---|---|---|
| bg | #0D0D0C | page |
| surface | #191917 | trays, mats, panels |
| hairline | #2E2D2A | dividers (decorative only) |
| text | #ECE9E2 | paper white |
| text-2 | #A3A099 | captions, EXIF lines |
| accent | #F0503A | safelight red: dot on the i, index line, link arrow, viewfinder brackets |
| signal | #7ED9A6 | fixer green: "House rule" label only |
| scrim | rgba(8,8,7,.72) | overlays |
Contrast (computed): text/bg 16.0, text-2/bg 7.5, accent/bg 5.5, signal/bg 11.5; all pass on surface too. Never use #2B3CFF, #FFE14D or #FFB3D4.

Fonts (one Google Fonts link): `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800&family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&display=swap`
| Role | Font | Size |
|---|---|---|
| Hero wordmark | Bricolage 700, -0.04em, `wdth` 75→100 on scroll | clamp(3.5rem, 0.157rem + 13.714vw, 12.5rem) |
| Display (closing lines) | Bricolage 700 | clamp(2.5rem, 0.829rem + 6.857vw, 7rem) |
| H2 | Bricolage 700, -0.03em | clamp(1.75rem, 1.1rem + 2.667vw, 3.5rem) |
| Body | Geist 400 | clamp(1rem, 0.93rem + 0.286vw, 1.1875rem) |
| Labels / EXIF | Geist Mono 400–500, uppercase, +0.1–0.14em | 12–14px |
- Wordmark `fotelier` (lowercase); the dot of the i is a small accent-red square (dotless ı + positioned square).
- Image framing: square corners, no shadows, no rounded cards. Prints sit on a surface mat with a 1px paper-white keyline (rgba(236,233,226,.5)) so the eye keeps a white reference on the dark surround.
- Grain: a 128 px tiled PNG (~5 kB) on a fixed `body::after`, opacity .05–.07, moved with `transform` in 4 steps over 0.8 s; static under reduced motion. No SVG feTurbulence or blend modes over the viewport.
- Interactive elements without buttons: text links with an arrow or index; hover/focus shows **viewfinder brackets** (four L corners in accent; see `.vf` in the reference); `:focus-visible` always also gets a 2px text-colour outline, offset 4px; every target ≥ 44px tall via padding.
- Optional cursor on pointer devices: thin crosshair; native cursor on touch and reduced motion.

## Motion architecture
- **CSS scroll-driven animations first** (`animation-timeline: view()` / named `view-timeline`, `animation-range`): Safari/iOS 26+, Firefox 159+, Chrome 115+. Wrap every scroll animation in `@supports (animation-timeline: view())` **and** `@media (prefers-reduced-motion: no-preference)`. Declare `animation-timeline` AFTER the `animation` shorthand (the shorthand resets it).
- **Default CSS = the final, readable state** (developed prints, Warm look, scrollable strip, one crop, everything visible). That is what JS-off, old browsers and reduced motion start from.
- **JS fallback (~1 kB)** only when `!CSS.supports('animation-timeline: view()')` and motion is allowed: IntersectionObserver marks live scenes; one rAF loop reads each live scene's rect (all reads, then all writes) and sets `--p` (0–1); CSS uses `--p`. The fallback may do less (e.g. step looks instead of scrubbing).
- **Pinning**: outer `.scn` with height N×`svh`, inner `.stg { position: sticky; top: 0; height: 100svh; overflow: clip }`, progress over `contain 0% contain 100%`. Use `svh`, never `vh`; pin with `top:0` only (iOS bottom-sticky bug).
- Animate only `transform`, `opacity`, `clip-path`, and `filter` on small elements. Never animate CSS variables, `mask-image` or `border-radius` per frame.
- **Looks on real photos**: ship pre-rendered look variants exported from the app (AVIF/WebP ≤ 120 kB each, ≤ 1600 px wide) and crossfade them with `opacity`. Until Jason supplies photos, use the CSS-drawn placeholder scenes from the reference and a `filter` chain (same 6 functions in the same order in every keyframe so it interpolates). Structure markup so swapping in `<img>` variants changes no JS.
- Native scrolling only (no hijacking). No full-screen zoom, spin or wide parallax; nothing scales past 1.15×.

## Scenes (copy is final)
Fixed header (`mix-blend-mode: difference`): wordmark → `#top`; text link `Beta · Dec` (viewfinder brackets) → `#invite`.
1. **Safelight** (`#top`, 180svh, pinned): red radial halo grows (opacity .25→1, scale .7→1.15); mono `Darkroom open · an iPhone photo editor`; wordmark `fotelier` (wdth 75→100); line `One look for the whole set.`; bottom mono `Scroll to develop ↓` (aria-hidden).
2. **Tray** (320svh, pinned): H2 `The whole tray develops at once.` + `One edit, every photo in the set. That's batch editing in Fotelier.` A surface tray of 6 prints (grid auto-fit, min clamp(90px, 22vw, 170px)); a paper layer (#E9E4DA) over each fades 1→0 over the first 70% while the print settles from scale .985→1, all six together. Mono `Tray 01 · 6 prints · developing`.
3. **Film strip** (420svh, pinned): H2 `Pull a new look through. Every print follows.` + `Fotelier has 30 film looks in 6 groups. The looks here are a demo. Hold a print to see the original.` Three prints above; below, a sprocketed strip (`<ol aria-label="Film looks">`: `00 Original`, `A1 Warm`, `B3 Mono`, `C2 Fade`, `D4 Chrome`, `E1 Cool`) translating left with scroll past a fixed 2px accent index line; the look keyframes are timed so each look applies as its frame crosses the line (values in the reference `@keyframes looks`). **Drag**: horizontal pointer drag on the strip also scrubs it (`touch-action: pan-y`; the drag moves the window scroll within the scene so scroll and drag stay in sync); arrow keys when the strip has focus (`tabindex="0"`). **Hold to compare**: primary-button hold (180 ms; cancel if moved > 8 px) on the prints shows originals (`filter:none`, no transition); ends on up/cancel/leave/blur/visibilitychange; prevent `contextmenu`; `-webkit-touch-callout:none; user-select:none`; Space held on the focused prints group does the same; a polite live region says "Showing originals" once.
4. **Easel** (300svh, pinned): H2 `The easel knows Instagram.` One print in a square surface; `clip-path: inset()` steps 4:5 → 3:4 → 1:1 → 1.91:1 → 9:16 (values in `@keyframes easel`); a one-line label window rolls `4:5 · Feed`, `3:4 · Grid`, `1:1 · Square`, `1.91:1 · Landscape`, `9:16 · Story` in sync. The five sizes also exist as text for screen readers.
5. **Matting room** (flow): H2 `The matting room.` + `White, film strip, instant, or any colour, including one picked straight from the photo with the eyedropper and loupe.` Four framed prints rise in on `view()` (opacity, translateY 40px): White (#F4F1EA, bottom-heavy mat), Film strip (#0A0A09 with paper-white sprocket holes, `background-repeat: space no-repeat`), Instant (#EFE8DA, deep bottom), Picked from the photo (mat in a colour from the print). **Loupe**: on pointer devices a 120px circle follows the pointer over the "Picked" print showing a 2.5× copy (transform only); on touch, tap to inspect (adds `touch-action:none` until tapped again); releasing sets that mat to the sampled colour (placeholders: hit-test sun/land/sky; real photos: sample a same-origin image via a hidden canvas). Then a mono EXIF line types out with `steps()`: `FRAME 07/36 · 35mm · f/2.0 · 1/250 · ISO 200` and `Camera info borders print your camera, lens and settings under the photo.`
6. **Contact sheet** (flow): H2 `Up to 16 on one contact sheet.` + `Pick a shape and a layout, then pinch and drag each photo into place.` A 4-column sheet of 12 cells (first spans 2×2); each flies in on entry from a small offset and ≤ 6° rotation. Optional: drag to swap cells (pointer + keyboard).
7. **Door** (220svh, pinned): a surface panel scales X 0→1 from the left over the first 55%; mono `House rule` (signal green); display `Nothing leaves the darkroom.`; `Edits happen on your iPhone. Nothing is uploaded. No account, no ads, no tracking.`
8. **Invite** (`#invite`): mono `Free beta · invites go out in December 2026`; display `Come in.`; text link `Email for an invitation →` (viewfinder brackets) → `mailto:support@fotelier.app?subject=Fotelier%20beta%20invitation&body=Please%20add%20me%20to%20the%20Fotelier%20beta.%0D%0A%0D%0AMy%20iPhone%20model%3A%20`; note `Tell us your iPhone model. Opens your email app; or write to support@fotelier.app.` Never use Apple's TestFlight name or logo as a badge.
9. **Footer**: mono `—— fotelier ▸ © 2026 Jason Xian ——`; links Privacy, Support, support@fotelier.app (≥ 44px tall).
- Meta: title `Fotelier — one look for the whole set`; description `An iPhone photo editor for multi-photo posts. Put one frame and film look on a whole set, save it as a recipe, build collages. Free beta opens in December.`

## Privacy and Support pages
Same palette, fonts, header, footer and grain; no pinned scenes. 680px text column. Privacy eyebrow `House rule · Effective November 22, 2026` (keep the existing date), H1 `Privacy policy`; Support eyebrow `Front desk`, H1 `Support`. Body text word for word. Optional cross-document `@view-transition { navigation: auto }` with the wordmark as a shared element.

## Reduced motion (designed, not broken)
No pinning (`.scn{height:auto}`, `.stg{position:static;height:auto}`), no scrubbing, no grain movement, no flying cells, no door. Show: developed prints; the strip as a native horizontal swipe list with `scroll-snap`; tapping a look frame crossfades the prints in 200 ms (user-initiated); the five crops side by side with labels; borders and EXIF line static; full contact sheet; static privacy panel. Hold-to-compare and the loupe still work (no follow lag). Listen for `matchMedia` changes.

## JavaScript off
Everything readable in order in its default state; strip is a horizontally scrollable list; compare and loupe absent; no console errors.

## Acceptance (report each with evidence)
1. Screenshots of all three pages at 390 and 1440 px, static and mid-scroll for each pinned scene; no horizontal page scroll.
2. iPhone Safari (iOS 26) or the Simulator: smooth scrubbing; the dynamic toolbar does not break pinning.
3. Fallback path (Chrome with `animation-timeline` unsupported, or old Safari) works; reduced motion shows the designed static version; JS off is readable.
4. Keyboard only: every link, the strip, compare and loupe usable; focus always visible. VoiceOver: headings in order; the live region speaks once per compare.
5. Policy wording unchanged (`git diff --word-diff`).
6. Network: only Google Fonts. No storage. No forced reflow in pointer handlers; budgets met.
7. Work on branch `redesign-v4`; one commit `Rebuild fotelier.app as the Developing Room`; do NOT merge or push to main. Jason reviews first.
