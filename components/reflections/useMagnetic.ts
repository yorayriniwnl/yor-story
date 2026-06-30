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
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  const animate = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
    currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;

    el.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;
    rafRef.current = requestAnimationFrame(animate);
  }, [ease]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !allowed) return;

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
    };

    const onLeave = () => {
      targetRef.current = { x: 0, y: 0 };
    };

    rafRef.current = requestAnimationFrame(animate);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      // Reset transform on cleanup
      if (el) el.style.transform = '';
    };
  }, [allowed, animate, strength]);

  return ref as React.RefObject<T>;
}
