'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  label?: string;
}

type State = 'idle' | 'loading' | 'success' | 'error';

/**
 * Email capture form for the Reflections mailing list.
 * Styled exclusively to the ON AIR dark token set — never falls back to light theme.
 * Loading/success/error states; disables submit while in-flight;
 * clears error on retype.
 */
export function EmailCapture({ label = 'Tune in — receive each transmission.' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (state === 'error') {
      setState('idle');
      setMessage('');
    }
  };

  const handleSubmit = async () => {
    if (!email || state === 'loading') return;

    setState('loading');
    setMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setState('success');
        setMessage(data.message ?? 'You\'re on the frequency.');
        setEmail('');
      } else if (res.status === 409) {
        setState('success');
        setMessage('Already subscribed. Signal received.');
      } else {
        setState('error');
        setMessage(data.error ?? 'Transmission failed. Try again.');
      }
    } catch {
      setState('error');
      setMessage('Could not reach the server. Try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="rf-email-wrap">
      <p className="rf-email-label">{label}</p>

      {state === 'success' ? (
        <p className="rf-email-success" role="status">
          <span className="rf-rec-dot" aria-hidden="true" />
          {message}
        </p>
      ) : (
        <div className="rf-email-row">
          <input
            type="email"
            className="rf-email-input"
            placeholder="your@frequency.com"
            value={email}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={state === 'loading'}
            aria-label="Email address"
            autoComplete="email"
          />
          <button
            type="button"
            className={`rf-email-btn ${state === 'loading' ? 'rf-email-btn--loading' : ''}`}
            onClick={handleSubmit}
            disabled={state === 'loading' || !email}
            aria-live="polite"
          >
            {state === 'loading' ? '…' : 'SUBSCRIBE'}
          </button>
        </div>
      )}

      {state === 'error' && message && (
        <p className="rf-email-error" role="alert">{message}</p>
      )}
    </div>
  );
}
