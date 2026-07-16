'use client';

interface BroadcastNoiseProps {
  /**
   * 'full' (default) is the standard broadcast apparatus at full strength.
   * 'clear' dials scanlines + grain down for essays with signal: 'clear' —
   * see the Reflection.signal doc comment in lib/reflections.ts. Still
   * present (this stays one universe, not a stripped-down mode), just quiet.
   */
  intensity?: 'full' | 'clear';
}

/**
 * Fixed scanline + grain overlay.
 * mix-blend-mode: overlay — sits above all content.
 * Static texture is on for everyone (cheap, no motion).
 * Flicker keyframe is gated behind reduced motion via CSS only.
 * No JS motion check needed — the @media query in the stylesheet handles it.
 */
export function BroadcastNoise({ intensity = 'full' }: BroadcastNoiseProps) {
  const clear = intensity === 'clear';
  return (
    <>
      {/* CRT scanlines */}
      <div className={`rf-scanlines ${clear ? 'rf-scanlines--clear' : ''}`} aria-hidden="true" />
      {/* Film grain */}
      <div className={`rf-grain ${clear ? 'rf-grain--clear' : ''}`} aria-hidden="true" />
    </>
  );
}
