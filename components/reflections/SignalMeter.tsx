interface SignalMeterProps {
  published: number;
  total?: number;
}

/**
 * Segmented signal-strength meter.
 * Discrete lit/unlit segments scaled to published / 52 transmissions.
 * Brighter "peak" segment at the leading edge of decoded transmissions.
 * Not a plain gradient progress bar.
 */
export function SignalMeter({ published, total = 52 }: SignalMeterProps) {
  const SEGMENTS = 26; // 26 segments representing 52 weeks (2 weeks per segment)
  const litCount = Math.round((published / total) * SEGMENTS);

  return (
    <div className="rf-meter" aria-label={`${published} of ${total} transmissions decoded`}>
      <div className="rf-meter-label">
        <span className="rf-meter-count">{published}</span>
        <span className="rf-meter-slash">/</span>
        <span className="rf-meter-total">{total}</span>
        <span className="rf-meter-unit">TRANSMISSIONS DECODED</span>
      </div>
      <div className="rf-meter-segments" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const isLit = i < litCount;
          const isPeak = i === litCount - 1 && litCount > 0;
          return (
            <div
              key={i}
              className={`rf-segment ${isLit ? 'rf-segment--lit' : ''} ${isPeak ? 'rf-segment--peak' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}
