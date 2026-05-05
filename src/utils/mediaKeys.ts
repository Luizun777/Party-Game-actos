import type { MediaItem } from '@/domain/models';

/** Deduplication key: type + externalId for API items, normalized title+type for manual */
export function getMediaKey(item: Pick<MediaItem, 'type' | 'externalId' | 'title' | 'manual'>): string {
  if (item.manual) {
    return `manual:${item.type}:${item.title.trim().toLowerCase()}`;
  }
  return `${item.type}:${item.externalId}`;
}

export function isDuplicate(pool: MediaItem[], candidate: Pick<MediaItem, 'type' | 'externalId' | 'title' | 'manual'>): boolean {
  const key = getMediaKey(candidate);
  return pool.some(item => getMediaKey(item) === key);
}
