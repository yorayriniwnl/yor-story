'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMotionAllowed } from './useFX';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

interface ScrambleTextProps {
  text: string;
  /** 'mount' | 'view' — when to trigger. Default: 'view' */
  trigger?: 'mount' | 'view';
  className?: string;
  duration?: number; // ms; default 700
  as?: keyof React.JSX.IntrinsicElements;
}

function scramble(target: string, progress: number): string {
  return target
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' ';
      if (i / target.length < progress) return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    })
    .join('');
}

/**
 * Scrambles a string on mount or on scroll-into-view.
 * Real text is always in the DOM via a visually-hidden span (for screen readers).
 * Only the animated copy is aria-hidden.
 * Skips animation entirely under prefers-reduced-motion.
 */
export function ScrambleText({
  text,
  trigger = 'view',
  className,
  duration = 700,
  as: Tag = 'span',
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text);
  const motionOk = useMotionAllowed();
  const containerRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const run = () => {
    if (!motionOk) {
      setDisplay(text);
      return;
    }
    cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(scramble(text, progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(text);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (trigger === 'mount') {
      run();
      return () => cancelAnimationFrame(rafRef.current);
    }

    // trigger === 'view'
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, motionOk, trigger]);

  return (
    // @ts-expect-error – dynamic tag
    <Tag ref={containerRef} className={className} style={{ position: 'relative' }}>
      {/* Screen reader text — always the real content */}
      <span className="rf-sr-only">{text}</span>
      {/* Visual scramble — decorative, hidden from AT */}
      <span aria-hidden="true" style={{ display: 'block' }}>
        {motionOk ? display : text}
      </span>
    </Tag>
  );
}
