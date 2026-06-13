import { CATEGORIES, emptyFeedMap, type Article, type Category, type FeedMap } from './types';

// ─── Shared provider interface ────────────────────────────────────────────────

interface NewsProvider {
  readonly name: string;
  readonly isAvailable: () => boolean;
  fetchCategory: (category: Category) => Promise<Article[]>;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function toISOSafe(s: string | null | undefined): string | null {
  if (!s) return null;
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

async function loadMockAll(): Promise<FeedMap> {
  const res = await fetch('/sample-news.json');
  const data = (await res.json()) as Partial<Record<Category, Article[]>>;
  const map = emptyFeedMap();
  for (const c of CATEGORIES) map[c] = data[c] ?? [];
  return map;
}

// ─── NewsAPI.org (legacy) ─────────────────────────────────────────────────────

interface NewsApiArticle {
  source?: { name?: string | null };
  author?: string | null;
  title?: string | null;
  description?: string | null;
  url?: string | null;
  urlToImage?: string | null;
  publishedAt?: string | null;
}

interface NewsApiResponse {
  status: string;
  articles?: NewsApiArticle[];
  message?: string;
}

function normalizeNewsApi(raw: NewsApiArticle[], category: Category): Article[] {
  return raw
    .filter((a) => a.title && a.url && a.title !== '[Removed]')
    .map((a, i) => ({
      id: `newsapi-${category}-${a.url ?? i}-${i}`,
      title: a.title!.trim(),
      source: a.source?.name?.trim() || 'Unknown',
      author: a.author?.trim() || null,
      publishedAt: toISOSafe(a.publishedAt),
      description: a.description?.trim() || null,
      url: a.url!,
      image: a.urlToImage || null,
    }));
}

const NEWSAPI_BASE = 'https://newsapi.org/v2/top-headlines';

const newsApiProvider: NewsProvider = {
  name: 'newsapi',
  isAvailable: () => Boolean(import.meta.env.VITE_NEWSAPI_KEY),
  async fetchCategory(category) {
    const key = import.meta.env.VITE_NEWSAPI_KEY as string;
    const params = new URLSearchParams({ category, country: 'us', pageSize: '100', apiKey: key });
    const res = await fetch(`${NEWSAPI_BASE}?${params}`);
    const data = (await res.json()) as NewsApiResponse;
    if (data.status !== 'ok' || !data.articles) throw new Error(data.message || 'NewsAPI failed');
    return normalizeNewsApi(data.articles, category);
  },
};

// ─── Currents API ─────────────────────────────────────────────────────────────

interface CurrentsArticle {
  id: string;
  title: string;
  description: string | null;
  url: string;
  author: string | null;
  image: string | null;
  published: string | null;
}

interface CurrentsResponse {
  status: string;
  news?: CurrentsArticle[];
}

const CURRENTS_CATEGORY_MAP: Record<Category, string> = {
  general: 'world',
  technology: 'technology',
  science: 'science',
  business: 'business',
  health: 'health',
  sports: 'sports',
  entertainment: 'entertainment',
};

function normalizeCurrents(raw: CurrentsArticle[], category: Category): Article[] {
  return raw
    .filter((a) => a.title && a.url)
    .map((a, i) => ({
      id: `currents-${category}-${a.url}-${i}`,
      title: a.title.trim(),
      source: 'Currents',
      author: a.author?.trim() || null,
      publishedAt: toISOSafe(a.published),
      description: a.description?.trim() || null,
      url: a.url,
      image: a.image || null,
    }));
}

const CURRENTS_BASE = 'https://api.currentsapi.services/v1/latest-news';

const currentsProvider: NewsProvider = {
  name: 'currents',
  isAvailable: () => Boolean(import.meta.env.VITE_CURRENTS_API_KEY),
  async fetchCategory(category) {
    const key = import.meta.env.VITE_CURRENTS_API_KEY as string;
    const base = new URLSearchParams({
      apiKey: key,
      category: CURRENTS_CATEGORY_MAP[category],
      language: 'en',
    });
    const pages = await Promise.all(
      [1, 2].map(async (page) => {
        const params = new URLSearchParams(base);
        params.set('page_number', String(page));
        const res = await fetch(`${CURRENTS_BASE}?${params}`);
        const data = (await res.json()) as CurrentsResponse;
        return data.status === 'ok' && data.news ? data.news : [];
      }),
    );
    return normalizeCurrents(pages.flat(), category);
  },
};

// ─── NewsData.io ──────────────────────────────────────────────────────────────

interface NewsDataArticle {
  article_id: string;
  title: string | null;
  description: string | null;
  link: string | null;
  creator: string[] | null;
  image_url: string | null;
  pubDate: string | null;
  source_id: string;
}

interface NewsDataResponse {
  status: string;
  results?: NewsDataArticle[];
}

const NEWSDATA_CATEGORY_MAP: Record<Category, string> = {
  general: 'top',
  technology: 'technology',
  science: 'science',
  business: 'business',
  health: 'health',
  sports: 'sports',
  entertainment: 'entertainment',
};

function normalizeNewsData(raw: NewsDataArticle[], category: Category): Article[] {
  return raw
    .filter((a) => a.title && a.link)
    .map((a, i) => ({
      id: `newsdata-${category}-${a.link ?? i}-${i}`,
      title: a.title!.trim(),
      source: a.source_id || 'Unknown',
      author: a.creator?.[0]?.trim() || null,
      publishedAt: toISOSafe(a.pubDate),
      description: a.description?.trim() || null,
      url: a.link!,
      image: a.image_url || null,
    }));
}

const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';

const newsDataProvider: NewsProvider = {
  name: 'newsdata',
  isAvailable: () => Boolean(import.meta.env.VITE_NEWSDATA_KEY),
  async fetchCategory(category) {
    const key = import.meta.env.VITE_NEWSDATA_KEY as string;
    const params = new URLSearchParams({
      apikey: key,
      category: NEWSDATA_CATEGORY_MAP[category],
      language: 'en',
    });
    const res = await fetch(`${NEWSDATA_BASE}?${params}`);
    const data = (await res.json()) as NewsDataResponse;
    if (data.status !== 'success' || !data.results) throw new Error('NewsData failed');
    return normalizeNewsData(data.results, category);
  },
};

// ─── GNews ────────────────────────────────────────────────────────────────────

interface GNewsArticle {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string | null;
  source: { name: string };
}

interface GNewsResponse {
  articles?: GNewsArticle[];
}

const GNEWS_TOPIC_MAP: Record<Category, string> = {
  general: 'general',
  technology: 'technology',
  science: 'science',
  business: 'business',
  health: 'health',
  sports: 'sports',
  entertainment: 'entertainment',
};

function normalizeGNews(raw: GNewsArticle[], category: Category): Article[] {
  return raw
    .filter((a) => a.title && a.url)
    .map((a, i) => ({
      id: `gnews-${category}-${a.url}-${i}`,
      title: a.title.trim(),
      source: a.source.name || 'Unknown',
      author: null,
      publishedAt: toISOSafe(a.publishedAt),
      description: a.description?.trim() || null,
      url: a.url,
      image: a.image || null,
    }));
}

const GNEWS_BASE = 'https://gnews.io/api/v4/top-headlines';

const gNewsProvider: NewsProvider = {
  name: 'gnews',
  isAvailable: () => Boolean(import.meta.env.VITE_GNEWS_KEY),
  async fetchCategory(category) {
    const key = import.meta.env.VITE_GNEWS_KEY as string;
    const params = new URLSearchParams({
      token: key,
      topic: GNEWS_TOPIC_MAP[category],
      lang: 'en',
      max: '10',
    });
    const res = await fetch(`${GNEWS_BASE}?${params}`);
    const data = (await res.json()) as GNewsResponse;
    if (!data.articles) throw new Error('GNews failed');
    return normalizeGNews(data.articles, category);
  },
};

// ─── Provider registry ────────────────────────────────────────────────────────

const PROVIDERS: NewsProvider[] = [
  currentsProvider,
  newsDataProvider,
  gNewsProvider,
  newsApiProvider,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches headlines for every category from all available providers, merges
 * and deduplicates by URL (priority order: Currents > NewsData > GNews > NewsAPI).
 * Falls back to the bundled sample dataset when no keys are configured or all
 * live requests fail.
 */
export async function fetchAllFeeds(): Promise<FeedMap> {
  const activeProviders = PROVIDERS.filter((p) => p.isAvailable());
  if (activeProviders.length === 0) return loadMockAll();

  const map = emptyFeedMap();

  await Promise.all(
    CATEGORIES.map(async (category) => {
      const perProvider = await Promise.all(
        activeProviders.map((p) => p.fetchCategory(category).catch(() => [] as Article[])),
      );
      const all = perProvider.flat();
      const seen = new Set<string>();
      map[category] = all.filter((a) => {
        if (seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      });
    }),
  );

  const total = CATEGORIES.reduce((n, c) => n + map[c].length, 0);
  return total > 0 ? map : loadMockAll();
}
