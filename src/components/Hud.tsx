import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES, CATEGORY_COLOR, FEEDS, type Category, type Feed } from '../lib/types';
import { useStore } from '../state/store';
import { extractTrending } from '../lib/trending';

// ── Label maps ────────────────────────────────────────────────────────────────

const FEED_FULL: Record<Feed, string> = {
  all:           'ALL FEEDS',
  general:       'GENERAL',
  technology:    'TECHNOLOGY',
  science:       'SCIENCE',
  business:      'BUSINESS',
  health:        'HEALTH',
  sports:        'SPORTS',
  entertainment: 'ENTMT',
};

const CAT_SHORT: Record<Category, string> = {
  general:       'GEN',
  technology:    'TECH',
  science:       'SCI',
  business:      'BIZ',
  health:        'HLT',
  sports:        'SPT',
  entertainment: 'ENT',
};

// ── Animated counter hook ─────────────────────────────────────────────────────

function useCountUp(target: number): number {
  const [value, setValue] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    const start = performance.now();
    let raf: number;
    function tick(now: number) {
      const t = Math.min((now - start) / 900, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return value;
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`hud-panel ${className}`}>
      <div className="scan-line" />
      {children}
    </div>
  );
}

// ── Main HUD ──────────────────────────────────────────────────────────────────

