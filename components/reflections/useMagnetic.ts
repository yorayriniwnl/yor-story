'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useInteractiveFXAllowed } from './useFX';

interface MagneticOptions {
  strength?: number;   // px pull at center of element; default 8
  ease?: number;       // lerp factor 0–1; default 0.12
}

/**
 * Pulls the referenced element a few px toward the cursor on hover.
 * Fully no-ops when useInteractiveFXAllowed() is false (reduced motion or touch).
 *
 * Usage: one hook call per card instance — hooks cannot run inside .map().
 *   const ref = useMagnetic<HTMLDivElement>();
 *   <div ref={ref}>...</div>
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 8,
  ease = 0.12,
}: MagneticOptions = {}): React.RefObject<T> {
  const ref = useRef<T>(null);
  const allowed = useInteractiveFXAllowed();
  const rafRef = useRef<number>(0);
  const runningRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    runningRef.current = false;
  }, []);

  const animate = useCallback(() => {
    const el = ref.current;
    if (!el) {
      stop();
      return;
    }

    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;

    el.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;

    // Settled back at rest — stop the loop instead of running forever idle.
    const atRestTarget = targetRef.current.x === 0 && targetRef.current.y === 0;
    const settled =
      Math.abs(currentRef.current.x) < 0.05 && Math.abs(currentRef.current.y) < 0.05;

    if (atRestTarget && settled) {
      currentRef.current = { x: 0, y: 0 };
      el.style.transform = '';
      stop();
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [ease, stop]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !allowed) return;

    const onEnter = () => start();

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalize distance from center to [-1, 1], then scale by strength
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      targetRef.current = {
        x: Math.max(-strength, Math.min(strength, dx * strength)),
        y: Math.max(-strength, Math.min(strength, dy * strength)),
      };
      // In case the loop had already settled+stopped mid-hover, wake it back up.
      start();
    };

    const onLeave = () => {
      targetRef.current = { x: 0, y: 0 };
      start(); // ease back to center even if the loop had stopped
    };

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      stop();
      // Reset transform on cleanup
      if (el) el.style.transform = '';
    };
  }, [allowed, start, stop, strength]);

  return ref as React.RefObject<T>;
}
