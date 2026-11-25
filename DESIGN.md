# fotelier.app — design and build spec (v2, "The Gallery")

For Codex (GPT-6.2 Sol, High). The visual reference is the Claude Design canvas "fotelier.app website design", artboards "v2 · Gallery home" (desktop and phone): https://claude.ai/artifact/9G8FE938w2CEN1n7bzD7Li. This file is the source of truth if they disagree. (v1 "Classic" is kept on the canvas for comparison only; do not build it.)

## Concept
The site is a dark museum. The visitor walks through halls; the photos on the walls are a live demo of the app. Changing one look recolours every print at once — that is Fotelier's pitch ("one look for the whole set"). A soft warm spotlight follows the cursor like gallery lighting. The beta is "the opening", with an invitation card.

## Hard constraints
- Static GitHub Pages site: `index.html`, `privacy/index.html`, `support/index.html`, `assets/site.css`, `assets/site.js`, keep `CNAME` (`fotelier.app`) and `.nojekyll`.
- Vanilla HTML/CSS/JS only. No framework, no build step, no libraries, no analytics, no cookies, no third-party scripts. Only external requests: Google Fonts.
- The page must be complete and readable with JavaScript off (controls just do nothing; prints show the default state).
- Do NOT rewrite privacy or support policy wording; move it into the new layout word for word (including the beta paragraph from commit 01f48ce).
- Works from 320 px wide, no horizontal scroll. Touch works (no hover-only features).
- `prefers-reduced-motion: reduce` → no transitions, spotlight fixed (not following the pointer).

## Tokens
| Token | Value | Use |
|---|---|---|
| wall | #0E0E11 | page background |
| wall-2 | #16161A | Hall 2 background |
| panel | #1A1A1F | control console |
| line | #2A2A30 | rules, borders |
| chip-border | #3A3A42 | unselected chip border |
| ivory | #F2F0EA | main text on dark, mats of collage/invitation |
| soft | #B9B6AE | secondary text |
| label | #8C8A84 | mono labels, placards |
| yellow | #FFE14D | accent, selected chips, "whole set.", focus ring |
| blue | #2B3CFF | the one blue button (invitation) |
| ink | #121212 | text on yellow and ivory |
Fonts (one Google Fonts link): `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Inter:wght@400;600&family=JetBrains+Mono:wght@500;600&display=swap`
- Display: Bricolage Grotesque 800, tight tracking (-0.03 to -0.04em). Wordmark lowercase `fotelier`.
- Body: Inter 17 px / 1.6. Labels and placards: JetBrains Mono, 11–13 px, uppercase, letter-spacing 0.08–0.14em.
- Chips/buttons: pills, min-height 44 px. Selected chip = yellow fill, ink text; unselected = transparent, chip-border, ivory text. Use `aria-pressed`.
- Focus ring: 2 px yellow, offset 3 px.

## Spotlight
A full-page overlay (`pointer-events:none`, above content backgrounds, below text is fine) with `radial-gradient(circle 520px at var(--mx) var(--my), rgba(255,236,190,.10) 0, rgba(255,236,190,.03) 45%, transparent 70%)`. JS sets `--mx/--my` on pointermove (throttle with requestAnimationFrame). Default 70% / 30%.

## Prints (CSS-drawn, no image files)
Each print = a 4:5 box `width:min(150px,26vw)` with a flat "sky" colour, a sun circle and a "land" band at the bottom:
| No. | Title | sky | sun | land | sun left/top/size % | land height % |
|---|---|---|---|---|---|---|
| 01 | Harbour | #E9A15B | #FFE14D | #2F4E6B | 22/18/26 | 34 |
| 02 | Courtyard | #2B3CFF | #FFB3D4 | #121B8C | 60/16/22 | 30 |
| 03 | Field | #9DB36A | #FFF6C7 | #4D5B2A | 40/24/20 | 38 |
| 04 | Rooftop | #F3B6C9 | #FFFFFF | #5A3550 | 18/30/30 | 28 |
| 05 | Coast | #7FB7D9 | #FFE14D | #1F3B52 | 58/20/24 | 36 |
Placard under each print (mono 11 px, label colour, centred): `No. 01 · Harbour` / `Warm · 70%` (live).

## Shared state (one object in site.js)
`{ look: 'warm', strength: 70, frame: 'mat', layout: 'grid' }` drives Hall 1, Hall 2 and Hall 3 together. Implement as CSS custom properties / classes on `<body>` where possible; transition `filter` 300 ms ease.

