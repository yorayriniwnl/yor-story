'use client';

import { useEffect, useState } from 'react';

/**
 * A thin accent-colored progress bar fixed to the top of the viewport.
 * Shows how far the reader has scrolled through the article.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100));
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="rf-progress" aria-hidden="true">
      <div className="rf-progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
