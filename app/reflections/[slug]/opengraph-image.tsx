import { ImageResponse } from 'next/og';
import { getReflectionBySlug, getPublishedSlugs } from '../../../lib/reflections';
import { CHAPTERS, romanNumeral } from '../../../components/reflections/chapters';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 86400;

export async function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

// Accent colors — all 9 chapters hardcoded here so there are zero undefined fallbacks.
// Changing chapters.ts alone is NOT enough — update this map too.
const CHAPTER_COLOR_MAP: Record<number, string> = {
  1: '#e63329', // rec-red — Faith, Manufactured
  2: '#e63329', // rec-red — Inherited Damage
  3: '#00d4c8', // carrier-cyan — The Body Isn't the Sin
  4: '#00d4c8', // carrier-cyan — What We Call Love
  5: '#e63329', // rec-red — Till Paperwork Do Us Part
  6: '#00d4c8', // carrier-cyan — Loyalty, No Contract
  7: '#e63329', // rec-red — Borrowed Borders
  8: '#e63329', // rec-red — Built to Be Replaced
  9: '#00d4c8', // carrier-cyan — Unfinished Business
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const r = getReflectionBySlug(slug);

  const title = r?.title ?? 'Reflections';
  const chNum = r?.chapter ?? 1;
  const ch = CHAPTERS[chNum];

  // Guaranteed non-undefined — falls back to ch.1 values if something is wrong
  const accentColor = CHAPTER_COLOR_MAP[chNum] ?? CHAPTER_COLOR_MAP[1];
  const numeral = ch?.numeral ?? romanNumeral(chNum);
  const chapterTitle = ch?.title ?? `Chapter ${chNum}`;

  const wordCount = r?.wordCount ?? 0;
  const readTime = r?.readTime ?? 0;
  const week = r?.week ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: '#0a0a0b',
          display: 'flex',
          fontFamily: 'serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            background: accentColor,
          }}
        />

        {/* Ghost numeral */}
        <div
          style={{
            position: 'absolute',
            right: -20,
            top: -40,
            fontSize: 400,
            fontWeight: 900,
            color: 'rgba(255,255,255,0.04)',
            lineHeight: 1,
            fontFamily: 'sans-serif',
            letterSpacing: -20,
          }}
        >
          {numeral}
        </div>

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px 80px 60px 64px',
            flex: 1,
          }}
        >
          {/* Top: brand + chapter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                background: accentColor,
                color: '#0a0a0b',
                fontSize: 13,
                fontWeight: 700,
                padding: '4px 10px',
                letterSpacing: 2,
                fontFamily: 'sans-serif',
              }}
            >
              {`CH.${numeral}`}
            </div>
            <div style={{ color: 'rgba(242,239,232,0.5)', fontSize: 13, letterSpacing: 2, fontFamily: 'sans-serif' }}>
              {chapterTitle.toUpperCase()}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ color: 'rgba(242,239,232,0.3)', fontSize: 13, letterSpacing: 2, fontFamily: 'sans-serif' }}>
              YOR AYRIN // REFLECTIONS
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 50 ? 48 : title.length > 35 ? 58 : 68,
              fontWeight: 700,
              color: '#f2efe8',
              lineHeight: 1.1,
              maxWidth: 900,
              fontFamily: 'serif',
            }}
          >
            {title}
          </div>

          {/* Bottom meta row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
              color: 'rgba(242,239,232,0.45)',
              fontSize: 14,
              letterSpacing: 1.5,
              fontFamily: 'monospace',
            }}
          >
            {week > 0 && <span>WEEK {String(week).padStart(2, '0')}</span>}
            {readTime > 0 && <span>{readTime} MIN READ</span>}
            {wordCount > 0 && <span>{wordCount.toLocaleString()} WORDS</span>}
            <div style={{ flex: 1 }} />
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: accentColor,
              }}
            />
            <span style={{ color: accentColor }}>ON AIR</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
