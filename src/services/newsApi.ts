import type { NewsArticle, Result, SportId } from '../types';
import { NEWS, getNewsById } from '../data/news';
import { DATA_MODE, delay } from './config';

export interface NewsItem extends NewsArticle {
  /** ISO */
  publishedAt: string;
}

const isDemo = DATA_MODE === 'demo';

function toItem(a: NewsArticle): NewsItem {
  const d = new Date();
  d.setDate(d.getDate() - a.daysAgo);
  d.setHours(a.hour, 0, 0, 0);
  return { ...a, publishedAt: d.toISOString() };
}

export interface NewsFilters {
  q?: string;
  sport?: SportId | 'all';
}

export async function getNews(f: NewsFilters = {}): Promise<Result<NewsItem[]>> {
  await delay(180);
  const q = f.q?.trim().toLowerCase();
  const list = NEWS.map(toItem)
    .filter((n) => !f.sport || f.sport === 'all' || n.sport === f.sport)
    .filter((n) => {
      if (!q) return true;
      const hay = `${n.title.ar} ${n.title.en} ${n.summary.ar} ${n.summary.en}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { data: list, isDemo };
}

export async function getMostRead(limit = 5): Promise<Result<NewsItem[]>> {
  const list = NEWS.map(toItem)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
  return { data: list, isDemo };
}

export interface ArticlePage {
  article: NewsItem;
  related: NewsItem[];
  mostRead: NewsItem[];
}

export async function getArticle(id: string): Promise<Result<ArticlePage | null>> {
  await delay(150);
  const raw = getNewsById(id);
  if (!raw) return { data: null, isDemo };
  const article = toItem(raw);
  const related = NEWS.filter((n) => n.id !== id && n.sport === raw.sport)
    .map(toItem)
    .slice(0, 3);
  const fallback = NEWS.filter((n) => n.id !== id && n.sport !== raw.sport)
    .map(toItem)
    .slice(0, 3 - related.length);
  const mostRead = NEWS.filter((n) => n.id !== id)
    .map(toItem)
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  return { data: { article, related: [...related, ...fallback], mostRead }, isDemo };
}
