import { FEEDS, type Feed } from '../lib/types';
import { useStore } from '../state/store';

const CORNER = 'pointer-events-none absolute h-10 w-10 border-cyber-cyan/50';

const LABEL: Record<Feed, string> = {
  all: 'ALL',
  general: 'GENERAL',
  technology: 'TECHNOLOGY',
  science: 'SCIENCE',
  business: 'BUSINESS',
  health: 'HEALTH',
  sports: 'SPORTS',
  entertainment: 'ENTERTAINMENT',
};

/** 2D heads-up overlay: title, status readout, feed selector with counts, frame. */
export function Hud() {
  const feed = useStore((s) => s.feed);
  const setFeed = useStore((s) => s.setFeed);
  const counts = useStore((s) => s.counts);
  const articles = useStore((s) => s.articles);
  const loading = useStore((s) => s.loading);
  const spinning = useStore((s) => s.spinning);
  const focusedId = useStore((s) => s.focusedId);

  const status = loading
    ? 'SYNCING FEED'
    : spinning
      ? 'SCANNING'
      : focusedId
        ? 'LOCKED'
        : 'IDLE';

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {/* corner brackets */}
      <div className={`${CORNER} left-4 top-4 border-l-2 border-t-2`} />
      <div className={`${CORNER} right-4 top-4 border-r-2 border-t-2`} />
      <div className={`${CORNER} bottom-4 left-4 border-b-2 border-l-2`} />
      <div className={`${CORNER} bottom-4 right-4 border-b-2 border-r-2`} />

      {/* title */}
      <div className="absolute left-8 top-8">
        <h1 className="font-display text-2xl font-black tracking-[0.3em] text-white">
          3D<span className="text-cyber-cyan">NEWS</span>
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.35em] text-cyber-cyan/60">
          orbital feed
        </p>
      </div>

      {/* status readout */}
      <div className="absolute bottom-8 left-8 font-mono text-[11px] uppercase tracking-widest text-white/55">
        <div>
          <span className="text-cyber-cyan">status</span> :{' '}
          <span className={status === 'LOCKED' ? 'text-cyber-magenta' : 'text-white/80'}>
            {status}
          </span>
        </div>
        <div>
          <span className="text-cyber-cyan">nodes</span> :{' '}
          <span className="text-white/80">{articles.length.toString().padStart(2, '0')}</span>
        </div>
        <div className="mt-1 text-white/35">drag to orbit · scroll to zoom · stop to lock</div>
      </div>

      {/* feed selector with counts */}
      <div className="pointer-events-auto absolute right-8 top-8 flex flex-col items-end gap-1.5">
        {FEEDS.map((f: Feed) => {
          const active = f === feed;
          const count = counts[f] ?? 0;
          return (
            <button
              key={f}
              onClick={() => setFeed(f)}
              className={`flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition ${
                active ? 'text-cyber-magenta' : 'text-white/45 hover:text-cyber-cyan'
              }`}
            >
              <span>
                {active ? '▸ ' : '  '}
                {LABEL[f]}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] tabular-nums ${
                  active
                    ? 'bg-cyber-magenta/20 text-cyber-magenta'
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {count.toString().padStart(2, '0')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
