import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const REFLECTIONS_DIR = path.join(process.cwd(), 'content', 'reflections');

export interface ReflectionFrontmatter {
  title: string;
  slug: string;
  week: number;
  chapter: number;
  excerpt: string;
  date: string;
  tags: string[];
  status: 'published' | 'draft';
}

export interface Reflection extends ReflectionFrontmatter {
  wordCount: number;
  readTime: number; // minutes
  body: string;
}

/** Derive word count from the markdown body — never trust frontmatter. */
function deriveWordCount(body: string): number {
  const stripped = body
    .replace(/---[\s\S]*?---/, '') // strip any residual frontmatter
    .replace(/[#*>`\[\]!]/g, '')   // strip markdown punctuation
    .trim();
  return stripped.split(/\s+/).filter(Boolean).length;
}

function deriveReadTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 200));
}

function parseFile(filename: string): Reflection | null {
  // Skip unplaced / prefixed with _
  if (filename.startsWith('_')) return null;

  const fullPath = path.join(REFLECTIONS_DIR, filename);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

  const fm = data as ReflectionFrontmatter;
  const wordCount = deriveWordCount(content);
  const readTime = deriveReadTime(wordCount);

  return {
    title: fm.title ?? '',
    slug: fm.slug ?? filename.replace(/\.mdx?$/, ''),
    week: Number(fm.week) || 0,
    chapter: Number(fm.chapter) || 0,
    excerpt: fm.excerpt ?? '',
    date: fm.date ?? 'TBD',
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    status: fm.status === 'published' ? 'published' : 'draft',
    wordCount,
    readTime,
    body: content,
  };
}

let _cache: Reflection[] | null = null;

/** All reflections parsed from disk (all statuses, for internal use). */
function readAll(): Reflection[] {
  if (_cache) return _cache;

  if (!fs.existsSync(REFLECTIONS_DIR)) {
    console.warn('[reflections] content/reflections/ directory not found.');
    return [];
  }

  const files = fs.readdirSync(REFLECTIONS_DIR).filter(f => /\.mdx?$/.test(f));
  const parsed = files.map(parseFile).filter((r): r is Reflection => r !== null);
  _cache = parsed.sort((a, b) => a.week - b.week);
  return _cache;
}

/**
 * Returns only published essays, sorted by week.
 * Drafts are excluded — a draft week does not appear on the public index
 * and does not resolve at its slug URL.
 */
export function getAllReflections(): Reflection[] {
  return readAll().filter(r => r.status === 'published');
}

/** Groups published reflections by chapter, sorted by week within chapter. */
export function getReflectionsByChapter(): Record<number, Reflection[]> {
  const all = getAllReflections();
  const grouped: Record<number, Reflection[]> = {};
  for (const r of all) {
    if (!grouped[r.chapter]) grouped[r.chapter] = [];
    grouped[r.chapter].push(r);
  }
  return grouped;
}

/**
 * Returns a single published reflection by slug.
 * Returns null for any unpublished or missing slug — so a direct URL
 * to a draft 404s, not just the index.
 */
export function getReflectionBySlug(slug: string): Reflection | null {
  const all = readAll();
  const found = all.find(r => r.slug === slug);
  if (!found) return null;
  if (found.status !== 'published') return null;
  return found;
}

/** Returns slugs of all published reflections (for generateStaticParams). */
export function getPublishedSlugs(): string[] {
  return getAllReflections().map(r => r.slug);
}

/**
 * Returns prev/next published essays scoped within the same chapter.
 * Falls back to null at the ends of a chapter — caller shows "Back to Reflections".
 */
export function getChapterNeighbors(
  slug: string
): { prev: Reflection | null; next: Reflection | null } {
  const all = getAllReflections();
  const current = all.find(r => r.slug === slug);
  if (!current) return { prev: null, next: null };

  const sameChapter = all.filter(r => r.chapter === current.chapter);
  const idx = sameChapter.findIndex(r => r.slug === slug);
  return {
    prev: idx > 0 ? sameChapter[idx - 1] : null,
    next: idx < sameChapter.length - 1 ? sameChapter[idx + 1] : null,
  };
}

/**
 * Returns published reflections shaped for the search API — lightweight,
 * no full body, just what the search endpoint needs.
 */
export function getSearchIndex() {
  return getAllReflections().map(r => ({
    id: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    week: r.week,
    chapter: r.chapter,
    tags: r.tags,
    url: `/reflections/${r.slug}`,
    // Include a short body snippet for full-text search
    snippet: r.body.replace(/[#>*`\[\]!]/g, '').slice(0, 500),
  }));
}
