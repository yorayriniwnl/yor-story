import fs from 'fs';
import path from 'path';
import { CHAPTERS } from '../components/reflections/chapters';
const REFLECTIONS_DIR = path.join(process.cwd(), 'content', 'reflections');

type FrontmatterValue = string | number | boolean | string[];

function parseFrontmatterValue(raw: string): FrontmatterValue {
  const value = raw.trim();
  if (value.startsWith('[')) {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed) || !parsed.every(item => typeof item === 'string')) {
      throw new Error('[reflections] frontmatter arrays must contain strings only.');
    }
    return parsed;
  }
  if (value.startsWith('"') && value.endsWith('"')) return JSON.parse(value);
  if (value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1);
  if (/^-?\d+$/.test(value)) return Number(value);
  if (value === 'true' || value === 'false') return value === 'true';
  return value;
}

function parseFrontmatterDocument(raw: string): { data: Record<string, FrontmatterValue>; content: string } {
  const normalized = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    throw new Error('[reflections] markdown file is missing the opening frontmatter delimiter.');
  }

  const end = normalized.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('[reflections] markdown file is missing the closing frontmatter delimiter.');

  const data: Record<string, FrontmatterValue> = {};
  for (const line of normalized.slice(4, end).split('\n')) {
    if (!line.trim()) continue;
    const separator = line.indexOf(':');
    if (separator <= 0) throw new Error(`[reflections] invalid frontmatter line: ${line}`);
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    data[key] = parseFrontmatterValue(value);
  }

  return { data, content: normalized.slice(end + 5) };
}

export interface ReflectionFrontmatter {
  title: string;
  slug: string;
  week: number;
  chapter: number;
  excerpt: string;
  date: string;
  tags: string[];
  status: 'published' | 'draft';
  /**
   * Editorial signal-clarity flag (see README / build notes).
   * 'processed' (default) is the full broadcast apparatus — scanlines, ambient
   * drift, ticker interference, all at full intensity. 'clear' dials the
   * chrome down for essays where the writing itself should carry the
   * exposure, without the broadcast distance adding to it.
   * Optional and opt-in — omitting it changes nothing about existing essays.
   */
  signal?: 'clear' | 'processed';
}

export interface Reflection extends ReflectionFrontmatter {
  wordCount: number;
  readTime: number; // minutes
  body: string;
  /** Always resolved to a concrete value — never undefined, even though the frontmatter field is optional. */
  signal: 'clear' | 'processed';
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
  const { data, content } = parseFrontmatterDocument(raw);

  const fm = data as unknown as ReflectionFrontmatter;
  const wordCount = deriveWordCount(content);
  const readTime = deriveReadTime(wordCount);
  const chapter = Number(fm.chapter) || 0;
  const status = fm.status === 'published' ? 'published' : 'draft';

  // F-03: a missing or misspelled `chapter` key resolves to 0, which is
  // outside the defined chapters. That essay would still parse
  // and be marked published, but every render loop that iterates chapters
  // would silently skip it — no error, no 404, just gone. These
  // frontmatter blocks are hand-edited, which makes this exactly the kind
  // of typo that will eventually happen, so a published essay with a
  // bad chapter fails loudly at build/read time instead of vanishing.
  const validChapters = Object.keys(CHAPTERS).map(Number);
  if (status === 'published' && !validChapters.includes(chapter)) {
    throw new Error(
      `[reflections] "${filename}" is published with chapter="${fm.chapter}" — must be one of: ${validChapters.join(', ')}. ` +
      `A wrong or missing value here silently drops the essay from every chapter section.`
    );
  }

  return {
    title: fm.title ?? '',
    slug: fm.slug ?? filename.replace(/\.mdx?$/, ''),
    week: Number(fm.week) || 0,
    chapter,
    excerpt: fm.excerpt ?? '',
    date: fm.date ?? 'TBD',
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    status,
    signal: fm.signal === 'clear' ? 'clear' : 'processed',
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