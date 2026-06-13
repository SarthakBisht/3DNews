import type { FeedMap } from './types';

const KEY = '3dnews-cache';
const TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  ts: number;
  data: FeedMap;
}

export function readCache(): FeedMap | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    if (Date.now() - entry.ts > TTL) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export function writeCache(data: FeedMap): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // storage full or private browsing — ignore
  }
}

export function clearCache(): void {
  localStorage.removeItem(KEY);
}

/** ms until the cached entry expires, or 0 if already expired / missing. */
export function msUntilExpiry(): number {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return 0;
    const entry = JSON.parse(raw) as CacheEntry;
    return Math.max(0, entry.ts + TTL - Date.now());
  } catch {
    return 0;
  }
}
