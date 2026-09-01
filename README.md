# YOR // Reflections — Drop-in Integration Guide

This repository contains the reflections archive and its editorial broadcast surface. It is styled as a YOR private field dossier: a black/graphite reading surface with crimson signal accents, chapter navigation, and explicit draft gating.

## Evidence boundary

| Surface | Status | Evidence boundary |
| --- | --- | --- |
| Next.js reflections routes, published/draft filtering, chapter navigation, and sitemap source | VERIFIED | Checked-in App Router and data-layer source define the route behavior. |
| YOR visual framework | VERIFIED | `npm run design:check` checks the canonical palette and field gradient. |
| Published essay content | REPORTED | Content status comes from frontmatter; draft files remain sealed from the public index. |
| Email capture / Resend delivery | EXPERIMENTAL | Requires configured Resend credentials and an independently verified provider. |
| Hosted deployment, canonical URL, and social previews | UNVERIFIED | Local metadata is present; live headers and provider behavior still need deployment checks. |
| Full 52-week publication program | PLANNED | The archive exposes the current record without implying future essays exist. |

## Visual contract

- Void `#000000`, graphite `#050505`, crimson `#e84b4b`, deep crimson `#671515`
- Signal `#ff8a7f`, warm white `#f5eaea`, muted `#c4c4c4`
- Field gradient `#671515 → #8c1616 → #2a0505`

Run `npm run design:check` before changing the visual system. The package-specific integration notes below explain how reflections are mounted and published.

**ON AIR broadcast aesthetic. 52 weeks. 9 chapters. Draft-gated.**

---

## What's in this package

```
content/reflections/         53 .md files (1 published, 51 drafts, 1 unplaced draft)
lib/reflections.ts           Data layer — reads MDX, filters drafts, derives word count
components/reflections/
  chapters.ts                Single source of truth for chapter metadata
  useFX.ts                   Motion hooks (useMotionAllowed, useFinePointer, etc.)
  useMagnetic.ts             Magnetic hover hook
  ScrambleText.tsx           Scramble text on mount or scroll-into-view
  SignalBoot.tsx             One-shot boot sequence overlay
  BroadcastNoise.tsx         CRT scanlines + grain
  OnAirTicker.tsx            Sticky marquee ticker
  ChapterNav.tsx             Sticky roman-numeral jump index (I–IX)
  EssayCard.tsx              Magnetic essay card with CSS glitch title
  EmailCapture.tsx           Email form (Resend)
  SignalMeter.tsx            Segmented signal-strength meter
  AmbientVignette.tsx        IntersectionObserver ambient color drift
app/reflections/
  page.tsx                   Index page
  [slug]/page.tsx            Article page
  [slug]/opengraph-image.tsx Per-essay OG image (1200×630 PNG)
app/api/
  subscribe/route.ts         POST email → Resend audience
  reflections/search/route.ts GET published reflections for search
styles/reflections-onair.css All ON AIR tokens + component styles
.env.example                 RESEND_API_KEY, RESEND_AUDIENCE_ID, NEXT_PUBLIC_SITE_URL
```

---

## Install dependencies

```bash
npm install gray-matter react-markdown remark-gfm
npm install @fontsource/bebas-neue @fontsource-variable/fraunces @fontsource-variable/jetbrains-mono
```

---

## Drop files into your project

1. **Copy everything** from this package into your repo root (merge with existing structure).

2. **Import fonts** in `app/layout.tsx` (or wherever you load globals):

```tsx
import '@fontsource/bebas-neue';
import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/jetbrains-mono';
```

Fraunces and JetBrains Mono are used at several weights (400/600/700) plus
italic, so this uses Fontsource's **variable** packages (one file covers the
whole weight axis) rather than `@fontsource/fraunces`, which only ships fixed
static weights. Bebas Neue only has one weight, so the plain `@fontsource`
package is correct there.

**This changes the registered font-family names** — `'Fraunces Variable'`
and `'JetBrains Mono Variable'`, not `'Fraunces'` / `'JetBrains Mono'`.
`reflections-onair.css` already references the `Variable`-suffixed names in
its `--font-serif` / `--font-mono` tokens to match. If you ever swap to the
fixed-weight packages instead, update those two token values too — otherwise
the fonts silently fall back to Georgia/Courier New with no build error.

3. **Import styles** — add to the bottom of `app/globals.css`:

```css
@import '../styles/reflections-onair.css';
```
*(adjust relative path to match your structure)*

4. **Copy `.env.example` → `.env.local`** and fill in your Resend keys.
   Without keys, `/api/subscribe` works in dev-mode (no real emails sent).

---

## Sitemap / nav

