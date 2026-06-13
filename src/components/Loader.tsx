/** Neon full-screen loading state shown while the feed syncs. */
export function Loader() {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyber-cyan/30 border-t-cyber-magenta" />
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-cyber-cyan/70">
          syncing feed
        </p>
      </div>
    </div>
  );
}
