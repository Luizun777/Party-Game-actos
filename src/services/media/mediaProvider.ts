import type { MediaItem, MediaCategory } from '@/domain/models';

export interface MediaSearchProvider {
  searchContent(query: string, category: MediaCategory): Promise<MediaItem[]>;
  getRandomContent(category: MediaCategory, excludeIds: string[]): Promise<MediaItem | null>;
  getRandomPool(category: MediaCategory, count: number, excludeIds: string[]): Promise<MediaItem[]>;
}
