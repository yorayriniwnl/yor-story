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
