# Reflections — Drop-in Integration Guide

**ON AIR broadcast aesthetic. 52 weeks. 9 chapters. Draft-gated.**

---

## What's in this package

```
content/reflections/         52 .md files (4 published, 47 stubs, 1 draft w/ real copy)
lib/reflections.ts           Data layer — reads MDX, filters drafts, derives word count
components/reflections/
  chapters.ts                Single source of truth for chapter metadata
  useFX.ts                   Motion hooks (useMotionAllowed, useFinePointer, etc.)
  useMagnetic.ts             Magnetic hover hook
  ScrambleText.tsx           Scramble text on mount or scroll-into-view
  SignalBoot.tsx             One-shot boot sequence overlay
  BroadcastNoise.tsx         CRT scanlines + grain
  OnAirTicker.tsx            Sticky marquee ticker
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
The `CHAPTER_COLOR_MAP` in `opengraph-image.tsx` has all 9 chapters hardcoded
with their exact hex values. If you rename a chapter's color assignment in
`chapters.ts`, update the map in the OG file too — it is intentionally a
separate constant so there are zero `undefined` fallbacks at generation time.

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
