import { Scene } from './components/Scene';
import { Hud } from './components/Hud';
import { DetailCard } from './components/DetailCard';
import { Loader } from './components/Loader';
import { useNews } from './hooks/useNews';
import { useStore } from './state/store';

export default function App() {
  useNews();
  const loading = useStore((s) => s.loading);
  const error = useStore((s) => s.error);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-cyber-ink text-white">
      <Scene />
      <Hud />
      <DetailCard />
      {loading && <Loader />}
      {error && (
        <div className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-cyber-magenta/50 bg-black/70 px-4 py-2 font-mono text-xs text-cyber-magenta">
          feed error: {error}
        </div>
      )}
      <div className="scanlines pointer-events-none absolute inset-0 z-40" />
    </div>
  );
}
