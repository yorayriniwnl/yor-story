import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { getAllReflections, getReflectionsByChapter } from '../../lib/reflections';
import { CHAPTERS, PAGE_ORDER, chapterColorVar, romanNumeral } from '../../components/reflections/chapters';
import { EssayCard } from '../../components/reflections/EssayCard';
import { EmailCapture } from '../../components/reflections/EmailCapture';
import { SearchWidget } from '../../components/reflections/SearchWidget';

const TOTAL_CHAPTERS = 52;

export const metadata: Metadata = {
  title: 'Reflections // Yor Ayrin',
  description: '52 chapters. 52 weeks. Every Friday. A personal essay project by Yor Ayrin.',
  openGraph: {
    title: 'Reflections // Yor Ayrin',
    description: '52 chapters. 52 weeks. Every Friday. Life stories, reflections, and everything in between.',
    type: 'website',
  },
};

export default function ReflectionsPage() {
  const byChapter = getReflectionsByChapter();
  const all = getAllReflections();
  const latest = all.at(-1);
  const chapterEntries = PAGE_ORDER.map((number) => ({
    number,
    chapter: CHAPTERS[number],
    essays: byChapter[number] ?? [],
  })).filter(({ essays }) => essays.length > 0);
  const openChapters = chapterEntries.length;

  return (
    <div className="rf-root rf-index-root">
      <header className="rf-site-header">
        <Link href="/reflections" className="rf-wordmark" aria-label="Reflections archive home">
          YR<span>.</span>
        </Link>
        <div className="rf-site-route">PRIVATE ARCHIVE / 01</div>
        <nav className="rf-site-nav" aria-label="Archive navigation">
          <a href="#archive">FILES</a>
          <a href="#subscribe">ACCESS</a>
        </nav>
      </header>

      <main>
        <section className="rf-dossier-hero" aria-labelledby="reflections-title">
          <div className="rf-hero-copy">
            <p className="rf-kicker"><span /> PRIVATE DOSSIER / 2026</p>
            <h1 id="reflections-title" className="rf-hero-title">
              <span>REFLECTIONS</span>
              <em>on what stays.</em>
            </h1>
            <p className="rf-hero-summary">
              52 chapters. 52 weeks. Every Friday.
              Life stories, reflections, and everything in between.
            </p>
            <div className="rf-hero-actions">
              <a className="rf-button rf-button--primary" href="#archive">
                <span aria-hidden="true">&#8594;</span> OPEN THE FILES
              </a>
              <span className="rf-hero-action-note">ESSAYS / UNFINISHED / PERSONAL</span>
            </div>
          </div>

          <div className="rf-hero-board" aria-label="Archive overview">
            <div className="rf-hero-board-top">
              <span>CASEBOARD</span>
              <span>YOR AYRIN / PRIVATE</span>
            </div>
            <div className="rf-hero-plot" aria-hidden="true">
              <span className="rf-plot-ring rf-plot-ring--one" />
              <span className="rf-plot-ring rf-plot-ring--two" />
              <span className="rf-plot-axis rf-plot-axis--x" />
              <span className="rf-plot-axis rf-plot-axis--y" />
              <span className="rf-plot-node rf-plot-node--one" />
              <span className="rf-plot-node rf-plot-node--two" />
              <span className="rf-plot-node rf-plot-node--three" />
              <span className="rf-plot-mark">{String(all.length).padStart(2, '0')}</span>
              <span className="rf-plot-caption">STORIES TOLD SO FAR</span>
            </div>

            {latest ? (
              <Link
                href={`/reflections/${latest.slug}`}
                className="rf-featured-file"
                data-file={`W${String(latest.week).padStart(2, '0')}`}
                style={{ '--case-accent': chapterColorVar(latest.chapter) } as CSSProperties}
              >
                <div className="rf-featured-file-top">
                  <span>PRIMARY FILE</span>
                  <span>CH.{romanNumeral(latest.chapter)}</span>
                </div>
                <div className="rf-featured-file-art" aria-hidden="true">
                  <span className="rf-featured-file-number">{String(latest.week).padStart(2, '0')}</span>
                  <span className="rf-featured-file-stamp">OPEN / READ</span>
                </div>
                <div className="rf-featured-file-copy">
                  <h2>{latest.title}</h2>
                  <span>{latest.readTime} MIN READ <b aria-hidden="true">/</b> LATEST ENTRY</span>
                </div>
              </Link>
            ) : (
              <div className="rf-featured-file rf-featured-file--empty">
                <div className="rf-featured-file-top"><span>PRIMARY FILE</span><span>SEALED</span></div>
                <p>The first entry is still being prepared.</p>
              </div>
            )}
          </div>
        </section>

        <section className="rf-operations-strip" aria-label="Archive status">
          <div><strong>{String(all.length).padStart(2, '0')}</strong><span>PUBLIC FILES</span></div>
          <div><strong>{String(openChapters).padStart(2, '0')}<i>/{String(TOTAL_CHAPTERS).padStart(2, '0')}</i></strong><span>CHAPTERS OPEN</span></div>
          <div><strong>{TOTAL_CHAPTERS}</strong><span>WEEK PROGRAM</span></div>
          <div><strong>{latest ? `W${String(latest.week).padStart(2, '0')}` : '--'}</strong><span>CURRENT RECORD</span></div>
        </section>

        <section className="rf-case-index" aria-labelledby="case-index-title">
          <div className="rf-case-index-heading">
            <p className="rf-kicker"><span /> CHAPTER INDEX</p>
            <h2 id="case-index-title">The record,<br /><em>in fragments.</em></h2>
          </div>
          <ol className="rf-case-index-list">
            {PAGE_ORDER.map((number) => {
              const chapter = CHAPTERS[number];
              const count = byChapter[number]?.length ?? 0;
              const isOpen = count > 0;
              const content = <>
                <span className="rf-case-index-number">{romanNumeral(number)}</span>
                <span className="rf-case-index-name">{chapter?.title}</span>
                <span className="rf-case-index-status">{isOpen ? `${String(count).padStart(2, '0')} FILE${count === 1 ? '' : 'S'}` : 'SEALED'}</span>
              </>;

              return (
                <li key={number} className={isOpen ? 'rf-case-index-item rf-case-index-item--open' : 'rf-case-index-item'}>
                  {isOpen ? <a href={`#chapter-${number}`}>{content}</a> : <span>{content}</span>}
                </li>
              );
            })}
          </ol>
        </section>

        <section className="rf-archive" id="archive" aria-labelledby="archive-title">
          <div className="rf-archive-heading">
            <div>
              <p className="rf-kicker"><span /> FIELD ARCHIVE</p>
              <h2 id="archive-title">Open cases.<br /><em>No clean endings.</em></h2>
            </div>
            <p>Each file is a close look at the systems we call normal when they are too familiar to question.</p>
          </div>

          <SearchWidget />

          <div className="rf-chapters">
            {chapterEntries.map(({ number, chapter, essays }) => (
              <section
                key={number}
                id={`chapter-${number}`}
                className={`rf-chapter rf-chapter--${chapter?.color ?? 'red'}`}
              >
                <header className="rf-chapter-head">
                  <span className="rf-chapter-numeral" aria-hidden="true">{romanNumeral(number)}</span>
                  <div className="rf-chapter-meta">
                    <p className="rf-chapter-label">CHAPTER {romanNumeral(number)} / {String(essays.length).padStart(2, '0')} OPEN FILE{essays.length === 1 ? '' : 'S'}</p>
                    <h3 className="rf-chapter-title">{chapter?.title}</h3>
                    <p className="rf-chapter-sub">{chapter?.sub}</p>
                  </div>
                </header>
                <div className="rf-essay-grid">
                  {essays.map((reflection) => <EssayCard key={reflection.slug} reflection={reflection} />)}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>

      <section className="rf-subscribe" id="subscribe">
        <div className="rf-subscribe-mark" aria-hidden="true">YR.</div>
        <div>
          <p className="rf-kicker"><span /> OPEN CHANNEL</p>
          <h2>Get the next file<br /><em>when it is ready.</em></h2>
        </div>
        <EmailCapture label="No noise. Just the next reflection." />
      </section>
    </div>
  );
}
