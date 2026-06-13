import { useEffect } from 'react';
import { fetchAllFeeds } from '../lib/newsApi';
import { readCache, writeCache, msUntilExpiry } from '../lib/newsCache';
import { useStore } from '../state/store';

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

/**
 * Loads every category feed on mount, served from localStorage cache when
 * fresh (< 30 min old). Schedules an automatic background refresh at the
 * exact moment the cache expires, and every 30 min thereafter.
 */
export function useNews(): void {
  const setFeeds   = useStore((s) => s.setFeeds);
  const setLoading = useStore((s) => s.setLoading);
  const setError   = useStore((s) => s.setError);

  useEffect(() => {
    let active = true;

    async function load(showSpinner: boolean) {
      if (showSpinner) {
        setLoading(true);
        setError(null);
      }

      // Serve from cache if still fresh
      const cached = readCache();
      if (cached) {
        if (!active) return;
        setFeeds(cached);
        setLoading(false);
        return;
      }

      // Cache miss or expired — hit the APIs
      try {
        const feeds = await fetchAllFeeds();
        if (!active) return;
        writeCache(feeds);
        setFeeds(feeds);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load news');
      } finally {
        if (active) setLoading(false);
      }
    }

    // Initial load
    load(true);

    // Schedule first refresh exactly when the cache expires,
    // then keep going every 30 min.
    const firstDelay = msUntilExpiry() || REFRESH_INTERVAL;
    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      if (!active) return;
      load(false); // silent background refresh
      interval = setInterval(() => {
        if (active) load(false);
      }, REFRESH_INTERVAL);
    }, firstDelay);

    return () => {
      active = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [setFeeds, setLoading, setError]);
}
