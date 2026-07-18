'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Reflection } from '../../lib/reflections';
import { CHAPTERS, chapterColorVar, romanNumeral } from './chapters';
import { useMagnetic } from './useMagnetic';

interface EssayCardProps {
  reflection: Reflection;
}

const POSTER_VARIANTS = ['halo', 'split', 'paper', 'crown', 'diagonal'] as const;

function getPosterVariant(slug: string) {
  const seed = [...slug].reduce((total, character) => (
    (total * 31 + character.charCodeAt(0)) % 100_000
  ), 0);
  return POSTER_VARIANTS[seed % POSTER_VARIANTS.length];
}

/**
 * A field-file card: literary copy is held inside a compact tactical frame,
 * rather than buried under a generic hover effect. The artwork is CSS-native
 * so every entry gets its own poster treatment without a fragile asset map.
 */
export function EssayCard({ reflection }: EssayCardProps) {
  const chapter = CHAPTERS[reflection.chapter];
  const colorVar = chapterColorVar(reflection.chapter);
  const week = String(reflection.week).padStart(2, '0');
  const posterVariant = getPosterVariant(reflection.slug);
  const magnetRef = useMagnetic<HTMLAnchorElement>({ strength: 5, ease: 0.1 });

  return (
    <Link
      ref={magnetRef}
      href={`/reflections/${reflection.slug}`}
      className="rf-card"
      data-week={week}
      data-variant={posterVariant}
      style={{
        '--card-accent': colorVar,
        '--card-angle': `${(reflection.week % 3) - 1}deg`,
      } as CSSProperties}
    >
      <div className="rf-card-poster">
        <div className="rf-card-poster-top">
          <span>FILE / W{week}</span>
          <span>CH.{romanNumeral(reflection.chapter)}</span>
        </div>
        <span className="rf-card-poster-number" aria-hidden="true">{week}</span>
        <span className="rf-card-crosshair" aria-hidden="true" />
        <span className="rf-card-stamp" aria-hidden="true">PERSONAL RECORD</span>
        <div className="rf-card-poster-bottom">
          <span>{chapter?.title ?? 'Unfiled'}</span>
          <span className="rf-card-status"><i /> OPEN</span>
        </div>
      </div>

      <div className="rf-card-copy">
        <h3 className="rf-card-title">{reflection.title}</h3>
        <p className="rf-card-excerpt">{reflection.excerpt}</p>
      </div>

      <div className="rf-card-meta">
        <span>{reflection.date !== 'TBD' ? reflection.date : 'DATE SEALED'}</span>
        <span>{reflection.readTime} MIN READ</span>
        <span className="rf-card-read"><b aria-hidden="true">&#8594;</b> READ FILE</span>
      </div>
    </Link>
  );
}
