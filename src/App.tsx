import { useEffect, useState } from 'react';
import { Scene } from './components/Scene';
import { Hud } from './components/Hud';
import { DetailCard } from './components/DetailCard';
import { Loader } from './components/Loader';
import { NewsGrid } from './components/NewsGrid';
import { useNews } from './hooks/useNews';
import { useStore } from './state/store';

export default function App() {
  useNews();
  const loading  = useStore((s) => s.loading);
  const error    = useStore((s) => s.error);
  const viewMode = useStore((s) => s.viewMode);
  const is3d     = viewMode === '3d';

  // Keep Scene mounted during fade-out, unmount after transition so WebGL
  // stops consuming GPU while the newspaper is active.
  const [sceneVisible, setSceneVisible] = useState(true);
  useEffect(() => {
    if (is3d) {
      setSceneVisible(true);
    } else {
      const t = setTimeout(() => setSceneVisible(false), 700);
      return () => clearTimeout(t);
    }
  }, [is3d]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-cyber-ink text-white">

      {/* ── 3D scene — unmounted when not in use to free GPU ─────────────── */}
      {sceneVisible && (
        <div
          className="absolute inset-0 transition-all duration-700"
          style={{
            opacity:       is3d ? 1 : 0,
            transform:     is3d ? 'scale(1)' : 'scale(1.04)',
            pointerEvents: is3d ? 'auto' : 'none',
          }}
        >
          <Scene />
        </div>
      )}

      {/* ── 2D newspaper grid ────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          opacity:       is3d ? 0 : 1,
          transform:     is3d ? 'translateY(16px)' : 'translateY(0)',
          pointerEvents: is3d ? 'none' : 'auto',
        }}
      >
        <NewsGrid />
      </div>

      {/* ── Always-on-top overlay layers ─────────────────────────────────── */}
      <Hud />
      <DetailCard />
      {loading && <Loader />}
      {error && (
        <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-cyber-magenta/50 bg-black/70 px-4 py-2 font-mono text-xs text-cyber-magenta">
          feed error: {error}
        </div>
      )}
      <div className="scanlines pointer-events-none absolute inset-0 z-40" />
      <div className="grain pointer-events-none fixed z-50" />
    </div>
  );
}
