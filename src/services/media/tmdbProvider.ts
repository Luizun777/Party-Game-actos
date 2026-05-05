import type { MediaItem, MediaCategory } from '@/domain/models';
import type { MediaSearchProvider } from './mediaProvider';
import { normalizeTmdbItem } from './mediaNormalizer';
import { shuffle } from '@/utils/shuffle';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN as string | undefined;
const BASE_URL = 'https://api.themoviedb.org/3';

function getHeaders(): HeadersInit {
  if (ACCESS_TOKEN) {
    return {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }
  return {};
}

function appendApiKey(url: string): string {
  if (!ACCESS_TOKEN && API_KEY) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}api_key=${API_KEY}`;
  }
  return url;
}

function categoryToTmdb(category: MediaCategory): 'movie' | 'tv' | 'multi' {
  if (category === 'pelicula') return 'movie';
  if (category === 'serie') return 'tv';
  return 'multi';
}

export function isTmdbAvailable(): boolean {
  return Boolean(API_KEY || ACCESS_TOKEN);
}

export class TmdbProvider implements MediaSearchProvider {
  async searchContent(query: string, category: MediaCategory): Promise<MediaItem[]> {
    if (!isTmdbAvailable()) return [];
    const tmdbType = categoryToTmdb(category);
    const endpoint = tmdbType === 'multi' ? 'search/multi' : `search/${tmdbType}`;
    const url = appendApiKey(`${BASE_URL}/${endpoint}?query=${encodeURIComponent(query)}&language=es-ES&page=1`);

    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) return [];
    const data = await res.json() as { results: unknown[] };

    return (data.results ?? [])
      .slice(0, 8)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((r: any) => {
        if (tmdbType === 'multi') return r.media_type === 'movie' || r.media_type === 'tv';
        return true;
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((r: any) => {
        if (tmdbType !== 'multi') r.media_type = tmdbType;
        return normalizeTmdbItem(r, 'manual', 'search');
      });
  }

  async getRandomContent(category: MediaCategory, excludeIds: string[]): Promise<MediaItem | null> {
    const pool = await this.getRandomPool(category, 1, excludeIds);
    return pool[0] ?? null;
  }

  async getRandomPool(category: MediaCategory, count: number, excludeIds: string[]): Promise<MediaItem[]> {
    if (!isTmdbAvailable()) return [];
    const tmdbType = categoryToTmdb(category);
    const type = tmdbType === 'multi' ? 'movie' : tmdbType;
    const endpoint = `discover/${type}`;
    const collected: MediaItem[] = [];
    const MAX_ATTEMPTS = 5;

    for (let attempt = 0; attempt < MAX_ATTEMPTS && collected.length < count; attempt++) {
      const page = Math.floor(Math.random() * 10) + 1;
      const url = appendApiKey(`${BASE_URL}/${endpoint}?language=es-ES&sort_by=popularity.desc&page=${page}`);

      try {
        const res = await fetch(url, { headers: getHeaders() });
        if (!res.ok) break;
        const data = await res.json() as { results: unknown[] };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = shuffle(data.results ?? []).map((r: any) => {
          r.media_type = type;
          return normalizeTmdbItem(r, 'random-global', 'random');
        });

        for (const item of items) {
          if (collected.length >= count) break;
          if (excludeIds.includes(item.titleId)) continue;
          if (collected.some(c => c.titleId === item.titleId)) continue;
          collected.push(item);
        }
      } catch {
        break;
      }
    }

    return collected;
  }
}
