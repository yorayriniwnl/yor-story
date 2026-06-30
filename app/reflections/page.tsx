import type { Metadata } from 'next';
import { getAllReflections, getReflectionsByChapter } from '../../lib/reflections';
import { CHAPTERS, PAGE_ORDER, romanNumeral } from '../../components/reflections/chapters';
import { OnAirTicker } from '../../components/reflections/OnAirTicker';
import { SignalBoot } from '../../components/reflections/SignalBoot';
import { BroadcastNoise } from '../../components/reflections/BroadcastNoise';
import { SignalMeter } from '../../components/reflections/SignalMeter';
import { EssayCard } from '../../components/reflections/EssayCard';
import { EmailCapture } from '../../components/reflections/EmailCapture';
import { AmbientVignette } from '../../components/reflections/AmbientVignette';
import { ScrambleText } from '../../components/reflections/ScrambleText';
import { SearchWidget } from '../../components/reflections/SearchWidget';

export const metadata: Metadata = {
  title: 'Reflections // Yor Ayrin',
  description: 'A 52-week personal essay project. 9 chapters. First-person, second-person-addressed, unsentimental, structurally argued.',
  openGraph: {
    title: 'Reflections // Yor Ayrin',
    description: 'A 52-week personal essay project on faith, love, damage, bodies, and borders.',
    type: 'website',
  },
};

export default function ReflectionsPage() {
  const byChapter = getReflectionsByChapter();
  const all = getAllReflections();

  return (
    <div className="rf-root">
      <BroadcastNoise />
      <SignalBoot />
      <AmbientVignette />

      <OnAirTicker />

      {/* Masthead */}
      <header className="rf-masthead">
        <div className="rf-masthead-inner">
          <div className="rf-masthead-eyebrow">YOR AYRIN // PRIVATE FREQUENCY</div>
          <ScrambleText
            text="REFLECTIONS"
            as="h1"
            className="rf-masthead-title"
            trigger="mount"
          />
          <p className="rf-masthead-sub">
            52 weeks. 9 chapters. One transmission at a time.
          </p>
        </div>
        <SignalMeter published={all.length} total={52} />
      </header>

      {/* Search */}
      <SearchWidget />

      {/* Chapter sections */}
      <main className="rf-chapters">
        {PAGE_ORDER.map((chNum) => {
          const ch = CHAPTERS[chNum];
          if (!ch) return null;
          const essays = byChapter[chNum] ?? [];

          return (
            <section
              key={chNum}
              data-chapter={chNum}
              className={`rf-chapter rf-chapter--${ch.color}`}
            >
              <div className="rf-chapter-head">
                <div
                  className="rf-chapter-numeral"
                  aria-hidden="true"
                >
                  {romanNumeral(chNum)}
                </div>
                <div className="rf-chapter-meta">
                  <span className="rf-chapter-label">CHAPTER {romanNumeral(chNum)}</span>
                  <ScrambleText
                    text={ch.title}
                    as="h2"
                    className="rf-chapter-title"
                    trigger="view"
                  />
                  <p className="rf-chapter-sub">{ch.sub}</p>
                </div>
              </div>

              {essays.length === 0 ? (
                <div className="rf-chapter-empty">
                  <span className="rf-no-signal">▒ NO SIGNAL YET ▒</span>
                  <p>This chapter hasn&apos;t transmitted yet.</p>
                </div>
              ) : (
                <div className="rf-essay-grid">
                  {essays.map((r) => (
                    <EssayCard key={r.slug} reflection={r} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </main>

      {/* Email capture */}
      <section className="rf-subscribe">
        <EmailCapture label="Tune in. New transmissions drop weekly." />
      </section>
    </div>
  );
}
