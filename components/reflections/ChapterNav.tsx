'use client';

import { useEffect, useState } from 'react';
import { CHAPTERS, PAGE_ORDER, chapterColorVar } from './chapters';
import { useMotionAllowed } from './useFX';

interface ChapterNavProps {
  /** Chapter numbers (1–9) that have at least one published essay. */
  chaptersWithEssays: number[];
}

/**
 * Sticky roman-numeral jump index, one item per chapter (I–IX).
 * Hidden below 640px — see .rf-chapternav in the mobile block.
 *
 * Two independent behaviors, gated differently on purpose:
 * - Active-chapter tracking (which numeral glows) is a wayfinding signal,
 *   not decorative motion, so it runs regardless of useMotionAllowed().
 *   The CSS reduced-motion block already strips the color transition on
 *   .rf-chapternav-item, so the state still updates, it just snaps
 *   instead of fading — same "reduced motion wins" contract, applied to
 *   the one part of this that actually is motion.
 * - The scroll itself IS motion, so that's gated: smooth when allowed,
 *   an instant jump otherwise.
 *
 * Empty chapters (no published essays yet) render dimmer — reuses
 * .rf-no-signal's opacity language rather than inventing a new one.
 */
export function ChapterNav({ chaptersWithEssays }: ChapterNavProps) {
  const [active, setActive] = useState<number | null>(null);
  const motionOk = useMotionAllowed();

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-chapter]');
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.chapter));
          }
        }
      },
      // Same center-band rootMargin as AmbientVignette, so the active
      // numeral and the ambient color shift in step with each other.
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  function handleClick(e: React.MouseEvent, chNum: number) {
    e.preventDefault();
    document.getElementById(`chapter-${chNum}`)?.scrollIntoView({
      behavior: motionOk ? 'smooth' : 'auto',
      block: 'start',
    });
  }

  return (
    <nav className="rf-chapternav" aria-label="Jump to chapter">
      <ul className="rf-chapternav-list">
        {PAGE_ORDER.map((chNum) => {
          const ch = CHAPTERS[chNum];
          if (!ch) return null;
          const empty = !chaptersWithEssays.includes(chNum);
          const isActive = active === chNum;

          return (
            <li key={chNum}>
              <a
                href={`#chapter-${chNum}`}
                onClick={(e) => handleClick(e, chNum)}
                className={[
                  'rf-chapternav-item',
                  empty ? 'rf-chapternav-item--empty' : '',
                  isActive ? 'rf-chapternav-item--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ '--nav-accent': chapterColorVar(chNum) } as React.CSSProperties}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Chapter ${ch.numeral}: ${ch.title}${empty ? ' — no signal yet' : ''}`}
              >
                {ch.numeral}
                <span className="rf-chapternav-label" aria-hidden="true">
                  {ch.title}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
