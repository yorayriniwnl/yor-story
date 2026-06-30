'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { CHAPTERS, chapterColorVar, romanNumeral } from './chapters';

interface SearchItem {
  id: string;
  title: string;
  excerpt: string;
  week: number;
  chapter: number;
  tags: string[];
  url: string;
  snippet: string;
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function score(item: SearchItem, q: string): number {
  const norm = normalise(q);
  const title = normalise(item.title);
  const excerpt = normalise(item.excerpt);
  const snippet = normalise(item.snippet);
  const chapterTitle = normalise(CHAPTERS[item.chapter]?.title ?? '');

  if (title.includes(norm)) return 3;
  if (excerpt.includes(norm)) return 2;
  if (chapterTitle.includes(norm)) return 1;
  if (snippet.includes(norm)) return 0.5;
  return -1;
}

/**
 * Client-side search widget for published Reflections essays.
 * Fetches the index once from /api/reflections/search on first mount,
 * then filters locally — no round-trip per keystroke.
 * Debounced at 180ms so it doesn't stutter on fast typing.
 */
export function SearchWidget() {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch the index once on mount
  useEffect(() => {
    setStatus('loading');
    fetch('/api/reflections/search')
      .then(r => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((data: { data: SearchItem[] }) => {
        setIndex(data.data ?? []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  const filter = useCallback(
    (q: string, idx: SearchItem[]) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setResults([]);
        return;
      }
      const scored = idx
        .map(item => ({ item, s: score(item, trimmed) }))
        .filter(({ s }) => s > 0)
        .sort((a, b) => b.s - a.s)
        .map(({ item }) => item);
      setResults(scored);
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => filter(q, index), 180);
  };

  // Keyboard shortcut — "/" focuses the input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== inputRef.current &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        setResults([]);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const hasQuery = query.trim().length > 0;
  const noResults = hasQuery && results.length === 0 && status === 'ready';

  return (
    <section className="rf-search-wrap" aria-label="Search essays">
      <div className="rf-search-header">
        <span className="rf-search-label">SEARCH TRANSMISSIONS</span>
        <span className="rf-search-hint">Press <kbd className="rf-search-kbd">/</kbd> to focus</span>
      </div>

      <div className="rf-search-input-row">
        <span className="rf-search-icon" aria-hidden="true">▷</span>
        <input
          ref={inputRef}
          type="search"
          className="rf-search-input"
          placeholder="title, chapter, keyword…"
          value={query}
          onChange={handleChange}
          aria-label="Search essays"
          autoComplete="off"
          spellCheck={false}
          disabled={status === 'error'}
        />
        {status === 'loading' && (
          <span className="rf-search-spinner" aria-hidden="true">▒</span>
        )}
        {hasQuery && (
          <button
            className="rf-search-clear"
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      {status === 'error' && (
        <p className="rf-search-error" role="alert">
          Could not load search index.
        </p>
      )}

      {noResults && (
        <p className="rf-search-empty" role="status">
          <span aria-hidden="true">▒ </span>
          No transmissions match <em>{query}</em>.
        </p>
      )}

      {results.length > 0 && (
        <div className="rf-search-results" role="list">
          <div className="rf-search-count" aria-live="polite">
            {results.length} transmission{results.length !== 1 ? 's' : ''} found
          </div>
          <div className="rf-search-grid">
            {results.map(item => {
              const colorVar = chapterColorVar(item.chapter);
              const ch = CHAPTERS[item.chapter];
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className="rf-search-card"
                  style={{ '--card-accent': colorVar } as React.CSSProperties}
                  role="listitem"
                >
                  <div className="rf-search-card-header">
                    <span className="rf-search-card-week">
                      W{String(item.week).padStart(2, '0')}
                    </span>
                    <span className="rf-search-card-chapter">
                      CH.{romanNumeral(item.chapter)} — {ch?.title ?? ''}
                    </span>
                  </div>
                  <h3 className="rf-search-card-title">{item.title}</h3>
                  <p className="rf-search-card-excerpt">{item.excerpt}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
