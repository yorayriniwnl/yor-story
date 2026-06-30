'use client';

import Link from 'next/link';
import { Reflection } from '../../lib/reflections';
import { CHAPTERS, chapterColorVar, romanNumeral } from './chapters';
import { useMagnetic } from './useMagnetic';
import { useInteractiveFXAllowed } from './useFX';

interface EssayCardProps {
  reflection: Reflection;
}

/**
 * Magnetic essay card with RGB-split glitch title on hover.
 * Glitch is pure CSS via data-text + pseudo-elements — no JS frame loop.
 * Plain heading under reduced motion or touch.
 */
export function EssayCard({ reflection }: EssayCardProps) {
  const magnetRef = useMagnetic<HTMLAnchorElement>({ strength: 6 });
  const interactive = useInteractiveFXAllowed();
  const chapter = CHAPTERS[reflection.chapter];
  const colorVar = chapterColorVar(reflection.chapter);

  return (
    <Link
      ref={magnetRef}
      href={`/reflections/${reflection.slug}`}
      className={`rf-card ${interactive ? 'rf-card--interactive' : ''}`}
      style={{ '--card-accent': colorVar } as React.CSSProperties}
    >
      <div className="rf-card-header">
        <span className="rf-card-week">W{String(reflection.week).padStart(2, '0')}</span>
        <span className="rf-card-chapter">
          CH.{romanNumeral(reflection.chapter)} — {chapter?.title ?? ''}
        </span>
      </div>

      <h3
        className={`rf-card-title ${interactive ? 'rf-card-title--glitch' : ''}`}
        data-text={reflection.title}
      >
        {reflection.title}
      </h3>

      <p className="rf-card-excerpt">{reflection.excerpt}</p>

      <div className="rf-card-meta">
        {reflection.date !== 'TBD' && (
          <span className="rf-card-date">{reflection.date}</span>
        )}
        {reflection.wordCount > 0 && (
          <>
            <span className="rf-card-sep">·</span>
            <span className="rf-card-readtime">{reflection.readTime} min read</span>
          </>
        )}
      </div>
    </Link>
  );
}
