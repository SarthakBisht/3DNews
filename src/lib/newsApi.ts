import { CATEGORIES, emptyFeedMap, type Article, type Category, type FeedMap } from './types';

const API_BASE = 'https://newsapi.org/v2/top-headlines';
const API_KEY = import.meta.env.VITE_NEWSAPI_KEY as string | undefined;

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

function normalize(raw: NewsApiArticle[], category: Category): Article[] {
  return raw
    .filter((a) => a.title && a.url && a.title !== '[Removed]')
    .map((a, i) => ({
      id: `${category}-${a.url ?? i}-${i}`,
      title: a.title!.trim(),
      source: a.source?.name?.trim() || 'Unknown',
      author: a.author?.trim() || null,
      publishedAt: a.publishedAt ?? null,
      description: a.description?.trim() || null,
      url: a.url!,
      image: a.urlToImage || null,
    }));
}

/** Loads the bundled sample dataset grouped by category. */
async function loadMockAll(): Promise<FeedMap> {
  const res = await fetch('/sample-news.json');
  const data = (await res.json()) as Partial<Record<Category, Article[]>>;
  const map = emptyFeedMap();
  for (const c of CATEGORIES) map[c] = data[c] ?? [];
  return map;
}

async function fetchCategory(category: Category): Promise<Article[]> {
  const params = new URLSearchParams({
    category,
    country: 'us',
    pageSize: '30',
    apiKey: API_KEY!,
  });
  const res = await fetch(`${API_BASE}?${params.toString()}`);
  const data = (await res.json()) as NewsApiResponse;
  if (data.status !== 'ok' || !data.articles) {
    throw new Error(data.message || 'NewsAPI request failed');
  }
  return normalize(data.articles, category);
}

/**
 * Fetches headlines for every category at once so the UI can show counts and
 * switch feeds instantly. Falls back to the bundled sample dataset when there
 * is no API key or the live requests fail / come back empty.
 */
export async function fetchAllFeeds(): Promise<FeedMap> {
  if (!API_KEY) return loadMockAll();

  try {
    const results = await Promise.all(
      CATEGORIES.map((c) => fetchCategory(c).catch(() => [] as Article[])),
    );
    const map = emptyFeedMap();
    CATEGORIES.forEach((c, i) => (map[c] = results[i]));

    const total = CATEGORIES.reduce((n, c) => n + map[c].length, 0);
    return total > 0 ? map : loadMockAll();
  } catch (err) {
    console.warn('[3DNews] live fetch failed, using sample data:', err);
    return loadMockAll();
  }
}
