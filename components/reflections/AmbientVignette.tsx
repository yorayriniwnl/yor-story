'use client';

import { useEffect } from 'react';
import { chapterColor } from './chapters';

/**
 * Sets --ambient CSS var on :root based on which chapter section
 * crosses the viewport's center band.
 * One IntersectionObserver for the whole page — inexpensive.
 * The background radial-gradient in CSS reads this var and drifts red/cyan.
 */
export function AmbientVignette() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-chapter]');
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const ch = Number((entry.target as HTMLElement).dataset.chapter);
            const color = chapterColor(ch);
            document.documentElement.style.setProperty(
              '--ambient',
              color === 'red' ? 'var(--rec-red)' : 'var(--carrier-cyan)'
            );
          }
        }
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return null;
}
