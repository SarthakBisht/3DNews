import { create } from 'zustand';
import {
  CATEGORIES,
  emptyFeedMap,
  type Article,
  type Feed,
  type FeedMap,
} from '../lib/types';

/** Articles for the active feed; "all" merges every category, deduped by url. */
function computeArticles(feeds: FeedMap, feed: Feed): Article[] {
  if (feed !== 'all') return feeds[feed] ?? [];
  const seen = new Set<string>();
  const out: Article[] = [];
  for (const c of CATEGORIES) {
    for (const a of feeds[c]) {
      if (seen.has(a.url)) continue;
      seen.add(a.url);
      out.push(a);
    }
  }
  return out;
}

function computeCounts(feeds: FeedMap): Record<Feed, number> {
  const counts = { all: computeArticles(feeds, 'all').length } as Record<Feed, number>;
  for (const c of CATEGORIES) counts[c] = feeds[c].length;
  return counts;
}

interface AppState {
  feeds: FeedMap;
  feed: Feed;
  articles: Article[];
  counts: Record<Feed, number>;
  loading: boolean;
  error: string | null;
  /** id of the article currently focused at screen-center, or null. */
  focusedId: string | null;
  /** true while the sphere is being spun fast enough to suppress focusing. */
  spinning: boolean;

  setFeeds: (feeds: FeedMap) => void;
  setFeed: (feed: Feed) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFocused: (id: string | null) => void;
  setSpinning: (spinning: boolean) => void;
}

const initialFeeds = emptyFeedMap();

export const useStore = create<AppState>((set) => ({
  feeds: initialFeeds,
  feed: 'all',
  articles: [],
  counts: computeCounts(initialFeeds),
  loading: true,
  error: null,
  focusedId: null,
  spinning: false,

  setFeeds: (feeds) =>
    set((s) => ({
      feeds,
      counts: computeCounts(feeds),
      articles: computeArticles(feeds, s.feed),
      focusedId: null,
    })),
  setFeed: (feed) =>
    set((s) => ({ feed, articles: computeArticles(s.feeds, feed), focusedId: null })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFocused: (focusedId) => set({ focusedId }),
  setSpinning: (spinning) => set({ spinning }),
}));

export const selectFocusedArticle = (s: AppState): Article | null =>
  s.articles.find((a) => a.id === s.focusedId) ?? null;
