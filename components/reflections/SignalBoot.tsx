'use client';

import { useEffect, useState } from 'react';
import { useMotionAllowed } from './useFX';

const SESSION_KEY = 'rf_signal_boot_seen';

/**
 * Shows a ~1.1s "SEARCHING FOR SIGNAL… LOCKED" overlay on first session load.
 * - sessionStorage-gated (try/catch for private-mode browsers)
 * - Any click/tap/keypress skips instantly
 * - Renders nothing during SSR — only appears post-hydration (no flash)
 * - Skipped entirely under prefers-reduced-motion
 */
export function SignalBoot() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<'searching' | 'locked' | 'done'>('searching');
  const motionOk = useMotionAllowed();

  useEffect(() => {
    if (!motionOk) return;

    let seen = false;
    try { seen = !!sessionStorage.getItem(SESSION_KEY); } catch { /* private mode */ }
    if (seen) return;

    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* private mode */ }

    setVisible(true);

    const skip = () => setPhase('done');

    window.addEventListener('click', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    window.addEventListener('touchstart', skip, { once: true });

    const t1 = setTimeout(() => setPhase('locked'), 700);
    const t2 = setTimeout(() => setPhase('done'), 1100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('click', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('touchstart', skip);
    };
  }, [motionOk]);

  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [phase]);

  if (!visible) return null;

  return (
    <div
      className={`rf-boot-overlay ${phase === 'done' ? 'rf-boot-exit' : ''}`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="rf-boot-inner">
        <div className="rf-boot-rec">
          <span className="rf-boot-dot" />
          <span>REC</span>
        </div>
        <div className="rf-boot-status">
          {phase === 'searching' ? 'SEARCHING FOR SIGNAL…' : '▌ SIGNAL LOCKED ▐'}
        </div>
        <div className="rf-boot-freq">FREQ 52.0 MHz // YOR AYRIN</div>
      </div>
    </div>
  );
}