export function Hud() {
  const feed        = useStore((s) => s.feed);
  const setFeed     = useStore((s) => s.setFeed);
  const counts      = useStore((s) => s.counts);
  const articles    = useStore((s) => s.articles);
  const loading     = useStore((s) => s.loading);
  const spinning    = useStore((s) => s.spinning);
  const focusedId   = useStore((s) => s.focusedId);
  const feeds       = useStore((s) => s.feeds);
  const viewMode    = useStore((s) => s.viewMode);
  const setViewMode = useStore((s) => s.setViewMode);

  const displayCount = useCountUp(articles.length);

  const providerCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of CATEGORIES) {
      for (const a of feeds[c]) {
        const p = a.id.split('-')[0];
        map[p] = (map[p] ?? 0) + 1;
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [feeds]);

  const topSources = useMemo(() => {
    const map: Record<string, number> = {};
    for (const a of articles) map[a.source] = (map[a.source] ?? 0) + 1;
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [articles]);

  const trending = useMemo(() => extractTrending(articles, 7), [articles]);

  const status      = loading ? 'SYNCING' : spinning ? 'SCANNING' : focusedId ? 'LOCKED' : 'NOMINAL';
  const statusColor = focusedId ? '#ff2bd6' : loading ? '#ffb627' : '#00ffa3';
  const feedColor   = feed !== 'all' ? CATEGORY_COLOR[feed as Category] : '#27e8ff';

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none font-mono text-[11px] uppercase tracking-widest">

      {/* ── Animated corner brackets ─────────────────────────────────────── */}
      {(['left-4 top-4 border-l-2 border-t-2',
         'right-4 top-4 border-r-2 border-t-2',
         'bottom-4 left-4 border-b-2 border-l-2',
         'bottom-4 right-4 border-b-2 border-r-2'] as const).map((cls, i) => (
        <div
          key={i}
          className={`absolute h-10 w-10 border-cyber-cyan/60 animate-corner-breathe ${cls}`}
          style={{ animationDelay: `${i * 0.75}s` }}
        />
      ))}

      {/* ── VIEW TOGGLE — top center ─────────────────────────────────────── */}
      <div className="pointer-events-auto absolute left-1/2 top-8 -translate-x-1/2 flex items-center gap-px">
        {(['3d', '2d'] as const).map((mode) => {
          const active = viewMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-all duration-200"
              style={{
                background: active ? 'rgba(39,232,255,0.12)' : 'rgba(255,255,255,0.03)',
                color: active ? '#27e8ff' : 'rgba(255,255,255,0.3)',
                border: `1px solid ${active ? '#27e8ff44' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: mode === '3d' ? '6px 0 0 6px' : '0 6px 6px 0',
                boxShadow: active ? '0 0 12px rgba(39,232,255,0.2)' : 'none',
              }}
            >
              <span>{mode === '3d' ? '◉' : '▦'}</span>
              <span>{mode.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* ── TITLE — top left ──────────────────────────────────────────────── */}
      <div className="absolute left-8 top-8">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] text-white/20 tracking-[0.4em]">SYS://</span>
          <h1 className="font-display text-xl font-black tracking-[0.32em] text-white animate-flicker">
            3D<span className="text-cyber-cyan" style={{ textShadow: '0 0 16px #27e8ff88' }}>NEWS</span>
          </h1>
        </div>
        <p className="text-[9px] text-cyber-cyan/40 tracking-[0.35em]">ORBITAL INTELLIGENCE ARRAY</p>
        <div className="mt-1 flex items-center gap-2 text-[9px] text-white/20">
          <span>REV 2.1 · LIVE</span>
          <span
            className="h-1.5 w-1.5 rounded-full animate-dot-blink"
            style={{ backgroundColor: '#00ffa3', boxShadow: '0 0 5px #00ffa3' }}
          />
        </div>
      </div>

      {/* ── FEED SELECTOR — top right ─────────────────────────────────────── */}
      <div className="pointer-events-auto absolute right-8 top-8 flex flex-col items-end gap-[3px]">
        {FEEDS.map((f: Feed) => {
          const active = f === feed;
          const count  = counts[f] ?? 0;
          const color  = f !== 'all' ? CATEGORY_COLOR[f as Category] : '#27e8ff';
          return (
            <button
              key={f}
              onClick={() => setFeed(f)}
              className={`group flex items-center gap-2 rounded px-2 py-0.5 transition-all duration-200 ${
                active ? 'bg-white/5' : 'opacity-35 hover:opacity-75'
              }`}
            >
              {f !== 'all' && (
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{
                    backgroundColor: color,
                    opacity: active ? 1 : 0.4,
                    boxShadow: active ? `0 0 6px ${color}` : 'none',
                  }}
                />
              )}
              <span className="text-[10px]" style={{ color: active ? color : undefined }}>
                {active ? '▸ ' : '  '}{FEED_FULL[f]}
              </span>
              <span
                className="min-w-[2.2rem] rounded px-1 py-px text-center text-[9px] tabular-nums"
                style={{
                  backgroundColor: active ? `${color}22` : 'rgba(255,255,255,0.04)',
                  color: active ? color : 'rgba(255,255,255,0.28)',
                  border: `1px solid ${active ? `${color}44` : 'transparent'}`,
                }}
              >
                {count.toString().padStart(3, '0')}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── BOTTOM LEFT: Data cluster ─────────────────────────────────────── */}
      <div className="absolute bottom-8 left-8 flex flex-col gap-2.5">

        {/* Row 1: Three data panels */}
        <div className="flex gap-3">
          {providerCounts.length > 0 && (
            <Panel>
              <div className="mb-1.5 text-[9px] text-white/28 tracking-[0.4em]">INTEL</div>
              <div className="space-y-0.5">
                {providerCounts.map(([p, n]) => (
                  <div key={p} className="flex items-center gap-2">
                    <span className="w-[4.5rem] text-[10px] text-cyber-cyan">{p.slice(0, 9).toUpperCase()}</span>
                    <span className="text-[10px] font-bold tabular-nums text-white/70">{n.toString().padStart(3, '0')}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {trending.length > 0 && (
            <Panel>
              <div className="mb-1.5 text-[9px] text-white/28 tracking-[0.4em]">TRENDING</div>
              <div className="space-y-0.5">
                {trending.map((kw, i) => (
                  <div
                    key={kw}
                    className="flex items-center gap-1.5 text-[10px] text-white/65 animate-slide-up"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="text-[8px] text-cyber-cyan/45">▸</span>
                    <span>{kw}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {topSources.length > 0 && (
            <Panel>
              <div className="mb-1.5 text-[9px] text-white/28 tracking-[0.4em]">SOURCES</div>
              <div className="space-y-0.5">
                {topSources.map(([src, n]) => (
                  <div key={src} className="flex items-center gap-2">
                    <span className="max-w-[72px] truncate text-[10px] text-white/50 lowercase">{src}</span>
                    <span className="text-[10px] tabular-nums text-white/30">{n}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* Row 2: Category legend — clickable */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pl-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className="pointer-events-auto flex items-center gap-1 opacity-55 transition-opacity hover:opacity-100"
              onClick={() => useStore.getState().setFeed(c)}
              title={c}
            >
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLOR[c],
                  boxShadow: `0 0 4px ${CATEGORY_COLOR[c]}`,
                }}
              />
              <span className="text-[9px] tracking-[0.3em]" style={{ color: CATEGORY_COLOR[c] }}>
                {CAT_SHORT[c]}
              </span>
            </button>
          ))}
        </div>

        {/* Row 3: Status bar */}
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full animate-dot-blink"
              style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
            />
            <span className="text-white/30">STATUS</span>
            <span className="font-bold" style={{ color: statusColor }}>{status}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/30">NODES</span>
            <span className="font-bold tabular-nums text-white/80">{displayCount.toString().padStart(3, '0')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/30">FEED</span>
            <span className="font-bold" style={{ color: feedColor }}>{feed.toUpperCase()}</span>
          </div>
        </div>

        {/* Row 4: Hint */}
        <div className="text-[9px] text-white/18 tracking-[0.3em]">
          DRAG · ORBIT &nbsp;｜&nbsp; SCROLL · ZOOM &nbsp;｜&nbsp; STOP · LOCK
        </div>
      </div>
    </div>
  );
}
