'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
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

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function score(item: SearchItem, query: string): number {
  const normalisedQuery = normalise(query);
  const title = normalise(item.title);
  const excerpt = normalise(item.excerpt);
  const snippet = normalise(item.snippet);
  const chapterTitle = normalise(CHAPTERS[item.chapter]?.title ?? '');

  if (title.includes(normalisedQuery)) return 3;
  if (excerpt.includes(normalisedQuery)) return 2;
  if (chapterTitle.includes(normalisedQuery)) return 1;
  if (snippet.includes(normalisedQuery)) return 0.5;
  return -1;
}

/** A local archive index: fetched once, then filtered without a round trip. */
export function SearchWidget() {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState<SearchItem[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/reflections/search')
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.json();
      })
      .then((data: { data: SearchItem[] }) => {
        setIndex(data.data ?? []);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query), 180);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement !== inputRef.current &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        setDebouncedQuery('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim();
    if (!trimmedQuery) return [];

    return index
      .map((item) => ({ item, ranking: score(item, trimmedQuery) }))
      .filter(({ ranking }) => ranking > 0)
      .sort((a, b) => b.ranking - a.ranking)
      .map(({ item }) => item);
  }, [debouncedQuery, index]);

  const hasQuery = query.trim().length > 0;
  const noResults = hasQuery && results.length === 0 && status === 'ready';

  return (
    <section className="rf-search-wrap" aria-label="Search the archive">
      <div className="rf-search-header">
        <span className="rf-search-label">FIND A FILE</span>
        <span className="rf-search-hint">PRESS <kbd className="rf-search-kbd">/</kbd> TO SEARCH</span>
      </div>

      <div className="rf-search-input-row">
        <span className="rf-search-icon" aria-hidden="true">&#8594;</span>
        <input
          ref={inputRef}
          type="search"
          className="rf-search-input"
          placeholder="title, chapter, or a word you remember"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search essays"
          autoComplete="off"
          spellCheck={false}
          disabled={status === 'error'}
        />
        {status === 'loading' && <span className="rf-search-spinner" aria-hidden="true">INDEXING</span>}
        {hasQuery && (
          <button
            className="rf-search-clear"
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            type="button"
          >
            CLEAR
          </button>
        )}
      </div>

      {status === 'error' && <p className="rf-search-error" role="alert">The archive index could not be loaded.</p>}
      {noResults && <p className="rf-search-empty" role="status">No open file matches <em>{query}</em>.</p>}

      {results.length > 0 && (
        <div className="rf-search-results" role="list">
          <div className="rf-search-count" aria-live="polite">
            {results.length} FILE{results.length === 1 ? '' : 'S'} FOUND
          </div>
          <div className="rf-search-grid">
            {results.map((item) => {
              const chapter = CHAPTERS[item.chapter];
              return (
                <Link
                  key={item.id}
                  href={item.url}
                  className="rf-search-card"
                  style={{ '--card-accent': chapterColorVar(item.chapter) } as CSSProperties}
                  role="listitem"
                >
                  <div className="rf-search-card-header">
                    <span>W{String(item.week).padStart(2, '0')}</span>
                    <span>CH.{romanNumeral(item.chapter)}</span>
                  </div>
                  <h3 className="rf-search-card-title">{item.title}</h3>
                  <p className="rf-search-card-excerpt">{item.excerpt}</p>
                  <span className="rf-search-card-chapter">{chapter?.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
