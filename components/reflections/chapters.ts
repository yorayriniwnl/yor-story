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
    title: 'Introduction',
    sub: 'The story begins here. Who is Yor Ayrin and why does any of this matter.',
    color: 'red',
  },
  2: {
    numeral: 'II',
    title: 'Origins',
    sub: 'Early days, first games, and the foundation of a digital identity.',
    color: 'cyan',
  },
  3: {
    numeral: 'III',
    title: 'The Climb',
    sub: 'Chasing the elusive global elite and the struggles of competitive gaming.',
    color: 'red',
  },
  4: {
    numeral: 'IV',
    title: 'Temptation',
    sub: 'Shortcuts, frustration, and the allure of cheating.',
    color: 'cyan',
  },
  5: {
    numeral: 'V',
    title: 'The Fall',
    sub: 'Faceit ban, loss of community, and facing the consequences.',
    color: 'red',
  },
  6: {
    numeral: 'VI',
    title: 'Realizations',
    sub: 'Mental health, personal growth, and taking responsibility.',
    color: 'cyan',
  },
  7: {
    numeral: 'VII',
    title: 'Redirection',
    sub: 'Channeling ambition from games to real-world development.',
    color: 'red',
  },
  8: {
    numeral: 'VIII',
    title: 'Connections',
    sub: 'College life, building startups, and finding genuine relationships.',
    color: 'cyan',
  },
  9: {
    numeral: 'IX',
    title: 'The Future',
    sub: 'Looking ahead: Yor Zenith, Yor Stores, and the legacy to build.',
    color: 'red',
  },
};

/** Render order for the index page. Matches numeric chapter order. */
export const PAGE_ORDER: number[] = Object.keys(CHAPTERS).map(Number).sort((a, b) => a - b);

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