Your existing CI test requires new routes to appear in both navigation and
the sitemap simultaneously. Add `/reflections` to both before pushing.

The `[slug]` route uses `generateStaticParams` from `getPublishedSlugs()`,
so only published essays generate static pages — draft slugs 404.

---

## Canonical URL bug (existing site issue)

Every page currently declares the homepage as its canonical URL.
The fix is per-page `alternates.canonical` in `generateMetadata`.
The article page in this package already does this correctly via
`NEXT_PUBLIC_SITE_URL`. Apply the same pattern to other pages.

---

## OG image note

OG images use `image/png`, not SVG — social platforms render PNG reliably.
The background color uses a red/cyan ternary derived from the chapter metadata. If you add new colors, update the OG generation logic to match.

---

## Publishing an essay

1. Open the week's `.md` file in `content/reflections/`
2. Replace the placeholder body with the real essay
3. Change `status: "draft"` → `status: "published"`
4. Set a real `date:` (e.g. `"2024-10-19"`)
5. Deploy — the essay appears on the index and its slug resolves

**Word count and read time are derived from the body on every build.**
Never set `wordCount` or `readTime` in frontmatter — they don't exist in
the schema and the data layer ignores them if they did.

---

## Chapter jump nav

Fixed roman-numeral index (I–IX), pinned to the right edge, vertically
centered. Lives in `ChapterNav.tsx`; hidden below 640px (see the mobile
block in `reflections-onair.css`) rather than squeezed in — there's no
version of a 9-item fixed sidebar that survives a phone viewport
gracefully.

Three things it does, each backed by data already in the codebase — no
new data model:

- **Empty vs. transmitting** — a numeral renders dim (`--empty`) when
  `getReflectionsByChapter()` has nothing for that chapter yet, same
  opacity language as `.rf-no-signal`. Currently that's 7 of 9 (only I
  and VII have published essays) — this will change on its own as more
  weeks go up, nothing to touch here when it does.
- **Active chapter** — one IntersectionObserver (same center-band
  `rootMargin` as `AmbientVignette`, so the glow and the ambient color
  shift together) tracks which `[data-chapter]` section is in view and
  lights that numeral in its own chapter color via `chapterColorVar()`.
  This keeps running under reduced motion — it's a wayfinding signal,
  not decoration, so muting it would cost real usability for no
  accessibility benefit. What DOES stop under reduced motion is the
  color transition itself, already handled by the existing CSS block.
- **Click to jump** — each numeral links to `#chapter-N` (real anchors,
  so it still works with JS disabled or before hydration). Smooth-scrolls
  when `useMotionAllowed()` is true, jumps instantly otherwise.

`.rf-chapter` now carries `scroll-margin-top: 56px` so the jump doesn't
land a chapter's top edge underneath the sticky 36px ticker. That rule
didn't exist before this nav needed it — first thing anyone reaching for
`#chapter-N` from anywhere else on the page will also want.

## Signal: clear vs. processed

Optional frontmatter field, `signal: "clear" | "processed"`. Omit it and you
get `"processed"` — the full broadcast apparatus at full intensity. Set
`signal: "clear"` on an essay where the writing should carry the exposure
without the broadcast distance adding to it.

`"clear"` dials down all three "processed" systems on that essay's article
page — nothing is stripped out, this stays one universe, just quieter:

- **Scanlines + grain** — `BroadcastNoise` renders `rf-scanlines--clear` /
  `rf-grain--clear`, and the flicker keyframe turns off.
- **Ticker interference** — `OnAirTicker` still scrolls, it just never
  self-interrupts with a "SIGNAL INTERFERENCE" burst.
- **Ambient background glow** — the `.rf-root::before` radial gradient drops
  to roughly a third of its usual opacity via `.rf-article-root--clear`.

This is an editorial call, same tier as flipping `status` to `"published"` —
make it deliberately, per essay, not as a default.

## Unplaced essay

`content/reflections/_unplaced-love-had-a-job-description.md` — the
parenting half of the Week 5 / Week 18 question. Prefixed with `_` so
`getAllReflections()` ignores it. Needs an editorial call before it becomes
a numbered week.

---

## Week 5 note

`w05-letting-go-vs-holding-on.md` is `status: "draft"` and contains the
romantic-relationship half of the essay only. Author sign-off required
before flipping to published.

---

## Reduced motion

Two independent layers:
1. JS: `useMotionAllowed()` gates whether an effect runs at all
2. CSS: `@media (prefers-reduced-motion: reduce)` at the bottom of
   `reflections-onair.css` forces every animation/transition off

If they disagree, reduced motion wins. Do not remove either layer.
