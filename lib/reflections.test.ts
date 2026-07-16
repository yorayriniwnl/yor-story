import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Tests against an in-memory fake filesystem so they never touch the real
 * 52 essays in content/reflections/. `fs` is mocked; `readAll()`'s
 * module-level cache means each test needs a fresh module instance
 * (vi.resetModules + dynamic import), or an earlier test's fixture would
 * leak into a later one.
 */

let files: Record<string, string> = {};

vi.mock('fs', () => {
  const impl = {
    existsSync: () => true,
    readdirSync: () => Object.keys(files),
    readFileSync: (p: string) => {
      const name = p.split('/').pop()!;
      if (!(name in files)) throw new Error(`ENOENT (fixture): ${name}`);
      return files[name];
    },
  };
  return { default: impl, ...impl };
});

/** Builds a minimal valid frontmatter block, with overrides for specific fields. */
function fm(overrides: Record<string, unknown> = {}): string {
  const base: Record<string, unknown> = {
    title: 'Test Essay',
    slug: 'test-essay',
    week: 1,
    chapter: 1,
    excerpt: 'An excerpt.',
    date: 'TBD',
    tags: [],
    status: 'published',
  };
  const merged = { ...base, ...overrides };
  const yaml = Object.entries(merged)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');
  return `---\n${yaml}\n---\nSome body text here.\n`;
}

describe('lib/reflections', () => {
  beforeEach(() => {
    files = {};
    vi.resetModules();
  });

  describe('getReflectionBySlug', () => {
    it('returns null for a draft slug (direct URL to a draft must 404, not just the index)', async () => {
      files['w01-draft.md'] = fm({ slug: 'w01-draft', status: 'draft' });
      const { getReflectionBySlug } = await import('./reflections');
      expect(getReflectionBySlug('w01-draft')).toBeNull();
    });

    it('returns the essay for a published slug', async () => {
      files['w01-published.md'] = fm({ slug: 'w01-published' });
      const { getReflectionBySlug } = await import('./reflections');
      const r = getReflectionBySlug('w01-published');
      expect(r?.slug).toBe('w01-published');
      expect(r?.status).toBe('published');
    });

    it('returns null for a slug that does not exist at all', async () => {
      files['w01-published.md'] = fm({ slug: 'w01-published' });
      const { getReflectionBySlug } = await import('./reflections');
      expect(getReflectionBySlug('does-not-exist')).toBeNull();
    });

    it('defaults signal to "processed" when the frontmatter field is absent', async () => {
      files['w01.md'] = fm({ slug: 'w01' });
      const { getReflectionBySlug } = await import('./reflections');
      expect(getReflectionBySlug('w01')?.signal).toBe('processed');
    });

    it('reads signal: "clear" through from frontmatter', async () => {
      files['w01.md'] = fm({ slug: 'w01', signal: 'clear' });
      const { getReflectionBySlug } = await import('./reflections');
      expect(getReflectionBySlug('w01')?.signal).toBe('clear');
    });
  });

  describe('getChapterNeighbors', () => {
    it('finds prev/next within the same chapter, in week order, ignoring other chapters', async () => {
      files['w01.md'] = fm({ slug: 'w01', week: 1, chapter: 1 });
      files['w02.md'] = fm({ slug: 'w02', week: 2, chapter: 1 });
      files['w03.md'] = fm({ slug: 'w03', week: 3, chapter: 1 });
      files['w04.md'] = fm({ slug: 'w04', week: 4, chapter: 2 }); // different chapter
      const { getChapterNeighbors } = await import('./reflections');
      const { prev, next } = getChapterNeighbors('w02');
      expect(prev?.slug).toBe('w01');
      expect(next?.slug).toBe('w03');
    });

    it('returns null at the start and end of a chapter', async () => {
      files['w01.md'] = fm({ slug: 'w01', week: 1, chapter: 1 });
      const { getChapterNeighbors } = await import('./reflections');
      const { prev, next } = getChapterNeighbors('w01');
      expect(prev).toBeNull();
      expect(next).toBeNull();
    });

    it('returns null/null for a slug that is not found', async () => {
      files['w01.md'] = fm({ slug: 'w01' });
      const { getChapterNeighbors } = await import('./reflections');
      expect(getChapterNeighbors('missing')).toEqual({ prev: null, next: null });
    });
  });

  describe('F-03 — chapter-range guard', () => {
    it('throws when a published essay has chapter=0', async () => {
      files['w01-bad.md'] = fm({ slug: 'w01-bad', chapter: 0 });
      const { getAllReflections } = await import('./reflections');
      expect(() => getAllReflections()).toThrow(/chapter/i);
    });

    it('throws when a published essay has a chapter above 9', async () => {
      files['w01-bad.md'] = fm({ slug: 'w01-bad', chapter: 10 });
      const { getAllReflections } = await import('./reflections');
      expect(() => getAllReflections()).toThrow(/chapter/i);
    });

    it('throws on the exact real-world scenario: a misspelled chapter key', async () => {
      // No "chapter" key at all (typo'd as "chaper") — Number(undefined) || 0 ⇒ 0.
      // This is the exact silent-disappearance case the finding describes.
      files['w01-typo.md'] = [
        '---',
        'title: "Test"',
        'slug: "w01-typo"',
        'week: 1',
        'chaper: 1',
        'excerpt: "..."',
        'date: "TBD"',
        'tags: []',
        'status: "published"',
        '---',
        'Body text.',
        '',
      ].join('\n');
      const { getAllReflections } = await import('./reflections');
      expect(() => getAllReflections()).toThrow();
    });

    it('does NOT throw for a draft with an out-of-range chapter — only published essays are load-bearing', async () => {
      files['w01-draft-bad.md'] = fm({ slug: 'w01-draft-bad', chapter: 0, status: 'draft' });
      const { getAllReflections } = await import('./reflections');
      expect(() => getAllReflections()).not.toThrow();
    });

    it('accepts every chapter in the valid 1–9 range', async () => {
      for (let ch = 1; ch <= 9; ch++) {
        files[`w${ch}.md`] = fm({ slug: `w${ch}`, week: ch, chapter: ch });
      }
      const { getAllReflections } = await import('./reflections');
      expect(() => getAllReflections()).not.toThrow();
      expect(getAllReflections()).toHaveLength(9);
    });
  });
});
