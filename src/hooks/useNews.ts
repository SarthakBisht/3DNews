import { useEffect } from 'react';
import { fetchAllFeeds } from '../lib/newsApi';
import { useStore } from '../state/store';

/**
 * Loads every category feed once on mount. Feed switching afterwards is handled
 * client-side from the already-loaded data, so it's instant and counts are exact.
 */
export function useNews(): void {
  const setFeeds = useStore((s) => s.setFeeds);
  const setLoading = useStore((s) => s.setLoading);
  const setError = useStore((s) => s.setError);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchAllFeeds()
      .then((feeds) => {
        if (!active) return;
        setFeeds(feeds);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load news');
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [setFeeds, setLoading, setError]);
}
