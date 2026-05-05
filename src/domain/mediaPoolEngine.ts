import type { MediaItem, MediaCategory } from './models';
import { isDuplicate } from '@/utils/mediaKeys';
import { POSTER_COLORS } from './models';
import { generateManualId } from '@/utils/ids';

export function addItemToPool(pool: MediaItem[], item: MediaItem): MediaItem[] {
  if (isDuplicate(pool, item)) return pool;
  return [...pool, item];
}

export function removeItemFromPool(pool: MediaItem[], titleId: string): MediaItem[] {
  return pool.filter(p => p.titleId !== titleId);
}

export function filterPoolByCategory(pool: MediaItem[], category: MediaCategory): MediaItem[] {
  if (category === 'ambos') return pool;
  return pool.filter(item => item.type === category);
}

export function createManualItem(
  title: string,
  type: 'pelicula' | 'serie',
  addedBy: string
): MediaItem {
  const colorIdx = Math.floor(Math.random() * POSTER_COLORS.length);
  const id = generateManualId();
  return {
    titleId: id,
    externalId: id,
    title: title.trim(),
    year: '—',
    type,
    color: POSTER_COLORS[colorIdx],
    addedBy,
    source: 'manual',
    manual: true,
  };
}

export function buildGlobalPool(pool: MediaItem[]): MediaItem[] {
  // Deduplicate by key, preserving order
  const seen = new Set<string>();
  return pool.filter(item => {
    const key = `${item.type}:${item.externalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function validatePool(pool: MediaItem[]): string | null {
  if (!pool.length) return 'El pool está vacío. Agrega al menos un título.';
  return null;
}
