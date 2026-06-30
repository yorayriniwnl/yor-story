'use client';

import { useEffect, useState } from 'react';

/**
 * Live-updating listener on prefers-reduced-motion.
 * Returns false if the user has requested reduced motion — gates ALL decorative
 * animation. Not a one-time read: responds to OS setting changes mid-session.
 */
export function useMotionAllowed(): boolean {
  // Initial state is always false on both server and the first client render
  // (before hydration finishes) so the two never disagree — the real value
  // is applied a moment later inside the effect below. Reading
  // window.matchMedia() directly in the lazy initializer would give the
  // server "false" but the client "true" on the very first paint, which is
  // a hydration mismatch for every consumer that branches on this value.
  const [allowed, setAllowed] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setAllowed(!e.matches);
    setAllowed(!mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return allowed;
}

/**
 * Returns true if the primary pointer is fine (mouse/trackpad).
 * Used to gate hover-only effects on touch devices — a magnetic pull
 * on a device that can't hover is a dead effect.
 */
export function useFinePointer(): boolean {
  // Same SSR/hydration reasoning as useMotionAllowed above: start false
  // everywhere, correct it inside the effect once we're definitely client-side.
  const [fine, setFine] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const handler = (e: MediaQueryListEvent) => setFine(e.matches);
    setFine(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return fine;
}

/**
 * Combination of useMotionAllowed + useFinePointer.
 * The gate for hover-only interactive effects (magnetic, glitch title, etc.).
 * If motion is disabled OR the device can't hover — effect doesn't run.
 */
export function useInteractiveFXAllowed(): boolean {
  const motion = useMotionAllowed();
  const fine = useFinePointer();
  return motion && fine;
}
