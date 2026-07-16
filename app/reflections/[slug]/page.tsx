import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getReflectionBySlug,
  getPublishedSlugs,
  getChapterNeighbors,
} from '../../../lib/reflections';
import { CHAPTERS, chapterColorVar, romanNumeral } from '../../../components/reflections/chapters';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const reflection = getReflectionBySlug(slug);
  if (!reflection) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yorayriniwnl.vercel.app';

  return {
    title: `${reflection.title} - Reflections`,
    description: reflection.excerpt,
    openGraph: {
      title: reflection.title,
      description: reflection.excerpt,
      type: 'article',
      images: [
        {
          url: `${baseUrl}/reflections/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: reflection.title,
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}/reflections/${slug}`,
    },
  };
}

export default async function ReflectionPage({ params }: Props) {
  const { slug } = await params;
  const reflection = getReflectionBySlug(slug);
  if (!reflection) notFound();

  const { prev, next } = getChapterNeighbors(slug);
  const chapter = CHAPTERS[reflection.chapter];
  const colorVar = chapterColorVar(reflection.chapter);
  const week = String(reflection.week).padStart(2, '0');

  return (
    <div
      className="rf-root rf-reader-root"
      style={{ '--case-accent': colorVar } as CSSProperties}
    >
      <header className="rf-site-header rf-reader-site-header">
        <Link href="/reflections" className="rf-wordmark" aria-label="Back to Reflections archive">
          YR<span>.</span>
        </Link>
        <div className="rf-site-route">REFLECTIONS / FILE W{week}</div>
        <Link href="/reflections" className="rf-reader-back">&#8592; ALL FILES</Link>
      </header>

      <main>
        <article className="rf-article">
          <header className="rf-article-header">
            <div className="rf-article-header-copy">
              <p className="rf-kicker"><span /> FIELD NOTE / W{week}</p>
              <div className="rf-article-arc">
                <span>CH.{romanNumeral(reflection.chapter)}</span>
                <i aria-hidden="true" />
                <span>{chapter?.title}</span>
              </div>
              <h1 className="rf-article-title">{reflection.title}</h1>
              <p className="rf-article-pull">{reflection.excerpt}</p>
              <div className="rf-article-meta">
                {reflection.date !== 'TBD' && <span>{reflection.date}</span>}
                <span>{reflection.readTime} MIN READ</span>
                <span>{reflection.wordCount.toLocaleString()} WORDS</span>
              </div>
              {reflection.tags.length > 0 && (
                <div className="rf-article-tags" aria-label="Topics">
                  {reflection.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              )}
            </div>

            <div className="rf-article-plot" aria-hidden="true">
              <span className="rf-article-plot-number">{week}</span>
              <span className="rf-article-plot-ring rf-article-plot-ring--one" />
              <span className="rf-article-plot-ring rf-article-plot-ring--two" />
              <span className="rf-article-plot-line rf-article-plot-line--one" />
              <span className="rf-article-plot-line rf-article-plot-line--two" />
              <span className="rf-article-plot-dot rf-article-plot-dot--one" />
              <span className="rf-article-plot-dot rf-article-plot-dot--two" />
              <span className="rf-article-plot-caption">DOCUMENT / PERSONAL / OPEN</span>
            </div>
          </header>

          <div className="rf-reading-layout">
            <aside className="rf-reading-rail" aria-label="File details">
              <div><span>CASE</span><strong>W{week}</strong></div>
              <div><span>CHAPTER</span><strong>{romanNumeral(reflection.chapter)}</strong></div>
              <div><span>STATUS</span><strong>OPEN</strong></div>
              <span className="rf-reading-rail-rule" />
              <p>Read slowly. Keep what is useful.</p>
            </aside>

            <div className="rf-article-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {reflection.body}
              </ReactMarkdown>
            </div>
          </div>
        </article>
      </main>

      <nav className="rf-article-nav" aria-label="Chapter navigation">
        {prev ? (
          <Link href={`/reflections/${prev.slug}`} className="rf-nav-prev">
            <span>PREVIOUS FILE</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <Link href="/reflections" className="rf-nav-prev">
            <span>ARCHIVE</span>
            <strong>Back to all files</strong>
          </Link>
        )}
        <Link href="/reflections" className="rf-nav-back">YR. / ARCHIVE</Link>
        {next ? (
          <Link href={`/reflections/${next.slug}`} className="rf-nav-next">
            <span>NEXT FILE</span>
            <strong>{next.title}</strong>
          </Link>
        ) : (
          <Link href="/reflections" className="rf-nav-next">
            <span>CHAPTER COMPLETE</span>
            <strong>Return to the archive</strong>
          </Link>
        )}
      </nav>
    </div>
  );
}
