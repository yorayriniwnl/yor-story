import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email = typeof body === 'object' && body !== null && 'email' in body
    ? String((body as { email: unknown }).email).trim().toLowerCase()
    : '';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  // Dev mode: keys not configured — log and return friendly success
  if (!apiKey || !audienceId) {
    console.log(`[subscribe] DEV MODE — would subscribe: ${email}`);
    return NextResponse.json(
      { message: 'Subscribed (dev mode — Resend keys not configured).' },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
      }),
    });

    if (res.status === 409) {
      // Already subscribed — not an error
      return NextResponse.json(
        { message: 'Already subscribed. Signal received.' },
        { status: 409 }
      );
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[subscribe] Resend error:', res.status, err);
      return NextResponse.json(
        { error: 'Subscription failed. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { message: 'You\'re on the frequency.' },
      { status: 200 }
    );
  } catch (err) {
    console.error('[subscribe] Network error:', err);
    return NextResponse.json(
      { error: 'Could not reach subscription service.' },
      { status: 503 }
    );
  }
}
