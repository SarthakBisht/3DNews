export type Category =
  | 'general'
  | 'technology'
  | 'science'
  | 'business'
  | 'health'
  | 'sports'
  | 'entertainment';

export const CATEGORIES: Category[] = [
  'general',
  'technology',
  'science',
  'business',
  'health',
  'sports',
  'entertainment',
];

/** A selectable feed: every category, plus the aggregate "all". */
export type Feed = 'all' | Category;

export const FEEDS: Feed[] = ['all', ...CATEGORIES];

export interface Article {
  id: string;
  title: string;
  source: string;
  author: string | null;
  publishedAt: string | null;
  description: string | null;
  url: string;
  image: string | null;
}

/** Articles grouped by category. */
export type FeedMap = Record<Category, Article[]>;

export function emptyFeedMap(): FeedMap {
  return {
    general: [],
    technology: [],
    science: [],
    business: [],
    health: [],
    sports: [],
    entertainment: [],
  };
}
