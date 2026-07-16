import { ImageResponse } from 'next/og';
import { getReflectionBySlug, getPublishedSlugs } from '../../../lib/reflections';
import { CHAPTERS, romanNumeral } from '../../../components/reflections/chapters';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 86400;

export async function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

const CHAPTER_COLOR_MAP: Record<number, string> = {
  1: '#e5232b',
  2: '#e5232b',
  3: '#9564ff',
  4: '#9564ff',
  5: '#e5232b',
  6: '#9564ff',
  7: '#e5232b',
  8: '#e5232b',
  9: '#9564ff',
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const reflection = getReflectionBySlug(slug);
  if (!reflection) return new Response(null, { status: 404 });

  const chapter = CHAPTERS[reflection.chapter];
  const accent = CHAPTER_COLOR_MAP[reflection.chapter] ?? CHAPTER_COLOR_MAP[1];
  const week = String(reflection.week).padStart(2, '0');
  const titleSize = reflection.title.length > 54 ? 50 : reflection.title.length > 35 ? 59 : 68;

  return new ImageResponse(
    (
      <div
        style={{
          background: '#090a09',
          color: '#f0e8da',
          display: 'flex',
          height: '100%',
          overflow: 'hidden',
          padding: 38,
          position: 'relative',
          width: '100%',
        }}
      >
        <div
          style={{
            border: '1px solid rgba(240,232,218,0.16)',
            display: 'flex',
            inset: 22,
            position: 'absolute',
          }}
        />
        <div
          style={{
            backgroundImage: 'linear-gradient(rgba(240,232,218,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(240,232,218,0.045) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            display: 'flex',
            inset: 0,
            opacity: 0.72,
            position: 'absolute',
          }}
        />
        <div
          style={{
            background: accent,
            display: 'flex',
            height: '100%',
            left: 0,
            opacity: 0.88,
            position: 'absolute',
            top: 0,
            width: 9,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '15px 0 14px 24px',
            position: 'relative',
            width: '65%',
          }}
        >
          <div style={{ alignItems: 'center', display: 'flex', fontFamily: 'monospace', fontSize: 13, letterSpacing: 2.1 }}>
            <span style={{ color: '#d9ad5d', marginRight: 18 }}>YR. / REFLECTIONS</span>
            <span style={{ color: 'rgba(240,232,218,0.52)' }}>FIELD FILE W{week}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 690 }}>
            <div style={{ color: accent, display: 'flex', fontFamily: 'monospace', fontSize: 14, letterSpacing: 3, marginBottom: 20 }}>
              CH.{chapter?.numeral ?? romanNumeral(reflection.chapter)} / {(chapter?.title ?? 'UNFILED').toUpperCase()}
            </div>
            <div style={{ color: '#f0e8da', fontFamily: 'serif', fontSize: titleSize, fontWeight: 700, letterSpacing: -2.4, lineHeight: 1.04 }}>
              {reflection.title}
            </div>
          </div>

          <div style={{ alignItems: 'center', color: 'rgba(240,232,218,0.57)', display: 'flex', fontFamily: 'monospace', fontSize: 13, letterSpacing: 1.6 }}>
            <span>{reflection.readTime} MIN READ</span>
            <span style={{ color: accent, margin: '0 19px' }}>/</span>
            <span>{reflection.wordCount.toLocaleString()} WORDS</span>
            <span style={{ color: accent, margin: '0 19px' }}>/</span>
            <span>OPEN RECORD</span>
          </div>
        </div>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            position: 'relative',
            width: '35%',
          }}
        >
          <div style={{ border: '1px solid rgba(217,173,93,0.42)', borderRadius: '50%', height: 310, position: 'absolute', right: -70, top: 94, width: 310 }} />
          <div style={{ border: '1px solid rgba(217,173,93,0.32)', borderRadius: '50%', height: 185, position: 'absolute', right: -8, top: 156, width: 185 }} />
          <div style={{ background: 'rgba(217,173,93,0.55)', height: 1, position: 'absolute', right: 6, top: 260, transform: 'rotate(-23deg)', width: 330 }} />
          <div style={{ background: 'rgba(217,173,93,0.55)', height: 1, position: 'absolute', right: 70, top: 178, transform: 'rotate(43deg)', width: 235 }} />
          <div style={{ background: '#d9ad5d', borderRadius: '50%', height: 11, position: 'absolute', right: 140, top: 217, width: 11 }} />
          <div style={{ background: accent, border: '3px solid rgba(229,35,43,0.22)', borderRadius: '50%', height: 14, position: 'absolute', right: 53, top: 314, width: 14 }} />
          <div style={{ bottom: -16, color: '#f0e8da', display: 'flex', fontFamily: 'sans-serif', fontSize: 250, fontWeight: 800, letterSpacing: -22, lineHeight: 0.8, position: 'absolute', right: 14, textShadow: `6px 6px 0 ${accent}` }}>
            {week}
          </div>
          <div style={{ border: `1px solid ${accent}`, color: accent, display: 'flex', fontFamily: 'monospace', fontSize: 11, letterSpacing: 1.5, padding: '7px 10px', position: 'absolute', right: 19, top: 52, transform: 'rotate(-8deg)' }}>
            PERSONAL DOSSIER
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
