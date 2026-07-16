'use client';

import { useState } from 'react';

interface EmailCaptureProps {
  label?: string;
}

type State = 'idle' | 'loading' | 'success' | 'error';

export function EmailCapture({ label = 'Receive each new reflection.' }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
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
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        setState('success');
        setMessage(data.message ?? 'You are on the list.');
        setEmail('');
      } else if (response.status === 409) {
        setState('success');
        setMessage('You are already on the list.');
      } else {
        setState('error');
        setMessage(data.error ?? 'The request could not be completed. Try again.');
      }
    } catch {
      setState('error');
      setMessage('Could not reach the server. Try again.');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSubmit();
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
            placeholder="you@example.com"
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
            {state === 'loading' ? 'SENDING' : 'SUBSCRIBE'}
          </button>
        </div>
      )}

      {state === 'error' && message && <p className="rf-email-error" role="alert">{message}</p>}
    </div>
  );
}
