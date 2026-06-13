import { useEffect, useRef, useState } from 'react';
import { CATEGORY_COLOR, type Article } from '../lib/types';
import { useStore } from '../state/store';

// ── Layout helpers ────────────────────────────────────────────────────────────

type CardSize = 'hero' | 'lg' | 'md' | 'sm';

function sizeFor(i: number): CardSize {
  const p = i % 9;
  if (p === 0) return 'hero';
  if (p <= 2)  return 'lg';
  if (p <= 5)  return 'md';
  return 'sm';
}

function colSpanFor(size: CardSize) {
  switch (size) {
    case 'hero': return 'col-span-12 md:col-span-7';
    case 'lg':   return 'col-span-6 md:col-span-5';
    case 'md':   return 'col-span-6 md:col-span-4';
    case 'sm':   return 'col-span-6 md:col-span-3';
  }
}

function imgHeightFor(size: CardSize) {
  switch (size) {
    case 'hero': return 260;
    case 'lg':   return 200;
    case 'md':   return 150;
    case 'sm':   return 110;
  }
}

const KB_CLASSES = ['kb-zoom-in','kb-pan-left','kb-pan-right','kb-zoom-out','kb-pan-up','kb-drift'];

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60)  return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// ── Lazy Ken Burns image ──────────────────────────────────────────────────────
// Only starts the animation when the card scrolls into view — no animation
// for off-screen cards, which eliminates scroll jank.

function KenBurnsImage({
  src, height, kbClass, catColor,
}: {
  src: string | null;
  height: number;
  kbClass: string;
  catColor: string;
}) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '100px', threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative overflow-hidden" style={{ height }}>
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover ${active ? kbClass : ''}`}
          style={{ willChange: 'transform' }}
          onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
        />
      ) : (
        <div
          className="w-full h-full"
          style={{ background: `linear-gradient(135deg, ${catColor}18 0%, #030508 100%)` }}
        />
      )}

      {/* Shimmer — only while visible */}
      {active && <div className="news-shimmer pointer-events-none absolute inset-0" />}

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#06090f] to-transparent" />
    </div>
  );
}

// ── Article card ──────────────────────────────────────────────────────────────

function ArticleCard({ article, index }: { article: Article; index: number }) {
  const size      = sizeFor(index);
  const catColor  = CATEGORY_COLOR[article.category] ?? '#27e8ff';
  const kbClass   = KB_CLASSES[index % KB_CLASSES.length];
  const ago       = timeAgo(article.publishedAt);

  const handleClick = () => {
    const s = useStore.getState();
    s.setFocused(article.id);
    s.setPinned(true);
  };

  return (
    <article
      className={`${colSpanFor(size)} group relative cursor-pointer overflow-hidden rounded-lg transition-transform duration-300 hover:-translate-y-0.5`}
      style={{ background: '#06090f', border: `1px solid ${catColor}1a` }}
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative">
        <KenBurnsImage
          src={article.image}
          height={imgHeightFor(size)}
          kbClass={kbClass}
          catColor={catColor}
        />
        {/* Badges */}
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5">
          <span
            className="rounded px-1.5 py-px font-mono text-[9px] uppercase tracking-widest"
            style={{ backgroundColor: `${catColor}22`, color: catColor, border: `1px solid ${catColor}40` }}
          >
            {article.category}
          </span>
        </div>
        {ago && (
          <span className="absolute right-2 top-2 z-10 font-mono text-[9px] text-white/35">{ago} ago</span>
        )}
      </div>

      {/* Text */}
      <div className="p-3">
        <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.35em]" style={{ color: `${catColor}80` }}>
          {article.source}
        </p>
        <h3
          className={`font-display font-bold leading-tight text-white/90 group-hover:text-white transition-colors ${
            size === 'hero' ? 'text-xl' : size === 'lg' ? 'text-base' : size === 'md' ? 'text-sm' : 'text-xs'
          }`}
        >
          {article.title}
        </h3>
        {(size === 'hero' || size === 'lg') && article.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-white/45">{article.description}</p>
        )}
        {article.tags.length > 0 && size !== 'sm' && (
          <div className="mt-2 flex flex-wrap gap-1">
            {article.tags.slice(0, size === 'hero' ? 5 : 3).map((t) => (
              <span
                key={t}
                className="rounded px-1 py-px font-mono text-[8px] uppercase tracking-wider"
                style={{ color: `${catColor}66`, border: `1px solid ${catColor}18` }}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover top accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${catColor}, transparent)` }}
      />
    </article>
  );
}

// ── Masthead ──────────────────────────────────────────────────────────────────

function Masthead({ total }: { total: number }) {
  const feed = useStore((s) => s.feed);
  const now  = new Date().toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).toUpperCase();

  return (
    <div className="mb-6 pb-4 pt-2">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[9px] tracking-[0.5em] text-white/22 uppercase">SYS:// ORBITAL PRESS · LIVE INTELLIGENCE</p>
          <h1 className="font-display text-3xl font-black tracking-[0.2em] text-white">
            3D<span className="text-cyber-cyan" style={{ textShadow: '0 0 20px #27e8ff55' }}>NEWS</span>
          </h1>
        </div>
        <div className="text-right font-mono text-[9px] uppercase text-white/22">
          <p>{now}</p>
          <p className="mt-0.5 text-cyber-cyan/50">{total} articles · {feed.toUpperCase()}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyber-cyan/35 to-transparent" />
        <span className="font-mono text-[8px] tracking-[0.6em] text-cyber-cyan/28">◈ LIVE ◈</span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyber-cyan/35 to-transparent" />
      </div>
    </div>
  );
}

// ── Main grid ─────────────────────────────────────────────────────────────────

const PAGE = 60; // articles per page — keeps DOM lean

export function NewsGrid() {
  const articles = useStore((s) => s.articles);
  const [limit, setLimit] = useState(PAGE);

  // Reset page when feed changes
  useEffect(() => setLimit(PAGE), [articles.length]);

  const visible = articles.slice(0, limit);

  return (
    <div
      className="absolute inset-0 overflow-y-auto"
      style={{ background: 'radial-gradient(circle at 50% 0%, #060d28 0%, #020409 40%, #010206 100%)' }}
    >
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* HUD top-bar spacer so masthead doesn't sit under the toggle */}
        <div className="h-16" />
        <Masthead total={articles.length} />

        <div className="grid grid-cols-12 gap-3">
          {visible.map((a, i) => (
            <ArticleCard key={a.id} article={a} index={i} />
          ))}
        </div>

        {limit < articles.length && (
          <button
            onClick={() => setLimit((l) => l + PAGE)}
            className="mx-auto mt-8 flex items-center gap-2 rounded border border-cyber-cyan/30 bg-cyber-cyan/5 px-6 py-2 font-mono text-xs uppercase tracking-widest text-cyber-cyan/70 transition hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
          >
            <span>Load more</span>
            <span className="text-[10px]">({articles.length - limit} remaining)</span>
          </button>
        )}

        <div className="mt-8 border-t border-cyber-cyan/8 py-4 text-center font-mono text-[9px] tracking-widest text-white/12">
          END OF TRANSMISSION · {articles.length} NODES PROCESSED
        </div>
      </div>
    </div>
  );
}
