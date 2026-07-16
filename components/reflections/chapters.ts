// Single source of truth for chapter display data.
// Never duplicate chapter titles into content frontmatter.

export type ChapterColor = 'red' | 'cyan';

export interface ChapterMeta {
  numeral: string;
  title: string;
  sub: string;
  color: ChapterColor;
  isInterlude?: boolean;
}

export const CHAPTERS: Record<number, ChapterMeta> = {
  1: {
    numeral: 'I',
    title: 'Faith, Manufactured',
    sub: 'How belief gets installed before the user knows there is a product.',
    color: 'red',
  },
  2: {
    numeral: 'II',
    title: 'Inherited Damage',
    sub: 'Damage passed down without a will read aloud, just handed to you at birth.',
    color: 'red',
  },
  3: {
    numeral: 'III',
    title: "The Body Isn't the Sin",
    sub: 'Shame was installed. Desire predates the installation.',
    color: 'cyan',
  },
  4: {
    numeral: 'IV',
    title: 'What We Call Love',
    sub: 'Love runs on conviction. Conviction has no comparison operator.',
    color: 'cyan',
  },
  5: {
    numeral: 'V',
    title: 'Till Paperwork Do Us Part',
    sub: 'The one contract people sign without reading the cancellation terms.',
    color: 'red',
  },
  6: {
    numeral: 'VI',
    title: 'Loyalty, No Contract',
    sub: 'The dog stays without being threatened. That is the whole thesis.',
    color: 'cyan',
  },
  7: {
    numeral: 'VII',
    title: 'Borrowed Borders',
    sub: 'Lines drawn by people who never lived inside them.',
    color: 'red',
  },
  8: {
    numeral: 'VIII',
    title: 'Built to Be Replaced',
    sub: 'What is worth doing once useful stops meaning employable.',
    color: 'red',
  },
  9: {
    numeral: 'IX',
    title: 'Unfinished Business',
    sub: "Grudges, justice, mortality, legacy — the ledger that doesn't close.",
    color: 'cyan',
  },
};

/** Render order for the index page. Matches numeric chapter order. */
export const PAGE_ORDER: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function romanNumeral(n: number): string {
  return CHAPTERS[n]?.numeral ?? String(n);
}

export function chapterColor(n: number): ChapterColor {
  return CHAPTERS[n]?.color ?? 'red';
}

/** CSS custom property name for a chapter's accent color. */
export function chapterColorVar(n: number): string {
  const color = chapterColor(n);
  return color === 'red' ? 'var(--rec-red)' : 'var(--carrier-cyan)';
}
