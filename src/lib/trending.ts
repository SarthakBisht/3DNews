import type { Article } from './types';

const STOP = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','are','was','were','be','been','has','have','had','do','does',
  'did','will','would','could','should','may','might','must','can','up','out',
  'as','it','its','this','that','these','those','what','which','who','how',
  'when','where','why','all','not','new','more','after','says','said','over',
  'into','his','her','their','he','she','they','we','you','i','me','my','our',
  'than','about','get','now','us','two','first','back','amid','also','one',
  'just','than','then','been','have','were','being','three','four','five',
  'six','seven','eight','nine','ten','week','month','year','day','time',
  'last','next','make','take','show','go','set','way','report','amid','says',
  'amid','hit','no','see','old','per','key','big','top','use',
]);

export function extractTrending(articles: Article[], top = 8): string[] {
  if (!articles.length) return [];
  const freq: Record<string, number> = {};

  for (const a of articles) {
    const words = a.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    for (const w of words) {
      if (w.length < 4 || STOP.has(w)) continue;
      freq[w] = (freq[w] ?? 0) + 1;
    }
    for (const t of a.tags) {
      const clean = t.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
      if (clean.length < 3) continue;
      freq[clean] = (freq[clean] ?? 0) + 2;
    }
  }

  return Object.entries(freq)
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([w]) => w.replace(/\b\w/g, (c) => c.toUpperCase()));
}
