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

export type Feed = 'all' | Category;
export const FEEDS: Feed[] = ['all', ...CATEGORIES];

export const CATEGORY_COLOR: Record<Category, string> = {
  general:       '#27e8ff',
  technology:    '#8b5cff',
  science:       '#00ffa3',
  business:      '#ffb627',
  health:        '#ff2bd6',
  sports:        '#ff6b35',
  entertainment: '#ff3366',
};

export interface Article {
  id: string;
  title: string;
  source: string;
  author: string | null;
  publishedAt: string | null;
  description: string | null;
  url: string;
  image: string | null;
  category: Category;
  tags: string[];
}

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
