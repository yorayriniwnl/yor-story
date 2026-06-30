import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getReflectionBySlug,
  getPublishedSlugs,
  getChapterNeighbors,
} from '../../../lib/reflections';
import { CHAPTERS, chapterColorVar, romanNumeral } from '../../../components/reflections/chapters';
import { BroadcastNoise } from '../../../components/reflections/BroadcastNoise';
import { OnAirTicker } from '../../../components/reflections/OnAirTicker';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = getReflectionBySlug(slug);
  if (!r) return {};

  const ch = CHAPTERS[r.chapter];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yorayriniwnl.vercel.app';

  return {
    title: `${r.title} — Reflections`,
    description: r.excerpt,
    openGraph: {
      title: r.title,
      description: r.excerpt,
      type: 'article',
      images: [
        {
          url: `${baseUrl}/reflections/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: r.title,
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
  const r = getReflectionBySlug(slug);
  if (!r) notFound();

  const { prev, next } = getChapterNeighbors(slug);
  const ch = CHAPTERS[r.chapter];
  const colorVar = chapterColorVar(r.chapter);

  return (
    <div className="rf-root rf-article-root" style={{ '--card-accent': colorVar } as React.CSSProperties}>
      <BroadcastNoise />
      <OnAirTicker />

      <article className="rf-article">
        {/* Ghost chapter numeral */}
        <div className="rf-article-ghost" aria-hidden="true">
          {romanNumeral(r.chapter)}
        </div>

        <header className="rf-article-header">
          <div className="rf-article-arc">
            <span className="rf-article-ch">
              CH.{romanNumeral(r.chapter)}
            </span>
            <span className="rf-article-chname">{ch?.title}</span>
          </div>

          <h1 className="rf-article-title">{r.title}</h1>

          <blockquote className="rf-article-pull">{r.excerpt}</blockquote>

          <div className="rf-article-meta">
            {r.date !== 'TBD' && <span>Week {r.week} · {r.date}</span>}
            {r.wordCount > 0 && (
              <>
                <span className="rf-meta-sep">·</span>
                <span>{r.readTime} min read</span>
                <span className="rf-meta-sep">·</span>
                <span>{r.wordCount.toLocaleString()} words</span>
              </>
            )}
          </div>

          {r.tags.length > 0 && (
            <div className="rf-article-tags">
              {r.tags.map((t) => (
                <span key={t} className="rf-tag">{t}</span>
              ))}
            </div>
          )}
        </header>

        <div className="rf-article-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {r.body}
          </ReactMarkdown>
        </div>
      </article>

      {/* Prev/next nav scoped within the same chapter */}
      <nav className="rf-article-nav" aria-label="Chapter navigation">
        {prev ? (
          <Link href={`/reflections/${prev.slug}`} className="rf-nav-prev">
            <span className="rf-nav-dir">← PREV</span>
            <span className="rf-nav-title">{prev.title}</span>
          </Link>
        ) : (
          <Link href="/reflections" className="rf-nav-prev rf-nav-back">
            ← BACK TO REFLECTIONS
          </Link>
        )}
        {next ? (
          <Link href={`/reflections/${next.slug}`} className="rf-nav-next">
            <span className="rf-nav-dir">NEXT →</span>
            <span className="rf-nav-title">{next.title}</span>
          </Link>
        ) : (
          <Link href="/reflections" className="rf-nav-next rf-nav-back">
            BACK TO REFLECTIONS →
          </Link>
        )}
      </nav>
    </div>
  );
}