Looks (k = strength/100), applied as CSS `filter` on every print's inner box:
- Original: `none`
- Warm: `sepia(0.45k) saturate(1+0.3k) hue-rotate(-8k deg)`
- Mono: `grayscale(k) contrast(1+0.2k)`
- Fade: `contrast(1-0.28k) brightness(1+0.1k) saturate(1-0.35k)`
- Chrome: `saturate(1+0.7k) contrast(1+0.2k)`
- Cool: `hue-rotate(-25k deg) saturate(1-0.15k) brightness(1-0.05k)`
(These are website demo looks, not the app's real look names.)

Frames, applied to the wrapper of each print (shadow on all: `0 24px 60px rgba(0,0,0,.55)`):
- Gallery white (`mat`): white, padding 12 12 40.
- Film strip (`film`): #121212, padding 22 8, two rows of ivory sprocket holes (8 px holes, 10 px gaps) 7 px from top and bottom.
- Instant (`instant`): #F6F2E9, padding 12 12 56.
- No frame (`none`): no padding.

## Page, top to bottom
1. Header: wordmark (→ `#top`); mono nav: `Hall 1 · One look` (#hall-1), `Hall 2 · Recipes` (#hall-2), `Hall 3 · Collage` (#hall-3), yellow pill `Opening · Dec` (#opening). Smooth scroll unless reduced motion.
2. Title: mono `Now showing · an iPhone photo editor`; H1 `One look for the whole set.` with "whole set." in yellow, clamp(48px, 8vw, 112px), line-height 0.92.
3. Hall 1 (`#hall-1`): mono heading `Hall 1 · Change one look. Every print follows.` + note `This is what Fotelier does to a whole post: try the controls below.` The wall: the five prints in a centred, wrapping row, bottom-aligned, gap 28 px, a 1 px line under the wall. Below, the console (panel, radius 24, max-width 920): row "Look" with 6 chips, row "Frame" with 4 chips, row "Strength" with a labelled range input 0–100 (yellow accent) and the live % value.
4. Hall 2 (`#hall-2`, wall-2 background, top line): left: mono `Hall 2 · Recipes`, H2 `Save the look. Hang the next set in one tap.`, text `A recipe keeps a frame and a look together. Pick one and next week's photos match this week's.`, then three full-width recipe buttons (radius 14, name left, mono detail right; selected = yellow): `Golden hour` — `Instant · Warm 80%`; `Night walk` — `Film strip · Mono 90%`; `Seaside` — `Gallery white · Fade 60%`. Clicking sets look+strength+frame for the whole site. A recipe shows selected only while the state matches it exactly. Right: prints 04, 05, 01 ("next week's set") with the current look and frame.
5. Hall 3 (`#hall-3`): left: mono `Hall 3 · Collage`, H2 `Up to 16 photos on one wall.`, text `Pick a shape and a layout, then pinch and drag each photo into place.`, chips `2 × 2`, `Strip of 4`, `1 + 3`. Right: an ivory-matted collage (padding 14, width min(440px,100%)) of prints 01, 02, 03, 05 with the current look, as a CSS grid, gap 8: 2×2 = 2 columns, rows 160 px; Strip = 4 columns, rows 260 px; 1+3 = 3 columns, rows 120 px, first cell spans 3 columns × 2 rows. Animate layout changes only if reduced motion is off (a simple FLIP or a 250 ms opacity crossfade is enough).
6. Museum rule banner (lines above and below): Bricolage `Your photos never leave the building.` + mono `Edited on your iPhone · no account · no ads · no tracking`.
7. Opening (`#opening`): centred ivory invitation card (max 640 px, padding 48×40, big shadow): mono `You are invited · beta opening · December 2026`, wordmark `fotelier` large (clamp 40–72 px), text `Email us with your iPhone model and we'll send you a link to install the test version when the beta opens.`, blue pill `Request an invitation` → `mailto:support@fotelier.app?subject=Fotelier%20beta&body=Please%20add%20me%20to%20the%20Fotelier%20beta.%20My%20iPhone%20model%3A%20`. Do not use Apple's TestFlight name or logo.
8. Footer: wordmark + `© 2026 Jason Xian`; links `Privacy policy`, `Support`, `support@fotelier.app`.

## Privacy and Support pages
Same dark wall, header and footer. Text column max 680 px on a slightly lighter panel (#16161A, radius 24, padding 40) so long text stays readable: mono eyebrow (effective date / `Support`), H1 Bricolage 800, then the existing text word for word with Inter 600 22 px headings where the current page has them. No spotlight needed on these pages.

## Accessibility
- Real `<button>`s for chips with `aria-pressed`; range input has a `<label>`; prints wall is decorative except placards (give the wall `role="img"` with an `aria-label` describing the current look, updated on change, or mark prints `aria-hidden` and keep placards readable).
- Contrast passes 4.5:1: ivory/soft/label on wall; ink on yellow and ivory; white on blue.
- `<html lang="en">`; titles `Fotelier — one look for the whole set`, `Fotelier privacy policy`, `Fotelier support`; meta description; existing favicon.

## Acceptance (report each)
1. 390 px and 1440 px screenshots of every page; no horizontal scroll; matches the canvas.
2. All controls work by mouse, touch and keyboard; recipes update all three halls; reduced-motion respected; JS-off page still reads correctly.
3. Policy wording unchanged (`git diff --word-diff` on the text).
4. Network: only fonts.googleapis.com and fonts.gstatic.com.
5. Lighthouse accessibility ≥ 95 on the home page.
6. One commit `Redesign fotelier.app as the Gallery`. Do not push until Jason approves.
