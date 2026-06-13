import { useEffect, useState } from 'react';
import { useStore, selectFocusedArticle } from '../state/store';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Futuristic detail overlay that slides in when a tile is focused. Built purely
 * from fields the API returns, plus a link out to the source.
 */
export function DetailCard() {
  const article = useStore(selectFocusedArticle);
  const setFocused = useStore((s) => s.setFocused);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => setImgFailed(false), [article?.id]);

  const open = Boolean(article);

  return (
    <div
      className={`pointer-events-none absolute right-0 top-0 z-20 flex h-full w-full max-w-md flex-col justify-center p-6 transition-all duration-500 ${
        open ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'
      }`}
    >
      {article && (
        <div className="pointer-events-auto relative overflow-hidden rounded-2xl border border-cyber-cyan/40 bg-[#060b1c]/80 shadow-neon backdrop-blur-xl">
          {/* gradient top edge */}
          <div className="h-1 w-full bg-gradient-to-r from-cyber-cyan via-cyber-violet to-cyber-magenta" />

          <button
            onClick={() => setFocused(null)}
            className="absolute right-3 top-4 z-10 font-mono text-xs text-cyber-cyan/70 transition hover:text-cyber-magenta"
            aria-label="Close"
          >
            [ ✕ ]
          </button>

          {article.image && !imgFailed && (
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={article.image}
                alt=""
                onError={() => setImgFailed(true)}
                className="h-full w-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060b1c] via-transparent to-transparent" />
            </div>
          )}

          <div className="space-y-3 p-5">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-cyber-cyan">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyber-magenta" />
              {article.source}
              {article.publishedAt && (
                <span className="text-white/40">// {formatDate(article.publishedAt)}</span>
              )}
            </div>

            <h2 className="font-display text-lg font-bold leading-snug text-white">
              {article.title}
            </h2>

            {article.author && (
              <p className="font-mono text-xs text-white/50">by {article.author}</p>
            )}

            {article.description && (
              <p className="text-sm leading-relaxed text-white/75">{article.description}</p>
            )}

            <a
              href={article.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group mt-2 inline-flex items-center gap-2 rounded-lg border border-cyber-magenta/50 bg-cyber-magenta/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-cyber-magenta transition hover:bg-cyber-magenta/20"
            >
              Read full article
              <span className="transition group-hover:translate-x-0.5">↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
