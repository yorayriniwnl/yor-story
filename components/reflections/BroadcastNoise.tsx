'use client';

/**
 * Fixed scanline + grain overlay.
 * mix-blend-mode: overlay — sits above all content.
 * Static texture is on for everyone (cheap, no motion).
 * Flicker keyframe is gated behind reduced motion via CSS only.
 * No JS motion check needed — the @media query in the stylesheet handles it.
 */
export function BroadcastNoise() {
  return (
    <>
      {/* CRT scanlines */}
      <div className="rf-scanlines" aria-hidden="true" />
      {/* Film grain */}
      <div className="rf-grain" aria-hidden="true" />
    </>
  );
}
