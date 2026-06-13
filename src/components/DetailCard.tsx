import { useEffect, useState } from 'react';
import { CATEGORY_COLOR } from '../lib/types';
import { useStore, selectFocusedArticle } from '../state/store';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)  return `T-${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24)  return `T-${hrs}h`;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function DetailCard() {
  const article   = useStore(selectFocusedArticle);
  const setFocused = useStore((s) => s.setFocused);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => setImgFailed(false), [article?.id]);

  const open     = Boolean(article);
  const catColor = article ? (CATEGORY_COLOR[article.category] ?? '#27e8ff') : '#27e8ff';

  return (
    <div
      className={`pointer-events-none absolute right-0 top-0 z-20 flex h-full w-full max-w-[22rem] flex-col justify-center p-5 transition-all duration-500 ${
        open ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
      }`}
    >
      {article && (
        <div
          className="pointer-events-auto relative overflow-hidden rounded-xl bg-[#040810]/90 backdrop-blur-2xl"
          style={{
            border: `1px solid ${catColor}33`,
            boxShadow: `0 0 40px ${catColor}18, 0 0 0 1px ${catColor}11`,
          }}
        >
          {/* Top accent line — category color */}
          <div
            className="h-[2px] w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${catColor}, #8b5cff, transparent)` }}
          />

          {/* Close button */}
          <button
            onClick={() => { setFocused(null); useStore.getState().setPinned(false); }}
            className="absolute right-3 top-3 z-10 font-mono text-[10px] text-white/30 transition hover:text-cyber-magenta"
          >
            [ ✕ ]
          </button>

          {/* Hero image */}
          {article.image && !imgFailed && (
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={article.image}
                alt=""
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover opacity-85"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to top, #040810 0%, transparent 50%)` }}
              />
              {/* Category badge on image */}
              <div
                className="absolute left-3 top-3 rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest"
                style={{
                  backgroundColor: `${catColor}22`,
                  color: catColor,
                  border: `1px solid ${catColor}44`,
                }}
              >
                {article.category}
              </div>
            </div>
          )}

          <div className="space-y-2.5 p-4">
            {/* Source + time */}
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
              <span
                className="h-1.5 w-1.5 rounded-full animate-dot-blink"
                style={{ backgroundColor: catColor, boxShadow: `0 0 5px ${catColor}` }}
              />
              <span style={{ color: catColor }}>{article.source}</span>
              {article.publishedAt && (
                <span className="text-white/30">// {formatDate(article.publishedAt)}</span>
              )}
            </div>

            {/* Title */}
            <h2 className="font-display text-base font-bold leading-snug text-white/95">
              {article.title}
            </h2>

            {/* Author */}
            {article.author && (
              <p className="font-mono text-[10px] text-white/35">BY {article.author.toUpperCase()}</p>
            )}

            {/* Description */}
            {article.description && (
              <p className="text-[12px] leading-relaxed text-white/65">{article.description}</p>
            )}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {article.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                    style={{
                      backgroundColor: `${catColor}14`,
                      color: `${catColor}bb`,
                      border: `1px solid ${catColor}22`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-1 flex items-center justify-between rounded-lg px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-all"
              style={{
                border: `1px solid ${catColor}44`,
                backgroundColor: `${catColor}10`,
                color: catColor,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${catColor}22`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = `${catColor}10`;
              }}
            >
              <span>Read Full Article</span>
              <span className="transition-transform group-hover:translate-x-0.5">↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
