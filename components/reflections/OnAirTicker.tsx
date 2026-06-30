'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionAllowed } from './useFX';

const ITEMS = [
  'YOR AYRIN // PRIVATE FREQUENCY',
  '52 TRANSMISSIONS // ONGOING',
  'FAITH, MANUFACTURED',
  'INHERITED DAMAGE',
  'THE BODY ISN\'T THE SIN',
  'WHAT WE CALL LOVE',
  'TILL PAPERWORK DO US PART',
  'LOYALTY, NO CONTRACT',
  'BORROWED BORDERS',
  'BUILT TO BE REPLACED',
  'UNFINISHED BUSINESS',
  'SIGNAL ACTIVE // STAND BY',
];

const TICKER_TEXT = ITEMS.join('  ·  ') + '  ·  ';

/**
 * Sticky marquee strip.
 * - Content doubled for seamless -50% transform loop
 * - Pulsing REC dot (CSS pulse, gated by reduced-motion in stylesheet)
 * - Occasionally self-interrupts with an amber "SIGNAL INTERFERENCE" burst
 *   only when motion is allowed
 */
export function OnAirTicker() {
  const motionOk = useMotionAllowed();
  const [interference, setInterference] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!motionOk) return;

    // Schedule a random interference burst every 8–20s
    const schedule = () => {
      const delay = 8000 + Math.random() * 12000;
      timerRef.current = setTimeout(() => {
        setInterference(true);
        setTimeout(() => {
          setInterference(false);
          schedule();
        }, 1200);
      }, delay);
    };
    schedule();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [motionOk]);

  return (
    <div className="rf-ticker-wrap" aria-label="Broadcast ticker" role="marquee">
      <div className="rf-ticker-rec" aria-hidden="true">
        <span className={`rf-rec-dot ${motionOk ? 'rf-rec-pulse' : ''}`} />
        <span className="rf-rec-label">ON AIR</span>
      </div>

      <div className="rf-ticker-track-container" aria-hidden="true">
        {interference ? (
          <div className="rf-ticker-interference">
            ▒▒▒ SIGNAL INTERFERENCE ▒▒▒ STAND BY ▒▒▒ SIGNAL INTERFERENCE ▒▒▒
          </div>
        ) : (
          <div
            className={`rf-ticker-track ${motionOk ? 'rf-ticker-animate' : ''}`}
          >
            {/* Doubled content for seamless loop */}
            <span>{TICKER_TEXT}</span>
            <span aria-hidden="true">{TICKER_TEXT}</span>
          </div>
        )}
      </div>
    </div>
  );
}
