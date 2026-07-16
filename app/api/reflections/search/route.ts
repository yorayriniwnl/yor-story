import { NextResponse } from 'next/server';
import { getSearchIndex } from '../../../../lib/reflections';

/**
 * GET /api/reflections/search
 *
 * Returns all published reflections shaped for client-side search.
 * This route exists because lib/reflections.ts reads the filesystem
 * at build/request time — it cannot be imported directly into a client-side
 * search component. The client fetches this once and runs filtering locally.
 *
 * Cache: 1hr with 30s stale-while-revalidate.
 */
export async function GET() {
  try {
    const index = getSearchIndex();
    return NextResponse.json(
      { data: index, count: index.length },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=30',
        },
      }
    );
  } catch (err) {
    console.error('[reflections/search] Error building index:', err);
    return NextResponse.json(
      { error: 'Could not build search index.' },
      { status: 500 }
    );
  }
}
