# fotelier.app — design and build spec

For Codex (GPT-6.2 Sol). Build the site exactly as described here. The visual reference is the Claude Design canvas "fotelier.app website design" (https://claude.ai/artifact/9G8FE938w2CEN1n7bzD7Li); this file is the source of truth if they ever disagree.

## Hard constraints
- Static GitHub Pages site. Plain HTML + one shared CSS file. No framework, no build step, no JavaScript needed.
- Files: `index.html`, `privacy/index.html`, `support/index.html`, `assets/site.css`, `CNAME` (keep `fotelier.app`), `.nojekyll` (keep).
- No analytics, trackers, cookies, cookie banners or third-party scripts. The privacy policy says the site collects nothing except emails people choose to send.
- Fonts from Google Fonts only (one `<link>`), with system fallbacks.
- Do NOT rewrite privacy or support policy wording. Move the existing text into the new layout word for word, including the beta paragraph added in commit 01f48ce.
- Every page works at 320 px wide and up, with no horizontal scrolling.

## Brand (matches the app's `src/lib/e-theme.ts`)
Colours (light only; the site does not need a dark mode):
| Token | Hex | Use |
|---|---|---|
| ink | #121212 | text, wordmark |
| body | #3A3A3A | paragraph text |
| muted | #5E5E5E | captions, footer |
| paper | #FFFFFF | page background |
| surface | #F1F1F1 | neutral cards |
| divider | #ECECEC | footer rule |
| blue | #2B3CFF | primary buttons, links, beta band, step numbers |
| blue-caption | #D6DBFF | text on the blue band |
| yellow | #FFE14D | feature strip, highlight behind "whole set." |
| pink-card | #FFE3EF | Recipes card |
| blue-card | #EEF0FF | Collage card |
| yellow-card | #FFF6C7 | Private card, privacy summary box |

Type:
- Display: Bricolage Grotesque 800, letter-spacing -0.03em. Wordmark is lowercase `fotelier`, 28 px.
- Body: Inter 400/600, 17 px, line-height 1.6.
- Labels: JetBrains Mono 600, 12–13 px, uppercase, letter-spacing 0.06–0.08em (same role as the app's mono captions).
- Google Fonts link: `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=Inter:wght@400;600&family=JetBrains+Mono:wght@600&display=swap`

Shape and spacing: content max-width 1200 px with 24 px side padding (policy text column 680 px). Buttons are pills (border-radius 999 px, padding 16×28 px, min height 44 px). Cards radius 20 px, padding 28 px. Section padding 88–96 px top/bottom. Flat colour only: no gradients, no glass, no emoji, no left-border cards.

## Home page (`index.html`), top to bottom
1. **Header**: wordmark left (links to `#top`); right: links "How it works" (`#how`), "Privacy" (`/privacy/`), "Support" (`/support/`), and a blue pill "Join the beta" (mailto below). Wraps on phones.
2. **Hero** (two columns, stacking under ~900 px):
   - Mono eyebrow: `iPhone photo editor · beta in December`
   - H1: `One look for the whole set.` with "whole set." on a #FFE14D highlight (padding 0 8px, radius 8px). Size clamp(44px, 6vw, 80px), line-height 0.98.
   - Paragraph: `Fotelier puts the same frame and film look on every photo in a post, then saves it as a recipe so your next set matches too. It edits on your iPhone. Nothing is uploaded.`
   - Buttons: blue pill `Email us to join the beta` (mailto) and text link `See how it works` (`#how`).
   - Right column: three overlapping "framed prints" drawn in CSS (white mat 12 px, 40 px bottom margin, soft shadow 0 12px 32px rgba(18,18,18,.14)); left rotated -6°, centre upright and larger, right rotated 5°. Each print is a flat-colour stylised photo (sun circle + horizon band): amber #C9822F/#6E4A23 with yellow sun; blue #2B3CFF/#121B8C with pink sun; olive #6F7A3A/#3E4520 with yellow sun. Mono caption under each: `Sample · Warm 03`. Prints use `aspect-ratio: 4/5` and `width: min(170px, 25vw)` (centre `min(190px, 28vw)`) so they fit on phones. Mark the group `aria-hidden="true"`. Replace with real app screenshots later if Jason supplies them.
3. **Feature strip**: full-width #FFE14D band, one mono uppercase line that wraps: `30 film looks · Batch editing · Saved recipes · Collage up to 16 photos · Camera info borders · Works offline` (as separate spans with gaps, no dots needed).
4. **How it works** (`id="how"`): H2 `Three steps, then it's yours to reuse.` then a 3-column ordered list (stacks on phones), each item with a 3 px ink top rule, blue mono number, H3 and text:
   - 01 `Pick the set` — `Choose the photos for your post: portrait, landscape and panorama together.`
   - 02 `Choose a frame and a look` — `Borders, Instagram crop sizes and film looks apply to every photo at once, without cropping them badly.`
   - 03 `Save it as a recipe` — `Next time, apply the same recipe in one tap so your feed stays consistent.`
5. **Feature cards**: grid `repeat(auto-fit, minmax(300px, 1fr))`, gap 16 px, six cards (mono label / H3 / text):
   - surface: `Film looks` / `30 looks in 6 groups` / `Adjust the strength, and hold to compare with the original.`
   - pink-card: `Recipes` / `Your style, saved` / `Save a frame and look together and reuse them on any photo or batch.`
   - blue-card: `Collage` / `Up to 16 photos` / `Pick a shape and layout, then pinch and drag each photo into place.`
   - surface: `Borders` / `Frames and camera info` / `White, film strip and instant frames, any border colour, or one picked from your photo.`
   - yellow-card: `Private` / `Your photos stay on your phone` / `Editing happens on your iPhone. No account, no ads, no tracking.`
   - surface: `Pricing` / `Free to start` / LEAVE OUT this card until Jason confirms the Pro offer (do not invent a price).
6. **Beta band** (`id="beta"`): full-width #2B3CFF, white text. H2 `Get a beta invite.`; text (#D6DBFF) `Beta invites go out in December. Email us with your iPhone model and we'll send you a link to install the test version.`; white pill button `Email us to join` (ink text). Do not use Apple's TestFlight name or logo as a badge.
7. **Footer**: `fotelier` wordmark (small) + `© 2026 Jason Xian` left; right: `Privacy policy`, `Support`, `support@fotelier.app` (mailto). Muted 14 px.

Beta mailto (use everywhere): `mailto:support@fotelier.app?subject=Fotelier%20beta&body=Please%20add%20me%20to%20the%20Fotelier%20beta.%20My%20iPhone%20model%3A%20` (escape `&` as `&amp;` in HTML).

## Privacy and Support pages
Same header (current page link underlined, `aria-current="page"`) and footer as home. Main column 680 px:
- Mono eyebrow with the existing effective date (privacy) or `Support` (support).
- H1 in Bricolage 800, clamp(38px, 5vw, 56px).
- Privacy only: a #FFF6C7 summary box, radius 16 px: `In short: Fotelier edits your photos on your iPhone. Your photos are never uploaded.`
- Then the existing text word for word, split into H2 (Inter 600, 22 px) + paragraphs wherever the current page already has headings. Contact line links support@fotelier.app.

## Accessibility and quality
- Real `<a href>` for every link/button; visible focus outline (2 px #2B3CFF, offset 3 px).
- Contrast: all text pairs above pass 4.5:1 (ink/body/muted on white and cards; white and #D6DBFF on blue).
- `<html lang="en">`, page `<title>`s: `Fotelier — one look for the whole set`, `Fotelier privacy policy`, `Fotelier support`. Add a meta description and the existing favicon if present.
- Respect `prefers-reduced-motion` (there is no motion anyway; don't add any).

## Acceptance (report each)
1. Open each page at 390 px and 1440 px: matches the canvas, no horizontal scroll.
2. Policy wording diff: privacy and support text identical to before (show `git diff --word-diff` on the text).
3. Every mailto opens with subject "Fotelier beta" prefilled.
4. No external requests except fonts.googleapis.com / fonts.gstatic.com.
5. One commit, message `Redesign fotelier.app to match the app`. Do not push until Jason approves.
